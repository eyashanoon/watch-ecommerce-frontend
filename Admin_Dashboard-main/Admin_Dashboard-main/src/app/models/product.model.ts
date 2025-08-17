export interface Product {
  id: number;
  name: string;
  description: string;
  imageId: number[];          // list of image IDs related to the product
  brand: string;
  handsColor: string;
  backgroundColor: string;
  bandColor: string;
  numberingFormat: string;
  bandMaterial: string;
  caseMaterial: string;
  displayType: string;
  shape: string;
  includesDate: boolean;
  hasFullNumerals: boolean;
  hasTickingSound: boolean;
  waterProof: boolean;
  changeableBand: boolean;
  size: number;               // was number before, matches Java Double
  weight: number;             // was number before, matches Java Double
  originalPrice: number;      // corresponds to Double originalPrice
  discountPrice: number;      // corresponds to Double discountPrice
  discount: number;           // corresponds to Double discount
  quantity: number;
}

export interface ProductWithImages {
  id: number;
  name: string;
  description: string;
  imageId: number[];          // list of image IDs related to the product
  brand: string;
  handsColor: string;
  backgroundColor: string;
  bandColor: string;
  numberingFormat: string;
  bandMaterial: string;
  caseMaterial: string;
  displayType: string;
  shape: string;
  includesDate: boolean;
  hasFullNumerals: boolean;
  hasTickingSound: boolean;
  waterProof: boolean;
  changeableBand: boolean;
  size: number;               // was number before, matches Java Double
  weight: number;             // was number before, matches Java Double
  originalPrice: number;      // corresponds to Double originalPrice
  discountPrice: number;      // corresponds to Double discountPrice
  discount: number;           // corresponds to Double discount
  quantity: number;

  images: string[];          // base64 image strings
  currentImageIndex: number; // carousel index
}


