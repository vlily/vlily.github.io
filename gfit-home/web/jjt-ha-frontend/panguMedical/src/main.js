import Vue from 'vue'
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
import '../statics/css/mui.css'
import '../statics/css/icons-extra.css'
import '../statics/css/muihead.css'

import App from './App.vue'

import VueRouter from 'vue-router'
import vueResource from 'vue-resource'

//import VueLazyload from 'vue-lazyload'

Vue.use(VueRouter)
Vue.use(vueResource)

Vue.use(MintUI)  //注册全局组件
//Vue.use(VueLazyload, {
//preLoad: 1.3,
//error: 'statics/images/loading.png',
//loading: 'statics/images/loading.png',
//attempt: 1
//})

import moment from '../statics/js/moment.js'
//注册全局过滤器
Vue.filter('dateFmt',(value,formatString)=>{
	formatString = formatString || 'YYYY-MM-DD HH:mm:ss';
	return moment(value).format(formatString); 
})
// 路由配置
import Home from 'comp/Home/Home'
import getOrder from 'comp/orderCure/getOrder'
import cureList from 'comp/recordCure/cureList'
import getFriends from 'comp/inviteFriends/getFriends'
import getPartner from 'comp/cityPartner/getPartner'
import messageList from 'comp/messageBoard/messageList'

const router = new VueRouter({
	linkActiveClass:'mui-active', //可以修改router-link-active 为mui-active来解决tab栏的选中bug
    mode: 'history',  //不想看到#号则配置这个 (可以用来解决与html本身锚点冲突的问题)
    routes: [
   		{ path: '/', redirect:'/Home'},
        { path: '/Home', component: Home },
        { path: '/orderCure', component: getOrder },
        { path: '/recordCure', component: cureList },
        { path: '/inviteFriends', component: getFriends },
        { path: '/cityPartner', component: getPartner }, 
        { path: '/messageBoard', component: messageList }, 
    ]
})

new Vue({
  el: '#app',
  router:router, //使用路由对象实例
  render: h => h(App)
})

