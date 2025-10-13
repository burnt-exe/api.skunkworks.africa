// server.js — Minimal Express API
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'skunkworks-api', environment: process.env.NODE_ENV });
});

app.listen(PORT, () => console.log(\`🚀 Skunkworks API running on port \${PORT}\`));
