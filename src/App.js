import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { ethers } from 'ethers';

function shortenAddress(address) {
  // 确保地址是有效的，以太坊地址长度为 42
  if (address && address.length === 42) {
    return address.slice(0, 6) + '...' + address.slice(-4);
  } else {
    return address;  // 如果地址无效，直接返回原地址
  }
}
function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [memoryAccessStatus, setMemoryAccessStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(''); // 当前正在显示的消息

  const [userAddress, setUserAddress] = useState(null);  // 用于存储用户地址
  const [status, setStatus] = useState('');  // 签名状态
  const [provider, setProvider] = useState(null);  // 用于存储以太坊提供者（MetaMask）
  useEffect(() => {
    // 初始化MetaMask钱包提供者
    const initProvider = async () => {
      if (window.ethereum) {
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethProvider);
        // await connectWallet(ethProvider);  // 连接钱包
      } else {
        alert('Please install MetaMask!');
      }
    };

    initProvider();
  }, []);

    // 连接钱包并获取用户地址
    const connectWallet = async (ethProvider) => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        setUserAddress(userAddress);
      } catch (err) {
        alert('plz install metamask');
        console.error("Failed to connect wallet", err);
      }
    };
  
    // 签名EIP-712消息
    const signMessage = async () => {
      if (!userAddress) {
        alert('Please connect your wallet first.');
        return;
      }
  
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
  
      // 要签名的数据
      const message = {
        userAddress: userAddress,
        action: 'approve',
        timestamp: Date.now(),
      };
  
      try {
        // 获取签名者（来自MetaMask的签名）
        const signer = provider.getSigner();
        const signature = await signer._signTypedData(domain, types, message);
        setStatus(`${signature}`);
        console.log('Signed Message:', signature);
        approveAccess(signature,message)
      } catch (err) {
        console.error('Error signing message:', err);
        setStatus('Failed to sign message');
      }
    };

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
  const approveAccess = async (signature,message) => {
    setThinking(true);
    setCurrentMessage(''); // 清空当前消息
    setTimeout(async () => {
      try {
        const response = await axios.post('http://localhost:3000/memory/approve-access', {
          signature,
          message,
        });
        setMemoryAccessStatus('approved');
        simulateMessage(response.data.chatData[2].message); // 显示第一个消息
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
        simulateMessage(response.data.chatData[2].message); // 显示第一个消息
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
        {userAddress&&(
            <p className='b'>wallet address: {userAddress}</p>)}
        {status&&(
          <p style={{fontSize: '10px' }} className='b'>signature: {status}</p>)}
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
            {userAddress ? (
             <> 
              {/* <button onClick={approveAccess}>Approve Access</button> */}
              <button onClick={signMessage}>Approve Access</button>
                {/* <p>Status: {status}</p> */}
              </>
            ) : (
              <button onClick={() => connectWallet(provider)}>Connect Wallet</button>
            )}
            <button onClick={rejectAccess}>Reject Access</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
