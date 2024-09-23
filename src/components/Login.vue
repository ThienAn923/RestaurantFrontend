<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue';
import axios from 'axios';

const router = useRouter();
let username = ref('');
let password = ref('');
const login = async () => {
    try{
        const response = await axios.post('http://localhost:3000/api/account/login', {
            accountUsername: username.value,
            accountPassword: password.value
        });
        console.log(response);
        router.push('/dashboard'); // Redirect to THE PAGE YOU WANT!! i don't have other pages so i just redirect to table
        
    }catch(err){
        console.log((err as any).message);
    }
}
</script>


<template>
  <Card class="my-auto">
    <CardHeader>
      <CardTitle class="text-2xl">
        Login
      </CardTitle>
      <CardDescription>
        Enter your email below to login to your account.
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="grid gap-2">
        <Label for="username">Username</Label>
        <Input id="username" type="username" v-model="username" placeholder="abcdefgh" required />
      </div>
      <div class="grid gap-2">
        <Label for="password">Password</Label>
        <Input id="password" type="password" v-model="password" required />
      </div>
    </CardContent>
    <CardFooter>
      <Button class="w-full" @click="login">
        Sign in
      </Button>
    </CardFooter>
  </Card>
</template>