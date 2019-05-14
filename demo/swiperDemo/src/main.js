//main.js这是项目的核心文件。全局的配置都在这个文件里面配置,引入文件，但是与组件无关。
import Vue from 'vue'
import App from './App.vue'
import router from './routes.js'
import VueAwesomeSwiper from 'vue-awesome-swiper'

import './assets/styles/swiper-4.2.2.min.css'
// import './assets/js/swiper-4.2.2.min.js'
import './assets/styles/base.css'
import './assets/styles/sir-trevor.min.css'

Vue.config.debug = true;//开启错误提示

// 全局注册
Vue.use(VueAwesomeSwiper)

new Vue({
    router,
    el: '#app',
    render: h => h(App)
})