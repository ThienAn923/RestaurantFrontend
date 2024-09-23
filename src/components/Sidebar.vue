<script setup lang="ts">
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

const props = defineProps<{
  initialMinimal?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:minimal', value: boolean): void
}>()

const router = useRouter()
const route = useRoute()

const isMinimal = ref(props.initialMinimal ?? false)

const toggleMinimal = () => {
  isMinimal.value = !isMinimal.value
  emit('update:minimal', isMinimal.value)
}

interface MenuItem {
  title: string;
  icon: any;
  href?: string;
  isOpen?: boolean;
  items?: Omit<MenuItem, 'icon' | 'items'>[];
}

const sidebarItems = ref<MenuItem[]>([
  { title: 'Dashboard', icon: Home, href: '/dashboard' },
  { 
    title: 'Management', 
    icon: Menu,
    isOpen: false,
    items: [
      {
        title: 'Dishes Management',
        isOpen: false,
        items: [
          { title: 'Dish', href: '/dishes' },
          { title: 'DishType', href: '/dishType' },
          { title: 'Table', href: '/table' },
          { title: 'Order', href: '/order' },
          { title: 'Invoice', href: '/invoice' },
        ]
      },
      { title: 'Promotion Management', href: '/promotion' },
      {
        title: 'Ingredient Management',
        isOpen: false,
        items: [
          { title: 'Provider', href: '/provider' },
          { title: 'Ingredient', href: '/ingredient' },
          { title: 'Ingredient Type', href: '/ingredient-type' },
          { title: 'Import Invoice', href: '/import-invoice' },
        ]
      },
      {
        title: 'Work Management',
        isOpen: false,
        items: [
          { title: 'Employee', href: '/employee' },
          { title: 'Position', href: '/position'},
          { title: 'Department', href: '/department'},

          //might be added later if i have time
          // { title: 'Shift', href: '/shift'},
          // { title: 'Work Schedule', href: '/work-schedule'},
        ]
      },
    ]
  },
  { title: 'Settings', icon: Settings, href: '/settings' },
])

const toggleSubmenu = (item: MenuItem) => {
  if (!isMinimal.value && item.items) {
    item.isOpen = !item.isOpen
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
              @click="item.items ? toggleSubmenu(item) : navigateTo(item.href!)"
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
</template>