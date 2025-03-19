// 2. Treatments and Path Verifications to get the test names

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');


// const destinationCopyFolder = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
const destinationCopyFolder = path.join(__dirname,"../collectedTracesFolder");

// const CUSTOM_REPORTER = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/entrypoint_NodeRock/mochaReporter.js";
const CUSTOM_REPORTER = path.join(__dirname,"mochaReporter.js");

const ROOT_PATH_NODEROCK = path.join(__dirname, "../");


function getTestsNames(pathProjectFolder, testFile, parameters) {
    
    const NODEROCK_INFO_PATH = path.join(pathProjectFolder, "NodeRock_Info");

    if (!fs.existsSync(NODEROCK_INFO_PATH)) {

        console.log(`\nCreating NodeRock_Info folder in ${pathProjectFolder}\n`);
        fs.mkdirSync(NODEROCK_INFO_PATH);

    } else {
        console.log(`\nNodeRock_Info folder already exists in ${pathProjectFolder}\n`);
    }

    // TALVEZ SUBSTITUIR POR UM fs.truncateSync('destinationCopyFolder', 0); COMPARAR SE É MAIS RAPIDO
    shell.rm('-rf', destinationCopyFolder);
    shell.mkdir(destinationCopyFolder);


    const PASSING_TESTS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "passingTests.json.log");
    if (!fs.existsSync(PASSING_TESTS_PATH)) {

        console.log(`\nCreating the PassingTests.json.log in: ${PASSING_TESTS_PATH}\n`);
        shell.cd(`${pathProjectFolder}`);

        // const commandGetTests = `npx mocha ${testFile} --recursive --exit -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}` + ", { silent: false }";
        // console.log("Comando usado para extrair os testes: ", commandGetTests);

        let out = shell.exec(`npx mocha ${testFile} --recursive --exit -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}`, { silent: false });
        // shell.exec(`./node_modules/.bin/_mocha --exit -t 20000 test/db.test.js -R ${CUSTOM_REPORTER}`, {silent: false}); // SOMENTE PARA O NEDB
        // shell.exec(`./node_modules/.bin/_mocha ${testFile} ${parameters} -R ${CUSTOM_REPORTER}`, {silent: false}); // para o fps
        // shell.exec(`mocha --recursive --require ./scripts/mocha-require`) // PARA O ZENPARSING
        //shell.cd("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource");
        shell.cd(ROOT_PATH_NODEROCK);

        const testsJSON = fs.readFileSync(path.join(destinationCopyFolder, "temporaryPassingTests.json.log"), 'utf8');
        const testsObject = JSON.parse(testsJSON);

        fs.writeFileSync(PASSING_TESTS_PATH, JSON.stringify(testsObject, null, 4), 'utf8');

    } else {
        console.log(`Using the existing PassingTests.json.log in: ${PASSING_TESTS_PATH}\n`);
    }

    
    const testsJSON = fs.readFileSync(PASSING_TESTS_PATH, 'utf8');
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
    let testsOriginalFullNameList = [];
    for(let i = 0; i < testsObject.length; i++) {
        testsOriginalFullNameList.push(testsObject[i].title);
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
        testsOriginalFullNameList: testsOriginalFullNameList,
        testsFullNameList: testsFullNameList,
        testsRespectiveFile: testsRespectiveFile,
    };
}

module.exports = {getTestsNames};