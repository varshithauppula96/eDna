const Router = require('express-promise-router');
const db = require('../db');

const router = new Router()

// allow requests from allowed locations
router.all('*', async (req,res,next) => {
  res.set({'Access-Control-Allow-Origin': db.allowable})
  next()
})

// Endpoint to get & format the data to fill barchart in SpeciesBarchart.vue
// Use the following command to send an http request from the terminal:
// curl -X GET 'https://edna.bigelow.org:3001/barchart?species=12&species=184&species=78&species=14&species=3&samples=23&samples=24&samples=11&samples=27&samples=7&samples=35'
router.get( '/', async (req,res) => {

  // query values from the request
  console.log("barchart query")
  var samples = req.query.samples
  var species = req.query.species
  var types = req.query.type

  // Get top 10 sample_ids ordered by date (recent to old) & corresponding site, project, & date
  var query_params = {
    text: `SELECT sample.id, project.name AS project, site.name AS site, date FROM sample
      INNER JOIN project ON sample.project_id = project.id  
      INNER JOIN site ON sample.site_id = site.id
      WHERE sample.id=ANY('{${[samples].join(',')}}')
      ORDER BY date DESC
      LIMIT 10;`,
    values: [],
  }
  var {rows} = await db.query( query_params ) 
  var sample_ids = rows.map(obj => obj.id) // list of sample ids

  // create 'dictionary' with keys=sample_id mapping to values=JSON object with the sample's metadata (project, site, and date)
  var sample_id2metadata = {}
  for( i in rows ) {
    var obj = rows[i]
    sample_id2metadata[obj.id] = {project:obj.project, site:obj.site, date:obj.date}
  }  

  // Format dynamic query string for second query
  var sample_vars = sample_ids.map(el => "COALESCE( samp" + el + ",0)::INT AS samp" + el)
  var var_names = sample_vars.length > 0 ? ", " + sample_vars.join(",") : ""
  var col_names = sample_ids.length > 0 ? ", samp" + sample_ids.join(" INT, samp") + " INT" : ""
  var other_query = sample_ids.length > 0 ? ", " + sample_ids.map(el => "100-SUM( samp" + el + ")::INT AS samp" + el) : ""

  // Get relative abundances of specified species at each sample date
  query_params = {
    text: `WITH abundances AS ( 
        SELECT species ${var_names} FROM CROSSTAB(
          $$ SELECT sp.species, count.sample_id, (100*count::numeric/samp.sum)::INT AS rel_ab FROM count
            INNER JOIN ( SELECT id, COALESCE(tax_species,tax_genus,tax_family,tax_order,tax_class,tax_phylum,tax_division,tax_supergroup,tax_kingdom) AS species
              FROM species) sp
              ON count.species_id=sp.id
            INNER JOIN (SELECT sample_id,SUM(count) FROM count GROUP BY 1) samp
              ON samp.sample_id=count.sample_id
            WHERE count.sample_id=ANY('{${[sample_ids].join(',')}}')
              AND species_id=ANY('{${[species].join(',')}}')
              AND type=ANY('{${[types].join(',')}}')
            GROUP BY sp.species, count.sample_id, count, samp.sum 
            ORDER BY sp.species
          $$,
          $$
            SELECT * FROM unnest(ARRAY[${[sample_ids].join(',')}]) 
          $$
        )
        AS (species VARCHAR ${col_names}) )
      SELECT * FROM abundances
      UNION ALL SELECT 'Other' ${other_query} FROM abundances;`,
    values: [],
  }

  // Only perform the second postgres query if the first query found > 0 samples
  // if input species & samples were empty, don't perfom second postgres query & just send empty data to frontend
  var ret = {samples:sample_id2metadata,data:[]} // initialize return object
  if(sample_ids.length > 0) {
    rows = await db.query( query_params ) 
    ret.data = rows.rows
  }

  // Returns a JSON object with 2 keys:
  //  species: "dictionary" mapping sample_id to metadata object (with project, site, and date)
  //  data: list of JSON objects with keys= species_id,{sample names} and values= relative abundances
  res.send(ret)
} )

module.exports = router
