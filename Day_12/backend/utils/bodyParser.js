const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        // Listen for data chunks
        req.on('data', chunk => {
            body += chunk.toString();
        });
        // When data finishes arriving
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
    });
};

module.exports = parseBody;