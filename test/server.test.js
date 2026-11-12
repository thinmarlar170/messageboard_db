const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { after, before, test } = require('node:test');
const { createApp } = require('../server');

let server;
let baseUrl;

before(async () => {
  const posts = [];
  const app = createApp({
    postStore: {
      async list() {
        return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      async create({ name, message }) {
        const createdAt = new Date(Date.now() + posts.length).toISOString();
        const post = { id: randomUUID(), name, message, createdAt };
        posts.push(post);
        return post;
      },
    },
  });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test('serves the board and returns posts newest first', async () => {
  const page = await fetch(baseUrl);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Leave a note/);

  const olderResponse = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Taylor', message: 'First note' }),
  });
  const olderPost = await olderResponse.json();
  assert.equal(olderResponse.status, 201);

  const newerResponse = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jordan', message: 'Second note' }),
  });
  const newerPost = await newerResponse.json();
  assert.equal(newerResponse.status, 201);

  const listResponse = await fetch(`${baseUrl}/api/posts`);
  const posts = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(posts[0].id, newerPost.id);
  assert.equal(posts[1].id, olderPost.id);
});

test('rejects missing fields and oversized values', async () => {
  const missing = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Taylor', message: '  ' }),
  });
  assert.equal(missing.status, 400);

  const oversized = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Taylor', message: 'x'.repeat(2001) }),
  });
  assert.equal(oversized.status, 400);

  const oversizedName = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'x'.repeat(81), message: 'A note' }),
  });
  assert.equal(oversizedName.status, 400);
});