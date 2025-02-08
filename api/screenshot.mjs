import puppeteer from 'puppeteer';  // 使用 import
import fs from 'fs';
import path from 'path';

export 默认 async function handler(req, res) {
  const { size } = req.query;  // 例如：600x800
  const [width, height] = size.split('x').map(val => parseInt(val, 10));

  // 检查参数是否正确
  if (!width || !height) {
    console.error("Invalid size format");
    return res.status(400).json({ error: 'Invalid size format. Use widthxheight.' });
  }

  const url = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';  // 在 Vercel 上使用 https，本地使用 http

  try {
    console.log(`Launching Puppeteer...`);

    const browser = await puppeteer.launch({
      headless: true,  // 以无头模式启动
      args: ['--no-sandbox', '--disable-setuid-sandbox'],  // 防止沙盒问题
    });

    const page = await browser.newPage();

    // 设置浏览器视口大小
    await page.setViewport({ width, height });

    console.log(`Navigating to ${url}`);
    const response = await page.goto(url, {
      waitUntil: 'networkidle2', // 等待页面完全加载
    });

    if (response.status() !== 200) {
      console.error(`Failed to load page. Status code: ${response.status()}`);
      return res.status(500).json({ error: `Failed to load page. Status code: ${response.status()}` });
    }

    console.log("Taking screenshot...");

    // 在 Vercel 临时目录中保存截图
    const screenshotPath = path.join('/tmp', 'screenshot.png');
    await page.screenshot({ path: screenshotPath });

    await browser.close();

    console.log("Returning screenshot...");

    // 读取临时文件并返回图片
    const image = fs.readFileSync(screenshotPath);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');  // 防止缓存
    res.status(200).send(image);

    // 删除临时截图文件
    fs.unlinkSync(screenshotPath);
  } catch (error) {
    console.error("Error during screenshot capture:", error); // 打印详细错误信息
    res.status(500).json({ error: 'Failed to capture screenshot.' });
  }
}
