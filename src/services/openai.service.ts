import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { PropertyRentalListingSchema } from '@/types/property-listing.type';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY,
});

const userPrompt = (html: string) => `
\`\`\`html
${html}
\`\`\`
`;

export async function convertHtmlToJson(html: string) {
  const response = await openai.chat.completions.create({
    model: 'deepseek/deepseek-chat-v3.1',
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
    response_format: zodResponseFormat(PropertyRentalListingSchema, 'data'),
  });

  const parsed = PropertyRentalListingSchema.safeParse(
    JSON.parse(response.choices[0].message.content),
  );

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
