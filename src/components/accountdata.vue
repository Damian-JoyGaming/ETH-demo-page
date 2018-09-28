<template>
  <b-col class="userData" md="5">
    <h5>YOUR ACCOUNT</h5>
    <p>Wallet Balance: <span id="userBalanceWorld">{{ denominateBalance(userBalanceWorld, currentDenominationId) }} {{getDenominatedCurrency(currentDenominationId)}}</span></p>
    <p>Casino Balance: <span id="userBalancePlatform">{{ denominateBalance(userBalancePlatform, currentDenominationId) }} {{getDenominatedCurrency(currentDenominationId)}}</span></p>
    <p>Game Lobby Balance: <span id="userBalanceGameSession">{{ userBalanceGameSession }}</span></p>
    <p>Exchange Rate: <span id="exchangeRateContainer">100 attoJoy = <span id="exchangeRateValue">1</span></span></p>
    <div class="denominationContainer"><span :class="{active: isActiveDenominationControl('previous', currentDenominationId)}" v-on:click="isActiveDenominationControl('previous', currentDenominationId) && changeCurrentDenominationId(-1, currentDenominationId)">{{getDenominationControlName('previous', currentDenominationId)}}</span> | <span :class="{active: isActiveDenominationControl('next', currentDenominationId)}" v-on:click="isActiveDenominationControl('next', currentDenominationId) && changeCurrentDenominationId(1, currentDenominationId)">{{getDenominationControlName('next', currentDenominationId)}}</span></div>
    <span v-if="transferBalanceInProgress" class="transactionInProgress">Updating balance</span>
  </b-col>
</template>

<script>
  import helper from '../utils/helper';
  import { getDenominatedDataById, getDenominatedCurrency } from '../utils/denomination';

  export default {
    name: 'accountdata',
    props: [
      'userBalanceWorld',
      'userBalancePlatform',
      'userBalanceGameSession',
      'transferBalanceInProgress',
      'currentDenominationId'
    ],
    data() {
      return {

      };
    },
    methods: {
      denominateBalance(balance, currentDenominationId) {
        const {decimal} = getDenominatedDataById(currentDenominationId);
        const denominatedBalance = (Number(balance) / decimal).toString();
        let stringBalance = denominatedBalance;

        if (~denominatedBalance.indexOf('e-')) {
          const [balance, amountZero] = denominatedBalance.split('e-');
          stringBalance = '0.';

          for (let i = 0; i < amountZero - 1; i++) {
            stringBalance += '0';
          }

          stringBalance += balance.replace('.', '');
        } else if (~denominatedBalance.indexOf('e+')) {
          const [balance, amountZero] = denominatedBalance.split('e+');

          stringBalance = balance.replace('.', '');
          for (let i = 0; i < amountZero - 1; i++) {
            stringBalance += '0';
          }
        }

        if (stringBalance.indexOf('0.') === 0) {
          const [first, second] = stringBalance.split('.');
          stringBalance = first + '.' + second.replace(/(\d{3})/g, '$1 ').trim();
        } else {
          stringBalance = stringBalance.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
        }

        return stringBalance;
      },
      isActiveDenominationControl(controlId, currentDenominationId) {
        return getDenominatedDataById(currentDenominationId)[controlId];
      },
      getDenominationControlName(controlId, currentDenominationId) {
        let denominatedName = '';
        const currentDenominationValue = getDenominatedDataById(currentDenominationId);
        if (currentDenominationValue.previous === false && controlId === 'previous' || currentDenominationValue.next === false && controlId === 'next') {
          denominatedName = currentDenominationValue.shortName;
        } else if (currentDenominationValue.previous === false && controlId === 'next') {
          denominatedName = getDenominatedDataById(currentDenominationId + 1).shortName;
        } else if (currentDenominationValue.previous && currentDenominationValue.next) {
          const delta = controlId === 'previous' ? -1 : 1;
          denominatedName = getDenominatedDataById(currentDenominationId + delta).shortName;
        } else if (currentDenominationValue.next === false && controlId === 'previous'){
          denominatedName = getDenominatedDataById(currentDenominationId - 1).shortName;
        }

        return denominatedName + 'JOY';
      },
      getDenominatedCurrency(currentDenominationId) {
        return getDenominatedCurrency(currentDenominationId);
      },
      changeCurrentDenominationId(currentDenominationId, value) {
        helper.data.bus.$emit('changeCurrentDenominationId', currentDenominationId + value);
      }
    }
  };
</script>
