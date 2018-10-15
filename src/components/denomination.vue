<template>
  <div class="denominationTableContainer">
    <div class="denominationHeader">
      Denomination
    </div>
    <div class="denominationContent" >
      <div :class="[key.toLocaleLowerCase(), 'tableColumn']" v-for="(value, key) in denominationData">
        <span class="header">{{key}}</span>
        <div class="table">
          <span v-for="(v, k) in value" v-html="v">{{v}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'denomination',
    data() {
      return {
        denominationData: {
          'SYMBOL': ['M','k','m','μ','n','p'], //,'f','a'
          'PREFIX': ['Mega','kilo','milli','micro','nano','pico'],//,'femto','atto'
          '10N': ['10<sup>6</sup>','10<sup>3</sup>','10<sup>-3</sup>','10<sup>-6</sup>','10<sup>-9</sup>','10<sup>-12</sup>'],//,'10<sup>-15</sup>','10<sup>-18</sup>'
          'DECIMAL': ['1 000 000','1 000', '0.001', '0.000 001', '0.000 000 001', '0.000 000 000 001']//, '0.000 000 000 000 001', '0.000 000 000 000 000 001'
        }
      };
    },
    beforeMount() {

    }
  };
</script>
