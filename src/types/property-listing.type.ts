import { z } from 'zod';

const PropertyRentalListingSchema = z.object({
  title: z.string({
    description: 'Title of the property listing',
  }),

  property_type: z
    .enum(['apartment', 'house', 'godown', 'land', 'other'], {
      description: 'Type of property being rented',
    })
    .default('apartment'),

  available_from: z
    .string()
    .date()
    .nullable()
    .optional()
    .describe('Date when property becomes available'),

  location: z
    .enum(['Male', 'Villigili', 'Hulhumale', 'other'])
    .nullable()
    .describe('Island/location of the property'),

  neighborhood: z
    .enum([
      'Maafannu',
      'Mahchangoalhi',
      'Galolhu',
      'Henveiru',
      'Villigili',
      'Hulhumale Phase 1',
      'Hulhumale Phase 2',
      'Unknown',
    ])
    .nullable()
    .optional()
    .describe('Neighborhood of the property'),

  floor: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional()
    .describe('Floor number of the property'),

  bedrooms: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional()
    .describe('Number of bedrooms'),

  bathrooms: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional()
    .describe('Number of bathrooms'),

  rental_price: z
    .number()
    .nullable()
    .optional()
    .describe('Rental price of the property'),

  rental_price_currency: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Currency of the rental price (ISO 4217 preferred, e.g., MVR, USD)',
    ),

  deposit: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Deposit or advance amount being asked for the property (raw text to capture different formats)',
    ),

  size: z
    .number()
    .nullable()
    .optional()
    .describe('Size of the property in square feet/meters (if available)'),

  furnished_status: z
    .enum(['furnished', 'unfurnished', 'semi-furnished', 'unknown'])
    .nullable()
    .optional()
    .describe('Furnishing status of the property'),

  amenities: z
    .array(z.string())
    .default([])
    .describe(
      'Physical amenities and facilities ONLY. Include: appliances, utilities, building features (lift, wifi, parking, washing_machine, etc.). EXCLUDE: subjective descriptions, location qualities, or abstract concepts.',
    ),

  other_details: z
    .array(z.string())
    .default([])
    .describe(
      'Other details mentioned (e.g., tenant preference, bills included)',
    ),

  listing_date: z
    .string()
    .date()
    .nullable()
    .describe('Date when the listing was created'),

  listing_user: z
    .string()
    .nullable()
    .describe('Name of the user who created the listing'),

  listing_contact: z
    .string()
    .nullable()
    .optional()
    .describe('Contact phone number given'),
});

type PropertyRentalListing = z.infer<typeof PropertyRentalListingSchema>;

export { PropertyRentalListingSchema, type PropertyRentalListing };
