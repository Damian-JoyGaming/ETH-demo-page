<template>
    <div class="MainPage">
        <navbar></navbar>
        <b-container class="mainContainer">
            <b-row>
                <b-col v-if="userIDTrue" class="set-user">
                    <span>ETH Account number: {{ userID }}</span>
                    <span><a v-bind:href="getTransactionsHistoryUrl()" target="_blank">Transactions History</a></span>
                </b-col>
            </b-row>
            <b-row v-if="userIDTrue" class="mainContent">
                <accountdata
                  :userBalanceWorld="userBalanceWorld"
                  :userBalancePlatform=userBalancePlatform
                  :userBalanceGameSession=userBalanceGameSession
                  :transferBalanceInProgress="transferBalanceInProgress"
                  :currentDenominationId="currentDenominationId">
                </accountdata>
                <transaction
                  :userID="userID"
                  :componentVisible="(parseInt(userBalanceWorld, 10) !== 0) || (parseInt(userBalancePlatform, 10) !== 0)"
                  :depositTabDisabled="parseInt(userBalanceWorld, 10) === 0"
                  :withdrawalTabDisabled="parseInt(userBalancePlatform, 10) === 0"
                  :isMetaMask="isMetaMask"
                  :tranasctionMinedTxHash="tranasctionMinedTxHash"
                  :transferBalanceInProgress="transferBalanceInProgress"
                >
                </transaction>
            </b-row>
            <b-row class="gameSession" v-if="(userIDTrue && ((parseFloat(userBalancePlatform).toFixed(2) > 0) || (parseFloat(userBalanceGameSession).toFixed(2) > 0)))">
                <b-col md="6">
                    <span class="gameLobbyHeader">Game Lobby</span>
                </b-col>
            </b-row>
            <b-row class="gameSession gameSessionBoxShadow" v-if="(userIDTrue && ((parseFloat(userBalancePlatform).toFixed(2) > 0) || (parseFloat(userBalanceGameSession).toFixed(2) > 0)))">
                <b-col md="2" class="gameSessionBuyCollectContainer">
                    <b-button class="gameSessionBuy gameSessionBuyCollect" size="lg" v-on:click="startGameSession" v-if="(!isGameSession) && (parseFloat(userBalancePlatform).toFixed(2) > 0)" :disabled="transferPending">
                        <span>Buy</span>
                    </b-button>
                    <b-button class="gameSessionCollect gameSessionBuyCollect" size="lg" v-on:click="endGameSession" v-if="parseFloat(userBalanceGameSession).toFixed(2) > 0" :disabled="transferPending">
                        <span>Collect</span>
                    </b-button>
                </b-col>
                <b-col md="10" class="doubleUpGameContainerTMP">
                    <div v-bind:class="{doubleUpGameTMP: true, gamesAvailable: !!(userBalanceGameSession > 0)}" :style='{ backgroundImage: "url(" + gamesBackgrounds("./doubleup_bg.png") + ")" }'>
                        <h1>Double Up!</h1>
                        <a v-if="userBalanceGameSession" onclick="window.open('./#/DoubleUp',
                           'newwindow',
                           'width=960, height=640,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no');
                          return false;">
                        </a>
                    </div>
                </b-col>
                <div class="inProgressBackground gameProgressSection" v-if="transferPendingBackground">
                    <div class="inProgressContent" v-if="transferPending">
                        <b-progress :value="confNum" :max="numberOfConfirmations + 1" show-progress animated></b-progress>
                    </div>
                </div>
            </b-row>
        </b-container>
        <div class="footer">
        </div>
        <denomination></denomination>
        <div class="loginPopup" v-if="loginPopup">
            <div class="loginContent">
                <h3>Login with</h3>
                <div class="metaMaskImage">
                    <a class="metaMaskLogin" v-on:click="loginWithMetaMask"></a>
                </div>
                <b-form-input v-model="userID" type="text" placeholder="ID" :disabled="userIDTrue == 1"></b-form-input>
                <b-button variant="primary" v-on:click="setUserID_req(userID)" id="setUserID" v-if="!userIDTrue">Set User ID</b-button>
            </div>
        </div>
    </div>
</template>


