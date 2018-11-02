<template>
  <b-col class="userData" md="5">
    <h5>YOUR ACCOUNT</h5>
    <p>Wallet Balance: <span id="userBalanceWorld">{{ denominateBalance(userBalanceWorld, currentDenominationId) }} {{getDenominatedCurrency(currentDenominationId)}}</span></p>
    <p>Casino Balance: <span id="userBalancePlatform">{{ denominateBalance(userBalancePlatform, currentDenominationId) }} {{getDenominatedCurrency(currentDenominationId)}}</span></p>
    <p>Game Lobby Balance: <span id="userBalanceGameSession">{{ userBalanceGameSession }}</span></p>
    <p>Exchange Rate: <span id="exchangeRateContainer">10 nanoJoy = <span id="exchangeRateValue">1</span></span></p>
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
        let denominatedBalance = balance;

        if (decimal && balance.length > decimal) {
          const first = balance.slice(0, balance.length - decimal);
          const second = balance.slice(balance.length - decimal, balance.length);
          denominatedBalance = first;
          if (second > 0) {
            denominatedBalance += '.' + second;
          }
        } else if (decimal) {
          denominatedBalance = (Number(balance) / Math.pow(10,decimal)).toString();
          if (~denominatedBalance.indexOf('e-')) {
            const [bal, amountZero] = denominatedBalance.split('e-');
            denominatedBalance = '0.';

            for (let i = 0; i < amountZero - 1; i++) {
              denominatedBalance += '0';
            }

            denominatedBalance += Number(bal).toString().replace('.', '');
          }
        }

        if (~denominatedBalance.indexOf('.')) {
          const [first, second] = denominatedBalance.split('.');
          denominatedBalance = first.replace(/(\d)(?=(\d{3})+$)/g, '$1 ') + '.' + second.replace(/(\d{3})/g, '$1 ').trim();
        } else {
          denominatedBalance = denominatedBalance.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
        }

        return denominatedBalance;
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
