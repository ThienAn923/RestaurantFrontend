<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Menu,
  Settings,
  Soup,
  BadgeCent,
  Salad,
  CalendarArrowDown,
  Beef,
  UtensilsCrossed,
  ClockArrowDown,
  BadgeDollarSign,
  CircleDollarSign,
  Import,
  Carrot,
  TicketsPlane,
  User,
  House,
  ChartNoAxesGantt,
  HandCoins,
  User2,
  ChartArea,


} from 'lucide-vue-next'
import { useAuthStore } from './pinia/auth'
import { ROLES, hasPermission } from './utils/permission'

const props = defineProps<{
  initialMinimal?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:minimal', value: boolean): void
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isMinimal = ref(props.initialMinimal ?? false)

// Load the sidebar state from local storage
const savedSidebarState = localStorage.getItem('sidebarState')
if (savedSidebarState) {
  isMinimal.value = JSON.parse(savedSidebarState).isMinimal
}

const toggleMinimal = () => {
  isMinimal.value = !isMinimal.value
  emit('update:minimal', isMinimal.value)
  // Save the sidebar state to local storage
  localStorage.setItem('sidebarState', JSON.stringify({ isMinimal: isMinimal.value }))
}

interface MenuItem {
  title: string;
  icon?: any;
  href?: string;
  isOpen?: boolean;
  items?: MenuItem[];
  action?: string;
  requiredRole?: number[];
}

// Load the menu items state from local storage
const savedMenuItemsState = localStorage.getItem('menuItemsState')
const allSidebarItems = ref<MenuItem[]>([
  { title: 'Thống Kê', icon: Home, href: '/dashboard', requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
  {
    title: 'Quản Lý',
    icon: Menu,
    isOpen: false,
    requiredRole: [ROLES.RECEPTIONIST, ROLES.CHEF, ROLES.ADMIN, ROLES.SERVER],
    items: [
      {
        title: 'Quản Lý Món Ăn',
        isOpen: false,
        icon: Salad,
        requiredRole: [ROLES.RECEPTIONIST, ROLES.ADMIN, ROLES.CHEF, ROLES.SERVER],
        items: [
          { title: 'Món Ăn', icon: Soup, href: '/dishes', requiredRole: [ROLES.ADMIN, ROLES.CHEF] },
          { title: 'Đặt Món', icon: CalendarArrowDown, href: '/DishesOrder', requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.SERVER] },
          { title: 'Loại Món', icon: Beef, href: '/dishType', requiredRole: [ROLES.ADMIN, ROLES.CHEF] },
          { title: 'Bàn', icon: UtensilsCrossed, href: '/table', requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.CHEF, ROLES.SERVER] },
          { title: 'Quản Lý Đơn Món', icon: ClockArrowDown, href: '/order', requiredRole: [ROLES.ADMIN, ROLES.CHEF, ROLES.SERVER] },
          { title: 'Thanh Toán Đơn Món', icon: BadgeCent, href: '/orderCompleted', requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
          { title: 'Hóa Đơn', icon: BadgeDollarSign, href: '/invoice', requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.SERVER] },
        ]
      },
      { title: 'Quản Lý Khuyến Mãi', icon: CircleDollarSign, href: '/promotion', requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.SERVER] },
      {
        title: 'Quản Lý Nguyên Liệu',
        icon: Carrot,
        isOpen: false,
        requiredRole: [ROLES.CHEF, ROLES.ADMIN],
        items: [
          { title: 'Nhà Cung Cấp', icon: Import, href: '/provider', requiredRole: [ROLES.ADMIN, ROLES.CHEF] },
          { title: 'Nguyên Liệu', icon: Carrot, href: '/ingredient', requiredRole: [ROLES.ADMIN, ROLES.CHEF] },
          { title: 'Loại Nguyên Liệu', icon: Soup, href: '/ingredient-type', requiredRole: [ROLES.ADMIN, ROLES.CHEF] },
          { title: 'Hóa Đơn Nhập', icon: TicketsPlane, href: '/import-invoice', requiredRole: [ROLES.ADMIN, ROLES.CHEF] },
        ]
      },
      {
        title: 'Quản Lý Công Việc',
        isOpen: false,
        icon: ChartNoAxesGantt,
        requiredRole: [ROLES.ADMIN],
        items: [
          { title: 'Nhân Viên', icon: User, href: '/employee', requiredRole: [ROLES.ADMIN] },
          { title: 'Chức Vụ', icon: ChartArea, href: '/position', requiredRole: [ROLES.ADMIN] },
          { title: 'Phòng Ban', icon: House, href: '/department', requiredRole: [ROLES.ADMIN] },
        ]
      },
      { title: 'Quản Lý Chi Tiêu', icon: HandCoins, href: '/expense', requiredRole: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
      { title: 'Quản Lý Khách Hàng', icon: User2, href: '/client', requiredRole: [ROLES.ADMIN] },
    ]
  },
  { title: 'Đăng Xuất', icon: Settings, href: '/login', action: 'logout', requiredRole: [ROLES.ADMIN, ROLES.CHEF, ROLES.RECEPTIONIST, ROLES.SERVER] },
])

