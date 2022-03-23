<template>



  <!-- dynamically change cursor -->
  <div id="app-body" :style="{cursor : curCursor}">

    <!-- Map Compnent -->
    <div class = "my-map">
      <app-map
          @get_coords="unique_locations"
          @clickedLocation="markerClicked"
          @updateLatLonBox="latLonBox"
          :base_path="base_path"
          :lat_range="lat_range"
          :lon_range="lon_range"
          :init_lat_range="init_lat_range"
          :init_lon_range="init_lon_range">
      </app-map>
    </div>

    <!-- Search Pane Component  -->
    <div>
      <search-pane
          @changeCursor="updateCursor"
          @searchAll="updateAll"
          :base_path="base_path"
          :species_names="species_names"
          :pids="pids"
          :sites="sites"
          :dates="dates"
          :types="types"
          :lat_range="lat_range"
          :lon_range="lon_range"
          :init_lat_range="init_lat_range"
          :init_lon_range="init_lon_range"
          ref="search">
      </search-pane>
    </div>

    <!-- Results Component -->
    <div>
      <results-pane
          @changeCursor="updateCursor"
          :base_path="base_path"
          :combined_data="combined_data"
          :query_string="query_string"
          :show_all="show_all"
          :lat_range="lat_range"
          :lon_range="lon_range"
          :date_range="date_range"
          ref="results">
      </results-pane>
    </div>
  </div>
</template>


<script>
import Vuetify from 'vuetify'


// register components locally
import MyMap from './Map.vue'
import Search from './Search.vue'
import Results from './Results.vue'
import $ from "jquery";


// import { log } from 'util' // uncomment this if you want to log things to the browser console in devtools
export default {


  components: {
    'app-map': MyMap,
    'search-pane': Search,
    'results-pane': Results,
  },
  data () {
    return {
      reveal: false,
      base_path: 'https://edna.bigelow.org:3000/', // base url for HTTP requests. Use 3001 for development, 3000 for production
      species_names: [], // list of unique species names for search bar autofill list
      pids: [], // list of project IDs for search bar autofill list
      sites: [],
      dates: {},
      types: [],
      combined_data: [],
      show_all: false,
      query_string: "",
      lat_range: { min: -90, max: 90 }, // selected latitude range
      lon_range: { min: -180, max: 180 }, // selected longitude range
      curCursor: "default",
      init_lon_range: {},
      init_lat_range: {},
      date_range: {},
    }
  },
  methods: {
    // sends http request to get list of distinct species names (to fill search box drop down)
    // *** Note: multiple species_ids in the db can have the same species name. This causes things like the same species name appearing multiple times in different columns in the heatmap
    getSpecies: function() {
      this.$http.get(this.base_path + "start/species").then( res => {
        this.species_names = [...new Set(Object.values(res.body))] // use only the unique options (no duplicates)
      })
    },
    // sends http request to get list of distinct project names (to fill search box drop down)
    getPids: function() {
      this.$http.get(this.base_path + "start/pids").then( res => {
        this.pids = res.body
      })
    },
    // sends http request to get list of distinct site names (to fill search box drop down)
    getSites: function() {
      this.$http.get(this.base_path + "start/site_name").then( res => {
        this.sites = res.body
      })
    },
    // sends http request to get min & max dates (to set date range default)
    getDates: function() {
      this.$http.get(this.base_path + "start/dates").then( res => {
        this.dates = res.body
      })
    },
    // sends http request to get list of distinct data types (to fill search box drop down)
    getTypes: function() {
      this.$http.get(this.base_path + "start/types").then( res => {
        this.types = res.body
      })
    },
    // sends http request to get list of distinct lat/lon locations (to place site dot locations on map)
    unique_locations: function (locations) {
      // set lat and lon ranges based on site locations
      var lats = locations.map(o=>o.lat)
      var lons = locations.map(o=>o.lon)
      this.lat_range = {min: Math.min.apply(null,lats)-1, max: Math.max.apply(null,lats)+1}
      this.lon_range = {min: Math.min.apply(null,lons)-1, max: Math.max.apply(null,lons)+1}
      // initialize red box on map to contain all data points
      // this.init_lat_range = this.lat_range
      // this.init_lon_range = this.lon_range
      // initialize red box on map to span Gulf of Maine
      this.init_lat_range = {min:43 ,max:44.6}
      this.init_lon_range = {min:-71 ,max:-68.4}
    },
    // update the data with the results of a search when a search is performed (occurs when searchAll event is emitted from Search.vue)
    updateAll: function (data, qstring, show, date_range) {
      this.combined_data = data
      this.query_string = qstring
      this.$refs.results.resetArrow()
      this.show_all = show
      this.date_range = date_range
      if(this.combined_data.length == 0) {
        this.updateCursor("default")
      }
      console.log("Defining DataTable...");
      $('#table_id').DataTable();
      console.log("Defined DataTable.");
    },
    // update the current cursor
    updateCursor: function( newCursor ) {
      this.curCursor = newCursor
    },
    // perform search & updates results when a location dot on the map is clicked
    markerClicked: function(siteName){
      this.updateCursor("wait")
      this.$http.get(this.base_path + "site_name/" + siteName.toLowerCase()).then( res => {
        this.combined_data = res.body
        this.date_range = this.$refs.search.getDate()
        this.query_string = `latmin=${this.lat_range.min}&latmax=${this.lat_range.max}` +
                            `&lonmin=${this.lon_range.min}&lonmax=${this.lon_range.max}` +
                            `&datemin=${this.date_range.min}&datemax=${this.date_range.max}&site=${siteName.toLowerCase()}`
        this.show_all = true
      })

    },
    // update the red lat/lon box on the map
    latLonBox: function(vals){
      // update lat & lon
      this.lat_range = vals.lat_range
      this.lon_range = vals.lon_range
      // lat bounds checking
      if( this.lat_range.min < -90 ) {
        this.lat_range.min = -90
      }
      if( this.lat_range.max > 90 ) {
        this.lat_range.max = 90
      }
      if( this.lat_range.min > this.lat_range.max ) {
        this.lat_range.max = this.lat_range.min
      }
      if( this.lat_range.max < this.lat_range.min ) {
        var oldMax2 = this.lat_range.max
        this.lat_range.min = oldMax2
      }
      // lon bounds checking
      if( this.lon_range.min < -180 ) {
        this.lon_range.min = -180
      }
      if( this.lon_range.max > 180 ) {
        this.lon_range.max = 180
      }
      if( this.lon_range.min > this.lon_range.max ) {
        this.lon_range.min = this.lon_range.max
      }
      if( this.lon_range.max < this.lon_range.min ) {
        var oldMin2 = this.lon_range.min
        this.lon_range.max = oldMin2
      }
    },
  },

  // methods called when the Body component is first mounted
  mounted () {

    this.getSpecies()
    this.getPids()
    this.getSites()
    this.getDates()
    this.getTypes()
  }
}
</script>

<style scoped>
.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}
.my-map {
  width: 66%;
  margin-left: 2%;
  margin-right: 2%;
  float: left;
  height: 100%;
}


#app{
  color: black;
}

</style>