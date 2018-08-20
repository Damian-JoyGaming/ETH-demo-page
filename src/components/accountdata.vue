<template>
  <b-col class="userData" md="5">
    <h5>YOUR ACCOUNT</h5>
    <p>Wallet Balance: <span id="userBalanceWorld">{{ denominateBalance(userBalanceWorld, currentDenominationId) }} {{getDenominatedCurrency(currentDenominationId)}}</span></p>
    <p>Casino Balance: <span id="userBalancePlatform">{{ denominateBalance(userBalancePlatform, currentDenominationId) }} {{getDenominatedCurrency(currentDenominationId)}}</span><span v-if="transferBalanceInProgress" class="transactionInProgress">Updating balance</span></p>
    <p>Game Lobby Balance: <span id="userBalanceGameSession">{{ userBalanceGameSession }}</span></p>
    <p>Exchange Rate: <span id="exchangeRateContainer">100 attoJoy = <span id="exchangeRateValue">1</span></span></p>
    <div class="denominationContainer"><span :class="{active: isActiveDenominationControl('previous', currentDenominationId)}" v-on:click="isActiveDenominationControl('previous', currentDenominationId) && changeCurrentDenominationId(-1, currentDenominationId)">{{getDenominationControlName('previous', currentDenominationId)}}</span> | <span :class="{active: isActiveDenominationControl('next', currentDenominationId)}" v-on:click="isActiveDenominationControl('next', currentDenominationId) && changeCurrentDenominationId(1, currentDenominationId)">{{getDenominationControlName('next', currentDenominationId)}}</span></div>
  </b-col>
</template>

<script>
  import helper from '../utils/helper';

  let baseDenominationObject = {previous: true, next: true, denominationFunction: function() {}};
  export default {
    name: 'accountdata',
    props: ['userBalanceWorld', 'userBalancePlatform', 'userBalanceGameSession', 'transferBalanceInProgress', 'currentDenominationId'],
    data() {
      return {
        denominationList: ['a', 'f', 'p', 'n', 'u', 'm', 'k', 'M'],
        denominationData: {
          a: Object.assign({}, baseDenominationObject, {previous:false, 'shortName': 'a', 'name': 'atto', decimal:1}),
          f: Object.assign({}, baseDenominationObject, {'shortName': 'f', 'name': 'femto', decimal: 1000}),
          p: Object.assign({}, baseDenominationObject, {'shortName': 'p', 'name': 'piko', decimal: 1000000}),
          n: Object.assign({}, baseDenominationObject, {'shortName': 'n', 'name': 'nano', decimal: 1000000000}),
          u: Object.assign({}, baseDenominationObject, {'shortName': 'u', 'name': 'micro', decimal: 1000000000000}),
          m: Object.assign({}, baseDenominationObject, {'shortName': 'm', 'name': 'milli', decimal: 1000000000000000}),
          k: Object.assign({}, baseDenominationObject, {'shortName': 'k', 'name': 'kilo', decimal: 1000000000000000000}),
          M: Object.assign({}, baseDenominationObject, {next:false, 'shortName': 'M', 'name': 'Mega', decimal: 1000000000000000000000})
        }
      };
    },
    methods: {
      denominateBalance(balance, currentDenominationId) {
        const {decimal} = this.getDenominatedDataById(currentDenominationId);
        const denominatedBalance = (Number(balance) / decimal).toString();
        let stringBalance = denominatedBalance;

        if (~denominatedBalance.indexOf('e')) {
          const [balance, amountZero] = denominatedBalance.split('e-');
          stringBalance = '0.';

          for (let i = 0; i < amountZero - 1; i++) {
            stringBalance += '0';
          }

          stringBalance += balance.replace('.', '');
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
        return this.getDenominatedDataById(currentDenominationId)[controlId];
      },
      getDenominationControlName(controlId, currentDenominationId) {
        let denominatedName = '';
        const currentDenominationValue = this.getDenominatedDataById(currentDenominationId);
        if (currentDenominationValue.previous === false && controlId === 'previous' || currentDenominationValue.next === false && controlId === 'next') {
          denominatedName = currentDenominationValue.shortName;
        } else if (currentDenominationValue.previous === false && controlId === 'next') {
          denominatedName = this.getDenominatedDataById(currentDenominationId + 1).shortName;
        } else if (currentDenominationValue.previous && currentDenominationValue.next) {
          const delta = controlId === 'previous' ? -1 : 1;
          denominatedName = this.getDenominatedDataById(currentDenominationId + delta).shortName;
        } else if (currentDenominationValue.next === false && controlId === 'previous'){
          denominatedName = this.getDenominatedDataById(currentDenominationId - 1).shortName;
        }

        return denominatedName + 'JOY';
      },
      getDenominatedDataById(currentDenominationId) {
        const denominationKey = this.denominationList[currentDenominationId];
        return this.denominationData[denominationKey];
      },
      getDenominatedCurrency(currentDenominationId) {
        const {name} = this.getDenominatedDataById(currentDenominationId);
        return `${name}JOY`;
      },
      changeCurrentDenominationId(currentDenominationId, value) {
        helper.data.bus.$emit('changeCurrentDenominationId', currentDenominationId + value);
      }
    }
  };
</script>
