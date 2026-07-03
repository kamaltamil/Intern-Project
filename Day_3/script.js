document.addEventListener("DOMContentLoaded", startApp);

const API_URL = "https://jsonplaceholder.typicode.com/posts";
const API_STORAGE_KEY = "apiPosts";
const SESSION_STORAGE_KEY = "sessionPosts";
let editingPostId = null;
let currentSort = "asc";

const getApiPosts = () => JSON.parse(localStorage.getItem(API_STORAGE_KEY)) || [];
const saveApiPosts = (posts) => localStorage.setItem(API_STORAGE_KEY, JSON.stringify(posts));
const getSessionPosts = () => JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)) || [];
const saveSessionPosts = (posts) => sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(posts));

const getFormFields = () => ({
    userIdEl: document.getElementById('user-id'),
    titleEl: document.getElementById('post-title'),
    bodyEl: document.getElementById('post-body'),
    userIdError: document.getElementById('user-id-error'),
    titleError: document.getElementById('post-title-error'),
    bodyError: document.getElementById('post-body-error'),
    createBtn: document.getElementById('create-post'),
    postTableBody: document.getElementById('post-table-body'),
    sortAsc: document.getElementById('sort-asc'),
    sortDesc: document.getElementById('sort-desc')
});

const clearErrors = () => {
    const { userIdError, titleError, bodyError } = getFormFields();
    userIdError.textContent = '';
    titleError.textContent = '';
    bodyError.textContent = '';
};

const showError = (field, message) => {
    field.textContent = message;
};

const validateForm = () => {
    const { userIdEl, titleEl, bodyEl } = getFormFields();
    clearErrors();

    const userId = Number(userIdEl.value.trim());
    const title = titleEl.value.trim();
    const body = bodyEl.value.trim();
    let valid = true;

    if (!Number.isInteger(userId) || userId <= 0) {
        showError(getFormFields().userIdError, 'UserId must be a positive integer');
        valid = false;
    }
    if (title.length <= 10) {
        showError(getFormFields().titleError, 'Title must be more than 10 characters');
        valid = false;
    }
    if (body.length < 25) {
        showError(getFormFields().bodyError, 'Post must be at least 25 characters');
        valid = false;
    }

    return {
        valid,
        payload: { userId, title, body }
    };
};

const fetchData = async () => {
    try {
        const response = await fetch(API_URL);
        const apiPosts = await response.json();
        saveApiPosts(apiPosts);
    } catch (error) {
        console.warn('Unable to fetch API posts, using stored data', error);
    }

    const apiStored = getApiPosts();
    const sessionStored = getSessionPosts();
    const merged = [...apiStored, ...sessionStored];

    const sorted = merged.sort((a, b) => {
        const ai = Number(a.id);
        const bi = Number(b.id);
        return currentSort === 'asc' ? ai - bi : bi - ai;
    });

    listAllProducts(sorted);
};

const getProduct = async (id) => {
    const sessionPosts = getSessionPosts();
    const sessionPost = sessionPosts.find(p => p.id == id);
    if (sessionPost) return sessionPost;

    const apiPosts = getApiPosts();
    const apiPost = apiPosts.find(p => p.id == id);
    if (apiPost) return apiPost;

    try {
        const response = await fetch(`${API_URL}/${id}`);
        return await response.json();
    } catch (error) {
        console.error('Unable to load product', error);
        return null;
    }
};

const addProduct = () => {
    const { userIdEl, titleEl, bodyEl } = getFormFields();
    const apiPosts = getApiPosts();
    const sessionPosts = getSessionPosts();
    const nextId = Math.max(100, ...apiPosts.map(p => Number(p.id) || 0), ...sessionPosts.map(p => Number(p.id) || 0)) + 1;

    const newPost = {
        userId: Number(userIdEl.value.trim()),
        id: nextId,
        title: titleEl.value.trim(),
        body: bodyEl.value.trim()
    };

    sessionPosts.push(newPost);
    saveSessionPosts(sessionPosts);
    resetForm();
    fetchData();
};

const fullUpdateProduct = (id, updateData) => {
    let sessionPosts = getSessionPosts();
    if (sessionPosts.some(p => p.id == id)) {
        sessionPosts = sessionPosts.map(p => p.id == id ? { ...p, ...updateData } : p);
        saveSessionPosts(sessionPosts);
        fetchData();
        return;
    }

    let apiPosts = getApiPosts();
    if (apiPosts.some(p => p.id == id)) {
        apiPosts = apiPosts.map(p => p.id == id ? { ...p, ...updateData } : p);
        saveApiPosts(apiPosts);
        fetchData();
        return;
    }
};

const deleteProduct = (id) => {
    let sessionPosts = getSessionPosts();
    if (sessionPosts.some(p => p.id == id)) {
        saveSessionPosts(sessionPosts.filter(p => p.id != id));
        fetchData();
        return;
    }

    let apiPosts = getApiPosts();
    if (apiPosts.some(p => p.id == id)) {
        saveApiPosts(apiPosts.filter(p => p.id != id));
        fetchData();
        return;
    }
};

const postTableBody = document.getElementById('post-table-body');
const listAllProducts = (data) => {
    postTableBody.innerHTML = '';
    data.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${post.userId}</td>
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.body}</td>
            <td>
                <button class="btn" onclick="editProduct(${post.id})">Edit</button>
                <button class="btn" onclick="deleteProduct(${post.id})">Delete</button>
            </td>
        `;
        postTableBody.appendChild(row);
    });
};

const editProduct = (id) => {
    getProduct(id).then(post => {
        if (!post) return;
        const { userIdEl, titleEl, bodyEl } = getFormFields();
        userIdEl.value = post.userId;
        titleEl.value = post.title;
        bodyEl.value = post.body;
        editingPostId = id;
        document.getElementById('create-post').innerText = 'Update';
    });
};

const resetForm = () => {
    const { userIdEl, titleEl, bodyEl } = getFormFields();
    userIdEl.value = '';
    titleEl.value = '';
    bodyEl.value = '';
    editingPostId = null;
    document.getElementById('create-post').innerText = 'Create';
    clearErrors();
};

const handleSubmit = () => {
    const validation = validateForm();
    if (!validation.valid) return;

    if (editingPostId === null) {
        addProduct();
    } else {
        fullUpdateProduct(editingPostId, validation.payload);
        resetForm();
    }
};

document.getElementById('create-post').addEventListener('click', handleSubmit);

function startApp() {
    const { sortAsc, sortDesc } = getFormFields();

    if (sortAsc) sortAsc.addEventListener('click', () => { currentSort = 'asc'; fetchData(); });
    if (sortDesc) sortDesc.addEventListener('click', () => { currentSort = 'desc'; fetchData(); });

    fetchData();
}
