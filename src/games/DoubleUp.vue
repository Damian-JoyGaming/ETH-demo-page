<template>
    <b-container fluid class="games-container">
        <iframe :src='doubleUpURL' frameborder="0"></iframe>
    </b-container>
</template>

<script>
  import helper from '../utils/helper';

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
      this.doubleUpURL = `http://192.168.1.24/DoubleUp/master/?userId=${this.doubleUpData.userID}&currency=${this.doubleUpData.tokenName}&port=${this.doubleUpData.doubleUpPort}&server=${this.doubleUpData.doubleUpServer}`;
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