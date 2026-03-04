import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AdminTeams from '../views/admin/AdminTeams.vue'
import AdminEvaluators from '../views/admin/AdminEvaluators.vue'
import { useAuthStore } from '../stores/auth.js'
import AdminQuestions from '../views/admin/AdminQuestions.vue'
import AdminAssignments from '../views/admin/AdminAssignments.vue'
import AdminTemplates from '../views/admin/AdminTemplates.vue'
import EvaluatorForm from '../views/EvaluatorForm.vue' 
import AdminEvaluationDetails from '../views/admin/AdminEvaluationDetails.vue'
import AdminRanking from '../views/admin/AdminRanking.vue'


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },

  // rotas admin (protegidas)
  { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true } },
  { path: '/admin/teams', component: AdminTeams, meta: { requiresAuth: true } },
  { path: '/admin/evaluators', component: AdminEvaluators, meta: { requiresAuth: true } },
  { path: '/admin/questions', component: AdminQuestions, meta: { requiresAuth: true } },
  { path: '/admin/assignments', component: AdminAssignments, meta: { requiresAuth: true } },
  { path: '/admin/templates', component: AdminTemplates, meta: { requiresAuth: true } },
  { path: '/admin/evaluations/:id', component: AdminEvaluationDetails, meta: { requiresAuth: true } },
  { path: '/admin/ranking', component: AdminRanking, meta: { requiresAuth: true } },


  // rota do avaliador (sem login)
  { path: '/avaliar', component: EvaluatorForm }
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
