import Vue from 'vue';
import VueRouter from 'vue-router';

import Ping from '@/components/Ping/Ping'
import Notebook from '@/components/Notebook/Notebook'

Vue.use(VueRouter);

let routes = [
    {
        path: '/',
        name: 'Notebook',
        component: Notebook,
    },
    {
        path: '/ping',
        name: 'Ping',
        component: Ping,
    },
];

export default new VueRouter({
    routes: routes,
    mode: 'history',
})
