// controllers/postController.js
const API_URLS = require('../config/db');
const { readLocalData, writeLocalData } = require('../utils/fileDb');

const getMixedPosts = async (req, res) => {
    try {
        const [jpResponse, djResponse] = await Promise.all([
            fetch(API_URLS.jsonPlaceholder),
            fetch(API_URLS.dummyJson)
        ]);
        const jpPosts = await jpResponse.json();
        const djData = await djResponse.json();
        const localPosts = readLocalData();

        const normalizedJp = jpPosts.slice(0, 15).map(p => ({ id: `jp-${p.id}`, title: p.title, body: p.body, source: 'JSONPlaceholder' }));
        const normalizedDj = djData.posts.slice(0, 15).map(p => ({ id: `dj-${p.id}`, title: p.title, body: p.body, source: 'DummyJSON' }));

        const combinedPosts = [...localPosts, ...normalizedJp, ...normalizedDj];

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(combinedPosts));
    } catch (error) {
        res.writeHead(500).end(JSON.stringify({ message: 'Failed to fetch posts' }));
    }
};

const createPost = (req, res, body) => {
    const localPosts = readLocalData();
    const newPost = {
        id: `local-${Date.now()}`,
        title: body.title,
        body: body.body,
        source: 'Local DB'
    };
    localPosts.unshift(newPost);
    writeLocalData(localPosts);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newPost)); // Ithu thaan Redux-ku return aagi UI-a update pannum!
};

const updatePost = async (req, res, id, body) => {
    try {
        // 1. Handle Local Posts
        if (id.startsWith('local-')) {
            const localPosts = readLocalData();
            const index = localPosts.findIndex(p => p.id === id);
            if (index !== -1) {
                localPosts[index] = { ...localPosts[index], title: body.title, body: body.body };
                writeLocalData(localPosts);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(localPosts[index]));
            }
        } 
        
        // 2. Handle JSONPlaceholder Posts
        else if (id.startsWith('jp-')) {
            const realId = id.replace('jp-', '');
            const apiRes = await fetch(`https://jsonplaceholder.typicode.com/posts/${realId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: realId, title: body.title, body: body.body })
            });
            const data = await apiRes.json();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ id: `jp-${data.id}`, title: data.title, body: data.body, source: 'JSONPlaceholder' }));
        }

        // 3. Handle DummyJSON Posts
        else if (id.startsWith('dj-')) {
            const realId = id.replace('dj-', '');
            const apiRes = await fetch(`https://dummyjson.com/posts/${realId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: body.title, body: body.body })
            });
            const data = await apiRes.json();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ id: `dj-${data.id}`, title: data.title, body: data.body, source: 'DummyJSON' }));
        }

        res.writeHead(404).end(JSON.stringify({ message: 'Post not found' }));
    } catch (error) {
        res.writeHead(500).end(JSON.stringify({ message: 'Error updating post' }));
    }
};

const deletePost = async (req, res, id) => {
    try {
        if (id.startsWith('local-')) {
            let localPosts = readLocalData();
            localPosts = localPosts.filter(p => p.id !== id);
            writeLocalData(localPosts);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ id }));
        } else if (id.startsWith('jp-')) {
            await fetch(`https://jsonplaceholder.typicode.com/posts/${id.replace('jp-', '')}`, { method: 'DELETE' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ id }));
        } else if (id.startsWith('dj-')) {
            await fetch(`https://dummyjson.com/posts/${id.replace('dj-', '')}`, { method: 'DELETE' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ id }));
        }
    } catch (error) {
        res.writeHead(500).end(JSON.stringify({ message: 'Error deleting post' }));
    }
};

module.exports = { getMixedPosts, createPost, updatePost, deletePost };