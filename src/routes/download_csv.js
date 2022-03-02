const Router = require('express-promise-router');
const db = require('../db');

const router = new Router()

// allow requests from allowed locations
router.all('*', async (req,res,next) => {
  res.set({'Access-Control-Allow-Origin': db.allowable})
  next()
})

// Endpoint to get the data to be downloaded as csv based on the given search parameters
// Use the following command to send an http request from the terminal:
// curl -X GET 'https://edna.bigelow.org:3001/download?latmin=43&latmax=54&lonmin=-70.5&lonmax=-68.6&datemin=2016.08.01&datemax=2017.10.18&site=jacks_point'
// /latmin=val&latmax=val&lonmin=val&lonmax=val&datemin=val&datemax=val&species=val&site=val&project=val
router.get( '/', async (req,res,next) => {

  console.log('downloading')

  // query values from the request
  // console.log(req.query)
  var rq = req.query
  var lat_min = parseFloat(rq.latmin)
  var lat_max = parseFloat(rq.latmax)
  var lon_min = parseFloat(rq.lonmin)
  var lon_max = parseFloat(rq.lonmax)
  var date_min = rq.datemin
  var date_max = rq.datemax

  var site_cond = ``
  var species_cond = ``
  var project_cond = ``
  var type_cond = ``
  var type_cond_where = ``

  // assumes search terms are lower case (the search terms are cast to lower case in Search.vue))
  if(rq.site) {
    site_cond = `AND LOWER(si.name) = ANY('{${[rq.site].join(',')}}')`
  }
  if(rq.species) {
    species_cond = `WHERE LOWER( COALESCE(sp.tax_species,sp.tax_genus,sp.tax_family,sp.tax_order,sp.tax_class,sp.tax_phylum,sp.tax_division,sp.tax_supergroup,sp.tax_kingdom)) = ANY('{${[rq.species].join(',')}}')`
  }
  if(rq.project) {
    project_cond = `AND LOWER(pr.name) = ANY('{${[rq.project].join(',')}}')`
  }
  if(rq.type) {
    type_cond = `LOWER(co.type) = ANY('{${[rq.type].join(',')}}')`
    type_cond_where = 'WHERE ' + type_cond
    type_cond = rq.species ? 'AND ' + type_cond : type_cond_where
    // console.log(type_cond)
}

  var col_query_params = {
    text: `SELECT sa.name_num FROM sample sa 
            INNER JOIN project pr ON sa.project_id=pr.id   
            INNER JOIN site si ON si.id = sa.site_id 
            WHERE 
              si.lat >= $1 AND si.lat <= $2 
              AND si.lon >= $3 AND si.lon <= $4
              AND sa.date >= $5 AND sa.date <= $6
              ${site_cond}
              ${project_cond}
              AND sa.id IN 
                (SELECT co.sample_id FROM count co
                  INNER JOIN species sp ON sp.id = co.species_id
                  ${species_cond}
                  ${type_cond}
                )
            ORDER BY 1`,
    values: [lat_min,lat_max,lon_min,lon_max,date_min,date_max],
    rowMode: 'array'
  }

  var { rows }  = await db.query( col_query_params )

  // send empty array as response to frontend if the query returned no data
  if( rows.length <= 0 ) {
    res.send([])
  }

  // format query string for second query (based on results of the first)
  var name_nums = rows.length > 0 ? "'" + rows.join("' , '") + "'": ""
  var data_name_nums = rows.length > 0 ? "," + rows.map( obj => "COALESCE(" + obj + ",0) AS " + obj).join(",") : ""
  var col_names = rows.length > 0 ? "," + rows.join(", ") : ""
  var data_col_names = rows.length > 0 ? "," + rows.join(" int, ") + " int" : ""
  var metadata_col_names = rows.length > 0 ? "," + rows.join(" text, ") + " text" : ""

  var metadata_query_params = {
    text: `SELECT species_id, NULL AS tax_kingdom, NULL AS tax_supergroup, NULL AS tax_division, NULL AS tax_phylum,
        NULL AS tax_class, NULL AS tax_order, NULL AS tax_family, NULL AS tax_genus, NULL AS tax_species ${col_names}
      FROM CROSSTAB(
        $$(SELECT 'Project' AS category, name_num, pr.name FROM sample
          INNER JOIN project pr ON sample.project_id = pr.id
          WHERE name_num in (${name_nums}) )
        UNION ALL (SELECT 'Date' AS category, name_num, date::text FROM sample 
          WHERE name_num in (${name_nums}) )
        UNION ALL (SELECT 'Latitude' AS category, name_num, lat::text FROM sample
          INNER JOIN site si ON sample.site_id = si.id
          WHERE name_num in (${name_nums}) )
        UNION ALL (SELECT 'Longitude' AS category, name_num, lon::text FROM sample
          INNER JOIN site si ON sample.site_id = si.id
          WHERE name_num in (${name_nums}) )
        ORDER BY 1,2 $$,
        $$SELECT DISTINCT name_num FROM sample WHERE name_num in (${name_nums}) ORDER BY 1$$)
      AS (species_id text ${metadata_col_names});`,
    values: []
  }

  rows  = await db.query( metadata_query_params )

  var metadata = rows.rows
  
  // third query string
  var data_query_params = {
    text: `SELECT species_id, tax_kingdom, tax_supergroup, tax_division, tax_phylum,tax_class, tax_order,
        tax_family, tax_genus, tax_species ${data_name_nums}
      FROM CROSSTAB(
      $$SELECT sp.id, sp.tax_kingdom, sp.tax_supergroup, sp.tax_division, sp.tax_phylum, sp.tax_class,
          sp.tax_order, sp.tax_family, sp.tax_genus, sp.tax_species, co2.name_num,
          COALESCE( SUM( co2.count ),0 )
        FROM species sp
        INNER JOIN
          (SELECT co.count, co.species_id, samp.name_num FROM count co
            INNER JOIN
              (SELECT sa.id, sa.name_num FROM sample sa 
                INNER JOIN project pr ON sa.project_id = pr.id   
                INNER JOIN site si ON si.id = sa.site_id 
                WHERE 
                  ((si.lat >= ${lat_min} AND si.lat <= ${lat_max}
                  AND si.lon >= ${lon_min} AND si.lon <= ${lon_max}
                  AND sa.date >= '${date_min}' AND sa.date <= '${date_max}' )
                  ${site_cond})
                  ${project_cond}
              ) samp
              ON co.sample_id = samp.id 
              ${type_cond_where}
          ) co2
          ON sp.id = co2.species_id
          ${species_cond}
        GROUP BY sp.id, sp.tax_species, co2.name_num ORDER BY 2,1,3 
      $$,
      $$SELECT sa.name_num FROM sample sa 
        INNER JOIN project pr ON sa.project_id=pr.id   
        INNER JOIN site si ON si.id = sa.site_id 
        WHERE 
          ( (si.lat >= ${lat_min} AND si.lat <= ${lat_max}
          AND si.lon >= ${lon_min} AND si.lon <= ${lon_max} 
          AND sa.date >= '${date_min}' AND sa.date <= '${date_max}' )
          ${site_cond} )
          ${project_cond} 
          AND sa.id IN 
            (SELECT co.sample_id FROM count co
              INNER JOIN species sp ON sp.id = co.species_id
              ${species_cond}
              ${type_cond}
            )
        ORDER BY 1
      $$)
      AS (species_id int, tax_kingdom varchar, tax_supergroup varchar, tax_division varchar, tax_phylum varchar,
        tax_class varchar, tax_order varchar, tax_family varchar, tax_genus varchar, tax_species varchar
        ${data_col_names} );`,
    values:[]
  }

  rows  = await db.query( data_query_params )

  // concatenate metadata & data rows & send the array of JSON objects (each object = 1 row in the csv file) back to the front end
  var data = [...metadata , ...rows.rows]
  res.send(data); 
} )

module.exports = router
