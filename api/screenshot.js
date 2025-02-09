const axios = require('axios');

async function captureScreenshot() {
  try {
    const response = await axios.post('https://chrome.browserless.io/screenshot', {
      url: 'http://localhost:3000/Canvas.html',
      viewport: { width: 600, height: 800 },
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    });

    const screenshot = response.data;
    // Process the screenshot data
    console.log('Screenshot captured successfully');
    return screenshot;
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  }
}

captureScreenshot();
