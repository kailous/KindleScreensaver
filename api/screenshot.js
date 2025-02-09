const axios = require('axios');

async function captureScreenshot() {
  try {
    // 获取 Vercel 自动提供的 URL
    const apiUrl = `https://${process.env.VERCEL_URL}`;  // 使用 Vercel 的默认域名

    const response = await axios.post(`${apiUrl}/screenshot`, {
      url: apiUrl,  // 使用 Vercel 自动生成的主页 URL
      viewport: { width: 600, height: 800 },
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.BROWSERLESS_API_KEY}`,  // 使用环境变量 API 密钥
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
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
