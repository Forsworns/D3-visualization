import Vue from 'vue';
import VueRouter from 'vue-router';

import GlobalPage from '@/components/GlobalPage/GlobalPage'

import { Loading } from 'element-ui'


const CountryPage = () => import('@/components/CountryPage/CountryPage')
const ComparePage = () => import('@/components/ComparePage/ComparePage')

Vue.use(VueRouter);

let routes = [
    {
        path: '/',
        name: 'Index',
        component: GlobalPage,
    },
    {
        path: '/global',
        name: 'Global',
        component: GlobalPage,
    },
    {
        path: '/country',
        name: 'Country',
        component: CountryPage,
        props: true,
    },
    {
        path: '/compare',
        name: 'Compare',
        component: ComparePage,
        props: true
    },
];

const router = new VueRouter({
    routes: routes,
    mode: 'history',
})

const options = {
    fullscreen: true,
    customClass: 'loading-class'
  }
  

router.beforeEach((to,from,next) => {
    Loading.service(options)
    next()
})

router.afterEach(() => {
    let loadingInstance = Loading.service(options) // 单例
    setTimeout(() => {
      loadingInstance.close() // 异步关闭
    },500)
  })


export default router
