import 'dotenv/config';
import { isNotNull, sql } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { listings } from '../src/db/schema.js';
import { convertHtmlToJson } from '../src/services/openai.service.js';

async function main() {
  console.log('🧪 OpenRouter Parsing Test');
  console.log('==========================\n');

  // Fetch a random listing with raw_data
  const [randomListing] = await db
    .select({
      id: listings.id,
      ibay_id: listings.ibay_id,
      title: listings.title,
      raw_data: listings.raw_data,
    })
    .from(listings)
    .where(isNotNull(listings.raw_data))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!randomListing) {
    console.log('❌ No listings with raw_data found in database');
    process.exit(1);
  }

  console.log(`📋 Selected listing:`);
  console.log(`   ID: ${randomListing.id}`);
  console.log(`   iBay ID: ${randomListing.ibay_id}`);
  console.log(`   Title: ${randomListing.title}`);
  console.log(`   Raw data length: ${randomListing.raw_data?.length ?? 0} chars`);
  console.log('');

  if (!randomListing.raw_data) {
    console.log('❌ No raw_data available for this listing');
    process.exit(1);
  }

  console.log('🔄 Parsing with OpenRouter...\n');

  try {
    const startTime = Date.now();
    const result = await convertHtmlToJson(randomListing.raw_data);
    const duration = Date.now() - startTime;

    console.log('✅ Parsing successful!\n');
    console.log(`⏱️  Duration: ${duration}ms\n`);
    console.log('📊 Parsed result:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Parsing failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main().catch(console.error);
