const fs = require('fs');
const path = require('path');

console.log(`\nCreating the collectedTracesFolder\n`);
fs.mkdirSync("../bbbFolder");
// fs.writeFileSync("../testeaaaaaaaa/aaa", "aaaaaa");


// const folderPath = path.resolve(__dirname, '../bbbFolder'); // Caminho absoluto
// fs.mkdirSync(folderPath);
// console.log(`Diretório criado em: ${folderPath}`);