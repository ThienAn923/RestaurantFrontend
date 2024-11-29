<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import { useAuthStore } from './pinia/auth'

const authStore = useAuthStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')

const login = async () => {
  try {
    await authStore.login(username.value, password.value)
    const userRole = authStore.userRole
    console.log('User role:', userRole);

    // Navigate based on user role
    if (userRole === 1) { //admin
      router.push('/Dashboard')
    } else if (userRole === 2) { //chef
      router.push('/order')
    } else if (userRole === 3) { //recep
      router.push('/Dashboard')
    } else if (userRole === 4) { //server
      router.push('/DishesOrder')
    } else {
      router.push('/login')
    }
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = 'Login failed. Please check your credentials and try again.'
  }
}
</script>

<template>
  <Card class="my-auto">
    <CardHeader>
      <CardTitle class="text-2xl">
        Đăng Nhập
      </CardTitle>
      <CardDescription>
        Nhập Tài Khoản và Mật Khẩu dưới đây để đăng nhập vào tài khoản của bạn.
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="grid gap-2">
        <Label for="username">Tên Đăng Nhập</Label>
        <Input id="username" type="text" v-model="username" placeholder="Enter your username" required />
      </div>
      <div class="grid gap-2">
        <Label for="password">Mật Khẩu</Label>
        <Input id="password" type="password" v-model="password" required />
      </div>
      <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
    </CardContent>
    <CardFooter>
      <Button class="w-full" @click="login">
        Sign in
      </Button>
    </CardFooter>
  </Card>
</template>