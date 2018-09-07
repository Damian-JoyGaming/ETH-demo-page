import contractConfig from './config.json';

async function getTokenContract(tokenAddress) {
  if (typeof window.web3 !== 'undefined') {
    const CONTRACT = await new window.web3.eth.Contract(contractConfig.JoyToken.abi, tokenAddress);

    return CONTRACT;
  }
}

async function getDepositContract(depositAddress) {
  if (typeof window.web3 !== 'undefined') {
    const CONTRACT = await new window.web3.eth.Contract(contractConfig.PlatformDeposit.abi, depositAddress);

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

export function web3TokenContractTransferOLD(depositAddress, tokenAddress, tokensToSend, userId) {
  return new Promise(async (resolve, reject) => {

    const contract = await getTokenContract(tokenAddress);
    contract.methods.transfer(depositAddress, tokensToSend).send({from: userId}).once('transactionHash', (response) => {
      resolve(response);
    }).on('confirmation', (confNumber, receipt) => {
      console.log(confNumber);
      console.log(receipt);
    }).on('error', (rerror) => {
      reject(rerror);
    }).then((res) => {
      console.log(res);
    });
  });
}

export function web3DepositContractPayOut(depositAddress, userID, tokensToSend) {
  return new Promise(async (resolve, reject) => {
    const contract = await getDepositContract(depositAddress);
    contract.methods.payOut(userID, tokensToSend).send({from: userID}).one('transactionHash', (response) => {
      resolve(response);
    }).on('receipt', (confNumber, receipt) => {
      console.log('confirmation');
      console.log(confNumber);
      console.log(receipt);
    }).on('error', (rerror) => {
      reject(rerror);
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

export function web3TokenContractTransfer(depositAddress, tokenAddress, tokensToSend, userId) {
  return new Promise(async (resolve, reject) => {
console.log('web3TokenContractTransfer!!!!!!!!!');
    const contract = await getTokenContract(tokenAddress);
    contract.methods.transfer(depositAddress, tokensToSend).send({from: userId}).once('transactionHash', (response) => {
      console.info('transactionHash', response);
      resolve(response);
    }).on('confirmation', (confNumber, receipt) => {
      console.info('confirmation', confNumber, receipt);
    }).on('receipt', (receipt) => {
      console.info('receipt', receipt);
    }).on('error', (rerror) => {
      reject(rerror);
    }).then((res) => {
      console.log(res);
    });
  });
}
