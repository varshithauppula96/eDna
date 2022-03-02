<template>
    <div role="navigation" id="main-nav">
        <b-navbar toggleable="md" type="dark">
            <!-- eDNA logo -->
            <b-navbar-brand id="title"><router-link to="/" exact><img id="logo_image" src="@/assets/edna.svg">&nbsp;{{title}}</router-link></b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <!-- Navigation menu -->
            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav class="ml-auto" >
                    <b-nav-item><router-link to="/" exact>Home</router-link></b-nav-item>
                    <b-nav-item><router-link to="/about" exact>About</router-link></b-nav-item>
                    <b-nav-item><router-link to="/contact" exact>Contact</router-link></b-nav-item>
                  <b-nav-item><router-link to="/home" exact>HomeMain</router-link></b-nav-item>

                </b-navbar-nav>

            </b-collapse>
        </b-navbar>
    </div>
</template>

<script>
export default {
    data() {
        return {
            title: 'Environmental DNA'
        }
    },
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

#main-nav {
  background-color: #a7c8db;


}
#title{
    position: relative;
    padding: 5px 5px;
    font-size: 3.0rem;
}
#logo_image{
    width: 46px;
    height: 46px;
    border-radius: 50%;
    overflow: hidden;
    margin-top: -6px;
}
.router-link-active, a:hover{
    color: #edf0f2;
}
a:hover{
    text-decoration: none;
  color: #edf0f2;

} 
</style>
