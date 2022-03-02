const Router = require('express-promise-router');
const db = require('../db');

const router = new Router()

// allow requests from allowed locations
router.all('*', async (req,res,next) => {
  res.set({'Access-Control-Allow-Origin': db.allowable})
  next()
})

// Endpoint to get the data to fill the results table in Results.vue when for a given species name
// * This endpoint isn't currently being used anywhere
// Use the following command to send an http request from the terminal:
// curl -X GET https://edna.bigelow.org:3001/species_name/botryllus_planus
// GET id from species table for given species name
router.get( '/:species', async (req,res,next) => {

  console.log(req.params.species)
  
  var query_params = {
    text: `SELECT \
        co.id, \
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
            INNER JOIN site si ON si.id = sa.site_id ) \
          samp \
      ON co.sample_id = samp.id \
      INNER JOIN species sp ON co.species_id = sp.id \
        WHERE LOWER(COALESCE(sp.tax_species,sp.tax_genus,sp.tax_family,sp.tax_order,sp.tax_class,sp.tax_phylum,sp.tax_division,sp.tax_supergroup,sp.tax_kingdom)) \
        = LOWER('${req.params.species}')  \
      ORDER BY co.count DESC;`,
    values : [],
  }

  const { rows }  = await db.query( query_params )  

  // returns array of JSON objects. each object = 1 row (1 species count at a given location & time)
  res.send(rows)
} )

module.exports = router
