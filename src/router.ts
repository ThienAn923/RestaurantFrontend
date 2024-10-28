import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './components/pinia/auth'

const routes = [
  { path: '/login', component: () => import('./components/Login.vue') },
  { path: '/Dashboard', component: () => import('./components/DashboardPage.vue'), meta: { requiresAuth: true } },
  { path: '/Dishes', component: () => import('./components/DishesManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/DishType', component: () => import('./components/DishTypeManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/table', component: () => import('./components/TablePage.vue'), meta: { requiresAuth: true } },
  { path: '/position', component: () => import('./components/PositionManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/department', component: () => import('./components/DepartmentManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/provider', component: () => import('./components/ProviderManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/ingredient-type', component: () => import('./components/IngredientTypeManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/ingredient', component: () => import('./components/IngredientManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/employee', component: () => import('./components/employeeManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/invoice', component: () => import('./components/invoiceManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/promotion', component: () => import('./components/promotionManagementPage.vue'), meta: { requiresAuth: true } },
  { path: '/import-invoice', component: () => import('./components/ImportInvoiceManagementPage.vue'), meta: { requiresAuth: true }},
  { path: '/order', component: () => import('./components/chefManagementPage.vue'), meta: { requiresAuth: true }},

  //temporary
  { path: '/order2', component: () => import('./components/orderReceptionistPage.vue'), meta: { requiresAuth: true }},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router