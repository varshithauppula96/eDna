const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

// allow requests from allowed locations
router.all('*', async (req,res,next) => {
  res.set({'Access-Control-Allow-Origin': db.allowable})
  next()
})

// All endpoints performed when the homepage (Body.vue) is first reached are found in this file

// Endpoint to get lat,lon of all sites. This is used to position the dots on the map
// Use the following command to send an http request from the terminal:
// curl -X GET https://edna.bigelow.org:3001/start/latlon
router.get( '/latlon', async (req,res) => {

  var query_params = {
    // project_id,
    text : `SELECT lat,lon, name FROM site WHERE lat IS NOT NULL;`,
    values : [],
  }
  const {rows} = await db.query( query_params )

  // sends a list of JSON objects each with lat,lon fields
  res.send(rows)
} )

// Endpoint to get all species names & their corresponding species_ids
// Use the following command to send an http request from the terminal:
// curl -X GET https://edna.bigelow.org:3001/start/species
router.get( '/species', async (req,res) => {

  // select the lowest taxonomic level (closest to species) that is not null
  var query_params = {
    text : `SELECT id, COALESCE(tax_species,tax_genus,tax_family,tax_order,tax_class,tax_phylum,tax_division,tax_supergroup,tax_kingdom) FROM species;`,
    values : [],
  }
  const {rows} = await db.query( query_params )

  // create dictionary with keys as species ids and values as tax_species
  var species_dict = {}
  for( i in rows ) {
    var obj = rows[i]

    // obj.coalesce should never be null in practice, since all samples will at least have a tax_kingdom entry
    species_dict[obj.id] = obj.coalesce==null ? "unnamed" : obj.coalesce
  }

  // sends a dictionary with species ids as keys, and species names as values
  res.send(species_dict)
} )

// Endpoint to get all project names (converted to upper case letters). Used to fill dropdown menu of project names
// Use the following command to send an http request from the terminal:
// curl -X GET https://edna.bigelow.org:3001/start/pids
router.get( '/pids', async (req,res) => {

  var query_params = {
    text : `SELECT name FROM project;`,
    values : [],
  }
  const {rows} = await db.query( query_params )
  
  // sends a list of project_names
  res.send(rows.map(obj => obj.name))
} )

// Endpoint to get all distinct site names. Used to fill dropdown menu of site names
// Use the following command to send an http request from the terminal:
// curl -X GET https://edna.bigelow.org:3001/start/site_name
router.get( '/site_name', async (req,res) => {

  var query_params = {
    text : `SELECT name FROM site;`,
    values : [],
  }
  const {rows} = await db.query( query_params )

  // sends a list of the site names
  res.send(rows.map(obj => obj.name))
} )

// Endpoint to get min & max dates of any sample in the db. Used to determine default date range (especially when date range isn't given in search params)
// Use the following command to send an http request from the terminal:
// curl -X GET https://edna.bigelow.org:3001/start/dates
router.get( '/dates', async (req,res) => {

  var query_params = {
    text : `SELECT MIN(date), MAX(date) FROM sample;`,
    values : [],
  }
  const {rows} = await db.query( query_params )

  // sends a JSON object with min and max fields
  res.send(rows[0])
} )

// Endpoint to get all distinct data types (18S, 16S, etc). Used to fill dropdown menu of data types
// Use the following command to send an http request from the terminal:
// curl -X GET https://edna.bigelow.org:3001/start/types
router.get( '/types', async (req,res) => {

  var query_params = {
    text : `SELECT DISTINCT type FROM count;`,
    values : [],
    rowMode: 'array'
  }
  const {rows} = await db.query( query_params )

  // sends a list of distinct data types (strings)
  res.send(rows.map(el=>el[0]))
} )

module.exports = router
