import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './components/pinia/auth'
import { hasPermission, ROLES } from './components/utils/permission'
import {useToast} from "./components/ui/toast"
import path from 'path'
const routes = [
  { path: '/login', component: () => import('./components/Login.vue') },
  { path: '/Dashboard', component: () => import('./components/DashboardPage.vue'), meta: { requiresAuth: true, requiredRoles: [ROLES.ADMIN, ROLES.RECEPTIONIST] } },
  { path: '/Dishes', component: () => import('./components/DishesManagementPage.vue'), meta: { requiresAuth: true, requiredRoles: [ROLES.ADMIN, ROLES.CHEF] } },
  { path: '/DishType', component: () => import('./components/DishTypeManagementPage.vue'), meta: { requiresAuth: true, requiredRoles: [ROLES.ADMIN, ROLES.CHEF, ROLES.RECEPTIONIST, ROLES.SERVER]} },
  { path: '/table', component: () => import('./components/TablePage.vue'), meta: { requiresAuth: true, requiredRoles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.CHEF, ROLES.SERVER] } },
  { path: '/position', component: () => import('./components/PositionManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN] } },
  { path: '/department', component: () => import('./components/DepartmentManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN] } },
  { path: '/provider', component: () => import('./components/ProviderManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN, ROLES.CHEF] } },
  { path: '/ingredient-type', component: () => import('./components/IngredientTypeManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN, ROLES.CHEF] } },
  { path: '/ingredient', component: () => import('./components/IngredientManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN, ROLES.CHEF] } },
  { path: '/employee', component: () => import('./components/employeeManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN] } },
  { path: '/invoice', component: () => import('./components/invoiceManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.SERVER] } },
  { path: '/promotion', component: () => import('./components/promotionManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.SERVER] } },
  { path: '/import-invoice', component: () => import('./components/ImportInvoiceManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN, ROLES.CHEF] }},
  { path: '/order', component: () => import('./components/chefManagementPage.vue'), meta: { requiresAuth: true, requiredRoles: [ROLES.ADMIN, ROLES.CHEF, ROLES.SERVER] }},
  { path: '/expense', component: () => import('./components/expenseManagementPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST] } },
  //temporary
  { path: '/orderCompleted', component: () => import('./components/orderReceptionistPage.vue'), meta: { requiresAuth: true, requiredRoles: [ROLES.ADMIN, ROLES.RECEPTIONIST] }},
  { path: '/DishesOrder', component: () => import('./components/DishesManagementOrderPage.vue'), meta: { requiresAuth: true, requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.SERVER]  } },
]

const {toast} = useToast()

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiredRoles = to.meta.requiredRoles;

  if (requiredRoles && !hasPermission(authStore.userRole, requiredRoles)) {
    // next('/Dashboard')
    next(false);
    // alert('You do not have permission to access this page');
    //the toast component is at the bottom of the page (Which is in app.vue)
    toast({
        title: 'Forbidden',
        description: 'You do not have permission to access this page',
      });
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router