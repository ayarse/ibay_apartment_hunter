import { z } from 'zod';

const PropertyRentalListingSchema = z.object({
  title: z.string().describe('Title of the property listing'),

  listing_type: z
    .enum(['rental', 'long_term_lease', 'sale', 'wanted'])
    .default('rental')
    .describe(
      'Type of listing: "rental" for monthly rentals, "long_term_lease" for multi-year leases with large upfront payments (typically >100k MVR), "sale" for properties being sold, "wanted" if someone is looking for a property (not offering one)',
    ),

  property_type: z
    .enum(['apartment', 'house', 'godown', 'land', 'other'])
    .default('apartment')
    .describe('Type of property'),

  available_from: z
    .string()
    .nullable()
    .optional()
    .describe('Date when property becomes available (YYYY-MM-DD format)'),

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

  // Rental pricing
  rental_price: z
    .number()
    .nullable()
    .optional()
    .describe('Monthly rental price (for rental listings)'),

  rental_price_currency: z
    .enum(['MVR', 'USD'])
    .nullable()
    .optional()
    .describe('Currency of the rental price'),

  // Long-term lease pricing
  lease_price: z
    .number()
    .nullable()
    .optional()
    .describe(
      'Total lease price for long-term leases (usually large amounts like 100k-500k+ MVR for multi-year terms)',
    ),

  lease_duration_years: z
    .number()
    .nullable()
    .optional()
    .describe('Duration of long-term lease in years (e.g., 5, 10, 15 years)'),

  // Sale pricing
  sale_price: z
    .number()
    .nullable()
    .optional()
    .describe('Sale price if property is for sale'),

  sale_price_currency: z
    .enum(['MVR', 'USD'])
    .nullable()
    .optional()
    .describe('Currency of the sale price'),

  // Deposit - structured
  deposit: z
    .object({
      months: z
        .number()
        .int()
        .min(1)
        .nullable()
        .optional()
        .describe(
          'Number of months deposit required (e.g., "2 month deposit" = 2)',
        ),
      fixed_amount: z
        .number()
        .nullable()
        .optional()
        .describe('Fixed deposit amount if specified as currency value'),
      currency: z
        .enum(['MVR', 'USD'])
        .nullable()
        .optional()
        .describe('Currency of fixed deposit amount'),
      raw_text: z
        .string()
        .nullable()
        .optional()
        .describe('Original deposit text if parsing is ambiguous'),
    })
    .nullable()
    .optional()
    .describe(
      'Security deposit details. Can be specified as months (e.g., "1 month", "2 months advance") or fixed amount',
    ),

  size: z
    .number()
    .nullable()
    .optional()
    .describe(
      'Size of the property in square feet. Return null if not explicitly mentioned.',
    ),

  furnished_status: z
    .enum(['furnished', 'unfurnished', 'semi-furnished', 'unknown'])
    .nullable()
    .optional()
    .describe('Furnishing status of the property'),

  amenities: z
    .array(z.string())
    .default([])
    .describe(
      'Physical amenities and facilities ONLY. Include: appliances, utilities, building features (lift, wifi, parking, washing_machine, ac, etc.). EXCLUDE: subjective descriptions or abstract concepts.',
    ),

  coordinates: z
    .object({
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
    })
    .nullable()
    .optional()
    .describe('Coordinates of the property. Only if available.'),

  other_details: z
    .array(z.string())
    .default([])
    .describe(
      'Other details mentioned (e.g., tenant preference, bills included, no pets)',
    ),

  listing_date: z
    .string()
    .date()
    .nullable()
    .describe(
      'Date when the listing was created. Look for "Last Updated" in HTML. Store in Format: YYYY-MM-DD. Return null if not available.',
    ),

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
