<template>
  <div id="app">
    <div id="header">
      <app-header></app-header>
    </div>
    <div id="scrollable">
        <router-view></router-view>
        <app-footer></app-footer>
    </div>
  </div>
</template>

<script>

// register components locally
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export default {
  components: {
    'app-header': Header,
    'app-footer': Footer
  },

  name: 'app', // component name
  data () { // no data to return
    return {
    }
  }
}
</script>

<style>
/* Define styles within each component */
html, body {
  font-family: 'dinot', Avenir, Arial, Helvetica, sans-serif;
  height: 100%;
  margin: 0;
}
.content {
  margin-left: 5%;
  margin-right: 5%;

}

#scrollable {
  height: 100%;
  overflow-y: auto;

}
#app-body {
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: white;
	//background-image: url("https://c4.wallpaperflare.com/wallpaper/159/917/66/sea-horizon-minimalism-gray-wallpaper-preview.jpg");
	background: white;
  background-repeat: no-repeat;
    background-size: cover;
	background-blend-mode: overlay;


	min-height: calc(100vh - 23rem);
  min-height: -webkit-calc(100vh - 23rem);
  min-height: -moz-calc(100vh - 23rem);
  overflow: hidden;
}
</style>


{property}{sides}-{breakpoint}-{size}
