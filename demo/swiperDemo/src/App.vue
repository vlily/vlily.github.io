<!--App.vue是项目入口文件。-->
<template>
    <div id="app">
        <div>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
}
</script>
<style type="text/css">
    #app {width: 100%;height: 100%;}
</style>