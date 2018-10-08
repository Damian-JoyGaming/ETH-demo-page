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
import Web3Local from 'web3';
import _ from 'lodash';

Vue.config.productionTip = false;

Vue.use(BootstrapVue);

Vue.use(VueAxios, axios);

Vue.use(VueCookie);


(function() {

  (function() {
      window.isMetaMaskPlugin = false;
      if (_.get(window, 'web3')) {
        window.isMetaMaskPlugin = true;
      }
      window.web3 = new Web3Local(_.get(window.web3, 'currentProvider', Web3Local.givenProvider));
  }(window));

  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
  });


})(window);
/* eslint-disable no-new */

