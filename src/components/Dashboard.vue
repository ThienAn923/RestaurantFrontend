<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInvoiceStore } from './pinia/invoice.store'
import { ScrollArea } from './ui/scroll-area'
import { AreaChart } from '@/components/ui/chart-area'
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/formatMoney'
import CustomChartTooltip from './ui/tooltip/CustomChartTooltip.vue' //this is a custome file that i made, not provided by the template
import { watch } from 'fs'

const invoiceStore = useInvoiceStore();

// Define types
type Invoice = {
  id: number;
  finalTotalCost: number;
  invoiceDate: Date;
}

type Dish = {
  id: string;
  dishName: string;
  count: number;
}

//this shit is unused, the shit that use this is also unused
type IncomeDataPoint = {
  timeUnit: string;
  income: number;
  expense: number;
  ingredientCost: number;
}

type Period = 'today' | 'week' | 'month' | 'year';
type incomePeriod = 'day' | 'week' | 'month' | 'year';

// Mock data with proper typing
const recentInvoices = ref<Invoice[]>([]);

//currently i store all the data of income here, this could be better for user to switch around tables
//But will kinda cpu and time consumming when loaded? i think
//Will hold data like this: Day{7 object}, week{12 object}, month {12 object}, years {all the rest of the year}
//The year one could be dangerous if there's million and million of invoice?
//Hai da, idk, but currently, this is just a test product, it wont hold as much data
const incomeData = ref<Record<incomePeriod, IncomeDataPoint[]>>({
  day: [],
  week: [],
  month: [],
  year: [],
});

interface TotalIncome {
  today: number;
  week: number;
  month: number;
}

const totalIncome = ref<TotalIncome>({
  today: 0,
  week: 0,
  month: 0,
})

const topDishes = ref<Record<Period, Dish[]>>({
  today: [
  ],
  week: [
  ],
  month: [
  ],
  year: [] // Add this to match the Period type
})

const selectedPeriod = ref<Period>('week')

const formatDate = (dateString: string): string => {
  return format(new Date(dateString), ' HH:mm:ss');
};

onMounted(async () => {
  // Fetch data from the store
  totalIncome.value = await invoiceStore.getTotalIncome();

  const response = await invoiceStore.fetchRecentInvoice();
  recentInvoices.value = response?.data.formattedInvoices || [];

  const topDishesResponse = await invoiceStore.getTopDishes();
  topDishes.value = topDishesResponse?.data || [];
  // console.log(JSON.stringify(topDishes.value));

  const incomeDataResponse = await invoiceStore.fetchIncomeData();
  incomeData.value = incomeDataResponse?.data;

  console.log("Running onMounted Dashboard", JSON.stringify(incomeData.value.day));


})

const chartSelection = ref<incomePeriod>('day');
const selectedData = computed(() => {
  return incomeData.value[chartSelection.value];
});

</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- 30 Minute Invoice -->
      <Card>
        <CardHeader>
          <CardTitle>Hóa Đơn Gần Đây (30 Phút)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <div class="h-32">
              <ul class="space-y-2">
                <li v-for="invoice in recentInvoices" :key="invoice.id" class="flex justify-between items-center">
                  <span class="text-gray-500 ">{{ formatDate(invoice.invoiceDate.toString()) }}</span>
                  <span class="font-bold">{{ formatCurrency(invoice.finalTotalCost) }}</span>
                </li>
              </ul>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <!-- Total Income -->
      <Card>
        <CardHeader>
          <CardTitle>Tổng Thu Nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span>Hôm Nay:</span>
              <span class="font-bold">{{ formatCurrency(totalIncome.today) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Tuần Này:</span>
              <span class="font-bold">{{ formatCurrency(totalIncome.week) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Tháng Này:</span>
              <span class="font-bold">{{ formatCurrency(totalIncome.month) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Top Dishes -->
      <Card>
        <CardHeader>
          <CardTitle>Top Món Ăn</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs v-model="selectedPeriod" class="w-full">
            <TabsList class="grid w-full grid-cols-3">
              <TabsTrigger value="today">Hôm Nay</TabsTrigger>
              <TabsTrigger value="week">Trong Tuần</TabsTrigger>
              <TabsTrigger value="month">Trong Tháng</TabsTrigger>
            </TabsList>
            <TabsContent v-for="period in ['today', 'week', 'month'] as const" :key="period" :value="period">
              <ul class="space-y-2">
                <li v-for="dish in topDishes[period]" :key="dish.id" class="flex justify-between items-center">
                  <span>{{ dish.dishName }}</span>
                  <span class="font-bold">{{ dish.count }}</span>
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
        <CardTitle>Biểu Đồ Thu Nhập</CardTitle>
        <div class="flex items-end justify-end mt-2 mr-2">
          <select v-model="chartSelection" class="p-2 border rounded">
            <option value="day">Trong 1 tháng</option>
            <option value="week">Trong 3 tháng</option>
            <option value="month">Trong 1 Năm</option>
            <option value="year">Tất Cả</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <AreaChart :data="selectedData" :colors="['#5DADE2', 'pink', 'orange', 'red']" index="timeUnit"
          :categories="['income', 'expense', 'ingredientCost']" :custom-tooltip="CustomChartTooltip"
          :y-formatter="(tick) => formatCurrency(tick)" />
      </CardContent>
    </Card>
  </div>
</template>