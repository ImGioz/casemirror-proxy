const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/proxy', async (req, res) => {
  const { amount, i } = req.query;

  if (!amount || !i) {
    return res.status(400).send('Missing parameters');
  }

  try {
    const targetUrl = `https://casemirror.kesug.com/mew.php?amount=${encodeURIComponent(amount)}&i=${encodeURIComponent(i)}`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const data = await response.text();

    res.set('Access-Control-Allow-Origin', '*');
    res.send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
