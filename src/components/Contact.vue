
<template>
  <div id="app-body">
    <div class="content">
      <h1>Contact Us</h1>
      <p>
        <ul>
          <!-- List email address link(s) -->
          <li>Email:</li>
            <ul v-for="(email,idx) in emails" :key="idx"> 
              <a :href="'mailto:'+String(email)">{{email}}</a>
            </ul>
          <!-- Bigelow website -->
          <li>Website: <a :href="String(web)">{{web}}</a></li>
        </ul>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Contact',
  data(){
    return {
      emails: ['nrecord@bigelow.org'], // could add more email addresses to this list
      web: 'https://www.bigelow.org'
    }
  }
}
</script>