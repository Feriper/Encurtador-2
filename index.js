const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const validUrl = require('valid-url');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String
});

const Url = mongoose.model('Url', urlSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const DOMAIN = 'http://seuencurtador.com/api/'; // Substitua pelo seu domínio real

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  if (!validUrl.isUri(originalUrl)) {
    return res.status(401).json('Invalid URL');
  }

  const shortUrl = shortid.generate();
  const newUrl = new Url({ originalUrl, shortUrl });

  await newUrl.save();
  res.json({ originalUrl, shortUrl: DOMAIN + shortUrl });
});

app.get('/api/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });

  if (url) {
    return res.redirect(url.originalUrl);
  }

  res.status(404).json('URL not found');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
