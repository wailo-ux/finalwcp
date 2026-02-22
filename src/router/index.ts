import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import Dashboard from '../pages/admin/dashboard/Dashboard.vue'
import Login from '../pages/auth/Login.vue'

const routes = [
  { path: '/:catchAll(.*)', redirect: { name: 'dashboard' } },
  { path: '/', redirect: { name: 'login' } },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { name: 'login', path: 'login', component: Login }
    ],
  },
  {
    path: '/admin',
    component: AppLayout,
    children: [
      { name: 'dashboard', path: 'dashboard', component: Dashboard },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const isUserLoggedIn = !!localStorage.getItem('user')

  if (to.path.includes('/admin') && !isUserLoggedIn) {
    next({ name: 'login' })
  } else if (to.path.includes('/auth') && isUserLoggedIn) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router