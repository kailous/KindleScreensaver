import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { size } = req.query;  // 例如：600x800
  const [width, height] = size.split('x').map(val => parseInt(val, 10));

  if (!width || !height) {
    console.error("Invalid size format");
    return res.status(400).json({ error: 'Invalid size format. Use widthxheight.' });
  }

  try {
    console.log(`Launching Puppeteer...`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });

    console.log(`Navigating to http://localhost:3000`);
    const response = await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
    });

    if (response.status() !== 200) {
      console.error(`Failed to load page. Status code: ${response.status()}`);
      return res.status(500).json({ error: `Failed to load page. Status code: ${response.status()}` });
    }

    console.log("Taking screenshot...");

    const screenshotPath = path.join('/tmp', 'screenshot.png');
    await page.screenshot({ path: screenshotPath });

    await browser.close();

    console.log("Returning screenshot...");

    const image = fs.readFileSync(screenshotPath);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(image);

    fs.unlinkSync(screenshotPath);
  } catch (error) {
    console.error("Error during screenshot capture:", error);
    res.status(500).json({ error: 'Failed to capture screenshot.' });
  }
}
