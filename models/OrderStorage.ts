// 订单数据存储模块
let orders: any[] = [];

export function getOrders(): any[] {
  return orders;
}

export function addOrder(order: any): void {
  orders.push(order);
}

export function findOrderByNo(orderNo: string): any | null {
  return orders.find(o => o.orderNo === orderNo) || null;
}

export function getOrdersByUserId(userId: number): any[] {
  return orders.filter(order => order.userId === userId);
}

export function getOrdersByEmail(email: string): any[] {
  return orders.filter(order => order.customerEmail === email);
}

export function getOrderStorage(): any[] {
  return orders;
}

export function updateOrderStatus(orderNo: string, updates: any): boolean {
  const order = orders.find(o => o.orderNo === orderNo);
  if (order) {
    if (typeof updates === 'string') {
      order.status = updates;
    } else {
      Object.assign(order, updates);
    }
    return true;
  }
  return false;
}