import 'dotenv/config';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { listings } from '../src/db/schema.js';
import { convertHtmlToJson } from '../src/services/openai.service.js';

async function main() {
  console.log('🧪 OpenRouter Parsing Test');
  console.log('==========================\n');

  // Parse command line args for --id=123
  const args = process.argv.slice(2);
  const idArg = args.find((arg) => arg.startsWith('--id='));
  const specificId = idArg ? parseInt(idArg.split('=')[1], 10) : null;

  let listing: {
    id: number;
    ibay_id: number | null;
    title: string | null;
    raw_data: string | null;
  } | undefined;

  if (specificId) {
    // Fetch specific listing by ID
    console.log(`🔍 Fetching listing with ID: ${specificId}\n`);
    const [result] = await db
      .select({
        id: listings.id,
        ibay_id: listings.ibay_id,
        title: listings.title,
        raw_data: listings.raw_data,
      })
      .from(listings)
      .where(and(eq(listings.id, specificId), isNotNull(listings.raw_data)))
      .limit(1);
    listing = result;

    if (!listing) {
      console.log(`❌ No listing found with ID ${specificId} (or no raw_data)`);
      process.exit(1);
    }
  } else {
    // Fetch a random listing with raw_data
    console.log('🎲 Fetching random listing...\n');
    const [result] = await db
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
    listing = result;

    if (!listing) {
      console.log('❌ No listings with raw_data found in database');
      process.exit(1);
    }
  }

  console.log(`📋 Selected listing:`);
  console.log(`   ID: ${listing.id}`);
  console.log(`   iBay ID: ${listing.ibay_id}`);
  console.log(`   Title: ${listing.title}`);
  console.log(`   Raw data length: ${listing.raw_data?.length ?? 0} chars`);
  console.log('');

  if (!listing.raw_data) {
    console.log('❌ No raw_data available for this listing');
    process.exit(1);
  }

  console.log('🔄 Parsing with OpenRouter...\n');

  try {
    const startTime = Date.now();
    const result = await convertHtmlToJson(listing.raw_data);
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
