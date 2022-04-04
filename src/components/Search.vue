<template>
  <div id="search-pane">
    <h3 >Search Parameters</h3>
    <b-form @submit.prevent="getData" @keyup.enter="getData" @reset.prevent="clearSearch">

      <!-- Site Name Search Box -->
      <!--      <label>Site Name: </label>-->
      <!--      <br/>-->
      <multiselect class="multiselect"

                   v-model="sites_search_items"
                   :options="sites"
                   :multiple="true"
                   :searchable="true"
                   :clear-on-select="false"
                   :close-on-select="false"
                   placeholder="Search by site name"
                   style="margin-bottom: 1rem;">

      </multiselect>

      <!-- Species Search Box -->
      <!--      <label>Species: </label>-->
      <!--      <br/>-->
      <multiselect
          v-model="species_search_items"
          :options="species_names"
          :multiple="true"
          :searchable="true"
          :clear-on-select="false"
          :close-on-select="false"
          placeholder="Search by species name"
          style="margin-bottom: 1rem;">
      </multiselect>

      <!-- Project IDs Search Box -->
      <!--      <label>Project Name: </label>-->
      <!--      <br/>-->
      <multiselect
          v-model="pids_search_items"
          :options="pids"
          :multiple="true"
          :searchable="true"
          :clear-on-select="false"
          :close-on-select="false"
          placeholder="Search by project name"
          style="margin-bottom: 1rem;">
      </multiselect>

      <!-- Data Types Search Box -->
      <!--      <label>Data Type: </label>-->
      <!--      <br/>-->
      <multiselect
          v-model="types_search_items"
          :options="types"
          :multiple="true"
          :searchable="true"
          :clear-on-select="false"
          :close-on-select="false"
          placeholder="Search by data type">
      </multiselect>

      <!-- Date Pickers -->
      <!--      <label>Date Range:</label>-->

        <datepicker
            class="calendar "
            :clear-button="true"
            placeholder="Start Date"


            v-model="start_date">
        </datepicker>

        <datepicker class="calendar "  :clear-button="true" placeholder="End Date" v-model="end_date"
                  ></datepicker>

      <!-- Latitude Inputs -->
      <label  class="latitude">Latitude Range &nbsp &nbsp  </label>

      <input  class="input-box" v-model="lat_range.min" placeholder="min">
      to
      <input class="input-box" v-model="lat_range.max" placeholder="max">
      <br/>
      <!-- <latlon-slider v-model="lat_range" :init_min="-90" :init_max="90"></latlon-slider> -->

      <!-- Longitude Inputs -->
      <label class = "longitutde" >Longitude Range  </label>
      <input class="input-box" v-model="lon_range.min" placeholder="min">
      to
      <input class="input-box" v-model="lon_range.max" placeholder="max">
      <br/>
      <!-- <latlon-slider v-model="lon_range" :init_min="-180" :init_max="180"></latlon-slider> -->


      <!-- Search & Reset Buttons -->

      <b-button class="p-md-2" variant="outline-light" style="width: 100px; margin-top: 1rem; color: #004949;" type="submit">Search</b-button>
      <b-button class="p-md-2" variant="outline-light" style="width: 100px; margin-top: 1rem; margin-left: 1rem; color: #004949;" type="reset">Reset</b-button>

    </b-form>
  </div>
</template>

