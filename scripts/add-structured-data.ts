import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { and, count, eq, isNotNull, isNull } from 'drizzle-orm';
import PQueue from 'p-queue';
import { db } from '../src/db/index.js';
import { listings } from '../src/db/schema.js';
import { convertHtmlToJson } from '../src/services/openai.service.js';

interface ProcessingStats {
  total: number;
  processed: number;
  failed: number;
  skipped: number;
}

class StructuredDataProcessor {
  private stats: ProcessingStats = {
    total: 0,
    processed: 0,
    failed: 0,
    skipped: 0,
  };

  private batchSize: number;
  private concurrency: number;
  private dryRun: boolean;
  private queue: PQueue;

  constructor(batchSize = 50, concurrency = 5, dryRun = false) {
    this.batchSize = batchSize;
    this.concurrency = concurrency;
    this.dryRun = dryRun;
    // Add interval to avoid rate limits: max `concurrency` requests per 1 second
    this.queue = new PQueue({ concurrency, interval: 1000, intervalCap: concurrency });
  }

  async run() {
    console.log(
      '🚀 Starting structured data processing for existing listings...',
    );
    console.log(`📊 Batch size: ${this.batchSize}`);
    console.log(`⚡ Concurrency: ${this.concurrency}`);
    console.log(`🔍 Dry run: ${this.dryRun ? 'YES' : 'NO'}`);
    console.log('');

    try {
      // Get count of listings that need processing
      await this.getProcessingStats();

      if (this.stats.total === 0) {
        console.log(
          '✅ No listings need processing. All listings already have structured data or no raw data available.',
        );
        return;
      }

      console.log(
        `📈 Found ${this.stats.total} listings that need structured data processing`,
      );
      console.log('');

      // Process in batches
      let offset = 0;
      while (offset < this.stats.total) {
        console.log(
          `📦 Processing batch ${Math.floor(offset / this.batchSize) + 1}/${Math.ceil(this.stats.total / this.batchSize)}`,
        );

        const batch = await this.getBatch(offset);
        await this.processBatch(batch);

        offset += this.batchSize;

      }

      this.printFinalStats();
    } catch (error) {
      console.error('❌ Error during processing:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  private async getProcessingStats() {
    // Count listings that have raw_data but no parsed_data
    const result = await db
      .select({ count: count() })
      .from(listings)
      .where(and(isNotNull(listings.raw_data), isNull(listings.parsed_data)));

    this.stats.total = result[0].count;
  }

  private async getBatch(offset: number) {
    return await db
      .select({
        id: listings.id,
        ibay_id: listings.ibay_id,
        title: listings.title,
        raw_data: listings.raw_data,
      })
      .from(listings)
      .where(and(isNotNull(listings.raw_data), isNull(listings.parsed_data)))
      .limit(this.batchSize)
      .offset(offset);
  }

  private async processBatch(
    batch: Array<{
      id: number;
      ibay_id: number | null;
      title: string | null;
      raw_data: string | null;
    }>,
  ) {
    // Process all listings in the batch concurrently using the queue
    await Promise.all(
      batch.map((listing) => this.queue.add(() => this.processListing(listing))),
    );
  }

  private getProgress(): string {
    const done = this.stats.processed + this.stats.failed + this.stats.skipped;
    const percent = ((done / this.stats.total) * 100).toFixed(1);
    return `[${done}/${this.stats.total} ${percent}%]`;
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  private async processListing(listing: {
    id: number;
    ibay_id: number | null;
    title: string | null;
    raw_data: string | null;
  }) {
    const { id, ibay_id, title, raw_data } = listing;

    try {
      if (!raw_data || raw_data.trim() === '') {
        console.log(`${this.getProgress()} ⚠️  Skipped ${id}: No raw data`);
        this.stats.skipped++;
        return;
      }

      // Convert HTML to structured JSON with retry
      const parsedData = await this.withRetry(() => convertHtmlToJson(raw_data), 3);

      if (this.dryRun) {
        console.log(
          `${this.getProgress()} ✅ [DRY RUN] ${id}: ${parsedData.listing_type} - ${parsedData.location}`,
        );
      } else {
        // Update the listing with parsed data
        await db
          .update(listings)
          .set({
            parsed_data: parsedData,
          })
          .where(eq(listings.id, id));

        console.log(
          `${this.getProgress()} ✅ ${id}: ${parsedData.listing_type} - ${parsedData.location} - ${parsedData.rental_price ?? parsedData.lease_price ?? parsedData.sale_price ?? 'N/A'}`,
        );
      }

      this.stats.processed++;
    } catch (error) {
      console.error(
        `${this.getProgress()} ❌ ${id}: ${(error as Error).message}`,
      );
      Sentry.captureException(error, {
        extra: {
          listingId: id,
          ibayId: ibay_id,
          title: title,
        },
      });
      this.stats.failed++;
    }
  }

  private printFinalStats() {
    console.log('');
    console.log('🎉 Processing completed!');
    console.log('📊 Final Statistics:');
    console.log(`   Total listings: ${this.stats.total}`);
    console.log(`   Successfully processed: ${this.stats.processed}`);
    console.log(`   Failed: ${this.stats.failed}`);
    console.log(`   Skipped: ${this.stats.skipped}`);
    console.log(
      `   Success rate: ${((this.stats.processed / this.stats.total) * 100).toFixed(1)}%`,
    );
  }

}

// Main execution
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const batchSizeArg = args.find((arg) => arg.startsWith('--batch-size='));
  const concurrencyArg = args.find((arg) => arg.startsWith('--concurrency='));
  const dryRunArg = args.includes('--dry-run');

  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 50;
  const concurrency = concurrencyArg
    ? parseInt(concurrencyArg.split('=')[1])
    : 5;

  if (batchSize <= 0 || Number.isNaN(batchSize)) {
    console.error('❌ Invalid batch size. Must be a positive number.');
    process.exit(1);
  }

  if (concurrency <= 0 || Number.isNaN(concurrency)) {
    console.error('❌ Invalid concurrency. Must be a positive number.');
    process.exit(1);
  }

  console.log('🏗️  iBay Apartment Hunter - Structured Data Processor');
  console.log('==================================================');
  console.log('');

  const processor = new StructuredDataProcessor(batchSize, concurrency, dryRunArg);

  try {
    await processor.run();
    console.log('');
    console.log('🎯 Script completed successfully!');
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Received SIGINT. Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Received SIGTERM. Gracefully shutting down...');
  process.exit(0);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { StructuredDataProcessor };
