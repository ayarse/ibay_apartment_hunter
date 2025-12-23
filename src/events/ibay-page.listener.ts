import * as Sentry from '@sentry/node';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { listings } from '@/db/schema';
import { convertHtmlToJson } from '@/services/openai.service';

export const ibayPageCrawler = async (data: {
  ibay_id: string;
  html: string;
}) => {
  const updatedListing = await db
    .update(listings)
    .set({
      raw_data: data.html,
    })
    .where(eq(listings.ibay_id, parseInt(data.ibay_id, 10)))
    .returning({ id: listings.id });

  const listingId = updatedListing[0].id;

  try {
    const parsedData = await convertHtmlToJson(data.html);

    await db
      .update(listings)
      .set({
        parsed_data: parsedData,
      })
      .where(eq(listings.id, listingId));
  } catch (error) {
    Sentry.captureException(error);
  }
};
