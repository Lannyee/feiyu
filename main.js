import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

// 引入全局uView
import uView from 'uview-ui'
Vue.use(uView)

const app = new Vue({
    ...App
})

// 引入全局方法
import Common from "@/common/common"
Vue.prototype.$common = Common;

// 配置请求
import httpInterceptor from '@/common/http.interceptor'
Vue.use(httpInterceptor, app)

app.$mount()