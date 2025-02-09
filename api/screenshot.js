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
      url: targetUrl,  // 目标网址
      viewport: { width: 600, height: 800 }  // 截图的视窗大小
    };

    // 请求 Browserless API 生成截图
    const response = await axios.post(browserlessUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',  // 确保返回截图数据
    });

    // 如果返回的是图像数据，直接返回
    res.setHeader('Content-Type', 'image/png');
    res.send(response.data);

  } catch (error) {
    console.error('Error during screenshot capture:', error);
    if (error.response) {
      console.error('Browserless response error:', error.response.data);
      return res.status(500).send(`Error: ${error.response.status} - ${error.response.data}`);
    }
    res.status(500).send('Error during screenshot capture');
  }
};
