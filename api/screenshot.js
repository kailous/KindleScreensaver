const axios = require('axios');

async function captureScreenshot() {
  try {
    const url = `https://${process.env.VERCEL_URL || 'localhost:3000'}`;  // 这是你的主页 URL
    const browserlessApiKey = process.env.BROWSERLESS_API_KEY;  // 使用环境变量保存 Browserless API 密钥

    const response = await axios.post('https://chrome.browserless.io/screenshot', {
      url: url,  // 目标页面的 URL（这里是 Vercel 的主页）
      viewport: { width: 600, height: 800 },
    }, {
      headers: {
        'Authorization': `Bearer ${browserlessApiKey}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',  // 返回截图数据
    });

    const screenshot = response.data;
    // 处理截图数据
    console.log('Screenshot captured successfully');
    return screenshot;
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  }
}

captureScreenshot();
