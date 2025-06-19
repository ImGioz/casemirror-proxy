import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

// Разрешаем CORS с твоего основного сайта или открыто
app.use(cors({
  origin: '*', // лучше сюда указать URL твоего сайта, например: 'https://example.com'
}));

app.get('/proxy', async (req, res) => {
  const amount = req.query.amount || '1';
  const url = `https://casemirror.kesug.com/mew.php?amount=${amount}&i=1`;

  try {
    // Отправляем запрос к Infinity Free с куки (если нужно, можно добавить их здесь)
    const response = await fetch(url, {
      // Можно добавить заголовки, если сервер требует
      headers: {
        // Пример: 'Cookie': 'some_cookie=value'
      }
    });

    // Читаем текстовый ответ
    const data = await response.text();

    // Отдаем ответ обратно фронтенду
    res.send(data);
  } catch (error) {
    console.error('Error in proxy:', error);
    res.status(500).send('Proxy error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
