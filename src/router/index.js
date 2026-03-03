import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AdminTeams from '../views/admin/AdminTeams.vue'
import AdminEvaluators from '../views/admin/AdminEvaluators.vue'
import { useAuthStore } from '../stores/auth.js'
import AdminQuestions from '../views/admin/AdminQuestions.vue'

const routes = [
  { path: '/', redirect: '/login' },         
  { path: '/login', component: Login },
  { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/admin/teams', component: AdminTeams, meta: { requiresAuth: true } },
  { path: '/admin/evaluators', component: AdminEvaluators, meta: { requiresAuth: true } },
  { path: '/admin/questions', component: AdminQuestions, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { path: '/login' }
  }
})

export default router
