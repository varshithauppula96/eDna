<template>

        <navbar id="f-navbar"
             class="navbar navbar-custom navbar-expand-lg shadow-lg p-1px mb-5 navbar-dark bg-white rounded"
             v-bind:class="[isSticky ? stickyClass : '']">
          <b-navbar-brand id="title"><router-link to="/" exact>{{title}}</router-link></b-navbar-brand>
          <b-navbar-nav class="ml-auto" >
            <b-nav-item><router-link to="/" exact>Home</router-link></b-nav-item>
            <b-nav-item><router-link to="/about" exact>About</router-link></b-nav-item>
            <b-nav-item><router-link to="/contact" exact>Contact</router-link></b-nav-item>
            <b-nav-item><router-link to="/result" exact>Search Edna</router-link></b-nav-item>

          </b-navbar-nav>
          </navbar>





</template>

<script>
export default {


    data() {
        return {
            title: 'Environmental DNA',
          isSticky: false,
          stickyClass: 'is_sticky',
          scrollPosition:0
        }
    }, created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods:{
    handleScroll(){
      this.scrollPosition = window.scrollY
      if(this.scrollPosition>=100){
        this.isSticky=true
      }else{
        this.isSticky=false
      }
    }
  }


}

</script>

<style scoped>
 li{
    margin: 0 10px;
}
a{

  color: #0c3759;
    padding: 6px 8px;
    border-radius: 10px;
}
nav{

  border-style: solid;
    padding: 0 2px;


}


a:hover{
    text-decoration: none;
  color: #edf0f2;

}





 .break1, .break2, .contact h2, .contact h3, p, header h4 {
   font-family: "Coming Soon", sans-serif;
 }




 nav ul li {
   font-size: 17px;
   font-family: "News Cycle";
 }

 .about-us a {
   font-family: "News Cycle", serif;
 }

 .navbar-brand {
   font-size: 25px;
   font-family: "News Cycle";
 }


 .navbar-default .navbar-brand {
   margin-left: 5%;
   color: cadetblue;
 }

 .navbar-default .navbar-brand:hover,
 .navbar-default .navbar-brand:focus {
   color: #FDFFFC;
   background-color: transparent;
 }

 .navbar-default .navbar-text {
   color: #210A2A;
 }

 .navbar-default .navbar-nav > li > a {
   color: #210A2A;
 }

 .navbar-default .navbar-nav > li > a:hover,
 .navbar-default .navbar-nav > li > a:focus {
   color: #F9F2F6;
   background-color: transparent;
   border-bottom: 1px solid #F9F2F6;
 }

 .navbar-default .navbar-nav > .active > a,
 .navbar-default .navbar-nav > .active > a:hover,
 .navbar-default .navbar-nav > .active > a:focus {
   color: #F9F2F6;
   background-color: #e7e7e7;
 }

 .navbar-default .navbar-nav > .disabled > a,
 .navbar-default .navbar-nav > .disabled > a:hover,
 .navbar-default .navbar-nav > .disabled > a:focus {
   color: #F9F2F6;
   background-color: transparent;
 }

 .navbar-default .navbar-toggle {
   border-color: #ddd;
 }



 .navbar-default .navbar-toggle:hover,
 .navbar-default .navbar-toggle:focus {
   background-color: #ddd;
 }

 .navbar-default .navbar-toggle .icon-bar {
   background-color: #888;
 }

 .navbar-default .navbar-collapse,
 .navbar-default .navbar-form {
   border-color: #e7e7e7;

 }

 .navbar-default .navbar-nav > .open > a,
 .navbar-default .navbar-nav > .open > a:hover,
 .navbar-default .navbar-nav > .open > a:focus {
   color: #555;
   background-color: #e7e7e7;
 }




 .navbar.is_sticky {

   position: fixed;
   top: 0;
   right: 0;
   left: 0;
   z-index: 1030;
   width: 100%;
   -webkit-animation: .95s ease-in-out 0s normal none 1 running fadeInDown;
   animation: .95s ease-in-out 0s normal none 1 running fadeInDown;
   -webkit-transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
   transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
   -webkit-box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.1);
   box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.1);
 }
</style>
