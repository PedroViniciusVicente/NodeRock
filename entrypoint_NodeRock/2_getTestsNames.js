// 2. Treatments and Path Verifications to get the test names

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const sourceCopyPath = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logHooks.json";
const destinationCopyFolder = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
let passedTestsJsonPath = destinationCopyFolder + "passingTests.json.log"

const pathRaizNodeRock = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource";
const CUSTOM_REPORTER = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/entrypoint_NodeRock/mochaReporter.js";

function getTestsNames(pathProjectFolder, testFile) {
    
    shell.rm('-rf', destinationCopyFolder);
    shell.mkdir(destinationCopyFolder);


    console.log(`Buscando os testes em: ${pathProjectFolder} / ${testFile}`);

    shell.cd(`${pathProjectFolder}`);

    let out = shell.exec(`npx mocha ${testFile} --recursive --exit -R ${CUSTOM_REPORTER}`, { silent: false });
    //shell.exec(`./node_modules/.bin/_mocha --exit -t 20000 test/db.test.js -R ${CUSTOM_REPORTER}`, {silent: false}); // para o nedb

    shell.cd(`${pathRaizNodeRock}`);

    const testsJSON = fs.readFileSync(passedTestsJsonPath, 'utf8');
    const testsObject = JSON.parse(testsJSON);


    // Obtendo a quantidade de arquivos únicos
    const uniqueFilesNames = new Set();
    testsObject.forEach(obj => {
        uniqueFilesNames.add(obj.file);
    });

    let fileCounter = 1;
    console.log(`\nOs ${uniqueFilesNames.size} arquivos de teste encontrados:`);
    for (const uniqueFileName of uniqueFilesNames) {
        console.log(`${fileCounter}. ${uniqueFileName}`);
    }

    // Obtendo os nomes dos testes
    let testsFullNameList = [];
    let testsRespectiveFile = [];
    for(let i = 0; i < testsObject.length; i++) {
        testsFullNameList.push(testsObject[i].title);
        testsRespectiveFile.push(testsObject[i].file);
    }

    console.log(`\nOs ${testsFullNameList.length} testes encontrados:`);
    for(let i = 0; i < testsFullNameList.length; i++) {
        console.log(`${i+1}. ${testsFullNameList[i]}`);
    }

    

    // Adaptando os nomes dos testes e removendo caracteres especiais
    // SUGESTAO: TALVEZ SEJA NECESSARIO FAZER ESSAS MESMAS ALTERACOES NAS STRINGS DOS TESTES QUE JA SAO SABIDOS COMO TENDO EVENT RACE NO 1_chosenProject.js
    for(let i = 0; i < testsFullNameList.length; i++) {
        testsFullNameList[i] = `"` + testsFullNameList[i] + `"`;
        testsFullNameList[i] = testsFullNameList[i].replace(/\s/g, '\\ '); // Adicionando "\" antes dos espacos

        testsFullNameList[i] = testsFullNameList[i].replace(/['`+\-()<>[\],]/g, '.*');
    }

    return {
        testsFullNameList: testsFullNameList,
        testsRespectiveFile: testsRespectiveFile,
    };
}

module.exports = {getTestsNames};