require('dotenv').config();

const express = require('express');
const path = require('node:path');
const { postStore: supabasePostStore } = require('./lib/post-store');

const port = process.env.PORT || 3000;

function createApp({ postStore = supabasePostStore } = {}) {
  const app = express();

  app.use(express.json({ limit: '10kb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/posts', async (req, res, next) => {
    try {
      res.json(await postStore.list());
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/posts', async (req, res, next) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required.' });
    }

    if (name.length > 80 || message.length > 2000) {
      return res.status(400).json({ error: 'Name or message is too long.' });
    }

    try {
      const post = await postStore.create({ name, message });
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Message board listening on http://localhost:${port}`);
  });
}

module.exports = { app, createApp };