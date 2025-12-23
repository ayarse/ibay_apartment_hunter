import fs from 'fs';
import path from 'path';
import { db } from '../src/db/index.js';
import { listings } from '../src/db/schema.js';
import type { PropertyRentalListing } from '../src/types/property-listing';

async function dumpJsonToCsv() {
  try {
    console.log('Fetching parsed_data from database...');

    // Fetch only the parsed_data column
    const result = await db
      .select({ parsed_data: listings.parsed_data })
      .from(listings);

    console.log(`Found ${result.length} listings`);

    if (result.length === 0) {
      console.log('No listings found in database');
      return;
    }

    // Filter out rows with null parsed_data and convert to CSV format
    const csvRows = result
      .filter((row) => row.parsed_data !== null)
      .map((row) => {
        const parsedData = row.parsed_data as PropertyRentalListing;

        return {
          title: parsedData.title,
          property_type: parsedData.property_type,
          available_from: parsedData.available_from,
          location: parsedData.location,
          neighborhood: parsedData.neighborhood,
          floor: parsedData.floor,
          bedrooms: parsedData.bedrooms,
          bathrooms: parsedData.bathrooms,
          rental_price: parsedData.rental_price,
          rental_price_currency: parsedData.rental_price_currency,
          deposit: parsedData.deposit,
          size: parsedData.size,
          furnished_status: parsedData.furnished_status,
          amenities: parsedData.amenities?.join('; '),
          other_details: parsedData.other_details?.join('; '),
          listing_date: parsedData.listing_date,
          listing_user: parsedData.listing_user,
          listing_contact: parsedData.listing_contact,
        };
      });

    console.log(`Found ${csvRows.length} listings with parsed data`);

    if (csvRows.length === 0) {
      console.log('No listings with parsed data found');
      return;
    }

    // Generate CSV headers
    const headers = Object.keys(csvRows[0]);

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...csvRows.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            // Escape values containing commas or quotes
            if (value === null || value === undefined) {
              return '';
            }
            const stringValue = String(value);
            if (
              stringValue.includes(',') ||
              stringValue.includes('"') ||
              stringValue.includes('\n')
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(','),
      ),
    ].join('\n');

    // Write to file
    const outputPath = path.join(process.cwd(), 'data', 'listings.csv');

    // Ensure data directory exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, csvContent, 'utf-8');

    console.log(
      `✅ Successfully exported ${csvRows.length} listings to ${outputPath}`,
    );
    console.log(`📊 CSV file contains ${headers.length} columns`);
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  dumpJsonToCsv()
    .then(() => {
      console.log('Export completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Export failed:', error);
      process.exit(1);
    });
}
