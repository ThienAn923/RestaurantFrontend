import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import DashboardPage from './components/DashboardPage.vue'
import DishmanagementPage from './components/DishesManagementPage.vue'
import DishTypeManagementPage from './components/DishTypeManagementPage.vue'
import TablePage from './components/TablePage.vue';
import PositionPage from './components/PositionManagementPage.vue';
import DepartmentPage from './components/DepartmentManagementPage.vue';
import ProviderPage from './components/ProviderManagementPage.vue';
import IngredientTypePage from './components/IngredientTypeManagementPage.vue';
import IngredientPage from './components/IngredientManagementPage.vue';
import employeePage from './components/employeeManagementPage.vue';
import invoicePage from './components/invoiceManagementPage.vue';
import promotionPage from './components/promotionmanagementPage.vue';
import ImportInvoiceManagement from './components/ImportInvoiceManagementPage.vue'
import { Import } from 'lucide-vue-next'

const routes = [
  { path: '/', component: DashboardPage },
  { path: '/login', component: Login },
  { path: '/Dashboard', component: DashboardPage },
  
  {path: '/Dishes', component: DishmanagementPage},
  {path: '/DishType', component: DishTypeManagementPage},
  {path: '/table', component: TablePage},
  {path: '/position', component: PositionPage},
  {path: '/department', component: DepartmentPage},
  {path: '/provider', component: ProviderPage},
  {path: '/ingredient-type', component: IngredientTypePage},
  {path: '/ingredient', component: IngredientPage},
  {path: '/employee', component: employeePage},
  {path: '/invoice', component: invoicePage},
  {path: '/promotion', component: promotionPage},
  {path: '/import-invoice', component: ImportInvoiceManagement}


]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router