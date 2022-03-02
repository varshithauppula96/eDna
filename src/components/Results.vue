<template>
    <div class="results">
        <h3>Results</h3>
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

        <!-- Plot bar chart of top species by site -->
        <species-barchart
            :combined_data="combined_data"
            :base_path="base_path"
            @chartRendered="changeCursor">
        </species-barchart>

        <!-- Plot the heatmap -->
        <species-heatmap
            :combined_data="combined_data"
            :base_path="base_path"
            @chartRendered="changeCursor">
        </species-heatmap>

        <!-- Table of results-->
        <b-container style="margin-bottom:1rem;" v-if="show_all && combined_data.length > 0">
            <!-- Column headers that can be clicked to sort by that column (arrow indicates ascending/descending) -->
            <b-row>
                <b-col>
                    <h6><a href="#" @click.prevent="sortBy('project_name')">PROJECT NAME {{arrow_col=="project_name" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></h6>
                </b-col>
                <b-col>
                    <h6><a href="#" @click.prevent="sortBy('site_name')">SITE NAME {{arrow_col=="site_name" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></h6>
                </b-col>
                <b-col>
                    <h6><a href="#" @click.prevent="sortBy('lat')">LATITUDE {{arrow_col=="lat" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></h6>
                </b-col>
                <b-col>
                    <h6><a href="#" @click.prevent="sortBy('lon')">LONGITUDE {{arrow_col=="lon" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></h6>
                </b-col>
                <b-col>
                    <h6><a href="#" @click.prevent="sortBy('date')">DATE {{arrow_col=="date" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></h6>
                </b-col>
                <b-col>
                    <h6><a href="#" @click.prevent="sortBy('species')">SPECIES {{arrow_col=="species" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></h6>
                </b-col>
                <b-col>
                    <h6><a href="#" @click.prevent="sortBy('count')">COUNT {{arrow_col=="count" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></h6>
                </b-col>
                <b-col>
                    <h6><a href="#" @click.prevent="sortBy('type')">TYPE {{arrow_col=="type" ? (arrow_up ? '&#x25B2;' : '&#x25BC;') : ''}}</a></h6>
                </b-col>
            </b-row>
            <!-- Data rows -->
            <b-row v-for="(obj,idx) in combined_data_100" :key="idx">
                <b-col>{{obj.proj}}</b-col>
                <b-col>{{obj.site_name.replace("_"," ")}}</b-col>
                <b-col>{{obj.lat!=null ? obj.lat : 'N/A'}}</b-col>
                <b-col>{{obj.lon!=null ? obj.lon : 'N/A'}}</b-col>
                <b-col>{{obj.date!=null ? obj.date.slice(0,10) : 'N/A'}}</b-col>    <!-- get date part, not time -->
                <b-col>{{obj.species.replace("_"," ")}}</b-col>
                <b-col>{{obj.count}}</b-col>
                <b-col>{{obj.type}}</b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
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
            return this.combined_data.slice(0,100)
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
    }
}
</script>

<style>
.results {
    margin-left: 2%;
    margin-right: 2%;
    margin-bottom: 5%;
    margin-top: 2%;
}
</style>