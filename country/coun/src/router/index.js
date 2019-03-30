import Vue from 'vue';
import VueRouter from 'vue-router';

import Ping from '@/components/Ping/Ping'
import Country from '@/components/Country/Country'

Vue.use(VueRouter);

let routes = [
    {
        path: '/',
        name: 'Country',
        component: Country,
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
