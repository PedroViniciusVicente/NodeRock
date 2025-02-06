// 6. Executing the monkey patching of the Promises from the tests
// npx mocha --require ./entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/monkeyPatchingTest/test/test.js

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const { extractedFeaturesMonkeyPatching } = require('./monkeyPatchingTestes/extractFeaturesMonkeyPatching'); 

function removerContrabarras(vetor) {
    return vetor.map(str => str.replace(/\\/g, ''));
}

function executeMonkeyPatching(testsRespectiveFile, testsFullNameList) {
    console.log("Extracting promises data from monkey patching");
    const correctTestsFullNameList = removerContrabarras(testsFullNameList);
    
    // console.log("\nMONKEY PATCHING!!!\n");
    // console.log(testsRespectiveFile);
    // console.log(testsFullNameList)
    
    let extractedDataMonkeyTests = [];
    for(let i = 0; i < testsFullNameList.length; i++) {
        fs.truncateSync('./promise_logs/promises.json', 0); // Zerando o conteudo do json em que se armazena as infos das promises

        const command = `./node_modules/.bin/_mocha --require ./entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js ${testsRespectiveFile[i]} -f ${correctTestsFullNameList[i]}`;
        // console.log(command);
        shell.exec(command);

        const testDataMonkey = extractedFeaturesMonkeyPatching();
        extractedDataMonkeyTests.push(testDataMonkey);
    }

    return extractedDataMonkeyTests;
}

module.exports = { executeMonkeyPatching };