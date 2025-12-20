import { OpenRouter } from '@openrouter/sdk';
import { z } from 'zod';
import { PropertyRentalListingSchema } from '@/types/property-listing.type';
import { env } from '@/config';

const openRouter = new OpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

const systemPrompt = `Parse Maldivian property listings from iBay into JSON.

## CRITICAL - PRICE EXTRACTION (Always do this first!)
Based on listing_type, you MUST extract the price fields:

| listing_type | REQUIRED fields |
|--------------|-----------------|
| long_term_lease | lease_price (number), lease_duration_years (number) |
| rental | rental_price (number), rental_price_currency |
| sale | sale_price (number), sale_price_currency |

Examples:
- "25 YEARS MRF 1,500,000/=" → listing_type: "long_term_lease", lease_price: 1500000, lease_duration_years: 25
- "15,000/month" → listing_type: "rental", rental_price: 15000, rental_price_currency: "MVR"
- "$500 monthly" → rental_price: 500, rental_price_currency: "USD"

Currency: MRF/MVR/Rf/- = "MVR", $/USD = "USD". Default to MVR if ambiguous.

## LISTING TYPE
- long_term_lease: "long lease", "lease", "X years" with large upfront payment (100k-2M+ MVR). NOT monthly rentals.
- sale: "for sale", "selling"
- wanted: Someone LOOKING for a property (not offering one). They want to rent/buy, not listing their own.
- rental: Monthly rentals (default). Usually 5k-30k MVR/month.

## PROPERTY & LOCATION
- property_type: apartment (default), house, godown (warehouse/storage), land (empty plot)
- location: Male, Hulhumale, Villigili, other
- Male neighborhoods: Maafannu, Mahchangoalhi, Galolhu, Henveiru
- Hulhumale: "Phase 1" or "Phase 2" (newer, also may be listed as "Hiyaa" or "Vinares")
- Villigili: Separate island near Male

## ROOMS & FLOOR
- "X room" typically means X bedrooms (e.g., "3 room apartment" → bedrooms: 3)
- Look for explicit "bedroom", "bathroom", "toilet" counts
- "attached bathroom" means bathroom is inside the bedroom
- floor: "ground floor"/"G" = 0, "1st floor" = 1, "2nd floor" = 2, etc.
- If floor is vague (e.g., "sixth & above"), put in other_details

## FURNISHED STATUS
- "fully furnished" / "furnished" → "furnished"
- "unfurnished" / "empty" → "unfurnished"
- "semi-furnished" / "partly furnished" / has some appliances but not complete → "semi-furnished"

## DEPOSIT
- "1 month deposit" / "2 month advance" → deposit.months = 1 or 2
- Fixed amount like "50,000 deposit" → deposit.fixed_amount = 50000, deposit.currency = "MVR"
- If ambiguous, store original text in deposit.raw_text

## OTHER FIELDS
- size: Only extract if explicitly stated in sqft/sq.ft. Return null otherwise.
- listing_contact: Combine multiple phone numbers with comma (e.g., "7775355, 7705978")
- listing_date: Look for "Last Updated" in HTML. Get as Format: YYYY-MM-DD. Return null if not found.
- coordinates: Extract latitude/longitude if embedded map or location data exists.
- amenities: Physical features only (lift, AC, wifi, parking, washing machine). Exclude subjective descriptions.
- other_details: Tenant preferences, bills included, pets policy, nearby landmarks, etc.

Return JSON only.`;

const userPrompt = (html: string) => `
\`\`\`html
${html}
\`\`\`
`;

export async function convertHtmlToJson(html: string) {
  const response = await openRouter.chat.send({
    model: 'deepseek/deepseek-v3.2',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt(html),
      },
    ],
    responseFormat: {
      type: 'json_schema',
      jsonSchema: {
        name: 'property_rental_listing',
        schema: z.toJSONSchema(PropertyRentalListingSchema),
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error('No response content from model');
  }

  const parsed = PropertyRentalListingSchema.safeParse(JSON.parse(content));

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
