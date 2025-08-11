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
  DisplayType: string;
  shape: string;
  includesDate: boolean;
  hasFullNumerals: boolean;
  hasTickingSound: boolean;
  waterProof: boolean;
  changeableBand: boolean;
  size: number;
  weight: number;
  price: number;
  quantity: number;
}
