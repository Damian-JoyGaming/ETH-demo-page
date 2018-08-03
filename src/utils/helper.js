import Vue from 'vue';
import * as Cookies from 'tiny-cookie';
import config from './utils-config.json';
import contractConfig from './config.json';

// let ws = new WebSocket('ws://192.168.1.207:8010/platform');
let ws = new WebSocket(config.serverURL);

// Create bus to comunicate between components
const bus = new Vue();

// Global variables (in this file)
let globalUserID = '';
let globalDepositAddress = '';
let globalTokenAddress = '';

// Create listiner at websocket to get messages
ws.onmessage = function (event) {
  // console.log(event.data);
  try {
    // Parse message to JSON
    const parsedEvent = JSON.parse(event.data);
    console.log('parsedEvent:');
    console.log(parsedEvent);
    // Get Command from message
    switch (parsedEvent.command) {
      // Get balance of selected token (and emit it to components)
      case 'getBalance_RES':
        bus.$emit('getBalance_RES', parsedEvent);
        break;
      // Get latest block from blockchain
      case 'latestBlock_RES':
        bus.$emit('latestBlock_RES', parsedEvent.data);
        break;
      // If user ID is set - after it emit true to component and set a cookie with userID
      case 'setUserID_RES':
        if (parsedEvent.status === 0) {
          bus.$emit('setUserID_RES', true);
          Cookies.set('JoyCoinUserId', globalUserID, 1);
        }
        break;
      // Subscribe latest block (unuse)
      case 'subscribeBlocks_RES':
        bus.$emit('subscribeBlocks_RES', {
          blockNumber: JSON.parse(parsedEvent.data).number,
          blockData: JSON.parse(parsedEvent.data),
        });
        break;
      // Check if block are sync (unuse)
      case 'isSync_RES':
        if (parsedEvent.status !== 0) {
          console.log(parsedEvent.status_err);
        }
        break;
      // Get deposit address of casino
      case 'getDepositAddress_RES':
        if (parsedEvent.status === 0) {
          globalDepositAddress = parsedEvent.data;
        }
        break;
      // Get token address
      case 'getTokenAddress_RES':
        if (parsedEvent.status === 0) {
          globalTokenAddress = parsedEvent.data;
        }
        break;
      // Check if Game Session is open
      case 'isSessionOpen_RES':
        if (parsedEvent.status === 0) {
          bus.$emit('isSessionOpen_RES', parsedEvent.answer);
        }
        break;
      case 'endGame_NOTIFY':
      case 'startGame_NOTIFY':
        if (parsedEvent.status === 0) {
          bus.$emit('transferPending', true);
        }
        break;
      case 'confirmation_NOTIFY':
        if (parsedEvent.status === 0) {
          bus.$emit('confNum', parsedEvent.confNum);
        }
        break;
      default:
        console.log('Not such command');
    }
    bus.$emit('returnConsole', JSON.stringify(event.data, null, '\t'));
  } catch (e) {
    console.log(e);
    bus.$emit('returnConsole', e);
  }
};

