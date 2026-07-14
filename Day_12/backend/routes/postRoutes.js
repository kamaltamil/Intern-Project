const { getMixedPosts, createPost, updatePost, deletePost } = require('../controllers/postController');
const parseBody = require('../utils/bodyParser');

const postRoutes = async (req, res) => {
    const url = req.url;
    const method = req.method;

    // GET /api/posts
    if (url === '/api/posts' && method === 'GET') {
        return await getMixedPosts(req, res);
    } 
    // POST /api/posts
    else if (url === '/api/posts' && method === 'POST') {
        const body = await parseBody(req);
        return createPost(req, res, body);
    }

    // Extract ID using Regex for PUT and DELETE (e.g., /api/posts/local-12345)
    const idMatch = url.match(/\/api\/posts\/([a-zA-Z0-9-]+)/);
    if (idMatch) {
        const id = idMatch[1];

        // PUT /api/posts/:id
        if (method === 'PUT') {
            const body = await parseBody(req);
            return updatePost(req, res, id, body);
        }
        // DELETE /api/posts/:id
        else if (method === 'DELETE') {
            return deletePost(req, res, id);
        }
    }

    // Fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
};

module.exports = postRoutes;