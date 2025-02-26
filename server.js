const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const port = 3000;
app.use(cors());

  // EIP-712 域信息
  const domain = {
    name: 'ApproveAccess',
    version: '1',
    chainId: 1,  // 假设是以太坊主网
  };

  // EIP-712 消息类型
  const types = {
    Approve: [
      { name: 'userAddress', type: 'address' },
      { name: 'action', type: 'string' },
      { name: 'timestamp', type: 'uint256' },
    ],
};
  
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
    const signerAddress = ethers.utils.verifyTypedData(domain, types, message, signature);
      if (signerAddress.toLowerCase()!== message.userAddress.toLowerCase()) {
        chatData[0].push({ role: 'bot', message: 'Invalid signature.' });
        return res.status(400).json({ message: 'Invalid signature',chatData: chatData[0]  });
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
