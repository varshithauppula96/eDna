<template>
  <div id="app-map">
    <h3>Map</h3>
    <div class="map-box" :style="{cursor : curCursor}">

        <!-- Leaflet Map -->
        <l-map
            ref="map"
            :minZoom="1"
            :zoom="zoom"
            :center="center"
            :bounds="bounds"
            :maxBounds="maxBounds"
            :maxBoundsViscosity="0.9"
            style="height: 100%"
            @update:center="centerUpdate"
            @update:zoom="zoomUpdate"
            @update:bounds="boundsUpdated"
        >
            <l-tile-layer :url="url" :attribution="attribution"/>
            <l-control-scale></l-control-scale>

            <!-- Map markers -->
            <l-marker v-for="marker in locations" 
                :key="marker.index" 
                :lat-lng="[marker.lat, marker.lon]" 
                :icon="marker.lat>rect_bounds[0][0] && marker.lat<rect_bounds[1][0] && marker.lon>rect_bounds[0][1] && marker.lon<rect_bounds[1][1] ? iconRed : iconBlue" 
                @click="innerClick(marker.name)"
                 >
              <!-- Marker tooltips -->
              <l-tooltip :options="{permanent: false, interactive: true}">
                <div>
                  Site name: {{marker.name.replace("_"," ")}}<br>
                  Coord: { {{marker.lat}}, {{marker.lon}} }
                </div>
              </l-tooltip>
            </l-marker>

            <!-- Red rectangle on map -->
            <l-rectangle
              :bounds="rect_bounds"
              :color="'red'"
              :fillOpacity="0.1"
              @mousedown="boxClicked"
              ref="rect">
            </l-rectangle>
        </l-map>
    </div>

    <!-- Map reset button -->
    <p style="text-align:right; padding-top:0.5rem;">
      <b-button @click.prevent="resetBox">Reset Map</b-button>
    </p>
  </div>
</template>

<script>
// import { log } from 'util'
import { latLngBounds, latLng, icon } from "leaflet";
import { LMap, LTileLayer, LMarker, LTooltip, LRectangle, LControlScale } from "vue2-leaflet";

