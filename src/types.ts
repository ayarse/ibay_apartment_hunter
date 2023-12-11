export enum Locations {
  All = 'All',
  Hulhumale = 'Hulhumale',
  Male = 'Male',
  Villigili = 'Villigili',
}
export interface Listing {
  id: string;
  title: string;
  url: string;
  price?: string | undefined;
  location?: string | undefined;
}
