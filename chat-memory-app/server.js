const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const port = 3000;
app.use(cors());

// 模拟存储数据
let chatData = {
  0: [
    { role: 'user', message: 'Hello, how are you?' },
    { role: 'bot', message: 'I am fine, thank you!' },
  ],
};

let memoryAccessStatus = 'pending';  // 'pending', 'approved', 'rejected'

// 中间件设置
app.use(bodyParser.json());

// GET 请求：返回特定聊天 ID 的所有消息
app.get('/chat/:id', (req, res) => {
  const chatId = req.params.id;
  if (chatData[chatId]) {
    res.json({
      messages: chatData[chatId],
      memoryAccessStatus,
    });
  } else {
    res.status(404).send('Chat not found');
  }
});

// POST 请求：批准内存访问
app.post('/memory/approve-access', (req, res) => {
  const { signature, message } = req.body;
  memoryAccessStatus = 'approved';

  if (signature&&message) {
      // 验证签名（这里是一个简单的示例，实际中需要对签名进行完整的验证）
      const messageHash = ethers.utils.solidityKeccak256(['string'], [message]);
      const recoveredAddress = ethers.utils.verifyMessage(messageHash, signature);
      if (recoveredAddress === message.userAddress) {
        memoryStatus.approved = true;
        chatMessages.push({ id: 3, role: 'bot', content: 'Access approved!' });
      } else {
        chatData[0].push({ role: 'bot', message: 'Invalid signature.' });
        return res.status(400).json({ success: false, message: 'Invalid signature',chatData: chatData[0]  });
      }
  }
  // 新生成消息
  chatData[0].push({ role: 'bot', message: 'Memory access approved.' });
  res.json({ message: 'Memory access approved.', chatData: chatData[0] });
});

// POST 请求：拒绝内存访问
app.post('/memory/reject-access', (req, res) => {
  memoryAccessStatus = 'rejected';
  // 新生成消息
  chatData[0].push({ role: 'bot', message: 'Memory access rejected.' });
  res.json({ message: 'Memory access rejected.', chatData: chatData[0] });
});

// 启动服务
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
