<template>
       <b-navbar toggleable="md" type="dark">
           <b-navbar-brand to="/">
               <img src="../assets/JoyToken_White.png" class="brand-image" alt="BV">
               Home
           </b-navbar-brand>
           <b-nav-toggle target="nav_collapse"></b-nav-toggle>
           <b-collapse is-nav id="nav_collapse">

               <b-nav is-nav-bar>
                   <b-nav-item v-if="connectionStatus"><b-badge variant="success">Server status</b-badge></b-nav-item>
                   <b-nav-item v-else><b-badge variant="danger">Server status</b-badge></b-nav-item>
               </b-nav>

               <!-- Right aligned nav items -->
               <b-nav is-nav-bar class="ml-auto">
                   <b-nav-item to="/debug" class="debug-url" v-if="false">Debug</b-nav-item>
                   <b-nav-item class="logoutButton" v-if="isLoggedIn" v-on:click="logOut">Logout</b-nav-item>
                   <b-nav-item class="logoutButton" v-else v-on:click="login">Login</b-nav-item>
                   <b-nav-item class="joinButton">Join</b-nav-item>
               </b-nav>

           </b-collapse>
       </b-navbar>
</template>

<script>
  import helper from '../utils/helper';

  export default {
    name: 'navbar',
    props:[
      'connectionStatus',
      'isLoggedIn'
    ],
    data() {
      return {
        reconnectButton: false
      };
    },
    mounted() {

    },
    destroyed() {

    },
    methods: {
      // Reconnect to websocket
      WSReconnect() {
        helper.methods.WSReconnect();
        setTimeout(() => { this.checkingStatus(); }, 1000);
      },
      // Logout function
      logOut() {
        helper.methods.logOut();
      },
      login() {
        helper.data.bus.$emit('loginPopup', true);
      }
    }
  };
</script>

<style lang="sass" src="./style/navbar.sass">
</style>
