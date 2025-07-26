import { Page } from 'puppeteer';
import { PuppeteerWebBaseLoader } from '@langchain/community/document_loaders/web/puppeteer';

export const getScrapedPage = async (url: string): Promise<string> => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        gotoOptions: {
            waitUntil: 'domcontentloaded',
        },
        evaluate: async (page: Page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML);
            await browser.close();

            return result;
        },
    });

    return (await loader.scrape())?.replace(/<[^>]*>/gm, '').trim() || '';
};
