export interface WishlistItem {
    productId: number;
    customerUsername?: string; // Optional, used when admin views customer's wishlist
    productName: string;
    productImage: string;
    productPrice: number;
    dateAdded?: Date;
}

export interface WishlistDto {
    items: WishlistItem[];
}