const handleMenuItemClick = (item) => {
  if (item.action === 'logout') {
    authStore.logout()
    router.push(item.href)
  } else {
    router.push(item.href)
  }
}

if (savedMenuItemsState) {
  const savedState = JSON.parse(savedMenuItemsState)
  allSidebarItems.value.forEach(item => {
    const savedItem = savedState.find((saved: MenuItem) => saved.title === item.title)
    if (savedItem) {
      item.isOpen = savedItem.isOpen
      if (item.items) {
        item.items.forEach(subItem => {
          const savedSubItem = savedItem.items?.find((saved: MenuItem) => saved.title === subItem.title)
          if (savedSubItem) {
            subItem.isOpen = savedSubItem.isOpen
          }
        })
      }
    }
  })
}

const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
  return items.filter(item => {
    if (item.requiredRole && !hasPermission(authStore.userRole, item.requiredRole)) {
      return false;
    }
    if (item.items) {
      const filteredItems = filterMenuItems(item.items);
      if (filteredItems.length > 0) {
        item.items = filteredItems;
        return true;
      }
      return false;
    }
    return true;
  });
};

const sidebarItems = computed(() => filterMenuItems(allSidebarItems.value))

const toggleSubmenu = (item: MenuItem) => {
  if (!isMinimal.value && item.items) {
    item.isOpen = !item.isOpen
    // Save the menu items state to local storage
    localStorage.setItem('menuItemsState', JSON.stringify(allSidebarItems.value))
  }
}

const handleItemClick = (item: MenuItem) => {
  if (item.items) {
    toggleSubmenu(item)
  } else if (item.action === 'logout') {
    authStore.logout()
    router.push(item.href)
  } else if (item.href) {
    router.push(item.href)
  }
}

const isActive = (href: string) => {
  return route.path === href
}

const sidebarWidth = computed(() => isMinimal.value ? 'w-16' : 'w-64')
</script>