export default {
  name: "locationsMap",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LTooltip,
    LRectangle,
    LControlScale,
  },
  props: {
    base_path: String,
    lat_range: Object,
    lon_range: Object,
    init_lat_range: Object,
		init_lon_range: Object,
  },
  data() {
    return {
      zoom: 8, // initial zoom level
      center: [0,0], // initial lat/lon center
      bounds: null,
      url: "https://{s}.tile.osm.org/{z}/{x}/{y}.png", // open street maps
      attribution:
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors', // open street maps attribution
      maxBounds: latLngBounds(latLng(-90, -180),latLng(90, 180)),
      locations: [],
      iconBlue: icon({
        iconUrl: require("../assets/circle_blue.svg"),
        iconSize: [22, 27],
        popupAnchor: [1, -8],
        tooltipAnchor: [1, -8],
      }),
      iconRed: icon({
        iconUrl: require("../assets/circle_red.svg"),
        iconSize: [22, 27],
        popupAnchor: [1, -8],
        tooltipAnchor: [1, -8],
      }),
      curCursor: "",
    };
  },
  computed: {
    // lat lon bounds of red rectangle
    rect_bounds: function() {
      return [[this.lat_range.min,this.lon_range.min],[this.lat_range.max,this.lon_range.max]]
    },
    rectangle: function() {
      return this.$refs.rect.mapObject
    }
  },
  methods: {
    // update map zoom level
    zoomUpdate(zoom) {
      this.zoom = zoom;
    },
    // update center lat/lon coord of map
    centerUpdate(center) {
      this.center = center;
    },
    // update map lat/lon bounds
    boundsUpdated (bounds) {
      this.bounds = bounds;
    },
    // emit clickedLocation event with site name when a marker is clicked
    innerClick(siteName) {
      this.$emit("clickedLocation", siteName);
    },
    // Adjust lat/lon range & red rectangle coordinates when the red box is clicked/dragged
    // There are lots of commented out lines involving changing the cursor -
    // That was me trying to figure out how to change the cursur to arrows when hovering over the red box to indicate it's draggable
    boxClicked() {
      // this.curCursor = "ns-resize"
      // this.$refs.rect.$('.leaflet-interactive').css('cursor','ns-resize')
      // this.$('.leaflet-dragging').css('cursor','ns-resize')
      this.map.on('mousemove', (e) => {
        // this.curCursor = "ns-resize"
        // this.$refs.rect.style.cursor = 'crosshair'
        // this.$refs.rect.mapObject.$('.leaflet-container').css('cursor','ns-resize')
        var bottomLeft = this.map.getBounds()._southWest // latlng coordinate of bottom left map corner
        var topRight = this.map.getBounds()._northEast // latlng coordinate of top right map corner
        var latThresh = Math.abs(bottomLeft.lat-topRight.lat)/15 // update if mouse is this close to box lat line
        var lonThresh = Math.abs(bottomLeft.lng-topRight.lng)/15 // update if mouse is this close to box lon line
        var lat_range = {min: this.rect_bounds[0][0], max: this.rect_bounds[1][0]}
        var lon_range = {min: this.rect_bounds[0][1], max: this.rect_bounds[1][1]}
        // update lat
        if( Math.abs(e.latlng.lat - lat_range.min) < latThresh ) {
          lat_range.min = e.latlng.lat
          this.map.dragging.disable() // disable map pan while dragging box
          // this.curCursor = "ns-resize"
          // this.map.$('.leaflet-mouse-marker').css('cursor','ns-resize')
        }
        else if( Math.abs(e.latlng.lat - lat_range.max) < latThresh ) {
          lat_range.max = e.latlng.lat
          this.map.dragging.disable() // disable map pan while dragging box
          // this.curCursor = "ns-resize"
          // this.map.$('.leaflet-mouse-marker').css('cursor','ns-resize')
        }
        // update lon
        if( Math.abs(e.latlng.lng - lon_range.min) < lonThresh ) {
          lon_range.min = e.latlng.lng
          this.map.dragging.disable() // disable map pan while dragging box
          // this.map.$('.leaflet-mouse-marker').css('cursor','ew-resize')
        }
        else if( Math.abs(e.latlng.lng - lon_range.max) < lonThresh ) {
          lon_range.max = e.latlng.lng
          this.map.dragging.disable() // disable map pan while dragging box
          // this.map.$('.leaflet-mouse-marker').css('cursor','ew-resize')
        }
        this.$emit("updateLatLonBox", {lat_range:lat_range, lon_range:lon_range}) // send mouse coords to Body to update the lat/lon search parameters
      })
      this.map.on('mouseup', () => {
        this.map.removeEventListener('mousemove')
        this.map.dragging.enable() // enable map pan when no longer dragging box
        // this.$('.leaflet-mouse-marker').css('cursor','') // set cursor back to normal
      })
    },
    // reset map zoom & center and the red box to their original values
    resetBox() {
      this.$emit("updateLatLonBox", {lat_range:JSON.parse(JSON.stringify(this.init_lat_range)), lon_range:JSON.parse(JSON.stringify(this.init_lon_range))})
      this.$nextTick(()=> {
        this.map.fitBounds(this.rect_bounds)
      })
    },
  },
  // initialize marker locations, map bounds/location, and red rectangle bounds & locations when Map component is first mounted
  mounted: function() {
    this.$http.get(this.base_path + "start/latlon").then( res => {
      this.locations = res.body
      this.$emit("get_coords",this.locations) // send locations to Body
    
      // get map object & resize to fit latlng box
      this.$nextTick(()=> {
        this.map = this.$refs.map.mapObject
        // this.map.fitBounds(this.rect_bounds) // initialize map bounds to rectangle bounds
        this.resetBox()
      })
    })
	}

};
</script>

<style>
.app-map{
  padding: 0.5em
}
.map-box{


  height: 450px;
  /*width: 800px;*/
  overflow: hidden;
  padding:20px;
  border-style: solid;

}
</style>
