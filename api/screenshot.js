// api/screenshot.js
const { chromium } = require('playwright');

module.exports = async (req, res) => {
  // 从查询参数中获取尺寸，例如 ?size=600x800，默认 600x800
  const { size = '600x800' } = req.query;
  if (!/^(\d+)x(\d+)$/.test(size)) {
    return res.status(400).send('尺寸格式错误，请使用 widthxheight 例如 600x800');
  }
  const [width, height] = size.split('x').map(Number);

  let browser;
  try {
    // 启动 Chromium，添加 --no-sandbox 和 --disable-setuid-sandbox 参数以适应无服务器环境
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 修改后的 URL 使用 http://localhost:3000/Canvas.html
    const canvasUrl = process.env.CANVAS_URL || 'http://localhost:3000';

    // 导航至页面，等待网络空闲
    await page.goto(canvasUrl, { waitUntil: 'networkidle' });
    // 设置视口大小
    await page.setViewportSize({ width, height });

    // 截取整个页面的图片
    const buffer = await page.screenshot({ fullPage: true });

    // 返回 PNG 图片
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(buffer);
  } catch (error) {
    console.error('截图出错:', error);
    res.status(500).send('截图失败');
  } finally {
    if (browser) await browser.close();
  }
};
