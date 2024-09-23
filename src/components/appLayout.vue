<script setup lang="ts">
import { ref, provide } from 'vue'
import Sidebar from './Sidebar.vue'

const props = defineProps<{
  initialMinimal?: boolean
}>()

const isMinimal = ref(props.initialMinimal ?? false)

const handleUpdateMinimal = (value: boolean) => {
  isMinimal.value = value
}

provide('isSidebarMinimal', isMinimal)
</script>

<template>
  <div class="flex w-full h-screen overflow-hidden bg-gray-100">
    <Sidebar 
      :initialMinimal="isMinimal" 
      @update:minimal="handleUpdateMinimal" 
    />
    <main class="flex-grow overflow-auto">
      <slot />
    </main>
  </div>
</template>