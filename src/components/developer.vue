<template>
  <b-col class="developer" md="12">
    <h5>DEVELOPER INFORMATION:</h5>
    <b-alert :show="dismissCountDown"
             dismissible
             variant="info"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged">
      <p>Copied</p>
    </b-alert>
    <p>Test Game Server Url: <span @click="copyToClipboard('gameServerUrlElement')" ref="gameServerUrlElement">{{testGameServerUrl}}</span></p>
    <p>UserID for Login: <span @click="copyToClipboard('userIDDevElement')" ref="userIDDevElement">{{userID}}</span></p>
    <p>Developer API Documentation: <b-btn class="downloadDevBtn" variant="info" @click="downloadApiDocumentation()">Download</b-btn></p>
  </b-col>
</template>

<script>
  // import helper from '../utils/helper';
  import config from '../utils/utils-config.json';

  export default {
    name: 'developer',
    props: [
      'userID'
    ],
    data() {
      return {
        testGameServerUrl: '',
        developerApiDocumentUrl: '',
        dismissSecs: 3,
        dismissCountDown: 0
      };
    },
    methods: {
      downloadApiDocumentation() {
        window.open(this.developerApiDocumentUrl);
      },
      copyToClipboard(el) {
        this.dismissCountDown = this.dismissSecs;
        const range = window.getSelection().getRangeAt(0);

        range.selectNode(this.$refs[el]);
        try {
          window.getSelection().addRange(range);
        } catch (e) {
          console.error('need to remove');
        }

        document.execCommand('copy');
      },
      countDownChanged (dismissCountDown) {
        this.dismissCountDown = dismissCountDown;
      }
    },
    created() {
      this.testGameServerUrl = config.developerServerUrl;
      this.developerApiDocumentUrl = config.developerApiDocumentUrl;
    }
  };

</script>
