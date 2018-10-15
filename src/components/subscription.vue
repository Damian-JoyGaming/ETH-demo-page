<template>
  <div class="notificationPopup" v-if="visible">
    <div class="notificationContent">
      <h3 class="notificationTitle">{{title}}</h3>
      <div class="notificationMessage">{{message}}
      </div>
      <b-form-select v-model="selected" :options="options" class="mb-3">
      </b-form-select>
      <div class="notificationActionButtons">
        <b-button class="notificationAction" :variant="action1.type" v-on:click="action1.callback" id="notificationAction1" >{{action1.title}}</b-button>
        <b-button class="notificationAction" :variant="action2.type" v-on:click="action2.callback" id="notificationAction2" >{{action2.title}}</b-button>
      </div>
    </div>
  </div>
</template>

<script>
  import helper from '../utils/helper';

  export default {
    name: 'subscription',
    data() {
      return {
        visible: false,
        title: 'Developer Subscription',
        message: 'Please choose your subscription plan',
        action1: {title: 'Submit', visible: false, type: 'success', callback: this.Submit.bind(this)},
        action2: {title: 'Reject', visible: false, type: 'danger', callback: this.Reject.bind(this)},
        selected: '3600',
        optionsTemplate: [
          { value: '3600', text: '1 hour' },
          { value: '21600', text: '6 hours' },
          { value: '86400', text: '1 day' },
          { value: '604800', text: '1 week' },
          { value: '2630000', text: '1 month' },
          { value: '15780000', text: '6 months' },
          { value: '31536000', text: '1 year' }
        ],
        options: []
      };
    },
    created() {
      helper.data.bus.$on('openSubscriptionPopup', (price) => {
        //this.subscriptionPrice = price;
        this.updatePlans(price);
        this.visible = true;

      });
    },
    mounted() {

    },
    destroyed() {

    },
    methods: {
      updatePlans(price) {
        this.options.length = 0;
        this.optionsTemplate.forEach((option) => {
          const text = `${option.text} for ${price * option.value} Wei`;
          this.options.push(Object.assign({}, option, {text}));
        });
      },

      Reject() {
        this.visible = false;
      },

      Submit() {
        helper.methods.buyDeveloperSubscription(this.selected);
        this.visible = false;
      }
    }
  };

</script>
