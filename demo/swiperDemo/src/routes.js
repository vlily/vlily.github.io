import Vue from 'vue';
import Router from 'vue-router';
import SirTrevor from 'sir-trevor';

import homePage from './views/home.vue';

import swiperRow from './components/swiperRow.vue';
import sirTrevor from './components/sirTrevor.vue';

Vue.use(Router)
Vue.use(SirTrevor)

export default new Router({
    routes:[
        {
            path:'/',
            component:homePage
        }
    ]
});
