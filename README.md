# ibm-test
场景 1：
# Chatbot Memory Access Simulation

这是一个简单的 React 应用，用于模拟一个聊天机器人与内存访问的交互。用户可以批准或拒绝聊天机器人的内存访问请求，批准后机器人会逐字显示一条消息。此应用包括了消息显示、内存访问状态的模拟以及逐字显示消息的功能。

## 功能概述

1. **消息显示**：展示聊天机器人的消息，包括用户和机器人的对话。
2. **内存访问请求**：
   - 在加载时，如果内存访问状态为 "pending"，用户可以选择批准或拒绝内存访问。
   - 用户批准内存访问后，机器人会逐字显示一条消息。
   - 用户拒绝内存访问后，机器人会显示一条拒绝访问的消息。
3. **逐字显示消息**：当用户批准内存访问后，机器人会逐字显示消息，模拟“思考”过程。

## 技术栈

- React
- Axios（用于进行 HTTP 请求）
- CSS（用于样式）

## 运行步骤

### 1. 克隆项目

```bash
git clone https://github.com/pigaoteman/ibm-test.git

```
### 2. 安装依赖
```bash
cd chat-memory-app

npm install

node server.js

cd chat-memory-frontend

npm install
```
### 3 访问应用
在浏览器中打开 http://localhost:3000，你将看到聊天界面和内存访问请求按钮。

### 7. 功能操作
- 批准内存访问：点击“Approve Access”按钮，机器人会逐字显示消息。
- 拒绝内存访问：点击“Reject Access”按钮，机器人会显示拒绝访问的消息。


场景 2：