// import vue components for each of the website's pages
import About from './components/About.vue';
import Body from './components/Body.vue';
import Contact from './components/Contact.vue';
import Home from "./components/Home";
import Results from "./components/Results";
import Search from "./components/Search";

import SearchResults from "./components/SearchResults";
import Team from "./components/Team";

// export paths to components to be used by main.js to run the Vue app
export default [
    {path: '/', component: Home},
    {path: '/body', component: Body},
    {path: '/about', component: About},
    {path: '/contact', component: Contact},
    {path: '/home', component: Home},
    {path: '/result', component: SearchResults},
    {path: '/team', component: Team}

]