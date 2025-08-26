export interface CartItem {
  productId: number;
  customerUsername?: string;
  productName: string;
  productImage: string;
  productPrice: number;
  productQuantity?: number; // optional quantity for display
  dateAdded?: Date;
}

export interface CartDto {
  items: CartItem[];
  customerUsername:string;
}
