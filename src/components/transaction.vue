<template>
  <b-col md="7" class="transferBalanceContainter">
    <div class="transferBalance" v-if="componentVisible">
      <h5>TRANSACTIONS</h5> <div  v-if="tranasctionMinedTxHash" class="transactionStatusLinkContainer"><a v-bind:href="getLastTransactionStatusUrl()" target="_blank">Last Transaction Status</a></div>
      <div v-if="isMetaMask" class="depWithButtonContainer">
        <b-card no-body>
          <b-tabs pills card>
            <b-tab :disabled="depositTabDisabled" title="Deposit Tokens" button-id="depositButton">
              <b-form-input v-model="tokensToSendDeposit" type="text" placeholder="Deposit" class="inputTextDeposit"></b-form-input>
              <b-btn v-on:click="!transferBalanceInProgress && sendTokensToCasino()" class="makeDepositButton">Deposit</b-btn>
            </b-tab>
            <b-tab :disabled="withdrawalTabDisabled" title="Withdrawal Tokens" button-id="withdrawalButton">
              <b-form-input v-model="tokensToSendWithdrawal" type="text" placeholder="Withdrawal" class="withdrawalTextDeposit"></b-form-input>
              <b-btn v-on:click="!transferBalanceInProgress && sendTokensFromCasino()" class="makeWithdrawalButton">Withdrawal</b-btn>
            </b-tab>
          </b-tabs>
        </b-card>
      </div>
    </div>
    <div class="inProgressBackground" v-if="transferBalanceInProgress">
      <!--<div class="inProgressContent transferToken" v-if="transferTokensPending">-->
        <!--<b-progress :value="numberOfConfirmations + 1" :max="numberOfConfirmations + 1" animated></b-progress>-->
      <!--</div>-->
    </div>
  </b-col>
</template>

<script>
  import helper from '../utils/helper';
  export default {
    name: 'transaction',
    props: [
      'userID',
      'componentVisible',
      'depositTabDisabled',
      'withdrawalTabDisabled',
      'isMetaMask',
      'tranasctionMinedTxHash',
      'transferBalanceInProgress'
    ],
    data() {
      return {
        tokensToSendDeposit: '',
        tokensToSendWithdrawal: ''
      };
    },
    methods: {
      sendTokensToCasino() {
        helper.methods.transferToCasino(this.userID, this.tokensToSendDeposit);
      },
      sendTokensFromCasino() {
        helper.methods.transferFromCasino(this.userID, this.tokensToSendWithdrawal);
      },
      getLastTransactionStatusUrl() {
        return `https://ropsten.etherscan.io/tx/${this.tranasctionMinedTxHash}`;
      }
    }
  };
</script>
