import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [memoryAccessStatus, setMemoryAccessStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(''); // 当前正在显示的消息

  // 获取聊天数据
  const fetchChatData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/chat/0');
      setChatMessages(response.data.messages);
      setMemoryAccessStatus(response.data.memoryAccessStatus);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };

  // 模拟点击批准内存访问
  const approveAccess = async () => {
    setThinking(true);
    setCurrentMessage(''); // 清空当前消息
    setTimeout(async () => {
      try {
        const response = await axios.post('http://localhost:3000/memory/approve-access');
        setMemoryAccessStatus('approved');
        simulateMessage(response.data.chatData[2].message);
      } catch (error) {
        console.error('Error approving access:', error);
        setThinking(false);
      }
    }, 2000); // 延迟2秒显示消息
  };

  // 模拟点击拒绝内存访问
  const rejectAccess = async () => {
    setThinking(true);
    setCurrentMessage(''); // 清空当前消息
    setTimeout(async () => {
      try {
        const response = await axios.post('http://localhost:3000/memory/reject-access');
        setMemoryAccessStatus('rejected');
        simulateMessage(response.data.chatData[2].message);
      } catch (error) {
        console.error('Error rejecting access:', error);
        setThinking(false);
      }
    }, 2000); // 延迟2秒显示消息
  };

  // 逐字显示消息
  const simulateMessage = (message) => {
    let index = -1;
    const interval = setInterval(() => {
      setThinking(false); // 停止“思考”状态
      setCurrentMessage((prev) => prev + message[index]); // 更新当前消息
      index += 1;
      if (index === message.length-1) {
        clearInterval(interval); // 完成逐字显示后清除定时器
      }
    }, 250); // 每100ms更新一次
  };

  // 页面加载时获取聊天数据
  useEffect(() => {
    fetchChatData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <div className="chat-container">
        <h1>Chat Messages</h1>
        <div className="chat-box">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}
            >
              <strong>{msg.role}:</strong> {msg.message}
            </div>
          ))}
          {thinking && (
            <div className="message bot">
              <strong>bot:</strong> <span className="thinking">Thinking...</span>
            </div>
          )}
          {currentMessage && !thinking && (
            <div className="message bot">
              <strong>bot:</strong> {currentMessage}
            </div>
          )}
        </div>
        <h2>Memory Access Status: {memoryAccessStatus}</h2>
        {memoryAccessStatus === 'pending' && !thinking && (
          <div className="button-group">
            <button onClick={approveAccess}>Approve Access</button>
            <button onClick={rejectAccess}>Reject Access</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
