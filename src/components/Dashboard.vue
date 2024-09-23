<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, DollarSign, Utensils } from 'lucide-vue-next'

// Define types
type Invoice = {
  id: number;
  amount: number;
  time: string;
}

type Dish = {
  name: string;
  sales: number;
}

type IncomeDataPoint = {
  name: string;
  income: number;
}

type Period = 'today' | 'week' | 'month' | 'year'

// Mock data with proper typing
const recentInvoices = ref<Invoice[]>([
  { id: 1, amount: 50.00, time: '10:15 AM' },
  { id: 2, amount: 75.50, time: '10:30 AM' },
  { id: 3, amount: 120.00, time: '10:45 AM' },
])

const incomeData: Record<Exclude<Period, 'today'>, IncomeDataPoint[]> = {
  week: [
    { name: 'Mon', income: 1000 },
    { name: 'Tue', income: 1200 },
    { name: 'Wed', income: 1100 },
    { name: 'Thu', income: 1300 },
    { name: 'Fri', income: 1500 },
    { name: 'Sat', income: 1800 },
    { name: 'Sun', income: 1600 },
  ],
  month: [
    { name: 'Week 1', income: 7000 },
    { name: 'Week 2', income: 7500 },
    { name: 'Week 3', income: 8000 },
    { name: 'Week 4', income: 8500 },
  ],
  year: [
    { name: 'Jan', income: 30000 },
    { name: 'Feb', income: 32000 },
    { name: 'Mar', income: 35000 },
    { name: 'Apr', income: 33000 },
    { name: 'May', income: 36000 },
    { name: 'Jun', income: 38000 },
  ],
}

const totalIncome = ref({
  today: 1500,
  week: 8500,
  month: 35000,
})

const topDishes = ref<Record<Period, Dish[]>>({
  today: [
    { name: 'Spaghetti Carbonara', sales: 45 },
    { name: 'Margherita Pizza', sales: 40 },
    { name: 'Caesar Salad', sales: 35 },
  ],
  week: [
    { name: 'Spaghetti Carbonara', sales: 280 },
    { name: 'Margherita Pizza', sales: 260 },
    { name: 'Grilled Salmon', sales: 240 },
  ],
  month: [
    { name: 'Spaghetti Carbonara', sales: 1200 },
    { name: 'Margherita Pizza', sales: 1100 },
    { name: 'Grilled Salmon', sales: 1000 },
  ],
  year: [] // Add this to match the Period type
})

const selectedPeriod = ref<Period>('week')
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- 30 Minute Invoice -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices (30 min)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li v-for="invoice in recentInvoices" :key="invoice.id" class="flex justify-between items-center">
              <span>${{ invoice.amount.toFixed(2) }}</span>
              <span class="text-gray-500">{{ invoice.time }}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <!-- Total Income -->
      <Card>
        <CardHeader>
          <CardTitle>Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span>Today:</span>
              <span class="font-bold">${{ totalIncome.today.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>This Week:</span>
              <span class="font-bold">${{ totalIncome.week.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>This Month:</span>
              <span class="font-bold">${{ totalIncome.month.toLocaleString() }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Top Dishes -->
      <Card>
        <CardHeader>
          <CardTitle>Top Dishes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs v-model="selectedPeriod" class="w-full">
            <TabsList class="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <TabsContent v-for="period in ['today', 'week', 'month'] as const" :key="period" :value="period">
              <ul class="space-y-2">
                <li v-for="dish in topDishes[period]" :key="dish.name" class="flex justify-between items-center">
                  <span>{{ dish.name }}</span>
                  <span class="font-bold">{{ dish.sales }}</span>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>

    <!-- Income Chart Placeholder -->
    <Card class="mt-6">
      <CardHeader>
        <CardTitle>Income Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
          <p class="text-gray-500">This space is for income chart</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>