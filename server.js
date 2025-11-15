// Simple Node.js server to proxy DeepSeek API calls and avoid CORS issues
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuration
const DEEPSEEK_API_KEY = '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';
const DEEPSEEK_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    console.log('📨 Chat request received');

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek/deepseek-chat',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      top_p: 1
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'DeepSync AI'
      }
    });

    console.log('✅ Response from OpenRouter received');
    res.json(response.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data || { message: error.message } 
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Using OpenRouter DeepSeek R1 (free)\n`);
});
