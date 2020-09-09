import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from  '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import Lists from '../components/goods/Lists.vue'
import Add  from '../components/goods/Add.vue'
import Orders from '../components/order/Order.vue'
import Reports from '../components/report/Reports.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', 
    component: Home, 
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: Lists },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Reports }
    ]
  }   
]

const router = new VueRouter({
  routes
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // ${//to and from are Route Object,next() must be called to resolve the hook}
  if(to.path === '/login') return next()
  const tokenStr = sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()  
})

export default router
