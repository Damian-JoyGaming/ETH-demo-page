import Vue from 'vue';
import * as Cookies from 'tiny-cookie';
import {web3WaitForBlocksChanged, web3TokenContractTransfer, web3DepositContractPayOut, web3GetTransactionReceipt, web3GetSubscriptionPrice, web3BuyDeveloperSubscription} from './web3Services';
import config from './utils-config.json';

// Create bus to comunicate between components
const bus = new Vue();
// let ws = new WebSocket('ws://192.168.1.207:8010/platform');
let ws = new WebSocket(config.serverURL);

// Global variables (in this file)
let globalUserID = '';
let globalDepositAddress = '';
let globalTokenAddress = '';
let globalSubscriptionAddress = '';
let lastTransactionId = '';
let transactionStatusTimerId = null;
const actionsTransferList = [];

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
      case 'setUserId_RES':
        if (parsedEvent.status === 0) {
          bus.$emit('setUserID_RES', true);
          Cookies.set('JoyCoinUserId', globalUserID, 1);
        } else {
          bus.$emit('setUserID_RES', false);
        }
        break;
      // Subscribe latest block (unuse)
      case 'subscribeBlocks_RES':
        bus.$emit('subscribeBlocks_RES', {
          blockNumber: JSON.parse(parsedEvent.data).number,
          blockData: JSON.parse(parsedEvent.data)
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
          executeAllTransferActions();
        }
        break;
      // Get token address
      case 'getTokenAddress_RES':
        if (parsedEvent.status === 0) {
          globalTokenAddress = parsedEvent.data;
          executeAllTransferActions();
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
          lastTransactionId = parsedEvent.txHash;
          bus.$emit('tranasctionMinedTxHash', lastTransactionId);
          bus.$emit('transferPending', true);
        }
        break;
      case 'confirmation_NOTIFY':
        if (parsedEvent.status === 0) {
          bus.$emit('confNum', parsedEvent.confNum);
        }
        break;
      case 'getUserExpired_RES':
        if (parsedEvent.status === 0) {
          bus.$emit('getUserExpired', parsedEvent);
        }
        break;
      case 'getSubscriptionEtherAddress_RES':
        if (parsedEvent.status === 0) {
          globalSubscriptionAddress = parsedEvent.data;
          bus.$emit('subscriptionAddress', parsedEvent);
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

ws.onopen = () => {
  bus.$emit('websocketConnected', true);
};

ws.onclose = () => {
  bus.$emit('websocketDisconnected', true);
  const popupData = {
    visible: true,
    title: 'Connection lost!',
    message: 'Sorry. Looks like you have connection problems. Try to reload page.',
    action1: {title: 'Reload Page', visible: true, type: 'info', callback: () => {
        location.reload();
      }}
  };
  bus.$emit('notificationPopup', popupData);
  // location.reload();
};

export default {
  data: {
    bus,
    userID: globalUserID,
    isUserIDSet: false,
    config
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
        case 'setUserId':
          sendString = `{ "command": "${command}", "userId": "${requested}" }`;
          break;
        case 'isSessionOpen':
          sendString = `{ "command": "${command}", "location": "${requested}" }`;
          break;
        case 'getUserExpired':
          sendString = `{ "command": "${command}", "unit": "dbg" }`;
          break;
        case 'getSubscriptionEtherAddress':
          sendString = `{ "command": "${command}"}`;
          break;
        case 'getSubscriptionJoyTokenABI':
          sendString = `{"command": "${command}"}`;
          break;
        case 'topUpTokens':
          sendString = `{"command": "${command}", "unit":"JoyToken"}`;
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
    // Transfer tokens to casino (userID, number of tokens to send)
    transferToCasino(userID, tokensToSend) {
      const transfer = async () => {
        const response = await web3TokenContractTransfer(globalDepositAddress, globalTokenAddress, tokensToSend, userID);
        this.transactionResponsePreparation(response);
      };

      actionsTransferList.push(transfer);
      this.proxyGenerateTransferActions();
    },

    transferFromCasino(userID, tokensToSend) {
      const transfer = async () => {
        const response = await web3DepositContractPayOut(globalDepositAddress, userID, tokensToSend);
        this.transactionResponsePreparation(response);
      };

      actionsTransferList.push(transfer);
      this.proxyGenerateTransferActions();
    },

    transactionResponsePreparation(response) {
      bus.$emit('tranasctionMinedTxHash', response);
      lastTransactionId = response;
      this.checkBaseTransferStatus();
    },

    proxyGenerateTransferActions() {
      generateTransfersActions = generateTransfersActions.bind(this);
      executeAllTransferActions();
    },

    checkBaseTransferStatus() {
      if (transactionStatusTimerId) {
        clearTimeout(transactionStatusTimerId);
      } else {
        bus.$emit('balanceTransferInProcess', true);
      }

      transactionStatusTimerId = setTimeout(async () => {
        const response = await web3GetTransactionReceipt(lastTransactionId);
        if (!response) {
          this.checkBaseTransferStatus();
        } else {
          transactionStatusTimerId = null;
          this.transferCompleteVerification(response);
        }
      }, 10000);
    },

    async transferCompleteVerification(transactionReceipt = {}) {
      const {blockHash, blockNumber, status, transactionHash} = transactionReceipt;
      if (!status) {
        bus.$emit('balanceTransferInProcess', false);
        console.error('Transaction FAILED');
        return false;
      }

      const blockUpdatesResult = await web3WaitForBlocksChanged(blockNumber, config.numberOfConfirmations);
      if (blockUpdatesResult) {
        const transactionReceipt = await web3GetTransactionReceipt(transactionHash);
        const {blockHash:blockHashReceipt, blockNumber:blockNumberReceipt, status:statusReceipt} = transactionReceipt;
        if (statusReceipt !== status) {
          bus.$emit('balanceTransferInProcess', false);
          console.error('Transaction FAILED');
          return false;
        }
        if (blockHash !== blockHashReceipt || blockNumber !== blockNumberReceipt) {
          this.transferCompleteVerification(transactionReceipt);
        } else {
          bus.$emit('balanceTransferInProcess', false);
        }
      }
    },

    async getSubscriptionPrice() {
      const price = await web3GetSubscriptionPrice(globalSubscriptionAddress);
      bus.$emit('subscriptionPrice', price);
    },

    async buyDeveloperSubscription(subscriptionPrice, seconds) {
      console.log('subscriptionPrice', subscriptionPrice, seconds);
      const response = await web3BuyDeveloperSubscription(globalSubscriptionAddress, globalUserID, subscriptionPrice, seconds);
      this.transactionResponsePreparation(response);
      bus.$emit('pendingSubscription');
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
        clientServer: config.clientServer
      };
    },
    // ............................ Setters/Getters .................
    // Setter of userID (from MainPage component, without cookie) -
    // set User ID and emit ssetUserIDetUserID to components
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
    }
  }
};


function* generateTransfersActions() {
  if (!globalDepositAddress) {
    yield this.sendRequest('getDepositAddress');
  }

  if (!globalTokenAddress) {
    yield this.sendRequest('getTokenAddress');
  }

  if (globalTokenAddress && globalDepositAddress) {
    while (actionsTransferList.length) {
      yield actionsTransferList.shift();
    }
  }
}

// function* generateSubscriptionActions() {
//   if (!globalSubscriptionAddress) {
//     yield this.sendRequest('getSubscriptionAddress');
//   }
//
//   if (globalSubscriptionAddress) {
//     while (actionsTransferList.length) {
//       yield actionsTransferList.shift();
//     }
//   }
//
// }

function executeAllTransferActions() {
  const generetedActions = generateTransfersActions();
  // eslint-disable-next-line
  for (const action of generetedActions) {
    if (typeof action === 'function') {
      action();
    }
  }
}
