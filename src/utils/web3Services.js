import contractConfig from './config.json';

function getTokenContract(tokenAddress) {
  if (typeof window.web3 !== 'undefined') {
    // eslint-disable-next-line no-undef
    const CONTRACT = web3.eth.contract(contractConfig.JoyToken.abi)
    .at(tokenAddress, (err, ctr) => ctr);
    return CONTRACT;
  }
}

function getDepositContract(depositAddress) {
  if (typeof window.web3 !== 'undefined') {
    // eslint-disable-next-line no-undef
    const CONTRACT = web3.eth.contract(contractConfig.PlatformDeposit.abi)
    .at(depositAddress, (err, ctr) => ctr);
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

export function web3TokenContractTransfer(depositAddress, tokenAddress, tokensToSend) {
  return new Promise((resolve, reject) => {
    getTokenContract(tokenAddress).transfer(depositAddress, tokensToSend, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

export function web3DepositContractPayOut(depositAddress, userID, tokensToSend) {
  return new Promise((resolve, reject) => {
    getDepositContract(depositAddress).payOut(userID, tokensToSend, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
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
