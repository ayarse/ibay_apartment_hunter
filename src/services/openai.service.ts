import { OpenRouter } from '@openrouter/sdk';
import { z } from 'zod';
import { PropertyRentalListingSchema } from '@/types/property-listing.type';
import { env } from '@/config';

const openRouter = new OpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

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
        content:
          'Parse the given HTML into the given JSON Schema. Return the JSON object only, no other text. Get dates in YYYY-MM-DD format.',
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
