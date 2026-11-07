import {
    state,
    resetModel,
    addPosts,
    setLoading,
    setError,
    setSearchQuery
} from './model.js';

import {
    renderPosts,
    toggleLoader,
    showError,
    hideError,
    showEndMessage,
    hideEndMessage,
    searchEl,
    retryBtn,
    sentinelEl
} from './view.js';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';
let debounceTimer;

export async function fetchPosts() {
    if (state.isLoading || state.isEnd) return;

    setLoading(true);
    setError(null);
    hideError();
    toggleLoader(true);

    try {
        const response = await fetch(`${API_URL}?_page=${state.page}&_limit=${state.limit}`);

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();

        addPosts(data);
        renderPosts();

        if (state.isEnd) {
            showEndMessage();
        } else {
            state.page++;
        }

    } catch (err) {
        setError(err.message || 'Не удалось загрузить данные. Проверьте соединение.');
        showError(state.error);
    } finally {
        setLoading(false);
        toggleLoader(false);
    }
}

function handleSearch(e) {
    const query = e.target.value.trim();

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        setSearchQuery(query);
        renderPosts();
    }, 300);
}

export function init() {
    resetModel();
    hideError();
    hideEndMessage();
    fetchPosts();

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            fetchPosts();
        }
    }, { rootMargin: '200px' });

    observer.observe(sentinelEl);

    searchEl.addEventListener('input', handleSearch);

    retryBtn.addEventListener('click', () => {
        hideError();
        fetchPosts();
    });
}