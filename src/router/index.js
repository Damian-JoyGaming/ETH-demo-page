import Vue from 'vue';
import Router from 'vue-router';
import Debug from '@/containers/Debug';
import MainPage from '@/containers/MainPage';
import DoubleUpGame from '@/games/DoubleUp';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/debug',
      name: 'Debug',
      component: Debug
    },
    {
      path: '/',
      name: 'MainPage',
      component: MainPage
    },
    {
      path: '/DoubleUp',
      name: 'Double Up',
      component: DoubleUpGame
    }
  ]
});
