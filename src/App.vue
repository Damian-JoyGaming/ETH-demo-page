<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import * as Cookies from 'tiny-cookie';
  import helper from './utils/helper';

  export default {
    name: 'app',
    beforeCreate() {
      // Check if cookie exist (if yes set UserID from it)
      if (Cookies.get('JoyCoinUserId')) {
        helper.methods.setUserID(Cookies.get('JoyCoinUserId'));
      }
    }
  };
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
