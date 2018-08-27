<template>
  <div id="gamelobby">
    <b-row class="gameSession" v-if="componentVisible">
      <b-col md="6">
        <span class="gameLobbyHeader">Game Lobby</span>
      </b-col>
    </b-row>
    <b-row class="gameSession gameSessionBoxShadow" v-if="componentVisible">
      <b-col md="2" class="gameSessionBuyCollectContainer">
        <b-button class="gameSessionBuy gameSessionBuyCollect" size="lg" v-on:click="startGameSession" v-if="buyButtonVisible" :disabled="transferPending">
          <span>Buy</span>
        </b-button>
        <b-button class="gameSessionCollect gameSessionBuyCollect" size="lg" v-on:click="endGameSession" v-if="collectButtonVisible" :disabled="transferPending">
          <span>Collect</span>
        </b-button>
      </b-col>
      <b-col md="10" class="doubleUpGameContainerTMP">
        <div v-bind:class="{doubleUpGameTMP: true, gamesAvailable: canPlayGame}" :style='{ backgroundImage: "url(" + gamesBackgrounds("./doubleup_bg.png") + ")" }'>
          <h1>Double Up!</h1>
          <a v-if="canPlayGame" onclick="window.open('./#/DoubleUp',
                             'newwindow',
                             'width=960, height=640,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no');
                            return false;">
          </a>
        </div>
      </b-col>
      <div class="inProgressBackground gameProgressSection" v-if="transferPendingBackground">
        <div class="inProgressContent" v-if="transferPending">
          <b-progress :value="confNum" :max="numberOfConfirmations + 1" show-progress animated></b-progress>
        </div>
      </div>
    </b-row>
  </div>
</template>

<script>
  import helper from '../utils/helper';
  const gamesBackgrounds = require.context('../assets/games', true, /\.(png|jpe?g|gif|svg)(\?.*)?$/);

  export default {
    name: 'gamelobby',
    props: [
      'componentVisible',
      'buyButtonVisible',
      'collectButtonVisible',
      'transferPending',
      'canPlayGame',
      'confNum',
      'numberOfConfirmations'
    ],
    data() {
      return {
        gamesBackgrounds,
        transferPendingBackground: false
      };
    },
    beforeUpdate() {
      this.transferPendingBackground = this.transferPending;
    },
    methods: {
      startGameSession() {
        this.transferPendingBackground = true;
        helper.methods.sendRequest('startGameSession');
      },
      endGameSession() {
        this.transferPendingBackground = true;
        helper.methods.sendRequest('endGameSession');
      }
    }
  };
</script>
