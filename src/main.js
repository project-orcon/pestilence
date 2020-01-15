import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './registerServiceWorker'
import vuetify from './plugins/vuetify'
import './firebase'
import { firestorePlugin } from "vuefire"
import Vuex from 'vuex'

Vue.use(Vuex);


const store = new Vuex.Store({
  state: {
    fingerprint: 0
  },
  mutations: {
    setFingerprint (state, fingerprint) {
      state.fingerprint=fingerprint;
    }
  },
  getters: {
    fingerprint: state => state.fingerprint
  }
})


Vue.use(firestorePlugin);


Vue.config.productionTip = false

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
