import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
import app from "./modules/app";

export default new Vuex.Store({
  modules: {
    app
  }
});
//session storage 浏览器关闭后清除
//local storage 需要手动清除
