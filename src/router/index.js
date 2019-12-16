import Vue from 'vue'
import VueRouter from 'vue-router'
import CreateRecord from '../views/CreateRecord.vue'
import Index from '../views/Index.vue'
import Camera from '../components/Camera.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Index
  },
  {
    path: '/camera',
    name: 'camera',
    component: Camera
  },
  {
    path: '/create',
    name: 'createRecord',
    component: CreateRecord
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
