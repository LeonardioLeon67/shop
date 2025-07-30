declare global {
  var orders: Record<string, {
    orderNo: string;
    productId: string;
    productName: string;
    customerEmail: string;
    paymentMethod: string;
    price: number;
    duration: string;
    status: string;
    paymentStatus: string;
    createdAt: Date;
    paidAt?: Date;
    account: string;
    password: string;
  }>;
}

export {};