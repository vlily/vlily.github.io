<!-- home.vue -->
<template>
    <div>
      <swiperRow style="display:inline-block;"></swiperRow>
      <sirTrevor class="sirTrevor"></sirTrevor>
    </div>
</template>
<style type="text/css">
.sirTrevor{margin-top: 20px;}
</style>
<script>
import swiperRow from '../components/swiperRow.vue';
import sirTrevor from '../components/sirTrevor.vue'
export default {
  name: 'home',
  data () {
    return {
       
    }
  },
  components: {
    swiperRow,
    sirTrevor
  },
  methods:{
    eClick(){
        console.log(9999);
    }
  }
}
</script>
