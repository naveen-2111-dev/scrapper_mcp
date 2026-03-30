import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { chromium } from "playwright";

export async function extractContent(links: string[]) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const results: Record<string, string> = {};

    try {
        for (const link of links) {
            await page.goto(link, { waitUntil: "domcontentloaded" });
            const html = await page.content();

            const dom = new JSDOM(html, { url: link });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();

            results[link] = article?.textContent || "";
        }

        return {
            organic_results: results,
        };
    } finally {
        await browser.close();
    }
}