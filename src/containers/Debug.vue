<template>
  <div class="Debug">
    <navbar></navbar>
    <b-container fluid>
      <b-row >
        <b-col class="userID">
          <b-form-input v-model="userID" type="text" placeholder="ID"></b-form-input>
          <b-button variant="primary" v-on:click="setUserID(userID)" >SetUserID</b-button>
          <p class="userIDStatus">Your UserID: <span v-if="userIDStatus">{{ userID }}</span></p>
        </b-col>
        <b-col>
          <b-button variant="primary" v-on:click="sendRequest('subscribeBlocks'); enableSubscribeBlockButton = false" v-if="enableSubscribeBlockButton">subscribeBlocks</b-button>
          <div v-if="subscribeBlockNumber">
            <b-btn v-b-toggle.collapse1 variant="primary">{{ subscribeBlockNumber }}</b-btn>
            <b-collapse id="collapse1" class="mt-2">
              <b-card>
                <ul>
                  <li v-for="(value, key) in subscribeBlock">
                    {{ key }} : <span class="value">{{ value }}</span>
                  </li>
                </ul>
              </b-card>
            </b-collapse>
          </div>
        </b-col>
      </b-row>
    </b-container>
    <b-container class="main-container">
      <b-row>
        <b-col cols="6">
          <h4>GetBalace</h4>
          <b-form-input v-model="getBalanceId" type="text" placeholder="ID"></b-form-input>
          <b-form-select v-model="getBalanceCurrency" :options="currencies" class="mb-3" :value="null"></b-form-select>
          <p>User: {{ getBalanceId }}</p>
          <p>Unit: {{ getBalanceCurrency }}</p>
          <b-button variant="primary" v-on:click="sendRequestCommand('getBalance', { getBalanceId, getBalanceCurrency} )" >GetBalace</b-button>
          <b-form-input v-model="getBalanceReturn" type="text" placeholder="Return" disabled></b-form-input>
        </b-col>
        <b-col cols="6" class="latestBlock">
          <h4>Latest Block</h4>
          <b-button variant="primary" v-on:click="sendRequest('latestBlock')">getLatestBlock</b-button>
          <ul id="latestBlockList">
            <li v-for="(value, key) in latestBlockList">
              {{ key }} : <span class="value">{{ value }}</span>
            </li>
          </ul>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6">

        </b-col>
      </b-row>
      <b-row class="returnRow">
        <b-col md="12">
          <h5>Return Console: </h5>
          <textarea :value.prop="returnConsole" rows="7"></textarea>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  /* eslint-disable object-shorthand */

  import helper from '../utils/helper';
  import navbar from '../components/navbar';

  export default {
    name: 'hello',
    components: { navbar },
    data() {
      return {
        userID: '',
        userIDStatus: false,
        getBalanceId: '',
        getBalanceCurrency: '',
        returnConsole: '',
        getBalanceReturn: '',
        latestBlockList: {},
        subscribeBlockNumber: '',
        subscribeBlock: {},
        enableSubscribeBlockButton: true,
        currencies: [
          {
            value: null,
            text: 'Choose unit',
            disabled: true,
            slot: 'first'
          },
          { value: 'Eth', text: 'Eth' },
          { value: 'Wei', text: 'Wei' },
          { value: 'JoyAsset', text: 'JoyAsset' }]
      };
    },
    mounted() {
      helper.data.bus.$on('latestBlock_RES', (event) => {
        this.latestBlockList = JSON.parse(event);
      });
      helper.data.bus.$on('getBalance_RES', (event) => {
        this.getBalanceReturn = event;
      });
      helper.data.bus.$on('returnConsole', (event) => {
        this.returnConsole += event;
      });
    },
    destroyed() {
      helper.data.bus.$off('latestBlock_RES');
      helper.data.bus.$off('getBalance_RES');
      helper.data.bus.$off('returnConsole');
    },
    methods: {
      // send request (command) to server without data
      sendRequest(command) {
        helper.methods.sendRequest(command);
      },
      // send request (command) to a server with data {object}
      sendRequestCommand(command, requested) {
        helper.methods.sendRequestCommand(command, requested);
      },
      setUserID(userID) {
        console.log(userID);
        this.$root.websocket.send(`{ "command": "setUserID_req", "userID": "${userID}" }`);
      },
      // listing a websocket
      messageListener() {
        const ourThis = this;
        this.$root.websocket.onmessage = function (event) {
          console.log(event.data);
          try {
            const parsedEvent = JSON.parse(event.data);
            switch (parsedEvent.command) {
              case 'setUserID_RES':
                if (parsedEvent.status === 0) {
                  ourThis.userIDStatus = true;
                }
                break;
              case 'subscribeBlocks_RES':
                ourThis.subscribeBlockNumber = JSON.parse(parsedEvent.data).number;
                ourThis.subscribeBlock = JSON.parse(parsedEvent.data);
                break;
              default:
                console.log('Not such command');
            }
            ourThis.returnConsole += JSON.stringify(event.data, null, '\t');
          } catch (e) {
            console.log(e);
            ourThis.returnConsole += e;
          }
        };
      }
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  h1, h2
    font-weight: normal

  ul
    list-style-type: circle
    padding: 0

  li
    display: block
    margin: 0 10px
    .value
      font-weight: 600

  a
    color: #42b983

  .main-container
    .row
      display: flex
      justify-content: space-between

  .latestBlock
    max-width: 50%
    word-wrap: break-word

  .returnRow
    textarea
      width: 100%
  .userID
    width: auto
    display: flex
    input
      width: auto
    .userIDStatus
      span
        font-weight: bold

</style>
