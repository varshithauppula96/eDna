// Register all endpoints with the express app
const start = require('./start')
const species_name = require('./species_name')
const site_name = require('./site_name')
const combined_search = require('./combined_search')
const download = require('./download_csv')
const heatmap = require('./heatmap_data')
const barchart = require('./barchart_data')

module.exports = (app) => {
  app.use( '/start', start )
  app.use( '/species_name', species_name )
  app.use( '/site_name', site_name )
  app.use( '/combined_search', combined_search )
  app.use( '/download', download )
  app.use( '/heatmap', heatmap )
  app.use( '/barchart', barchart )
}
