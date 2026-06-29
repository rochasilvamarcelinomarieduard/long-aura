import { createRouter, createWebHistory } from 'vue-router'
import LoginView         from '@/views/LoginView.vue'
import HomeView          from '@/views/HomeView.vue'
import ForYou            from '@/views/ForYou.vue'
import ProfileView       from '@/views/ProfileView.vue'
import Searchview        from '@/views/Searchview.vue'
import Uploadview        from '@/views/Uploadview.vue'
import Notificationsview from '@/views/Notificationsview.vue'
import Messagesview      from '@/views/Messagesview.vue'
import AdminLogin        from '@/views/AdminLogin.vue'
import AdminView         from '@/views/AdminView.vue'
import LojaView          from '@/views/LojaView.vue'
import ProdutoView       from '@/views/ProdutoView.vue'
import CarrinhoView      from '@/views/CarrinhoView.vue'
import ColecaoView       from '@/views/ColecaoView.vue'
import ResetPassword from '@/views/ResetPasswordView.vue'
import { authState }                     from '@/auth.js'
import { adminAuthState, initAdminAuth } from '@/adminAuth.js'

initAdminAuth()

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { public: true },
  },
  {
  path: '/rastreio',
  name: 'rastreio',
  component: () => import('@/views/RastreioView.vue'),
  meta: { requiresAuth: true }
},
  {
    path: '/home',
    component: HomeView,
    meta: { requiresAuth: true },
    children: [
      { path: '',                   name: 'ForYou',        component: ForYou },
      { path: 'profile',            name: 'Profile',       component: ProfileView },
      { path: 'profile/:username',  name: 'ProfileUser',   component: ProfileView },
      { path: 'explore',            name: 'Search',        component: Searchview },
      { path: 'upload',             name: 'Upload',        component: Uploadview },
      { path: 'notifications',      name: 'Notifications', component: Notificationsview },
      { path: 'messages',           name: 'Messages',      component: Messagesview },
      { path: 'loja',               name: 'Loja',          component: LojaView },
      { path: 'loja/produto/:id',   name: 'Produto',       component: ProdutoView },
      { path: 'loja/colecao/:tipo', name: 'Colecao',       component: ColecaoView },
      { path: 'carrinho',           name: 'Carrinho',      component: CarrinhoView },
    ],
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { public: true },
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminView,
    meta: { requiresAdmin: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (!authState.ready) {
    await new Promise(resolve => {
      const stop = setInterval(() => {
        if (authState.ready) { clearInterval(stop); resolve() }
      }, 30)
    })
  }
  if (!adminAuthState.ready) {
    await new Promise(resolve => {
      const stop = setInterval(() => {
        if (adminAuthState.ready) { clearInterval(stop); resolve() }
      }, 30)
    })
  }
if (to.meta.requiresAuth && !authState.user) return { name: 'Login' }
  if (to.meta.requiresAdmin) {
    if (!adminAuthState.user || !adminAuthState.profile?.is_admin) return { name: 'AdminLogin' }
  }
  if (to.name === 'Login' && authState.user) return { path: '/home' }
  if (to.name === 'AdminLogin' && adminAuthState.profile?.is_admin) return { path: '/admin/dashboard' }
})

export default router