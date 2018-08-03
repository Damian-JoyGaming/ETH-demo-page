<template>
    <div class="MainPage">
        <navbar></navbar>
        <b-container class="mainContainer">
            <b-row>
                <b-col v-if="userIDTrue" md="9" class="set-user">
                    <span>ETH Account number: {{ userID }}</span>
                </b-col>
            </b-row>
            <b-row v-if="userIDTrue" class="mainContent">
                <b-col class="userData" md="5">
                    <h5>YOUR ACCOUNT</h5>
                    <p>JOY: <span id="userBalanceWorld">{{ userBalanceWorld }}</span></p>
                    <p>Casino Balance: <span id="userBalancePlatform">{{ userBalancePlatform }}</span></p>
                    <p>Game Lobby Balance: <span id="userBalanceGameSession">{{ userBalanceGameSession }}</span></p>
                    <div class="denominationContainer"><span class="active">uCoins</span> | <span>mCoins</span></div>
                </b-col>
                <b-col md="7" class="transferBalanceContainter">
                    <div class="transferBalance" v-if="(parseInt(userBalanceWorld, 10) !== 0) || (parseInt(userBalancePlatform, 10) !== 0)">
                        <h5>TRANSACTIONS</h5>
                        <div v-if="isMetaMask" class="depWithButtonContainer">
                            <b-card no-body>
                                <b-tabs pills card>
                                    <b-tab :disabled="parseInt(userBalanceWorld, 10) === 0" title="Deposit Tokens" button-id="depositButton">
                                        <b-form-input v-model="tokensToSendDeposit" type="text" placeholder="Deposit" class="inputTextDeposit"></b-form-input>
                                        <b-btn v-on:click="sendTokensToCasino()" class="makeDepositButton">Deposit</b-btn>
                                    </b-tab>
                                    <b-tab :disabled="parseInt(userBalancePlatform, 10) === 0" title="Withdrawal Tokens" button-id="withdrawalButton">
                                        <b-form-input v-model="tokensToSendWithdrawal" type="text" placeholder="Withdrawal" class="withdrawalTextDeposit"></b-form-input>
                                        <b-btn v-on:click="sendTokensFromCasino()" class="makeWithdrawalButton">Withdrawal</b-btn>
                                    </b-tab>
                                </b-tabs>
                            </b-card>
                        </div>
                    </div>
                    <div class="inProgressBackground" v-if="transferTokensPendingBackground">
                        <div class="inProgressContent transferToken" v-if="transferTokensPending">
                            <b-progress :value="numberOfConfirmations + 1" :max="numberOfConfirmations + 1" animated></b-progress>
                        </div>
                    </div>
                </b-col>
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
                    <div class="doubleUpGameTMP" :style='{ backgroundImage: "url(" + gamesBackgrounds("./doubleup_bg.png") + ")" }'>
                        <h1>Double Up!</h1>
                        <a href="/#/DoubleUp" target="_blank"></a>
                    </div>
                </b-col>
                <div class="inProgressBackground" v-if="transferPendingBackground">
                    <div class="inProgressContent" v-if="transferPending">
                        <b-progress :value="confNum" :max="numberOfConfirmations + 1" show-progress animated></b-progress>
                    </div>
                </div>
            </b-row>
        </b-container>
        <div class="footer">
        </div>
        <div class="denominationTableContainer">
            <div class="denominationHeader">
                Denomination
            </div>
            <div class="denominationContent">
                <div class="symbol tableColumn">
                    <span class="header">SYMBOL</span>
                    <div class="table">
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                        <span>Y</span>
                    </div>
                </div>
                <div class="prefix tableColumn">
                    <span class="header">PREFIX</span>
                    <div class="table">
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                        <span>Yotta</span>
                    </div>
                </div>
                <div class="10n tableColumn">
                    <span class="header">10N</span>
                    <div class="table">
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                        <span>10^24</span>
                    </div>
                </div>
                <div class="decimal tableColumn">
                    <span class="header">DECIMAL</span>
                    <div class="table">
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                        <span>1000000000000</span>
                    </div>
                </div>
            </div>
        </div>
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

  const gamesBackgrounds = require.context('../assets/games', true, /\.(png|jpe?g|gif|svg)(\?.*)?$/);

  export default {
    name: 'MainPage',
    components: { gamesComp, navbar },
    data() {
      return {
        userID: helper.methods.getUserID(),
        userIDTrue: false,
        userBalanceWorld: '',
        userBalancePlatform: '',
        userBalanceGameSession: '',
        isMetaMask: false,
        tokensToSendDeposit: '',
        tokensToSendWithdrawal: '',
        pendingTransaction: false,
        transactionDone: false,
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
    },
    methods: {
      // ............................ User functions (ID, Balances) ........
      setUserID_req(userID) {
        helper.methods.sendRequestCommand('setUserID_req', userID);
        this.getBalance(userID);
        helper.methods.setUserID(userID);
        this.loginPopup = false;
      },
      getBalance(userID) {
        helper.methods.sendRequestCommand('getBalance', { getBalanceId: userID, getBalanceCurrency: 'JoyToken', location: 'world' });
        helper.methods.sendRequestCommand('getBalance', { getBalanceId: userID, getBalanceCurrency: 'JoyToken', location: 'platform' });
        helper.methods.sendRequestCommand('getBalance', { getBalanceId: userID, getBalanceCurrency: 'JoyToken', location: 'gameSession' });
      },
      loginWithMetaMask() {
        this.setUserID_req(window.web3.eth.coinbase);
        this.userID = window.web3.eth.coinbase;
      },
      // ............................ Casino transfers .....................
      sendTokensToCasino() {
        // this.pendingTransaction = true;
        helper.methods.transferToCasino(this.userID, this.tokensToSendDeposit);
        // this.transferTokensPendingBackground = true;
        // this.transferTokensPending = true;
        // const oldUserBalancePlatfrom = this.userBalancePlatform;
        // const transferTokenInterval = setInterval(() => {
        //   helper.methods.sendRequestCommand('getBalance',
        // { getBalanceId: this.userID, getBalanceCurrency: 'JoyToken', location: 'platform' });
        //   if (oldUserBalancePlatfrom !== this.userBalancePlatform) {
        //     clearInterval(transferTokenInterval);
        //     this.transferTokensPendingBackground = false;
        //     this.transferTokensPending = false;
        //   }
        // }, 1000);
      },
      sendTokensFromCasino() {
        // this.pendingTransaction = true;
        helper.methods.transferFromCasino(this.userID, this.tokensToSendWithdrawal);
        // this.transferTokensPendingBackground = true;
        // this.transferTokensPending = true;
        // const oldUserBalancePlatfrom = this.userBalancePlatform;
        // const transferTokenInterval = setInterval(() => {
        //   console.log(`oldUserBalancePlatfrom: ${oldUserBalancePlatfrom}`);
        //   console.log(`userBalancePlatform: ${this.userBalancePlatform}`);
        //   helper.methods.sendRequestCommand('getBalance',
        // { getBalanceId: this.userID, getBalanceCurrency: 'JoyToken', location: 'platform' });
        //   if (oldUserBalancePlatfrom !== this.userBalancePlatform) {
        //     clearInterval(transferTokenInterval);
        //     this.transferTokensPendingBackground = false;
        //     this.transferTokensPending = false;
        //   }
        // }, 1000);
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
    },
  };
</script>

<style lang="sass" src="./style/mainpage.sass">
</style>