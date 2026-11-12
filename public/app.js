const form = document.querySelector('#post-form');
const postsElement = document.querySelector('#posts');
const countElement = document.querySelector('#post-count');
const statusElement = document.querySelector('#form-status');
const submitButton = form.querySelector('button[type="submit"]');

function renderPosts(posts) {
  postsElement.replaceChildren();
  countElement.textContent = `${posts.length} ${posts.length === 1 ? 'note' : 'notes'}`;

  if (posts.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No notes yet. You can start the conversation.';
    postsElement.append(empty);
    return;
  }

  for (const post of posts) {
    const article = document.createElement('article');
    article.className = 'post';

    const meta = document.createElement('div');
    meta.className = 'post-meta';
    const name = document.createElement('span');
    name.className = 'post-name';
    name.textContent = post.name;
    const date = document.createElement('time');
    date.className = 'post-date';
    date.dateTime = post.createdAt;
    date.textContent = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(post.createdAt));
    meta.append(name, date);

    const message = document.createElement('p');
    message.className = 'post-message';
    message.textContent = post.message;
    article.append(meta, message);
    postsElement.append(article);
  }
}

async function loadPosts() {
  postsElement.innerHTML = '<p class="empty-state">Gathering the latest notes…</p>';
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Could not load notes.');
    renderPosts(await response.json());
  } catch {
    postsElement.innerHTML = '<p class="empty-state">The board could not be reached. Please refresh to try again.</p>';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusElement.textContent = '';
  statusElement.classList.remove('success');
  submitButton.disabled = true;

  const data = new FormData(form);
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.get('name'),
        message: data.get('message'),
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not post your note.');

    form.reset();
    statusElement.textContent = 'Your note is on the board.';
    statusElement.classList.add('success');
    await loadPosts();
  } catch (error) {
    statusElement.textContent = error.message || 'Could not post your note. Please try again.';
  } finally {
    submitButton.disabled = false;
  }
});

loadPosts();