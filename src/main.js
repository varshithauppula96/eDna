import Vue from 'vue'
import App from './App.vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import Routes from './router.js'
import BootstrapVue from 'bootstrap-vue'

import { Icon } from 'leaflet'

/* load styles from style sheet */
import 'leaflet/dist/leaflet.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// all styles in stylesheet instead of individual components
// uncomment the line below to use the css in ./styles/stylesheet.css isntead of the css that is in the style tag of each individual component (including App.vue)
// *** Note: using the styles in the stylesheet below cause the results tale not to show properly. That should be fixed before the stylesheet is used!
// import "./styles/stylesheet.scss"

// register imported packages in Vue
Vue.use(VueResource);
Vue.use(VueRouter);
Vue.use(BootstrapVue)

// this part resolves an issue where the markers would not appear
delete Icon.Default.prototype._getIconUrl;

// markers on map
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});


Vue.config.productionTip = false

// register routes in Vue app
const router = new VueRouter({
  routes: Routes,
  mode: 'history'
})

// create Vue instance
new Vue({
  el: '#app',
  render: h => h(App),
  router: router
})

// modifying metadata
// https://alligator.io/vuejs/vue-router-modify-head/
