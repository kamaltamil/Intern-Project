const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '..', '..', 'db.json');

const readDB = () => {
  const data = fs.readFileSync(dbFile, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

module.exports = { readDB, writeDB };