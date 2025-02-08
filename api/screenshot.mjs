import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { size } = req.query;  // 例如：600x800
  const [width, height] = size.split('x').map(val => parseInt(val, 10));

  // 检查参数是否正确
  if (!width || !height) {
    console.error("Invalid size format");
    return res.status(400).json({ error: 'Invalid size format. Use widthxheight.' });
  }

  // 确定目标页面的 URL
  const url = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';  // 使用 Vercel 部署后的 URL 或本地地址

  try {
    console.log(`Launching Puppeteer...`);

    // 使用 chrome-aws-lambda 提供的 Chromium 路径
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath,  // 使用 chrome-aws-lambda 提供的 Chromium
      headless: true,
      args: chromium.args,
      defaultViewport: {
        width: width,
        height: height,
      },
    });

    const page = await browser.newPage();

    console.log(`Navigating to ${url}`);
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',  // 等待页面加载完成
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

    // 删除临时截图文件
    fs.unlinkSync(screenshotPath);

  } catch (error) {
    console.error("Error during screenshot capture:", error);
    res.status(500).json({ error: 'Failed to capture screenshot.' });
  }
}
