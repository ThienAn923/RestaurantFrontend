<!-- <script setup lang="ts">
import Login from './components/Login.vue'
import Table from './components/UserTable.vue'

</script>

<template>
  <div class="h-screen flex justify-center align-middle ">
    <Table />
  </div>
</template> -->

<template>
  <div class="h-screen flex justify-center align-middle">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// No need to import the components here as they are handled by the router
</script>