<script>
import Vuetify from 'vuetify'
import Datepicker from 'vuejs-datepicker';
import Multiselect from 'vue-multiselect'
// import Sliders from './Sliders.vue'
// import { log } from 'util';
export default {
  name : "Search",
  components: {
    'datepicker': Datepicker,
    'multiselect': Multiselect,
    // 'latlon-slider': Sliders,
  },
  props: {
    base_path: String,
    species_names: Array,
    pids: Array,
    sites: Array,
    types: Array,
    dates: Object,
    lat_range: Object,
    lon_range: Object,
    init_lat_range: Object,
    init_lon_range: Object,
  },
  data () {
    return {
      sites_search_items: [], // string entered into sites search box
      species_search_items: [], // string entered into species search box
      pids_search_items: [], // string entered into pids search box
      types_search_items: [], // string entered into data type search box
      start_date: '',
      end_date: '', // end date string
    }
  },
  methods: {
    // gets data from db based on search parameters given
    getData: async function () {
      this.$emit("changeCursor","wait") // change cursor to wait. goes back to default after results are rendered (in Results.vue)
      var date_range = this.getDate()
      var combined_data = []
      var type = []
      var site_search = ''
      var species_search = ''
      var project_search = ''
      var type_search = ''
      // site name parameter
      if( this.sites_search_items.length > 0 ) {
        if( (this.sites_search_items.length == 1) && (this.species_search_items.length < 1) && (this.pids_search_items.length < 1) ) {
          // this makes the barchart show if only one site was searched for
        }
        type.push("site")
        site_search = '&site=' + this.sites_search_items.join('&site=').toLowerCase()
      }
      // species name parameter
      if( this.species_search_items.length > 0 ) {
        type.push("species")
        species_search = '&species=' + this.species_search_items.join('&species=').toLowerCase()
      }
      // project name parameter
      if( this.pids_search_items.length > 0 ) {
        type.push("project")
        project_search = '&project=' + this.pids_search_items.join('&project=').toLowerCase()
      }
      // data type parameter
      if( this.types_search_items.length > 0 ) {
        type.push("type")
        type_search = '&type=' + this.types_search_items.join('&type=').toLowerCase()
      }
      // query string w/ all search parameters
      var query_string = `latmin=${this.lat_range.min}&latmax=${this.lat_range.max}` +
                         `&lonmin=${this.lon_range.min}&lonmax=${this.lon_range.max}` +
                         `&datemin=${date_range.min}&datemax=${date_range.max}` +
                         site_search + species_search + project_search + type_search
      var path = this.base_path + `combined_search?${query_string}`
      // send request to db
      await this.$http.get( path ).then( res => {
        combined_data = res.body
      })
      // emit searchAll event so Body.vue can update the results
      this.$emit("searchAll",combined_data,query_string,true,date_range)
    },
    // get date range & format date strigns for query_string
    getDate: function() {
      var min = this.dates.min.slice(0,10).split("-").join(".")
      var max = this.dates.max.slice(0,10).split("-").join(".")
      if( this.start_date != '' ) {
        console.log(this.start_date.getFullYear());
        min = this.start_date.getFullYear() + '.' + (this.start_date.getMonth() + 1) + '.' + this.start_date.getDate()
      }
      if( this.end_date != '' ) {
        max = this.end_date.getFullYear() + '.' + (this.end_date.getMonth()+1) + '.' + this.end_date.getDate()
      }
      return {min:min ,max:max}
    },
    // clear search parameters & results data displayed
    clearSearch: function() {
      this.start_date = '' // start date string
      this.end_date = '' // end date string
      this.lat_range.min = this.init_lat_range.min
      this.lat_range.max = this.init_lat_range.max
      this.lon_range.min = this.init_lon_range.min
      this.lon_range.max = this.init_lon_range.max
      this.sites_search_items = []
      this.species_search_items = []
      this.pids_search_items = []
      this.types_search_items = []
      this.$emit("searchAll",[],"",false,this.getDate())
    },
  },
}
</script>



<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
h3{
  text-align: center;
  padding-bottom:  4px;
}
#search-pane {
  margin-left: 72%;
  margin-right: 2%;
  top: 0;
  width: 26%;
  left: 70%;
  height: 100%;
  text-align: center;
  color: black;
}
.calendar {
  color: #004949;
  margin-bottom: 1em;
  margin-top: 1em;
  text-align: center;
  border: 3px #555555;
}
button{
  background-color: transparent;
}
.input-box {
  width: 25%;
}
.longitutde{
  padding-right: 8px;
}
.latitude{
  padding-right: 3px;
}
.multiselect{
  min-height: 3px;
}
</style>