export interface Image {
  id: number;          // Image ID
  filename: string;    // Name of the image file
  data: string;        // Base64 encoded image string (without data:image/jpeg;base64, prefix)
  product?: any;       // Optional: reference to the product (can be omitted or typed more strictly)
}
