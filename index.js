// 这是机器人的核心文件，我们叫它 index.js

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const stream = require('stream');

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // 让图片暂存在内存里

// 这是机器人唯一需要听的指令
app.post('/upload-proxy', upload.single('file'), async (req, res) => {
  try {
    // 1. 检查小程序是否把图片送过来了
    if (!req.file) {
      return res.status(400).send('没有收到文件');
    }

    // 2. 准备把图片送给Dify
    const formData = new FormData();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    formData.append('file', bufferStream, { filename: req.file.originalname });

    // 3. 把图片发给Dify，并带上Dify需要的“通行证”（Authorization）
    // !!! 重要：请把 'YOUR_DIFY_API_KEY' 替换成您自己的Dify API密钥
    const difyResponse = await axios.post(
      'https://api.dify.ai/v1/files/upload',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': 'Bearer app-h3rD7ft9s5vWC28PJnEjVx5Z', 
        },
      }
    );

    // 4. Dify返回了结果（带着那张“201尝鲜券”）
    // 5. 我们拿出Dify返回的数据，自己包装一份“200外卖收据”送回给小程序
    res.status(200).json(difyResponse.data);

  } catch (error) {
    console.error('代理转发时出错:', error);
    res.status(500).send('服务器在转发时出错了');
  }
});

// 让机器人开始工作
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`代理服务器正在端口 ${port} 上运行`);
});
