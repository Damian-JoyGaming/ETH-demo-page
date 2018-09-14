<template>
  <b-col class="developer" md="12">
    <h5>DEVELOPER INFORMATION:</h5>

    <p>Test Game Server Url: <span>{{testGameServerUrl}}</span></p>
    <p>Developer API Documentation: <b-btn class="downloadDevBtn" variant="info" @click="downloadApiDocumentation()">Download</b-btn></p>
  </b-col>
</template>

<script>
  // import helper from '../utils/helper';
  import config from '../utils/utils-config.json';

  export default {
    name: 'developer',
    props: [

    ],
    data() {
      return {
        testGameServerUrl: '',
        developerApiDocumentUrl: ''
      };
    },
    methods: {
      downloadApiDocumentation() {
        window.open(this.developerApiDocumentUrl);
      }
    },
    created() {
      this.testGameServerUrl = config.serverURL;
      this.developerApiDocumentUrl = config.developerApiDocumentUrl;
    }
  };

</script>
