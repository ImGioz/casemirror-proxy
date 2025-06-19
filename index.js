import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import crypto from 'crypto';

const app = express();

app.use(cors({
  origin: '*',
}));

function toNumbers(hexStr) {
  const arr = [];
  hexStr.replace(/(..)/g, (_, hex) => {
    arr.push(parseInt(hex, 16));
  });
  return arr;
}

function toHex(byteArr) {
  return byteArr.map(b => (b < 16 ? '0' : '') + b.toString(16)).join('').toLowerCase();
}

function slowAES_decrypt(cipherBytes, mode, keyBytes, ivBytes) {
  if (mode !== 2) throw new Error('Unsupported mode: ' + mode);

  const key = Buffer.from(keyBytes);
  const iv = Buffer.from(ivBytes);
  const encrypted = Buffer.from(cipherBytes);

  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  decipher.setAutoPadding(true);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

app.get('/proxy', async (req, res) => {
  const amount = req.query.amount || '1';
  const url1 = `https://casemirror.kesug.com/mew.php?amount=${amount}&i=1`;

  try {
    // Первый запрос, получаем HTML с JS-защитой
    const response1 = await fetch(url1, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html',
        'Referer': 'https://casemirror.kesug.com/',
      }
    });

    const html = await response1.text();

    // Парсим a,b,c из JS
    const regexA = /var a = toNumbers\("([0-9a-f]+)"\)/;
    const regexB = /var b = toNumbers\("([0-9a-f]+)"\)/;
    const regexC = /var c = toNumbers\("([0-9a-f]+)"\)/;

    const matchA = html.match(regexA);
    const matchB = html.match(regexB);
    const matchC = html.match(regexC);

    if (!matchA || !matchB || !matchC) {
      return res.status(500).send('Failed to parse AES params');
    }

    const a = toNumbers(matchA[1]);
    const b = toNumbers(matchB[1]);
    const c = toNumbers(matchC[1]);

    // Дешифруем
    const decryptedBuffer = slowAES_decrypt(c, 2, a, b);
    const cookieValue = toHex([...decryptedBuffer]);

    // Второй запрос с cookie __test
    const url2 = `https://casemirror.kesug.com/mew.php?amount=${amount}&i=2`;
    const response2 = await fetch(url2, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://casemirror.kesug.com/',
        'Cookie': `__test=${cookieValue}`
      }
    });

    const json = await response2.json();

    res.json(json);

  } catch (error) {
    console.error(error);
    res.status(500).send('Proxy error with AES decryption');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
