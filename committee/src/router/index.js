import Vue from 'vue';
import VueRouter from 'vue-router';

import { Loading } from 'element-ui'

const IndexPage = () => import('@/components/IndexPage')

Vue.use(VueRouter);

let routes = [
    {
        path: '/',
        name: 'Index',
        component: IndexPage,
    },
    {
        path: '/index',
        name: 'index',
        component: IndexPage,
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
