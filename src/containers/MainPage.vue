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
                  :currentDenominationId="currentDenominationId"
                >
                </accountdata>
                <transaction
                  :userID="userID"
                  :componentVisible="(parseInt(userBalanceWorld, 10) !== 0) || (parseInt(userBalancePlatform, 10) !== 0)"
                  :depositTabDisabled="parseInt(userBalanceWorld, 10) === 0"
                  :withdrawalTabDisabled="parseInt(userBalancePlatform, 10) === 0"
                  :isMetaMask="isMetaMask"
                  :tranasctionMinedTxHash="tranasctionMinedTxHash"
                  :transferBalanceInProgress="transferBalanceInProgress"
                  :currentDenominationId="currentDenominationId"
                >
                </transaction>
            </b-row>
            <gamelobby
              :componentVisible="(userIDTrue && ((parseFloat(userBalancePlatform).toFixed(2) > 0) || (parseFloat(userBalanceGameSession).toFixed(2) > 0)))"
              :buyButtonVisible="(!isGameSession) && (parseFloat(userBalancePlatform).toFixed(2) > 0)"
              :collectButtonVisible="parseFloat(userBalanceGameSession).toFixed(2) > 0"
              :transferPending="transferPending"
              :canPlayGame="!!(userBalanceGameSession > 0)"
              :confNum="confNum"
              :numberOfConfirmations="numberOfConfirmations"
            >
            </gamelobby>
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
  import navbar from '../components/navbar';
  import accountdata from '../components/accountdata';
  import transaction from '../components/transaction';
  import denomination from '../components/denomination';
  import gamelobby from '../components/gamelobby';

  export default {
    name: 'MainPage',
    components: { navbar, denomination, accountdata, transaction, gamelobby },
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
        transferPending: false,
        confNum: 0,
        numberOfConfirmations: helper.data.config.numberOfConfirmations,
        loginPopup: false,
        progressBarAnimationInterval: {},
        tranasctionMinedTxHash: null,
        transferBalanceInProgress: false,
        currentDenominationId: 0,
        initApp: true
      };
    },
    mounted() {
      // Run this functions 1s after open the page
      setTimeout(() => {
        if (helper.methods.getUserIDStatus()) {
          this.setUserID_req(this.userID);
          this.isSessionOpen();
        } else {
          this.loginPopup = true;
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
