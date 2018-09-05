// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable no-unused-vars,object-shorthand */
import Vue from 'vue';
import VueAxios from 'vue-axios';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue';
import VueCookie from 'vue-cookie';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import App from './App';
import router from './router';
var Web3Local = require('web3');

Vue.config.productionTip = false;

Vue.use(BootstrapVue);

Vue.use(VueAxios, axios);

Vue.use(VueCookie);

(function() {



  (function() {
    if (typeof window.web3 !== 'undefined') {
      window.web3 = new Web3Local(window.web3.currentProvider);
    } else {
      const web3Provider = new Web3Local.providers.HttpProvider('https://infuranet.infura.io');
      window.web3 = new Web3Local(web3Provider);
    }
  }(window));

  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
  });


})(window);
/* eslint-disable no-new */

