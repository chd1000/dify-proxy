// 这是最终升级版的“机器人”核心文件，添加了更强大的CORS支持

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const stream = require('stream');
const cors = require('cors'); // 引入“零件”

const app = express();

// --- 我们升级了CORS配置 ---
// 这段代码的意思是：无论你从哪来，用什么方法，带什么标记，我都热情欢迎！
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*'
}));
// -------------------------

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

    // !!! 再次确认这里的 API Key 是您自己的，没有变
    const difyResponse = await axios.post(
      'https://api.dify.ai/v1/files/upload',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': 'Bearer YOUR_DIFY_API_KEY', 
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
