import { type NextRequest, NextResponse } from 'next/server';
import { isOpsAuthenticated } from '@/lib/ops/auth';
import { db, schema } from '@/db';

/**
 * POST /api/ops/settings/import
 * Import contacts from CSV into the leads table
 */
export async function POST(request: NextRequest) {
  const authenticated = await isOpsAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const csvText = await request.text();
    const lines = csvText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV must have a header row and at least one data row' },
        { status: 400 }
      );
    }

    // Parse header row
    const headers = parseCSVRow(lines[0]).map((h) => h.toLowerCase().trim());
    const dataRows = lines.slice(1);

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const rowNum = i + 2; // 1-indexed, header is row 1
      try {
        const values = parseCSVRow(dataRows[i]);
        const row: Record<string, string> = {};

        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j] || '';
        }

        // Validate: need at least email or phone
        const email = row['email'] || null;
        const phone = row['phone'] || null;

        if (!email && !phone) {
          errors.push(`Row ${rowNum}: missing email and phone (at least one required)`);
          continue;
        }

        // Address is required by schema
        const address = row['address'] || '';
        const city = row['city'] || '';
        const state = row['state'] || '';
        const zip = row['zip'] || '';

        if (!address || !city || !state || !zip) {
          errors.push(`Row ${rowNum}: missing required address fields (address, city, state, zip)`);
          continue;
        }

        await db.insert(schema.leads).values({
          email,
          phone,
          firstName: row['first_name'] || row['firstname'] || null,
          lastName: row['last_name'] || row['lastname'] || null,
          address,
          city,
          state,
          zip,
        });

        imported++;
      } catch {
        errors.push(`Row ${rowNum}: failed to import`);
      }
    }

    return NextResponse.json({ imported, errors });
  } catch {
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}

/**
 * Parse a single CSV row, handling quoted fields with commas/newlines
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote (""))
        if (i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current);
  return result;
}
