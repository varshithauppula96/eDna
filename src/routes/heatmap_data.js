const Router = require('express-promise-router');
const db = require('../db');

const router = new Router()

// allow requests from allowed locations
router.all('*', async (req,res,next) => {
  res.set({'Access-Control-Allow-Origin': db.allowable})
  next()
})

// Endpoint to get & format the data to fill heatmap in SpeciesHeatmap.vue
// Use the following command to send an http request from the terminal:
// curl -X GET 'https://edna.bigelow.org:3001/heatmap?species=12&species=184&species=78&species=14&species=3&samples=23&samples=24&samples=11&samples=27&samples=7&samples=35'
router.get( '/', async (req,res) => {

  console.log("heatmap query")
  // console.log(req.query)
  // query values from the request
  var samples = req.query.samples
  var species = req.query.species
  var types = req.query.type

  // Gets count ids & corresponding species_id of the top 100 most abundant species (or less depending on search parameters) given the user's search parameters
  var query_params = {
    text: `SELECT id, species_id FROM count
      WHERE species_id=ANY('{${[species].join(',')}}')
        AND sample_id=ANY('{${[samples].join(',')}}')
        AND type=ANY('{${[types].join(',')}}')
      ORDER BY count DESC;`,
    values: [],
  }
  var {rows} = await db.query( query_params ) 

  // reformat ids into lists
  var count_ids = rows.map(obj => obj.id)
  var species_ids = [... new Set(rows.map(obj => obj.species_id))]

  // format 2nd dynamic query string based on results of the first 
  var species_vars = species_ids.map(el => "COALESCE( sp" + el + ",0) AS sp" + el)
  var var_names = species_vars.length > 0 ? ", " + species_vars.join(",") : ""
  var col_names = species_ids.length > 0 ? ", sp" + species_ids.join(" INT, sp") + " INT" : ""

  query_params = {
    text: `SELECT id, COALESCE(tax_species,tax_genus,tax_family,tax_order,tax_class,tax_phylum,tax_division,tax_supergroup,tax_kingdom)
      FROM species
      WHERE id=ANY('{${[species_ids].join(',')}}');`,
    values: [],
  }
  rows = await db.query( query_params ) 

  // Create dictionary mapping unique species_id to non-unique species_name
  var species_id2name = {}
  for( i in rows.rows ) {
    var obj = rows.rows[i]
    species_id2name[obj.id] = obj.coalesce
  }  

  // Get relative abundances of specified species at each sample date
  query_params = {
    text:  `SELECT sample_id::INT, meta.date, meta.site, meta.project ${var_names}
        FROM CROSSTAB(
          $$ SELECT count.sample_id, species_id, (100*count::numeric/samp.sum)::INT AS rel_ab FROM count
            INNER JOIN (SELECT sample_id,SUM(count) FROM count GROUP BY 1) samp
            ON samp.sample_id=count.sample_id
            WHERE id=ANY('{${[count_ids].join(',')}}')
            GROUP BY count.sample_id, species_id, count, samp.sum 
            ORDER BY count.sample_id
          $$,
          
          $$
            SELECT * FROM unnest(ARRAY[${[species_ids].join(',')}]) 
          $$
        )
        AS (sample_id INT ${col_names})
        INNER JOIN
          (SELECT sa.id, sa.date, si.name AS site, pr.name AS project FROM sample sa
          INNER JOIN (SELECT id, name FROM site) si ON si.id=sa.site_id
          INNER JOIN (SELECT id, name FROM project) pr ON pr.id=sa.project_id) meta
        ON meta.id = sample_id;`,
    values: [],
  }

  // console.log(query_params.text.replace("\n","")) // prints the postgres query that was dynamically created
  rows = await db.query( query_params ) 

  // Returns a JSON object with 2 keys:
  //  species: "dictionary" mapping species_id to species_name
  //  data: list of JSON objects with keys= sample_id,date,site,project,{species names}
  res.send({species:species_id2name, data:rows.rows})
} )

module.exports = router


