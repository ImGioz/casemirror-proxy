import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: '*', // Или укажи домен твоего сайта
}));

// Основной прокси для mew.php
app.get('/proxy', async (req, res) => {
  const amount = req.query.amount || '1';
  const url = `https://casemirror.kesug.com/mew.php?amount=${amount}&i=1`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('Error proxying mew.php:', error);
    res.status(500).send('Proxy error');
  }
});

// Проксируем aes.js со стороннего сервера
app.get('/aes.js', async (req, res) => {
  try {
    const response = await fetch('https://casemirror.kesug.com/aes.js');
    if (!response.ok) {
      throw new Error(`Failed to fetch aes.js: ${response.statusText}`);
    }
    const js = await response.text();
    res.set('Content-Type', 'application/javascript');
    res.send(js);
  } catch (error) {
    console.error('Error proxying aes.js:', error);
    res.status(500).send('Failed to fetch aes.js');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
