<template>
       <b-navbar toggleable="md" type="dark">
           <b-navbar-brand to="/">
               <img src="../assets/JoyToken_White.png" class="brand-image" alt="BV">
               Home
           </b-navbar-brand>
           <b-nav-toggle target="nav_collapse"></b-nav-toggle>
           <b-collapse is-nav id="nav_collapse">

             <b-navbar-nav>
                <b-nav-item v-if="connectionStatus"><b-badge variant="success">Server status</b-badge></b-nav-item>
                <b-nav-item v-else><b-badge variant="danger">Server status</b-badge></b-nav-item>
             </b-navbar-nav>

               <!-- Right aligned nav items -->
               <b-navbar-nav class="ml-auto" v-if="isLoggedIn">
                   <b-nav-item to="/debug" class="debug-url" v-if="false">Debug</b-nav-item>
                   <b-nav-item v-if="!developmentSubscription.infoMessage" class="subscriptionButton" v-on:click="subscriptionButtonHandler">Buy Dev  Subscription</b-nav-item>
                   <b-navbar-nav class="subscriptionInfo" v-if="developmentSubscription.infoMessage">
                     <b-nav-text>{{developmentSubscription.infoMessage}}</b-nav-text>
                   </b-navbar-nav>
                   <b-nav-item class="logoutButton" v-if="isLoggedIn" v-on:click="logOut">Logout</b-nav-item>
                   <b-nav-item class="logoutButton" v-else v-on:click="login">Login</b-nav-item>
               </b-navbar-nav>

           </b-collapse>
       </b-navbar>
</template>

<script>
  import helper from '../utils/helper';
  import moment from 'moment';

  let subscriptionAddressRequest = false;

  export default {
    name: 'navbar',
    props:[
      'connectionStatus',
      'isLoggedIn',
      'loadingApp'
    ],
    data() {
      return {
        reconnectButton: false,
        developmentSubscription: {
          price: -1,
          expired: 0,
          infoMessage: 'Checking Subscription...'
        }
      };
    },
    watch: {

        developmentSubscription: function (val) {
          this.$emit('checkSubscription', !!val.expired);
        }

    },
    mounted() {

      helper.data.bus.$on('getUserExpired', ({expired_sec}) => {
        let date = null;
        if (expired_sec > 0) {
          date = moment.utc(new Date(Date.now() + 1000 * expired_sec).getTime()).format('DD-MM-YYYY');
        }
        this.developmentSubscription = Object.assign({}, this.developmentSubscription, {
          expired: expired_sec,
          infoMessage: expired_sec > 0 ? `Experation date: ${date}` : ''
        });

      });

      helper.data.bus.$on('subscriptionAddress', () => {
        this.getSubscriptionPrice();
      });

      helper.data.bus.$on('subscriptionPrice', (price) => {
        this.developmentSubscription.price = price;
        this.checkUserSubscription();
      });

      helper.data.bus.$on('checkUserSubscription', () => {
        this.checkUserSubscription();
      });

      helper.data.bus.$on('pendingSubscription', () => {
        this.developmentSubscription = Object.assign({}, this.developmentSubscription, {
          infoMessage: 'Pending Subscription...'
        });
      });

    },
    destroyed() {

    },
    beforeUpdate() {
      this.checkSubscriptionAddress();
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
      },
      subscriptionButtonHandler() {
        const popupData = {
          visible: true,
          title: 'Developer Subscription',
          message: `Would you like to buy developer subscription for 1 month for ${this.developmentSubscription.price} Wei ?`,
          action1: {title: 'Submit', visible: true, type: 'success', callback: () => {
            helper.data.bus.$emit('notificationPopup', {visible: false});
            helper.methods.buyDeveloperSubscription();
          }},
          action2: {title: 'Reject', visible: true, type: 'danger', callback: () => {
            helper.data.bus.$emit('notificationPopup', {visible: false});
          }}
        };
        helper.data.bus.$emit('notificationPopup', popupData);
      },
      checkUserSubscription() {
        this.developmentSubscription = Object.assign({}, this.developmentSubscription, {
          infoMessage: 'Checking Subscription...'
        });
        helper.methods.sendRequestCommand('getUserExpired', {});
      },
      checkSubscriptionAddress() {
        if (this.isLoggedIn && !subscriptionAddressRequest) {
          subscriptionAddressRequest = true;
          this.developmentSubscription = Object.assign({}, this.developmentSubscription, {
            infoMessage: 'Checking Subscription.'
          });
          helper.methods.sendRequestCommand('getSubscriptionAddress');
        }
      },
      getSubscriptionPrice() {
        helper.methods.getSubscriptionPrice();
      }
    }
  };
</script>

<style lang="sass" src="./style/navbar.sass">
</style>
