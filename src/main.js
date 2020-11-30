import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./plugins/element.js";
import VueCompositionApi from "@vue/composition-api";
import "./router/token";

//自定义全局组件
import "@/assets/icon/index";
//路由守卫

Vue.config.productionTip = false;
Vue.use(VueCompositionApi);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
