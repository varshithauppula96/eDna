const Router = require('express-promise-router') // for async routing
const db = require('../db') // for connecting to postgres database
// const {performance} = require('perf_hooks') // I used this for timing query speed. could be useful later on

const router = new Router()

// allow requests from allowed locations
router.all('*', async (req,res,next) => {
  res.set({'Access-Control-Allow-Origin': db.allowable})
  next()
})


// Endpoint to get the data to be shown in the Results table based on the given search parameters
// Use the following command to send an http request from the terminal:
// curl -X GET 'https://edna.bigelow.org:3001/combined_search?latmin=43&latmax=54&lonmin=-70.5&lonmax=-68.6&datemin=2016.08.01&datemax=2017.10.18&site=jacks_point'
// /latmin=val&latmax=val&lonmin=val&lonmax=val&datemin=val&datemax=val&species=val&site=val&project=val
// eslint-disable-next-line no-unused-vars
router.get( '/', async (req,res,next) => {

    // eslint-disable-next-line no-console
    console.log(req.query)

    var rq = req.query
    // query values from the request
    var lat_min = parseFloat(rq.latmin)
    var lat_max = parseFloat(rq.latmax)
    var lon_min = parseFloat(rq.lonmin)
    var lon_max = parseFloat(rq.lonmax)
    var date_min = rq.datemin
    var date_max = rq.datemax

    // maximum number of rows to return (faster query when numResults is limited)
    // this number may affect number of results returned in barchart & heatmap. (see computed: qstring in SpeciesBarchart.vue & SpeciesHeatmap.vue)
    var numResults = 100
    
    var site_cond = ``
    var species_cond = ``
    var project_cond = ``
    var type_cond = ``

    // assumes search terms are lower case (the search terms are cast to lower case in Search.vue)
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
        type_cond = rq.species ? 'AND ' + type_cond : 'WHERE ' + type_cond 
    }

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
                WHERE \
                    si.lat >= $1 AND si.lat <= $2 \
                    AND si.lon >= $3 AND si.lon <= $4 \
                    AND sa.date >= $5 AND sa.date <= $6 \
                    ${site_cond} \
                    ${project_cond} \
            ) samp \
            ON co.sample_id = samp.id \
        INNER JOIN species sp ON sp.id = co.species_id \
            ${species_cond} \
            ${type_cond} \
        ORDER BY co.count DESC LIMIT $7;`,
        values: [lat_min,lat_max,lon_min,lon_max,date_min,date_max,numResults],
    }
 
    const { rows }  = await db.query( query_params )

    // send a list of JSON objects - each representing an individual count
    // each object has fields: count_id, sample_id, project_name, lat, lon, date, site_name, species_id, type, species_name, and count
    res.send(rows)
} )

module.exports = router
