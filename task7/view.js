import { state } from './model.js';

export const feedEl = document.getElementById('feed');
export const loaderEl = document.getElementById('loader');
export const errorEl = document.getElementById('error');
export const errorTextEl = document.getElementById('error-text');
export const endMessageEl = document.getElementById('end-message');
export const searchEl = document.getElementById('search');
export const retryBtn = document.getElementById('retry-btn');
export const sentinelEl = document.getElementById('sentinel');

export function renderPosts() {
    feedEl.innerHTML = '';

    if (state.filteredPosts.length === 0 && !state.isLoading && !state.isEnd && state.searchQuery) {
        feedEl.innerHTML = '<div class="post-card"><p class="post-body" style="text-align:center;">Ничего не найдено по вашему запросу.</p></div>';
        return;
    }

    state.filteredPosts.forEach(post => {
        const card = document.createElement('article');
        card.className = 'post-card';

        const title = document.createElement('h2');
        title.className = 'post-title';
        title.textContent = post.title;

        const body = document.createElement('p');
        body.className = 'post-body';
        body.textContent = post.body;

        const meta = document.createElement('div');
        meta.className = 'post-meta';
        meta.innerHTML = `<span>Автор: ${post.userId}</span><span>Пост #${post.id}</span>`;

        card.appendChild(title);
        card.appendChild(body);
        card.appendChild(meta);

        feedEl.appendChild(card);
    });
}

export function toggleLoader(show) {
    if (show) {
        loaderEl.classList.remove('hidden');
    } else {
        loaderEl.classList.add('hidden');
    }
}

export function showError(message) {
    errorEl.classList.remove('hidden');
    errorTextEl.textContent = message;
    endMessageEl.classList.add('hidden');
}

export function hideError() {
    errorEl.classList.add('hidden');
}

export function showEndMessage() {
    endMessageEl.classList.remove('hidden');
}

export function hideEndMessage() {
    endMessageEl.classList.add('hidden');
}