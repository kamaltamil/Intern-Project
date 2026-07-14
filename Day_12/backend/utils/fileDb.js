const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../config/localPosts.json');

const readLocalData = () => {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
};

const writeLocalData = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = { readLocalData, writeLocalData };