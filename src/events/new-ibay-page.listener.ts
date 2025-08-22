import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const ibayPageCrawler = async (data: { ibay_id: string; html: string }) => {
    await db.update(listings).set({
        raw_data: data.html,
    }).where(eq(listings.ibay_id, parseInt(data.ibay_id, 10)));
}