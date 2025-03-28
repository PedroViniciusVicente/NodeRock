// 6. Executing the monkey patching of the Promises from the tests
// npx mocha --require ./entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/monkeyPatchingTest/test/test.js

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const { extractedFeaturesMonkeyPatching } = require('./monkeyPatchingTestes/extractFeaturesMonkeyPatching'); 

function executeMonkeyPatching(testsRespectiveFile, testsOriginalFullNameList) {
    console.log("Extracting promises data from monkey patching");
    
    // console.log("\nMONKEY PATCHING!!!\n");
    // console.log(testsRespectiveFile);
    // console.log(testsFullNameList)
    
    let extractedDataMonkeyTests = [];
    for(let i = 0; i < testsOriginalFullNameList.length; i++) {
        // fs.truncateSync('./promise_logs/promises.json', 0); // Zerando o conteudo do json em que se armazena as infos das promises
        fs.truncateSync('./FoldersUsedDuringExecution/temporary_promises_logs/promises.json', 0); // Zerando o conteudo do json em que se armazena as infos das promises

        const command = `../node_modules/.bin/_mocha --exit -t 10000 --require ./entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js ${testsRespectiveFile[i]} -f '${testsOriginalFullNameList[i]}'`;
        console.log("Comando usado para monkeyPatching foi: ", command);
        shell.exec(command);

        const testDataMonkey = extractedFeaturesMonkeyPatching();
        extractedDataMonkeyTests.push(testDataMonkey);
    }

    return extractedDataMonkeyTests;
}

module.exports = { executeMonkeyPatching };