const http = require('http');
const postRoutes = require('./routes/postRoutes');

const PORT = 3001;

const server = http.createServer((req, res) => {
    // 1. Manual CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // 2. Pass request to the router
    postRoutes(req, res);
});

server.listen(PORT, () => {
    console.log(`🚀 Pure Node Backend running on http://localhost:${PORT}`);
});