export default {
  data: {
    bus,
    userID: globalUserID,
    isUserIDSet: false,
    config,
  },
  methods: {
    // ............................ WebSockets Utils ...................
    // Send Request to web server (just command)
    sendRequest(command) {
      try {
        ws.send(`{ "command": "${command}" }`);
      } catch (e) {
        console.log(e);
      }
    },
    // Send request to web server (command with parameters)
    sendRequestCommand(command, requested) {
      let sendString;
      switch (command) {
        case 'getBalance':
          sendString = `{ "command": "${command}", "user": "${requested.getBalanceId}", "unit" : "${requested.getBalanceCurrency}", "location": "${requested.location}" }`;
          break;
        case 'setUserID_req':
          sendString = `{ "command": "${command}", "userID": "${requested}" }`;
          break;
        case 'isSessionOpen':
          sendString = `{ "command": "${command}", "location": "${requested}" }`;
          break;
        default:
          break;
      }
      console.log(`sendString: ${sendString}`);
      ws.send(sendString);
    },
    // Reconnect to websocket (in progress)
    WSReconnect() {
      // ws = new WebSocket('ws://192.168.1.207:8010/platform');
      ws = new WebSocket(config.serverURL);
    },
    // ............................ Tokens Utils .....................
    // Generate the Contract object (to send tokens)
    // eslint-disable-next-line consistent-return
    getTokenContract() {
      if (typeof window.web3 !== 'undefined') {
        // eslint-disable-next-line no-undef
        const CONTRACT = web3.eth.contract(contractConfig.JoyToken.abi)
          .at(globalTokenAddress, (err, ctr) => ctr);
        return CONTRACT;
      }
    },
    // eslint-disable-next-line consistent-return
    getDepositContract() {
      if (typeof window.web3 !== 'undefined') {
        // eslint-disable-next-line no-undef
        const CONTRACT = web3.eth.contract(contractConfig.PlatformDeposit.abi)
          .at(globalDepositAddress, (err, ctr) => ctr);
        return CONTRACT;
      }
    },
    // Transfer tokens to casino (userID, number of tokens to send)
    transferToCasino(userID, tokensToSend) {
      this.sendRequest('getDepositAddress');
      this.sendRequest('getTokenAddress');
      // eslint-disable-next-line consistent-return
      const getDepositAddressInterval = setInterval(() => {
        if (globalDepositAddress !== '' && globalTokenAddress !== '') {
          clearInterval(getDepositAddressInterval);
          // eslint-disable-next-line no-unused-vars
          this.getTokenContract().transfer(globalDepositAddress, tokensToSend, (err, res) => {
            if (!err) {
              // const pendingTransactionInterval = setInterval(() => {
              // axios.get(`https://api.etherscan.io/api?module=transaction&action=getstatus&txhash=${res}&apikey=${this.etherscan}`)
              // .then((response) => {
              // console.log(response);
              // });
              // clearInterval(pendingTransactionInterval);
              // console.log('tick interval');
              // }, 1000);
            }
            console.log(err);
          });
        }
      }, 100);
    },
    transferFromCasino(userID, tokensToSend) {
      this.sendRequest('getDepositAddress');
      this.sendRequest('getTokenAddress');
      // eslint-disable-next-line consistent-return
      const getDepositAddressInterval = setInterval(() => {
        if (globalDepositAddress !== '' && globalTokenAddress !== '') {
          clearInterval(getDepositAddressInterval);
          // eslint-disable-next-line no-unused-vars
          this.getDepositContract().payOut(userID, tokensToSend, (err, res) => {
            if (!err) {
              // const pendingTransactionInterval = setInterval(() => {
              // axios.get(`https://api.etherscan.io/api?module=transaction&action=getstatus&txhash=${res}&apikey=${this.etherscan}`)
              // .then((response) => {
              // console.log(response);
              // });
              // clearInterval(pendingTransactionInterval);
              // console.log('tick interval');
              // }, 1000);
              console.log(res);
              if (typeof window.web3 !== 'undefined') {
                // eslint-disable-next-line no-undef
                console.log(`res: ${res}`);
                window.web3.eth
                  .getTransaction(res, (getTransactionErr, getTransactionRes) => {
                    console.log(`getTransactionRes: ${JSON.stringify(getTransactionRes)}`);
                  });
              }
            } else {
              console.log(err);
            }
          });
        }
      }, 100);
    },
    // ............................ Utils ...........................
    // Logout function - remove cookie and reloading a page
    logOut() {
      Cookies.remove('JoyCoinUserId');
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    },
    // ............................ Games Utils ...................
    getGamesParameters() {
      return {
        userID: this.userID,
        tokenName: config.tokenName,
        doubleUpPort: config.doubleUpPort,
        doubleUpServer: config.doubleUpServer,
      };
    },
    // ............................ Setters/Getters .................
    // Setter of userID (from MainPage component, without cookie) -
    // set User ID and emit setUserID to components
    setUserID(userID) {
      this.userID = userID;
      globalUserID = userID;
      this.isUserIDSet = true;
      bus.$emit('setUserID', this.isUserIDSet);
    },
    // Getter of userID
    getUserID() {
      return this.userID;
    },
    // Getter of userID Status (true/false)
    getUserIDStatus() {
      return this.isUserIDSet;
    },
    // Getter of Websocket status (true/false)
    getWSStatus() {
      return ws.readyState;
    },
  },
};
