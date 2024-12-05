<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns';
import { formatCurrency } from '../lib/formatMoney'
import { useRoute } from 'vue-router';

interface InvoiceDetail {
    id: string;
    dishName: string;
    quantity: number;
    totalCost: number;
    createAt: Date;
    salePerUnit: undefined | number;
    promotionAfterDishID?: string | null;
    originalPrice: number;
    promotionName?: string;
    discount?: number;
}

interface Invoice {
    id: string;
    invoiceDate: Date;
    totalCost: number;
    orderNote?: string | undefined;
    totalPromotion?: number | undefined;
    invoiceStatus: boolean;
    employeeID: string;
    employeeName: string;
    tableID: string;
    tableNumber: number;
    promotionID?: string | undefined;
    promotionName: string;
    invoiceDetails: InvoiceDetail[];
    finalTotalCost: number;
    pointEarned: number;
    pointUsed: number;
}


onMounted(() => {
    if (route.query.invoice) {
        currentInvoice.value = JSON.parse(route.query.invoice);
        console.log("Current invoice: ", currentInvoice.value);
    }

    // Set up the event listener to close the window after printing
    window.onafterprint = () => {
        window.close();
    };

    // Trigger the print dialog
    printInvoice();
});

const formatDate = (dateString: string | Date): string => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
};

const currentInvoice = ref<Invoice | null>(null);
const route = useRoute();
if (route.query.invoice) {
    currentInvoice.value = JSON.parse(route.query.invoice);
    console.log("Cuurent invoice: ", currentInvoice.value);
}

const printInvoice = () => {
    window.print();
}
</script>


<template>
    <div class="print-invoice w-[80mm] mx-auto bg-white p-10">
        <div class="max-w-3xl mx-auto">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center">
                    <img src="https://logowik.com/content/uploads/images/restaurant9491.logowik.com.webp?height=80&width=80?height=80&width=80"
                        alt="N&A Restaurant Logo" class="h-20 w-20 mr-4" />
                    <div>
                        <h1 class="text-3xl font-extrabold text-gray-900">N&A Restaurant</h1>
                        <p class="text-sm text-gray-600">Số 405 đường Lý Tự Trọng P.An Khánh </p>
                        <p class="text-sm text-gray-600"> Q.Ninh kiều tp.Cần Thơ</p>
                        <p class="text-sm text-gray-600">SĐT: (+84) 7575-9999</p>
                    </div>
                </div>
                <div class="text-right">
                    <h2 class="text-2xl font-bold text-gray-900">Hóa Đơn</h2>
                    <p class="text-sm text-gray-600">#{{ currentInvoice.id }}</p>
                </div>
            </div>

            <div class="border-t border-b border-gray-200 py-4 mb-6">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm font-bold text-gray-600">Ngày lập:</p>
                        <p class="text-sm text-gray-900">{{ formatDate(currentInvoice.invoiceDate) }}</p>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-gray-600">Bàn:</p>
                        <p class="text-sm text-gray-900">{{ currentInvoice.tableNumber }}</p>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-gray-600">Nhân viên lập:</p>
                        <p class="text-sm text-gray-900">{{ currentInvoice.employeeName }}</p>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-gray-600">Khuyến mãi:</p>
                        <p class="text-sm text-gray-900">{{ currentInvoice.promotionName }}</p>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-gray-600">Khuyến mãi cho tổng hóa đơn:</p>
                        <p class="text-sm text-gray-900">{{ currentInvoice.discount }}%</p>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-gray-600">Ghi Chú:</p>
                        <p class="text-sm text-gray-900">{{ currentInvoice.orderNote || "Không có ghi chú" }}</p>
                    </div>
                </div>
            </div>

            <div class="mb-8">
                <h3 class="text-lg font-semibold mb-3">Chi tiết hóa đơn</h3>
                <Table v-if="currentInvoice.invoiceDetails.length > 0">
                    <TableHeader>
                        <TableRow>
                            <TableHead class="font-bold text-gray-700">Tên món</TableHead>
                            <TableHead class="font-bold text-gray-700">Số lượng</TableHead>
                            <TableHead class="font-bold text-gray-700">% Giảm giá</TableHead>
                            <TableHead class="font-bold text-gray-700">Giá sau cùng</TableHead>
                            <TableHead class="font-bold text-gray-700">Tổng Cộng</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="detail in currentInvoice.invoiceDetails" :key="detail.id">
                            <TableCell>{{ detail.dishName }}</TableCell>
                            <TableCell>{{ detail.quantity }}</TableCell>
                            <TableCell>{{ detail.discount }}%</TableCell>
                            <TableCell>{{ formatCurrency(detail.totalCost / detail.quantity) }}</TableCell>
                            <TableCell class="font-bold text-gray-600">{{ formatCurrency(detail.totalCost) }}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <p v-else class="text-gray-500">No details available for this invoice.</p>
            </div>

            <div class="flex justify-between items-center mb-8">
                <div class="text-sm">
                    <p class="font-medium text-gray-600">Tổng cộng:</p>
                    <p class="font-medium text-gray-600">Giảm giá:</p>
                    <p class="font-bold text-gray-900">Tổng sau cùng:</p>
                </div>
                <div class="text-sm text-right">
                    <p>{{ formatCurrency(currentInvoice.totalCost) }}</p>
                    <p>{{ formatCurrency((currentInvoice.discount / 100 *
                        currentInvoice.totalCost) || 0) }}</p>
                    <p class="font-bold">{{ formatCurrency(currentInvoice.finalTotalCost) }}</p>
                </div>
            </div>

            <div class="flex justify-between items-center">
                <div>
                    <p class="text-xs text-gray-600 mb-1">Quét để nhận điểm thưởng:</p>
                    <img src="https://logowik.com/content/uploads/images/restaurant9491.logowik.com.webp?height=80&width=80.svg?height=80&width=80"
                        alt="QR Code" class="h-20 w-20" />
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-600 mb-1">Đã bao gồm thuế VAT </p>
                </div>
            </div>

            <div class="mt-8 text-center">
                <p class="text-xs text-gray-600">Cảm ơn quý khách đã dùng bữa tại nhà hàng chúng tôi!</p>
                <p class="text-xs text-gray-600">Hẹn gặp lại quý khách trong thời gian sớm nhất.</p>
            </div>
        </div>
    </div>
</template>