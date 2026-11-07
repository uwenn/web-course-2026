export const state = {
    posts: [],
    filteredPosts: [],
    page: 1,
    limit: 10,
    isLoading: false,
    isEnd: false,
    searchQuery: '',
    error: null
};

export function resetModel() {
    state.posts = [];
    state.filteredPosts = [];
    state.page = 1;
    state.isLoading = false;
    state.isEnd = false;
    state.error = null;
}

export function addPosts(newPosts) {
    state.posts = [...state.posts, ...newPosts];
    if (newPosts.length < state.limit) {
        state.isEnd = true;
    }
    applyFilter();
}

export function setLoading(value) {
    state.isLoading = value;
}

export function setError(msg) {
    state.error = msg;
}

export function setSearchQuery(query) {
    state.searchQuery = query;
    applyFilter();
}

function applyFilter() {
    if (!state.searchQuery) {
        state.filteredPosts = state.posts;
    } else {
        const q = state.searchQuery.toLowerCase();
        state.filteredPosts = state.posts.filter(post =>
            post.title.toLowerCase().includes(q)
        );
    }
}