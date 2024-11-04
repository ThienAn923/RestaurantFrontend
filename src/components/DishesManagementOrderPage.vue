<script setup lang="ts">
import AppLayout from './appLayout.vue'
import DishesManagementOrder from './DishesManagementOrder.vue'
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>

<template>
    <AppLayout>
        <DishesManagementOrder />
    </AppLayout>
    <Toaster />
</template>
