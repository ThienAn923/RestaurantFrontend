<script setup lang="ts">
import { VisBulletLegend } from '@unovis/vue'
import type { BulletLegendItemInterface } from '@unovis/ts'
import { BulletLegend } from '@unovis/ts'
import { nextTick, onMounted, ref } from 'vue'
import { buttonVariants } from '@/components/ui/button'
import { computed } from 'vue'
import { formatCurrency } from '@/lib/formatMoney'

const props = withDefaults(defineProps<{
  items: BulletLegendItemInterface[],
  totals: { income: number; expense: number; ingredientCost: number }
}>(), {
  items: () => [],
  totals: { income: 0, expense: 0, ingredientCost: 0 }
}) //This is partly customed, the totals one is customed


const emits = defineEmits<{
  'legendItemClick': [d: BulletLegendItemInterface, i: number]
  'update:items': [payload: BulletLegendItemInterface[]]
}>()

const elRef = ref<HTMLElement>()

onMounted(() => {
  const selector = `.${BulletLegend.selectors.item}`
  nextTick(() => {
    const elements = elRef.value?.querySelectorAll(selector)
    const classes = buttonVariants({ variant: 'ghost', size: 'xs' }).split(' ')
    elements?.forEach(el => el.classList.add(...classes, '!inline-flex', '!mr-2'))
  })
})

function onLegendItemClick(d: BulletLegendItemInterface, i: number) {
  emits('legendItemClick', d, i)
  const isBulletActive = !props.items[i].inactive
  const isFilterApplied = props.items.some(i => i.inactive)
  if (isFilterApplied && isBulletActive) {
    // reset filter
    emits('update:items', props.items.map(item => ({ ...item, inactive: false })))
  }
  else {
    // apply selection, set other item as inactive
    emits('update:items', props.items.map(item => item.name === d.name ? ({ ...d, inactive: false }) : { ...item, inactive: true }))
  }
}

</script>

<template>
  <div class="flex flex-col items-center w-full">
    <div class="flex justify-center items-center space-x-6 mb-4 w-full">
      <div class="flex items-center">
        <span class="text-sm font-medium mr-2" style="color: #5DADE2">Tổng Thu Nhập:</span>
        <span class="text-sm font-bold" style="color: #5DADE2">
          {{ formatCurrency(props.totals.income) }}
        </span>
      </div>
      <div class="flex items-center">
        <span class="text-sm font-medium mr-2 text-pink-500">Tổng Chi Tiêu:</span>
        <span class="text-sm font-bold text-pink-500">
          {{ formatCurrency(props.totals.expense) }}
        </span>
      </div>
      <div class="flex items-center">
        <span class="text-sm font-medium mr-2 text-orange-500">Chi Phí Nguyên Liệu:</span>
        <span class="text-sm font-bold text-orange-500">
          {{ formatCurrency(props.totals.ingredientCost) }}
        </span>
      </div>
    </div>
  </div>
  <div ref="elRef" class="w-max">
    <VisBulletLegend :items="items" :on-legend-item-click="onLegendItemClick" />
  </div>

</template>
