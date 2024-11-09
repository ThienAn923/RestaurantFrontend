<script setup lang="ts">
import { ref, defineEmits, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DateFormatter, type DateValue, getLocalTimeZone, now } from '@internationalized/date'
import { Calendar as CalendarIcon } from 'lucide-vue-next'

const df = new DateFormatter('en-US', {
    dateStyle: 'long',
})

const value = ref<DateValue>(now(getLocalTimeZone()))
const popoverOpen = ref(false)

const emit = defineEmits<{
    (e: 'date-selected', date: DateValue): void
}>()

function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ')
}

const handleDateSelect = (date: DateValue | undefined) => {
    //handle undefined
    if (!date) return;

    value.value = date
    popoverOpen.value = false // Close the popover after selecting a date
    emit('date-selected', date)
}

onMounted(() => {
    // Emit the initial value
    console.log(value.value);
    emit('date-selected', value.value) // I HAVE NO IDEA!! THERE'RE BOTH "DateValue" and still managed to get mismatched type error

})

</script>

<template>
    <Popover v-model:open="popoverOpen">
        <PopoverTrigger as-child>
            <Button variant="outline" :class="cn(
                'w-[280px] justify-start text-left font-normal',
                !value && 'text-muted-foreground',
            )">
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date" }}
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
            <Calendar v-model="value" initial-focus @update:model-value="handleDateSelect" />
        </PopoverContent>
    </Popover>
</template>