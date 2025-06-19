import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: '*', // Или укажи домен твоего сайта
}));

// Основной прокси для mew.php с заголовками
app.get('/proxy', async (req, res) => {
  const amount = req.query.amount || '1';
  const url = `https://casemirror.kesug.com/mew.php?amount=${amount}&i=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': 'https://casemirror.kesug.com/',
      }
    });

    const data = await response.text();

    // Пытаемся распарсить JSON, если сервер отдаёт его
    try {
      const json = JSON.parse(data);
      res.json(json);
    } catch {
      // Если не JSON — отдаём как есть
      res.send(data);
    }
  } catch (error) {
    console.error('Error proxying mew.php:', error);
    res.status(500).send('Proxy error');
  }
});

// Проксируем aes.js со стороннего сервера
app.get('/aes.js', async (req, res) => {
  try {
    const response = await fetch('https://casemirror.kesug.com/aes.js', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
        'Accept': 'application/javascript',
        'Referer': 'https://casemirror.kesug.com/',
      }
    });

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
