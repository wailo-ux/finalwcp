import { createRouter, createWebHistory } from 'vue-router'

// HAPUS BARIS INI: AppLayout, Dashboard, ComingSoon, Login, dan AuthLayout 
// tidak perlu di-import di sini karena sudah dipanggil pakai () => import(...) di bawah.

// Biarkan ini karena masih dipakai langsung (bukan lazy load) di rute bawah:
import Register from '../pages/auth/Register.vue'
import ForgotPassword from '../pages/auth/ForgotPassword.vue'

const routes = [
  { path: '/:catchAll(.*)', redirect: { name: 'dashboard' } },
  { path: '/', redirect: { name: 'login' } },
  
  // Rute /auth yang sudah digabungkan menjadi satu:
  {
    path: '/auth',
    component: () => import('../layouts/AuthLayout.vue'), 
    children: [
      { name: 'login', path: 'login', component: () => import('../pages/auth/Login.vue') }, 
      { name: 'register', path: 'register', component: Register },
      { name: 'forgot-password', path: 'forgot-password', component: ForgotPassword },
    ],
  },

  {
    path: '/admin',
    component: () => import('../layouts/AppLayout.vue'),
    children: [
      { name: 'dashboard', path: 'dashboard', component: () => import('../pages/admin/dashboard/Dashboard.vue') },
      { name: 'wcp1', path: 'wcp1', component: () => import('../pages/admin/dashboard/ComingSoon.vue') },
      { name: 'wcp2', path: 'wcp2', component: () => import('../pages/admin/dashboard/ComingSoon.vue') },
      { name: 'wcp3', path: 'wcp3', component: () => import('../pages/admin/dashboard/ComingSoon.vue') },
      { name: 'user-management', path: 'user-management', component: () => import('../pages/admin/dashboard/UserManagement.vue') },
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