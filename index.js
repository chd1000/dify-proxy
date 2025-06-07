// 这是最终版“机器人”核心文件，添加了“敲门”回应功能

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const stream = require('stream');
const cors = require('cors');

const app = express();

// 依然保持最强的CORS配置
app.use(cors({ origin: '*', methods: '*', allowedHeaders: '*' }));

// --- 我们新增加的“敲门”回应功能 ---
// 当有人访问 /ping 时，我们立刻回答 "pong"
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});
// ---------------------------------

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload-proxy', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('没有收到文件');
    }

    const formData = new FormData();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    formData.append('file', bufferStream, { filename: req.file.originalname });

    const difyResponse = await axios.post(
      'https://api.dify.ai/v1/files/upload',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': 'Bearer YOUR_DIFY_API_KEY', // 确保这里是您的密钥
        },
      }
    );

    res.status(200).json(difyResponse.data);
  } catch (error) {
    console.error('代理转发时出错:', error.response ? error.response.data : error.message);
    res.status(500).send('服务器在转发时出错了');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`代理服务器正在端口 ${port} 上运行`);
});
