const Router = require('express-promise-router');
const db = require('../db');

const router = new Router()

// allow requests from allowed locations
router.all('*', async (req,res,next) => {
  res.set({'Access-Control-Allow-Origin': db.allowable})
  next()
})

// Endpoint to get the data to fill the results table in Results.vue when a site marker on the map is clicked
// Use the following command to send an http request from the terminal:
// curl -X GET https://edna.bigelow.org:3001/site_name/Weskeag_River
router.get( '/:name', async (req,res) => {

  var numResults = 100 // maximum number of rows to return
  console.log(req.params.name)
  
  var query_params = {
    text: `SELECT \
        co.id, \
        samp.id AS sample_id, \
        samp.proj, \
        samp.lat, \
        samp.lon, \
        samp.date, \
        samp.site_name, \
        co.species_id, \
        co.type, \
        COALESCE(sp.tax_species,sp.tax_genus,sp.tax_family,sp.tax_order,sp.tax_class,sp.tax_phylum,sp.tax_division,sp.tax_supergroup,sp.tax_kingdom) AS species, \
        co.count \
      FROM count co \
      INNER JOIN \
          (SELECT sa.id,sa.date,pr.name proj,si.lat,si.lon,si.name site_name FROM sample sa \
            INNER JOIN project pr ON sa.project_id=pr.id  \
            INNER JOIN site si ON si.id = sa.site_id \
            WHERE LOWER(si.name) = LOWER('${req.params.name}'))  \
          samp \
      ON co.sample_id = samp.id \
      INNER JOIN species sp ON co.species_id = sp.id \
      ORDER BY co.count DESC LIMIT $1;`,
    values : [numResults],
  }

  const { rows }  = await db.query( query_params )  

  // returns array of JSON objects. each object = 1 row (1 species count)
  res.send(rows)
} )

module.exports = router
