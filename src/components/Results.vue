
<template>
  <div class="toggleResults">
    <div class="results">
      <h1 style="text-align: center">Results</h1>
      <!-- Download button  -->
      <b-button
          style="float:center;"
          @click.prevent="getDownload"
          v-if="show_all && !downloading && combined_data.length > 0">
        Download Raw Data
      </b-button>
      <p>{{download_data}}</p>

      <!-- Show message if search returned no results -->
      <h4 v-if="show_all && combined_data.length == 0">No results found.</h4>


      <div id ="tablebox">
        <!-- Table of results-->
        <table id="table_id"  class="display nowrap" style="width:100%">
          <!-- Column headers that can be clicked to sort by that column (arrow indicates ascending/descending) -->
          <thead>
          <tr>
            <th><a class="tableLink" href="#" @click.prevent="sortBy('project_name')">PROJECT NAME {{arrow_col=="project_name" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></th>
            <th><a class="tableLink" href="#" @click.prevent="sortBy('site_name')">SITE NAME {{arrow_col=="site_name" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></th>
            <th><a class="tableLink" href="#" @click.prevent="sortBy('lat')">LATITUDE {{arrow_col=="lat" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></th>
            <th><a class="tableLink" href="#" @click.prevent="sortBy('lon')">LONGITUDE {{arrow_col=="lon" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></th>
            <th><a class="tableLink" href="#" @click.prevent="sortBy('date')">DATE {{arrow_col=="date" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></th>
            <th><a class="tableLink" href="#" @click.prevent="sortBy('species')">SPECIES {{arrow_col=="species" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></th>
            <th><a class="tableLink" href="#" @click.prevent="sortBy('count')">COUNT {{arrow_col=="count" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></th>
            <th><a class="tableLink" href="#" @click.prevent="sortBy('type')">TYPE {{arrow_col=="type" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></th>
          </tr>
          </thead>
          <!-- Data rows -->
          <tbody>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <!-- get date part, not time -->
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr v-for="(obj,idx) in this.combined_data_100" :key="idx">
            <td>{{obj.proj}}</td>
            <td>{{obj.site_name.replace("_"," ")}}</td>
            <td>{{obj.lat!=null ? obj.lat : 'N/A'}}</td>
            <td>{{obj.lon!=null ? obj.lon : 'N/A'}}</td>
            <td>{{obj.date!=null ? obj.date.slice(0,10) : 'N/A'}}</td>    <!-- get date part, not time -->
            <td>{{obj.species.replace("_"," ")}}</td>
            <td>{{obj.count}}</td>
            <td>{{obj.type}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <br>
      <br>

      <div class="container-fluid">
        <div class="row h-100 text-center">
          <div id="col" class="col-md-12 my-auto">
            <h1 id="title">Visualise The Data</h1>
            <button id="btn1" type="button" class="btn btn-light" data-card="card1">Bar Chart</button>
            <button id="btn2" type="button" class="btn btn-light" data-card="card2">Heat Maps</button>
            <!--          <button id="btn3" type="button" class="btn btn-info" data-card="card3">Blueberries</button>-->
            <!--          <button id="btn4" type="button" class="btn btn-danger" data-card="card4">Watermelon</button>-->

            <div class="card-deck">
              <div id="card1" class="card">
                <species-barchart
                    :combined_data="combined_data"
                    :base_path="base_path"
                    @chartRendered="changeCursor">
                </species-barchart>
                <div class="card-body">
                  <h5 class="card-title">Bar Chart</h5>
                  <p class="card-text">A bar chart or bar graph is a chart or graph that presents categorical data with rectangular bars with heights or lengths proportional to the values that they represent.</p> </div>
              </div>
              <div id="card2" class="card">
                <species-heatmap
                    :combined_data="combined_data"
                    :base_path="base_path"
                    @chartRendered="changeCursor">
                </species-heatmap>
                <div class="card-body">
                  <h5 class="card-title">Heat Map</h5>
                  <p class="card-text">A heat map is a data
                    visualization technique that shows magnitude of a phenomenon as
                    color in two dimensions.</p> </div>
              </div>
              <!--            <div id="card3"class="card">-->
              <!--              <img src="https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" class="card-img-top cover" alt="...">-->
              <!--              <div class="card-body">-->
              <!--                <h5 class="card-title">Blueberries</h5>-->
              <!--                <p class="card-text">Blueberries are perennial flowering plants with blue or purple–colored berries. They are classified in the section Cyanococcus within the genus Vaccinium.</p>-->
              <!--              </div>-->
              <!--            </div>-->
              <!--            <div id="card4"class="card">-->
              <!--              <img src="https://cdn.suwalls.com/wallpapers/photography/sliced-watermelon-20523-2880x1800.jpg" class="card-img-top cover" alt="...">-->
              <!--              <div class="card-body">-->
              <!--                <h5 class="card-title">Watermelon</h5>-->
              <!--                <p class="card-text">Watermelon is a plant species in the family Cucurbitaceae, a vine-like flowering plant originating in West Africa. It is a highly cultivated fruit worldwide, having more than 1000 varieties.</p>-->
              <!--              </div>-->
              <!--            </div>-->
            </div>
          </div>


        </div>
      </div>




    </div>
  </div>
</template>


<script>
import "jquery/dist/jquery.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import Vuetify from 'vuetify'
import $ from 'jquery'
import SpeciesBarchart from './SpeciesBarchart.vue'
import SpeciesHeatmap from './SpeciesHeatmap.vue'
import { log } from 'util';
export default {
  name: "Results",
  components: {
    'species-barchart': SpeciesBarchart,
    'species-heatmap': SpeciesHeatmap,
  },
  props: {
    query_string: String,
    combined_data: Array,
    show_all: Boolean,
    base_path: String,
    lat_range: Object,
    lon_range: Object,
    date_range: Object,
  },
  data () {
    return {
      toggleResults:false,
      arrow_col: "count",
      arrow_up: false,
      download_data: "",
      downloading: false,
      barchart_rendered: false,
      heatmap_rendered: false,
    }
  },
  computed: {
    // first 100 rows of the data (only displays first 100 rows. In the Future: explore pagination)
    combined_data_100: function () {
      return this.combined_data
    }
  },
  methods: {


    // sort the data by the given column & current sort (arrow) direction
    sortBy: function ( key ) {
      this.arrow_col = key
      switch( key ) {
        case "project_name":
          this.combined_data_100.sort( (a,b) => this.arrow_up ? (a.proj < b.proj)-(a.proj > b.proj) : (a.proj > b.proj)-(a.proj < b.proj) )
          this.arrow_up = !this.arrow_up
          break
        case "site_name":
          this.combined_data_100.sort( (a,b) => this.arrow_up ? (a.site_name < b.site_name)-(a.site_name > b.site_name) : (a.site_name > b.site_name)-(a.site_name < b.site_name) )
          this.arrow_up = !this.arrow_up
          break
        case "lat":
          this.combined_data_100.sort( (a,b) => this.arrow_up ? (b.lat==null ? -1 : parseFloat(b.lat) - parseFloat(a.lat)) : (a.lat==null ? -1 : parseFloat(a.lat) - parseFloat(b.lat)) )
          this.arrow_up = !this.arrow_up
          break
        case "lon":
          this.combined_data_100.sort( (a,b) => this.arrow_up ? (b.lon==null ? -1 : parseFloat(b.lon) - parseFloat(a.lon)) : (a.lon==null ? -1 : parseFloat(a.lon) - parseFloat(b.lon)) )
          this.arrow_up = !this.arrow_up
          break
        case "date":
          this.combined_data_100.sort( (a,b) => this.arrow_up ? new Date(b.date) - new Date (a.date) : new Date(a.date) - new Date(b.date) )
          this.arrow_up = !this.arrow_up
          break
        case "species":
          this.combined_data_100.sort( (a,b) => this.arrow_up ? (a.species < b.species)-(a.species > b.species) : (a.species > b.species)-(a.species < b.species) )
          this.arrow_up = !this.arrow_up
          break
        case "count":
          this.combined_data_100.sort( (a,b) => this.arrow_up ? parseFloat(b.count) - parseFloat(a.count) : parseFloat(a.count) - parseFloat(b.count) )
          this.arrow_up = !this.arrow_up
          break
        case "type":
          this.combined_data_100.sort( (a,b) => this.arrow_up ? (a.type < b.type)-(a.type > b.type) : (a.type > b.type)-(a.type < b.type) )
          this.arrow_up = !this.arrow_up
          break
        default:
          log("Unable to reorder results")
      }
    },
    // reset the sort column & sort order & arrow direction
    resetArrow: function() {
      this.arrow_col = "count"
      this.arrow_up = false
    },
    // get the data to be downloaded as csv based on query search parameters
    getDownload: function() {
      this.downloading = true
      this.download_data = "Retrieving data..."
      this.$emit("changeCursor","wait")
      log('downloading')
      var path = this.base_path + `download?${this.query_string}`
      this.$http.get( path ).then( res => {
        this.download_data = ""
        var data = res.body
        if(data.length <= 0) {
          alert("No results to download. Please expand your search.")
          this.$emit("changeCursor","default")
          this.downloading = false
          return
        }
        // put data into csv format string
        var csvContent = [ Object.keys(data[0]).join(","), ...data.map(item => item==null ? "" : Object.values(item).join(","))]
        csvContent = csvContent.join("\n")
        // create blob object to compactly store data
        var blob = new Blob([csvContent],{type:'text/csv;charset=utf-8'})
        // encode data to be downloaded
        const url = URL.createObjectURL(blob)
        // download data as a file using the helper function
        this.downloadFile(url)
        this.$emit("changeCursor","default")
        this.downloading = false
        // destroy blob after download
        URL.revokeObjectURL(url)
      })
    },
    // create filename using current date/time. then create & auto-click url to dowwnload csv file without any popup windows
    downloadFile: function(url) {
      var d = new Date( Date.now() )
      var dateStr = d.toISOString().replace(/:/g,'_')
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download",("edna-download-" + dateStr + ".csv"))
      link.click()
    },
    // change loading cursor back to default cursor after both charts have rendered
    changeCursor: function(type) {
      if(type=='barchart') {
        this.barchart_rendered = true
      }
      else if(type=='heatmap'){
        this.heatmap_rendered = true
      }
      if(this.barchart_rendered && this.heatmap_rendered) {
        this.$emit("changeCursor","default")
        this.barchart_rendered = false
        this.heatmap_rendered = false
      }
    }
  },
  mounted() {
    console.log("Defining DataTable...");
    $('#table_id').DataTable({
                               "scrollY": 200,
                               "scrollX": true,
                               // destroy: true,
                               "ordering": false,
                               "info": true,
                               "lengthChange": false,
                               "bLengthChange": false,

                               paging: true,
                               searching: false,
                               retrieve: true,
                             });
    console.log("Defined DataTable.");
    $("#card1").hide();
    $("#card2").hide();
    $(".btn").on('click',function() {
      var cardId = $(this).attr('data-card');
      $('#'+cardId).toggle(300);
    })
    $(".btn").on('click',function() {
      var str = $(this).text();
      $("#title").html(lstr);
    });
  }
}
</script>


<style>
.tableLink{
  color: black;
}
.results {
  margin-left: 2%;
  margin-right: 2%;
  margin-bottom: 5%;
  margin-top: 2%;
}
*{
  font-family: 'Inria Sans', sans-serif;
}
.container h1{
  margin-bottom: 30px;
}
.container {
  height: 100vh;
}
.card-deck{
  margin-bottom: 30px;
  margin-top:30px;
  padding-bottom: 20px;
}
.card img{
  min-height: 200px;
  max-height: 100%;
}





/*.cover {*/
/*  object-fit: cover;*/
/*  width: 50px;*/
/*  height: 100px;*/
/*}*/
</style>