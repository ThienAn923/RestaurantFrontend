<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInvoiceStore } from './pinia/invoice.store'
import { ScrollArea } from './ui/scroll-area'
import { AreaChart } from '@/components/ui/chart-area'
import { endOfDay, format } from 'date-fns';
import { formatCurrency } from '@/lib/formatMoney'
import CustomChartTooltip from './ui/tooltip/CustomChartTooltip.vue' //this is a custome file that i made, not provided by the template
import TestComponent from './testComponent.vue'; //it's the calendar component, i made it myself lmao, too lazy to change name
import { useToast } from './ui/toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

const invoiceStore = useInvoiceStore();
const { toast } = useToast()

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

  // console.log("Running onMounted Dashboard", JSON.stringify(incomeData.value));

})


const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);
const step = ref<number>(1);
// const step = ref('1'); //just for testing
const handleStartDateSelected = (date: Date) => {
  startDate.value = date;
};

const handleEndDateSelected = (date: Date) => {
  endDate.value = date;
};

const handleStepInput = (value: number) => {

  // step.value = parseInt(value); //I HAVE NO IDEA WHY IT"S STRING, BUT IT"S STRING, i literally have no idea, so this is the fix
}

const customIncomeData = ref<IncomeDataPoint[]>([]);

const getCustomIncomeData = async (startDate: Date, endDate: Date, step: number) => {

  verifyCustomeDate(startDate, endDate, step);
  const incomeDataResponse = await invoiceStore.fetchCustomIncomeData(startDate, endDate, step); //time stand for the day since user's input to now
  customIncomeData.value = incomeDataResponse?.data;


  //The data for the chart will be update under the computed function for selectedData
}

function verifyCustomeDate(startDate: Date, endDate: Date, step: number) {
  const start = new Date(startDate.year, startDate.month - 1, startDate.day);
  const end = new Date(endDate.year, endDate.month - 1, endDate.day);
  if (start >= end) {
    toast({
      title: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc',
    });
    return;
  }

  if (typeof step !== 'number' || step < 0) {
    toast({
      title: 'Bước phải là số dương',
      description: 'Đảm bảo bước lớn hơn 0, và là một số, không chưa ký tự đặc biệt',
    });
    return;
  }
}

// watch([startDate, endDate, step,], () => {
//   console.log("Selected date from DishesManagementOrder: ", JSON.stringify(startDate.value), JSON.stringify(endDate.value), step);
// })




const isCustomRange = ref(false)

const applyCustomRange = () => {
  // Here you would fetch data based on startDate, endDate, and step
  // For now, we'll just toggle the custom range flag
  isCustomRange.value = true
  chartSelection.value = 'custom'
  getCustomIncomeData(startDate.value!, endDate.value!, step.value);
}



const chartSelection = ref<incomePeriod>('day');
// const selectedData = ref<any>([]); //to lazy to define the type, bassicly day week month year for 4 selection, and day for custom (day for custom is not really day, it's more like "step")

const selectedData = computed(() => {
  if (chartSelection.value === 'custom') {
    return customIncomeData.value.day; //trust lmao
  }
  return incomeData.value[chartSelection.value];
});

//It take ALOT of time to modify the back end to send back the totals
//so i just calculate it here, it's not the best way, but it's the fastest (for me) way
const totals = computed(() => {
  //because, the data is not loaded yet
  //so if there's no this line, it will just... stop working (the whole chart lol)
  //This is to handle the case where user select custom range the first time since page load
  //As chartSelection changed (to custom), it will run the selectedData computed property
  //And there for will give this function an empty array, which caused the function to fuck up
  if (!selectedData.value) return { income: 9999, expense: 9999, ingredientCost: 9999 };


  return selectedData.value.reduce(
    (totals, item) => {
      totals.income += typeof item.income === 'number' ? item.income : 9;
      totals.expense += typeof item.expense === 'number' ? item.expense : 9;
      totals.ingredientCost += typeof item.ingredientCost === 'number' ? item.ingredientCost : 9;
      return totals;
    },
    { income: 0, expense: 0, ingredientCost: 0 }
  );
});
console.log("total from Dashboard", JSON.stringify(totals.value));

watch(totals, (newVal) => {
  console.log("Total income: ", JSON.stringify(newVal));
})



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
        <div class="flex items-center space-x-4 mt-2">
          <Select v-model="chartSelection">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Trong 1 tháng</SelectItem>
              <SelectItem value="week">Trong 3 tháng</SelectItem>
              <SelectItem value="month">Trong 1 Năm</SelectItem>
              <SelectItem value="year">Tất Cả</SelectItem>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
            </SelectContent>
          </Select>

          <template v-if="chartSelection === 'custom'">
            <TestComponent @date-selected="handleStartDateSelected" />
            <TestComponent @date-selected="handleEndDateSelected" />
            <div class="flex items-center space-x-2">
              <Label for="step">Bước:</Label>
              <Input id="step" type="number" v-model="step" @input="handleStepInput" class="w-20" min="1" />
            </div>
            <Button @click="applyCustomRange">Áp dụng</Button>
          </template>
        </div>
      </CardHeader>
      <CardContent>
        <AreaChart :data="selectedData" :colors="['#5DADE2', 'pink', 'orange', 'red']" index="timeUnit"
          :categories="['income', 'expense', 'ingredientCost']" :custom-tooltip="CustomChartTooltip"
          :y-formatter="formatCurrency" :totals="totals" /> <!-- :totals is custom -->
      </CardContent>
    </Card>
  </div>
</template>