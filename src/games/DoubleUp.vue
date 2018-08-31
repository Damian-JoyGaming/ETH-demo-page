<template>
    <b-container fluid class="games-container">
        <iframe :src='doubleUpURL' frameborder="0"></iframe>
    </b-container>
</template>

<script>
  import helper from '../utils/helper';
  import * as Cookies from 'tiny-cookie';

  export default {
    name: 'DoubleUp',
    data() {
      return {
        doubleUpData: {},
        doubleUpURL: ''
      };
    },
    beforeMount() {
      this.doubleUpData = helper.methods.getGamesParameters();
      this.doubleUpData.userID = Cookies.get('JoyCoinUserId');
      this.doubleUpURL = `${this.doubleUpData.clientServer}?userId=${this.doubleUpData.userID}&currency=${this.doubleUpData.tokenName}&port=${this.doubleUpData.doubleUpPort}&server=${this.doubleUpData.doubleUpServer}`;
    }
  };
</script>

<style scoped lang="sass">
    .games-container
        height: 100vh
    .container-fluid
        padding: 0
    iframe
        overflow: hidden
        width: 100%
        height: 100%
</style>
