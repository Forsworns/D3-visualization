import Vue from 'vue';
import VueRouter from 'vue-router';

import Bar from '@/components/Barchart/Barchart'

Vue.use(VueRouter);

let routes = [
    {
        path: '/',
        name: 'Bar',
        component: Bar,
    }
];

export default new VueRouter({
    routes: routes,
    mode: 'history',
})
