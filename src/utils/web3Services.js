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

export function web3TokenContractTransfer(depositAddress, tokenAddress, tokensToSend, userId) {
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
    contract.methods.payOut(userID, tokensToSend).send({from: userID}).once('transactionHash', (response) => {
      resolve(response);
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
    setTimeout(async function blockChecking() {
      const nextBlockId = await web3GetBlockNumber();
      if (nextBlockId - blockId < blocksAmount) {
        blockChecking();
      } else {
        resolve(true);
      }
    }, 5000);

  });
}
