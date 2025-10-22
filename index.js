// index.js  —— ESM + lowdb + 三路由
import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();

// 1) 静态资源：把 /public 下的页面服务到 “/”
app.use(express.static('public'));

// 2) 解析 JSON 请求体：为 POST /new-data 准备
app.use(express.json());

// 3) 连接 lowdb（db.json 不存在会自动创建）
const defaultData = { messages: [] };   // 存储结构：messages 数组
const adapter = new JSONFile('db.json');
const db = new Low(adapter, defaultData);

// 确保首次可用（读一次，若为空就写入默认结构）
await db.read();
db.data ||= defaultData;
await db.write();

// ---------------- 作业要求的路由 ----------------

// Route 1：静态页已经由 express.static('public') 处理到 “/”

// Route 2：POST /new-data —— 接收并写入数据库
app.post('/new-data', async (req, res) => {
  const payload = req.body;              // 例如 { message: "..." }

  // 最小校验（可选）：必须有非空字符串 message
  if (!payload || typeof payload.message !== 'string' || !payload.message.trim()) {
    return res.status(400).json({ success: false, error: 'message is required' });
  }

  // 写入数据库
  await db.read();
  db.data.messages.push({ message: payload.message.trim(), createdAt: Date.now() });
  await db.write();

  // 告知客户端“成功写入”
  res.json({ success: true });
});

// Route 3：GET /data —— 从数据库读数据并返回
app.get('/data', async (req, res) => {
  await db.read();
  res.json({ data: db.data.messages });
});

// 端口（本地 3000；部署用环境变量 PORT）
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Listening on http://localhost:' + port);
});
