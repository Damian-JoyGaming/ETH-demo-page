<template>
       <b-navbar toggleable="md" type="dark">



           <b-navbar-brand to="/">
               <img src="../assets/JoyToken_White.png" class="brand-image" alt="BV">
               Home
           </b-navbar-brand>
           <b-nav-toggle target="nav_collapse"></b-nav-toggle>
           <b-collapse is-nav id="nav_collapse">

               <b-nav is-nav-bar>
                   <b-nav-item v-if="wsStatus === 1"><b-badge variant="success">Server status</b-badge></b-nav-item>
                   <b-nav-item v-else><b-badge variant="danger">Server status</b-badge></b-nav-item>
               </b-nav>

               <!-- Right aligned nav items -->
               <b-nav is-nav-bar class="ml-auto">
                   <b-nav-item to="/debug" class="debug-url" v-if="false">Debug</b-nav-item>
                   <b-nav-item class="logoutButton" v-if="userIDStatus" v-on:click="logOut">Logout</b-nav-item>
                   <b-nav-item class="logoutButton" v-else v-on:click="login">Login</b-nav-item>
                   <b-nav-item class="joinButton">Join</b-nav-item>
               </b-nav>

           </b-collapse>
       </b-navbar>
</template>

<script>
  import helper from './helper';

  export default {
    name: 'navbar',
    data() {
      return {
        wsStatus: '',
        reconnectButton: true,
        userIDStatus: '',
      };
    },
    mounted() {
      // Check status of Websocket second after mounted 'navbar' component
      setTimeout(() => { this.checkingStatus(); }, 1000);
      // Check status of Websocket every 30 second
      setInterval(() => { this.checkingStatus(); }, 30000);
      // Listener at 'setUserID' to check if user ID is set (true/false)
      helper.data.bus.$on('setUserID', (event) => {
        this.userIDStatus = event;
      });
    },
    destroyed() {
      // On destoryed of component (close page) close the listener
      helper.data.bus.$off('setUserID');
    },
    methods: {
      // Checking status of websocket
      checkingStatus() {
        this.wsStatus = helper.methods.getWSStatus();
      },
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
      },
    },
  };
</script>

<style lang="sass" src="./style/navbar.sass">
</style>