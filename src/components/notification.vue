<template>
  <div class="notificationPopup" v-if="visible">
    <div class="notificationContent">
      <h3 class="notificationTitle">{{title}}</h3>
      <div class="notificationMessage">{{message}}</div>
      <div :class="{notificationActionButtons: action1.visible && action2.visible, notificationActionButton: action1.visible && !action2.visible}" v-if="action1.visible">
        <b-button v-if="action1.visible" class="notificationAction" :variant="action1.type" v-on:click="action1.callback" id="notificationAction1" >{{action1.title}}</b-button>
        <b-button v-if="action2.visible" class="notificationAction" :variant="action2.type" v-on:click="action2.callback" id="notificationAction2" >{{action2.title}}</b-button>
      </div>
    </div>
  </div>
</template>

<script>
  import helper from '../utils/helper';

  export default {
    name: 'notification',
    props: [
      'notificationData'
    ],
    data() {
      return {
        visible: false,
        title: '',
        message: '',
        action1: {title: '', visible: true, type: 'info', callback: () => {}},
        action2: {title: '', visible: true, type: 'info', callback: () => {}}
      };
    },
    created() {
      this.addPopupListeners();
    },
    destroyed() {

    },
    methods: {

      addPopupListeners() {
        helper.data.bus.$on('notificationPopup', (event) => {
          this.setPopupData(event);
        });
      },
      removePopupListeners() {
        helper.data.bus.$off('notificationPopup');
      },

      setPopupData(data) {
        const {title, action1, action2, visible, message} = data;

        this.visible = visible || false;
        this.title = title || '';
        this.message = message || '';
        this.action1 = action1 || {title: '', visible: true, type: 'info', callback: () => {}};
        this.action2 = action2 || {title: '', visible: true, type: 'info', callback: () => {}};
      }
    }
  };

</script>
