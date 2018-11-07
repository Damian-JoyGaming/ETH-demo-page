import contractConfig from './config.json';

const INCORRECT_USER_ID_ERROR = 'unable to sign transaction for this address';
const USER_DENIED_TRANSACTION_SIGNATURE = 'User denied transaction signature';

async function getContract(type, address) {
  if (typeof window.web3 !== 'undefined') {
    const CONTRACT = await new window.web3.eth.Contract(contractConfig[type].abi, address);

    return CONTRACT;
  }
}

function web3GetBlockNumber() {
  return new Promise((resolve, reject) => {
    window.web3.eth.getBlockNumber((error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

export function web3TokenContractTransfer(depositAddress, tokenAddress, tokensToSend, userId, errorCallback) {
  return new Promise(async (resolve, reject) => {

    const contract = await getContract('JoyToken', tokenAddress);
    contract.methods.transfer(depositAddress, tokensToSend).send({from: userId}).once('transactionHash', (response) => {
      resolve(response);
    }).on('confirmation', (confNumber, receipt) => {
      console.log(confNumber);
      console.log(receipt);
    }).on('error', (error) => {
      if (errorCallback && !~error.message.indexOf(USER_DENIED_TRANSACTION_SIGNATURE)) {
        errorCallback(getErrorMessage(error));
      }
      reject(error);
    }).then((res) => {
      console.log(res);
    });
  });
}

export function web3DepositContractPayOut(depositAddress, userID, tokensToSend, errorCallback) {
  return new Promise(async (resolve, reject) => {
    const contract = await getContract('PlatformDeposit', depositAddress);
    contract.methods.payOut(userID, tokensToSend).send({from: userID}).once('transactionHash', (response) => {
      resolve(response);
    }).on('receipt', (confNumber, receipt) => {
      console.log('confirmation');
      console.log(confNumber);
      console.log(receipt);
    }).on('error', (error) => {
      if (errorCallback && !~error.message.indexOf(USER_DENIED_TRANSACTION_SIGNATURE)) {
        errorCallback(getErrorMessage(error));
      }
      reject(error);
    });
  });
}

export function web3GetTransactionReceipt(transactionId) {
  return new Promise((resolve, reject) => {
    window.web3.eth.getTransactionReceipt(transactionId, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

export async function web3WaitForBlocksChanged(blockId, blocksAmount = 5) {
  return new Promise((resolve) => {
    (function blockChecking() {
      setTimeout(async () => {
        const nextBlockId = await web3GetBlockNumber();
        console.log('nextBlockId', nextBlockId, blockId);
        if (nextBlockId - blockId < blocksAmount) {
          blockChecking();
        } else {
          resolve(true);
        }
      }, 5000);
    }(this));
  });
}

export async function web3GetSubscriptionPrice(subscriptionAddress) {
  return new Promise(async (resolve) => {
    const contract = await getContract('SubscriptionWithEther', subscriptionAddress);
    const price = await contract.methods.subscriptionPrice().call();
    resolve(price);
  });
}

export async function web3BuyDeveloperSubscription(subscriptionAddress, userId, price, seconds, errorCallback) {
  return new Promise(async (resolve, reject) => {
    const contract = await getContract('SubscriptionWithEther', subscriptionAddress);
    contract.methods.subscribe(seconds).send({from: userId, value: price}).once('transactionHash', (response) => {
      resolve(response);
    }).on('confirmation', (confNumber, receipt) => {
      console.log(confNumber);
      console.log(receipt);
    }).on('error', (error) => {
      if (errorCallback && !~error.message.indexOf(USER_DENIED_TRANSACTION_SIGNATURE)) {
        errorCallback(getErrorMessage(error));
      }
      reject(error);
    }).then((res) => {
      console.log(res);
    });
  });
}

export async function web3GetTokenDecimals(tokenAddress) {
  const contract = await getContract('JoyToken', tokenAddress);
  return new Promise((resolve) => {
      contract.methods.decimals().call()
      .then((result) => {
        resolve(result);
      });
  });
}

export function web3CheckIfUserIsLoggedIn(errorCallback) {
  return new Promise((resolve, reject) => {
    window.web3.eth.getAccounts((err, accounts) => {
      if (err !== null || accounts.length === 0) {
        if (errorCallback) {
          const params = {
            title: 'User is not authorized',
            message: 'Please login to MetaMask for corresponding action'
          };
          errorCallback(params);
        }
        reject();
      } else {
        resolve();
      }
    });
  });
}

function getErrorMessage({message}) {
  return {
    title: 'Sorry you can not complete transaction',
    message: ~message.indexOf(INCORRECT_USER_ID_ERROR) ? 'Please check that you have same ETH Account number in MetaMask' : 'Something went wrong please try again'
  };
}
//
// export function web3TokenContractTransfer(depositAddress, tokenAddress, tokensToSend, userId) {
//   return new Promise(async (resolve, reject) => {
// console.log('web3TokenContractTransfer!!!!!!!!!');
//     const contract = await getTokenContract(tokenAddress);
//     contract.methods.transfer(depositAddress, tokensToSend).send({from: userId}).once('transactionHash', (response) => {
//       console.info('transactionHash', response);
//       resolve(response);
//     }).on('confirmation', (confNumber, receipt) => {
//       console.info('confirmation', confNumber, receipt);
//     }).on('receipt', (receipt) => {
//       console.info('receipt', receipt);
//     }).on('error', (rerror) => {
//       reject(rerror);
//     }).then((res) => {
//       console.log(res);
//     });
//   });
// }
