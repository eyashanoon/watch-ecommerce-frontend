// models/image.model.ts
export interface Image {
  id: number;
  url: string; // or base64 string if you store images that way
  productId: number;
}
