<template>
    <div class="MainPage">
        <navbar
          :connectionStatus="connectionStatus"
          :isLoggedIn="userIDTrue"
          :loadingApp="loadingApp"
        >
        </navbar>
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
        <notification></notification>
        <login
          :isLoggedIn="userIDTrue"
          :loginPopup="loginPopup"
        >
        </login>
      <div class="loadingApp" v-if="loadingApp"></div>
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
  import login from '../components/login';
  import notification from '../components/notification';
  import * as Cookies from 'tiny-cookie';

  let tmpUserId = null;

  export default {
    name: 'MainPage',
    components: { navbar, denomination, accountdata, transaction, gamelobby, login, notification },
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
        loadingApp: true,
        connectionStatus:false
      };
    },
    mounted() {
      // Run this functions 1s after open the page
      helper.data.bus.$on('latestBlock_RES', (event) => {
        console.log(event);
      });
      helper.data.bus.$on('setUserID_RES', (event) => {
        if (event) {
          this.userID = tmpUserId;
          tmpUserId = null;
          this.userIDTrue = true;
          this.getBalance(this.userID);
          helper.methods.setUserID(this.userID);
          this.loginPopup = false;
          this.isSessionOpen();
        } else {
          this.loginPopup = true;
        }
        this.loadingApp = false;
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
          helper.data.bus.$emit('checkUserSubscription', false);
        } else {
          this.transferBalanceInProgress = event;
        }
      });
      helper.data.bus.$on('changeCurrentDenominationId', (event) => {
        this.currentDenominationId = event;
      });

      helper.data.bus.$on('websocketConnected', (event) => {
        this.connectionStatus = true;
        this.loginVerification();
      });

      helper.data.bus.$on('websocketDisconnected', (event) => {
        this.connectionStatus = false;

      });

      helper.data.bus.$on('doLogin', (event) => {
        this.setUserID_req(event);
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
      helper.data.bus.$off('websocketConnected');
      helper.data.bus.$off('doLogin');
    },
    methods: {
      // ............................ User functions (ID, Balances) ........
      setUserID_req(userID) {
        this.loadingApp = true;
        tmpUserId = userID;
        helper.methods.sendRequestCommand('setUserId', userID);
      },
      getBalance(userID = this.userID) {
        this.transferBalanceInProgress = true;
        helper.methods.sendRequestCommand('getBalance', { getBalanceId: userID, getBalanceCurrency: 'JoyToken', location: 'world' });
        helper.methods.sendRequestCommand('getBalance', { getBalanceId: userID, getBalanceCurrency: 'JoyToken', location: 'platform' });
        helper.methods.sendRequestCommand('getBalance', { getBalanceId: userID, getBalanceCurrency: 'JoyToken', location: 'gameSession' });
      },
      loginWithMetaMask() {
        tmpUserId = window.web3.eth.coinbase;
        this.setUserID_req(tmpUserId);
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
      },

      loginVerification() {
        const JoyCoinUserId = Cookies.get('JoyCoinUserId');
        if (JoyCoinUserId) {
          this.setUserID_req(JoyCoinUserId);
        } else {
          this.loadingApp = false;
          this.loginPopup = true;
        }
      }
    }
  };
</script>

<style lang="sass" src="./style/mainpage.sass">
</style>
