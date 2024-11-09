import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface Order {
  id: string;
  orderStatus: string;
  employeeID: string;
  orderNote: string;
  tableID: string;
  createAt: string; //Why String? I HAVE NO IDEA!!! If shits work, dont touch it (not me code this XD)
  forDate: string; //WHY IS THE API RETURnING A STRING??????
}

interface OrderDetail {
  id: string;
  dishId: string;
  quantity: number;
  orderID: string;
  createAt: string;
  orderDetailStatus: string;
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([]);
  const orderDetails = ref<OrderDetail[]>([]); // Thêm biến để lưu trữ chi tiết đơn hàng
  const currentPage = ref(1);
  const totalItems = ref(0);
  const itemsPerPage = 5;
  const selectedOrderDetails = ref<OrderDetail[]>([]); // Khai báo với kiểu rõ ràng
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

  const fetchOrders = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/order?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();

      // Lấy thông tin bàn cho từng đơn hàng
      const ordersWithTables = await Promise.all(
        data.map(async (order: Order) => {
          const tableResponse = await fetch(`http://localhost:3000/api/table/${order.tableID}`);
          const tableData = await tableResponse.json();

          return {
            ...order,
            tableID: tableData.tableNumber, // Thêm thông tin bàn vào đơn hàng
            realTableID: order.tableID, // SHUT!!!! IF YOU EVER READ THIS, YOU WILL DIE IN 7 DAYS
            //blame ma friend for this lmao
            //ok, seriously though, realTableID shouldn't have any effect on the UI nor the Order object and page
            //The reason why im adding this line is because im too lazy to fix the whole thing from the order page
            //And i only need the ID for invoice generation. So, yeah, this is a quick fix 
          };
        })
      );

      orders.value = ordersWithTables;
      totalItems.value = data.length; // Hoặc data.total nếu API trả về tổng số
      currentPage.value = page;
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderDetail = async (updatedOrderDetails: OrderDetail) => {
    try {
      const id = updatedOrderDetails.id;
      const response = await fetch(`http://localhost:3000/api/orderDetail/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderDetailStatus: updatedOrderDetails.orderDetailStatus }),
      });
      if (response.ok) {
        await fetchOrderDetails();
      } else {
        console.error('Failed to update order details');
      }
    } catch (error) {
      console.error('Error updating order details:', error);
    }
  }

  const fetchOrderWithOrderDetails = async (orderID: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/order/${orderID}`);
      const data = await response.json();
  
      // Log the entire response for debugging
      console.log('API response:', data);
  
      const order = data.order; 
      const orderDetails = data.orderDetails;
  
      // Check if orderDetails is defined and is an array
      if (!Array.isArray(orderDetails)) {
        throw new Error('orderDetails is not an array or is undefined');
      }
  
      // Fetch dish details for each order detail
      const orderDetailsWithDishes = await Promise.all(
        orderDetails.map(async (orderDetail: OrderDetail) => {
          const dishResponse = await fetch(`http://localhost:3000/api/dish/${orderDetail.dishId}`);
          const dishData = await dishResponse.json();
  
          return {
            ...orderDetail,
            dishName: dishData.dishName, // Add dish name to order detail
          };
        })
      );
  
      // Combine order and order details into one JSON object
      const orderWithDetails = {
        ...order,
        orderDetails: orderDetailsWithDishes,
      };
  
      // Update the selectedOrderDetails with the combined data
      selectedOrderDetails.value = orderWithDetails;
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const fetchOrderByID = async (orderID: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/order/${orderID}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch order');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  }

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/orderDetail`); // Đường dẫn API để lấy chi tiết đơn hàng
      if (response.ok) {
        const details: OrderDetail[] = await response.json();
        orderDetails.value = details; // Cập nhật giá trị cho orderDetails
      } else {
        console.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const addOrder = async (newOrder: Omit<Order, 'id'>) => {
    try {
      const response = await fetch('http://localhost:3000/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (response.ok) {
        await fetchOrders(currentPage.value);
      } else {
        console.error('Failed to add order');
      }
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const updateOrder = async (updatedOrder: Order) => {
    try {
      const { id, tableID, employeeID, ...updatedOrderWithoutId } = updatedOrder;
      console.log(JSON.stringify(updatedOrderWithoutId));
      const response = await fetch(`http://localhost:3000/api/order/${updatedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrderWithoutId),
      });
      if (response.ok) {
        await fetchOrders(currentPage.value);
      } else {
        console.error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/order/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchOrders(currentPage.value);
      } else {
        console.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return {
    orders,
    orderDetails, // Trả về orderDetails để có thể sử dụng trong component
    currentPage,
    totalItems,
    selectedOrderDetails,
    totalPages,
    fetchOrders,
    fetchOrderDetails, // Trả về hàm fetchOrderDetails
    addOrder,
    updateOrder,
    deleteOrder,
    fetchOrderWithOrderDetails,
    fetchOrderByID,
    updateOrderDetail,
  };
});  