<template>
  <aside
    :class="['bg-white transition-all duration-300 ease-in-out flex-shrink-0 border-r border-gray-200', sidebarWidth]">
    <div class="p-4 h-full overflow-y-auto">
      <button @click="toggleMinimal"
        class="w-full mb-4 p-2 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-200">
        <ChevronLeft v-if="!isMinimal" class="w-5 h-5 mx-auto" />
        <ChevronRight v-else class="w-5 h-5 mx-auto" />
      </button>
      <nav>
        <ul class="space-y-2">
          <li v-for="item in sidebarItems" :key="item.title">
            <button @click="handleItemClick(item)"
              :class="['w-full text-left p-2 rounded-md transition-colors duration-200 flex items-center', isActive(item.href!) ? 'bg-gray-200' : 'hover:bg-gray-100']">
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span v-if="!isMinimal" class="ml-2">{{ item.title }}</span>
              <ChevronDown v-if="!isMinimal && item.items" class="w-4 h-4 ml-auto transition-transform duration-200"
                :class="{ 'transform rotate-180': item.isOpen }" />
            </button>
            <ul v-if="!isMinimal && item.items && item.isOpen" class="mt-2 ml-4 space-y-1">
              <li v-for="subItem in item.items" :key="subItem.title">
                <button v-if="subItem.href" @click="handleItemClick(subItem)"
                  :class="['w-full text-left p-2 rounded-md transition-colors duration-200', isActive(subItem.href) ? 'bg-gray-200' : 'hover:bg-gray-100']">
                  {{ subItem.title }}
                </button>
                <div v-else>
                  <button @click="toggleSubmenu(subItem)"
                    class="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 flex items-center">
                    <span>{{ subItem.title }}</span>
                    <ChevronDown class="w-4 h-4 ml-auto transition-transform duration-200"
                      :class="{ 'transform rotate-180': subItem.isOpen }" />
                  </button>
                  <ul v-if="subItem.isOpen" class="mt-2 ml-4 space-y-1">
                    <li v-for="grandChild in subItem.items" :key="grandChild.title">
                      <button @click="handleItemClick(grandChild)"
                        :class="['w-full text-left p-2 rounded-md transition-colors duration-200', isActive(grandChild.href!) ? 'bg-gray-200' : 'hover:bg-gray-100']">
                        {{ grandChild.title }}
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>



<!-- <script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Home,
  Menu,
  Settings,
} from 'lucide-vue-next'
import { useAuthStore } from '../components/pinia/auth'
import { ROLES, hasPermission } from '../components/utils/permission'

const props = defineProps<{
  initialMinimal?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:minimal', value: boolean): void
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isMinimal = ref(props.initialMinimal ?? false)

const toggleMinimal = () => {
  isMinimal.value = !isMinimal.value
  emit('update:minimal', isMinimal.value)
}

interface MenuItem {
  title: string;
  icon?: any;
  href?: string;
  isOpen?: boolean;
  items?: MenuItem[];
  requiredRole?: number;
}

const allSidebarItems = ref<MenuItem[]>([
  { title: 'Dashboard', icon: Home, href: '/dashboard', requiredRole: ROLES.RECEPTIONIST },
  { 
    title: 'Management', 
    icon: Menu,
    isOpen: false,
    requiredRole: ROLES.RECEPTIONIST,
    items: [
      {
        title: 'Dishes Management',
        isOpen: false,
        requiredRole: ROLES.RECEPTIONIST,
        items: [
          { title: 'Dish', href: '/dishes', requiredRole: ROLES.RECEPTIONIST },
          { title: 'DishType', href: '/dishType', requiredRole: ROLES.CHEF },
          { title: 'Table', href: '/table', requiredRole: ROLES.RECEPTIONIST },
          { title: 'Order', href: '/order', requiredRole: ROLES.RECEPTIONIST },
          { title: 'Invoice', href: '/invoice', requiredRole: ROLES.RECEPTIONIST },
        ]
      },
      { title: 'Promotion Management', href: '/promotion', requiredRole: ROLES.CHEF },
      {
        title: 'Ingredient Management',
        isOpen: false,
        requiredRole: ROLES.CHEF,
        items: [
          { title: 'Provider', href: '/provider', requiredRole: ROLES.CHEF },
          { title: 'Ingredient', href: '/ingredient', requiredRole: ROLES.CHEF },
          { title: 'Ingredient Type', href: '/ingredient-type', requiredRole: ROLES.CHEF },
          { title: 'Import Invoice', href: '/import-invoice', requiredRole: ROLES.CHEF },
        ]
      },
      {
        title: 'Work Management',
        isOpen: false,
        requiredRole: ROLES.ADMIN,
        items: [
          { title: 'Employee', href: '/employee', requiredRole: ROLES.ADMIN },
          { title: 'Position', href: '/position', requiredRole: ROLES.ADMIN },
          { title: 'Department', href: '/department', requiredRole: ROLES.ADMIN },
        ]
      },
    ]
  },
  { title: 'Settings', icon: Settings, href: '/settings', requiredRole: ROLES.RECEPTIONIST },
])

const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
  return items.filter(item => {
    if (item.requiredRole && !hasPermission(authStore.userRole, item.requiredRole)) {
      return false
    }
    if (item.items) {
      item.items = filterMenuItems(item.items)
      return item.items.length > 0
    }
    return true
  })
}