<script>
  /* eslint-disable no-unused-vars,object-shorthand */
  import helper from '../utils/helper';
  import gamesComp from './Games';
  import navbar from '../utils/navbar';
  import accountdata from './accountdata';
  import transaction from './transaction';
  import denomination from './denomination';

  const gamesBackgrounds = require.context('../assets/games', true, /\.(png|jpe?g|gif|svg)(\?.*)?$/);

  export default {
    name: 'MainPage',
    components: { gamesComp, navbar, denomination, accountdata, transaction },
    data() {
      return {
        userID: helper.methods.getUserID(),
        userIDTrue: false,
        userBalanceWorld: '',
        userBalancePlatform: '',
        userBalanceGameSession: '',
        isMetaMask: false,
        gameSession: true,
        isGameSession: false,
        transferPendingBackground: false,
        transferPending: false,
        transferTokensPendingBackground: false,
        transferTokensPending: false,
        confNum: 0,
        numberOfConfirmations: helper.data.config.numberOfConfirmations,
        gamesBackgrounds,
        loginPopup: false,
        progressBarAnimationInterval: {},
        tranasctionMinedTxHash: null,
        transferBalanceInProgress: false,
        currentDenominationId: 0
      };
    },
    mounted() {
      // Run this functions 1s after open the page
      setTimeout(() => {
        if (helper.methods.getUserIDStatus()) {
          this.setUserID_req(this.userID);
          this.isSessionOpen();
        }
      }, 1000);
      helper.data.bus.$on('latestBlock_RES', (event) => {
        console.log(event);
      });
      helper.data.bus.$on('setUserID_RES', () => {
        this.isSessionOpen();
        this.userIDTrue = true;
      });
      helper.data.bus.$on('getBalance_RES', (event) => {
        if (event.location === 'world') {
          this.userBalanceWorld = event.balance;
        } else if (event.location === 'platform') {
          this.userBalancePlatform = event.balance;
        } else if (event.location === 'gameSession') {
          this.userBalanceGameSession = event.balance /
            helper.data.config.userBalanceGameSessionDenomination;
        }
        this.transferBalanceInProgress = false;
      });
      helper.data.bus.$on('isSessionOpen_RES', (event) => {
        this.isGameSession = event;
      });
      helper.data.bus.$on('confNum', (event) => {
        this.confNum = parseInt(event + 1, 10);
        if (this.confNum >= this.numberOfConfirmations + 1) {
          this.transferPending = false;
          this.transferPendingBackground = false;
          this.getBalance();
          this.isSessionOpen();
          this.confNum = 0;
          clearInterval(this.progressBarAnimationInterval);
        }
      });
      helper.data.bus.$on('transferPending', (event) => {
        this.transferPending = event;
        this.progressBarAnimation();
      });
      helper.data.bus.$on('pendingToken_NOTIFY', (event) => {
        console.log(`event: ${event} `);
      });
      helper.data.bus.$on('loginPopup', (event) => {
        this.loginPopup = event;
      });
      helper.data.bus.$on('tranasctionMinedTxHash', (event) => {
        this.tranasctionMinedTxHash = event;
      });
      helper.data.bus.$on('balanceTransferInProcess', (event) => {
        if (!event) {
          this.getBalance();
        } else {
          this.transferBalanceInProgress = event;
        }
      });
      helper.data.bus.$on('changeCurrentDenominationId', (event) => {
        this.currentDenominationId = event;
      });


      if (typeof window.web3 !== 'undefined') {
        this.isMetaMask = true;
      }
    },
    destroyed() {
      helper.data.bus.$off('latestBlock_RES');
      helper.data.bus.$off('setUserID_RES');
      helper.data.bus.$off('getBalance_RES');
      helper.data.bus.$off('isSessionOpen_RES');
      helper.data.bus.$off('confNum');
      helper.data.bus.$off('startGame_NOTIFY');
      helper.data.bus.$off('loginPopup');
      helper.data.bus.$off('tranasctionMinedTxHash');
      helper.data.bus.$off('balanceTransferInProcess');
      helper.data.bus.$off('changeCurrentDenominationId');
    },
    methods: {
      // ............................ User functions (ID, Balances) ........
      setUserID_req(userID) {
        helper.methods.sendRequestCommand('setUserID_req', userID);
        this.getBalance(userID);
        helper.methods.setUserID(userID);
        this.loginPopup = false;
      },
      getBalance(userID = this.userID) {
        helper.methods.sendRequestCommand('getBalance', { getBalanceId: userID, getBalanceCurrency: 'JoyToken', location: 'world' });
        helper.methods.sendRequestCommand('getBalance', { getBalanceId: userID, getBalanceCurrency: 'JoyToken', location: 'platform' });
        helper.methods.sendRequestCommand('getBalance', { getBalanceId: userID, getBalanceCurrency: 'JoyToken', location: 'gameSession' });
      },
      loginWithMetaMask() {
        this.setUserID_req(window.web3.eth.coinbase);
        this.userID = window.web3.eth.coinbase;
      },
      // ............................ Game Session functions ...............
      startGameSession() {
        this.transferPendingBackground = true;
        helper.methods.sendRequest('startGameSession');
        this.gameSession = true;
      },
      endGameSession() {
        this.transferPendingBackground = true;
        helper.methods.sendRequest('endGameSession');
      },

      // ............................ Utils ................................
      isSessionOpen() {
        helper.methods.sendRequestCommand('isSessionOpen', 'blockchain');
      },
      progressBarAnimation() {
        this.confNum = 0;
        this.progressBarAnimationInterval = setInterval(() => {
          if (this.confNum <= this.numberOfConfirmations + 1) {
            this.confNum += 0.0075;
          } else {
            console.log('animation else');
            clearInterval(this.progressBarAnimationInterval);
          }
        }, 1000);
      },

      getTransactionsHistoryUrl() {
        return `https://ropsten.etherscan.io/address/${this.userID}`;
      }
    }
  };
</script>

<style lang="sass" src="./style/mainpage.sass">
</style>
