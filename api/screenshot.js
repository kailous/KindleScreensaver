const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const browserlessUrl = 'https://chrome.browserless.io/screenshot';  // Browserless API URL
    const targetUrl = `https://${req.headers.host}`;  // 获取当前请求的主机名，构造目标 URL
    const apiKey = process.env.BROWSERLESS_API_KEY;  // 从环境变量中获取API Key

    if (!apiKey) {
      return res.status(500).send('Browserless API Key not configured.');
    }

    // 构造请求体
    const requestBody = {
      url: targetUrl,
      viewport: { width: 600, height: 800 }
    };

    // 发送POST请求到Browserless
    const response = await axios.post(browserlessUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer', // 返回图片数据
    });

    // 将图片数据保存或直接返回
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(response.data);  // 返回截图图片数据

  } catch (error) {
    console.error('Error during screenshot capture:', error.response ? error.response.data : error.message);
    res.status(500).send('Error during screenshot capture: ' + error.message);
  }
};