const sidebarItems = computed(() => filterMenuItems(allSidebarItems.value))

const toggleSubmenu = (item: MenuItem) => {
  if (!isMinimal.value && item.items) {
    item.isOpen = !item.isOpen
    console.log(`Toggled ${item.title}: isOpen = ${item.isOpen}`)
  }
}

const handleItemClick = (item: MenuItem) => {
  console.log(`Clicked item: ${item.title}`)
  if (item.items) {
    toggleSubmenu(item)
  } else if (item.href) {
    navigateTo(item.href)
  }
}

const navigateTo = (href: string) => {
  router.push(href)
}

const isActive = (href: string) => {
  return route.path === href
}

const sidebarWidth = computed(() => isMinimal.value ? 'w-16' : 'w-64')
</script>

<template>
  <aside 
    :class="[
      'bg-white transition-all duration-300 ease-in-out flex-shrink-0 border-r border-gray-200',
      sidebarWidth
    ]"
  >
    <div class="p-4 h-full overflow-y-auto">
      <button 
        @click="toggleMinimal" 
        class="w-full mb-4 p-2 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-200"
      >
        <ChevronLeft v-if="!isMinimal" class="w-5 h-5 mx-auto" />
        <ChevronRight v-else class="w-5 h-5 mx-auto" />
      </button>
      <nav>
        <ul class="space-y-2">
          <li v-for="item in sidebarItems" :key="item.title">
            <button 
              @click="handleItemClick(item)"
              :class="[
                'w-full text-left p-2 rounded-md transition-colors duration-200 flex items-center',
                isActive(item.href!) ? 'bg-gray-200' : 'hover:bg-gray-100'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span v-if="!isMinimal" class="ml-2">{{ item.title }}</span>
              <ChevronDown 
                v-if="!isMinimal && item.items" 
                class="w-4 h-4 ml-auto transition-transform duration-200"
                :class="{ 'transform rotate-180': item.isOpen }"
              />
            </button>
            <ul v-if="!isMinimal && item.items && item.isOpen" class="mt-2 ml-4 space-y-1">
              <li v-for="subItem in item.items" :key="subItem.title">
                <button 
                  v-if="subItem.href"
                  @click="navigateTo(subItem.href)"
                  :class="[
                    'w-full text-left p-2 rounded-md transition-colors duration-200',
                    isActive(subItem.href) ? 'bg-gray-200' : 'hover:bg-gray-100'
                  ]"
                >
                  {{ subItem.title }}
                </button>
                <div v-else>
                  <button
                    @click="toggleSubmenu(subItem)"
                    class="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 flex items-center"
                  >
                    <span>{{ subItem.title }}</span>
                    <ChevronDown 
                      class="w-4 h-4 ml-auto transition-transform duration-200"
                      :class="{ 'transform rotate-180': subItem.isOpen }"
                    />
                  </button>
                  <ul v-if="subItem.isOpen" class="mt-2 ml-4 space-y-1">
                    <li v-for="grandChild in subItem.items" :key="grandChild.title">
                      <button
                        @click="navigateTo(grandChild.href!)"
                        :class="[
                          'w-full text-left p-2 rounded-md transition-colors duration-200',
                          isActive(grandChild.href!) ? 'bg-gray-200' : 'hover:bg-gray-100'
                        ]"
                      >
                        {{ grandChild.title }}
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template> -->