// routes/url.js
const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const shortid = require('shortid');
const Url = require('../models/url');
const dotenv = require('dotenv');

dotenv.config();

// POST /api/url/shorten
router.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl = process.env.BASE_URL;

  // Verifica se a base URL é válida
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json('Base URL inválida');
  }

  const urlCode = shortid.generate();

  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl });

      if (url) {
        res.json(url);
      } else {
        const shortUrl = baseUrl + '/' + urlCode;

        url = new Url({
          longUrl,
          shortUrl,
          urlCode,
          date: new Date()
        });

        await url.save();

        res.json(url);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json('Erro no servidor');
    }
  } else {
    res.status(401).json('URL inválida');
  }
});

router.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });

    if (url) {
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json('Nenhuma URL encontrada');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Erro no servidor');
  }
});

module.exports = router;
