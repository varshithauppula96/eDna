<template>
  <div id="app-body">
    <div class="content">
      <h1>About eDNA</h1>
      <p>
        This is a data tool in development for accessing and visualizing aquatic environmental metabarcoding data
        <br> Data can also be downloaded using the command line interface <a :href=cli> this command line interface.</a>
        <br>  To read more about the project <a :href=web> click here.</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  data () {
    return {
      web: "https://www.bigelow.org/news/articles/2019-08-21.html",
      cli: "https://www.npmjs.com/package/edna-cli"
    }
  }
}
</script>

<style scoped>
.content {
  width: 100%;
  margin-left: 2%;
  margin-right: 2%;

  height: 100%;
  padding-top:25px;
}
</style>