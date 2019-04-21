import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import store from './store/store.js'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as d3 from 'd3'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.prototype.$d3 = d3

new Vue({
  render: h => h(App),
  router: router,
  store: store,
}).$mount('#app')
