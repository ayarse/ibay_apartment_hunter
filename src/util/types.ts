export const Locations = {
  All: 'All',
  Hulhumale: 'Hulhumale',
  Male: 'Male',
  Villigili: 'Villigili',
} as const;

export const Events = {
  NewIBayItem: 'new-ibay-item',
} as const;

export interface Listing {
  id: string;
  title: string;
  url: string;
  price?: string | undefined;
  location?: string | undefined;
}
