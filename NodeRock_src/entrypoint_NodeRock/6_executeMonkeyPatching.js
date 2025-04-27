// 6. Executing the monkey patching of the Promises from the tests
// npx mocha --require ./entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/monkeyPatchingTest/test/test.js

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const { extractedFeaturesMonkeyPatching } = require('./monkeyPatchingTestes/extractFeaturesMonkeyPatching'); 


const monkeyPatchingText = `
 __  __             _                ____       _       _     _               ____                      _                     
|  \\/  | ___  _ __ | | _____ _   _  |  _ \\ __ _| |_ ___| |__ (_)_ __   __ _  |  _ \\ _ __ ___  _ __ ___ (_)___  ___  ___       
| |\\/| |/ _ \\| '_ \\| |/ / _ \\ | | | | |_) / _\` | __/ __| '_ \\| | '_ \\ / _\` | | |_) | '__/ _ \\| '_ \` _ \\| / __|/ _ \\/ __|      
| |  | | (_) | | | |   <  __/ |_| | |  __/ (_| | || (__| | | | | | | | (_| | |  __/| | | (_) | | | | | | \\__ \\  __/\\__ \\_ _ _ 
|_|  |_|\\___/|_| |_|_|\\_\\___|\\__, | |_|   \\__,_|\\__\\___|_| |_|_|_| |_|\\__, | |_|   |_|  \\___/|_| |_| |_|_|___/\\___||___(_|_|_)
                             |___/                                    |___/`;


function executeMonkeyPatching() {

    console.log(monkeyPatchingText);

    const ANALYZED_PROJECT_FILE = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json");
    const analyzedProjectData = JSON.parse(fs.readFileSync(ANALYZED_PROJECT_FILE, 'utf8'));

    const pathProjectFolder = analyzedProjectData.pathProjectFolder;
    const isScript = analyzedProjectData.isScript;

    
    const TEST_NAMES_AND_FILES = path.join(pathProjectFolder, "NodeRock_Info/passingTests.json.log");
    const analyzedProjectTestNamesAndFiles = JSON.parse(fs.readFileSync(TEST_NAMES_AND_FILES, 'utf8'));
    
    const testsOriginalFullNameList = analyzedProjectTestNamesAndFiles.map(test => test.title);
    const testsRespectiveFile = analyzedProjectTestNamesAndFiles.map(test => test.file);
    
    // "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource";
    const ROOT_PATH_NODEROCK = path.join(__dirname, "../");


    // console.log("\nMONKEY PATCHING!!!\n");
    // console.log(testsRespectiveFile);
    // console.log(testsFullNameList)
    
    const NODEROCK_INFO_MONKEYPATCH_FILE = path.join(pathProjectFolder, "NodeRock_Info", "monkeypatching.json");


    if (!fs.existsSync(NODEROCK_INFO_MONKEYPATCH_FILE)) {

        let extractedDataMonkeyTests = [];
        let currentTestWithQuotes;
        for(let i = 0; i < testsOriginalFullNameList.length; i++) {
            // fs.truncateSync('./promise_logs/promises.json', 0); // Zerando o conteudo do json em que se armazena as infos das promises
            fs.truncateSync('./FoldersUsedDuringExecution/temporary_promises_logs/promises.json', 0); // Zerando o conteudo do json em que se armazena as infos das promises

            testsOriginalFullNameList[i].includes('"') 
            ? currentTestWithQuotes = `'${testsOriginalFullNameList[i]}'` 
            : currentTestWithQuotes = `"${testsOriginalFullNameList[i]}"` 

            let command;
            if(!isScript) {
                command = `../node_modules/.bin/_mocha --exit -t 10000 --require ./entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js ${testsRespectiveFile[i]} -f ${currentTestWithQuotes}`;
            }
            else {
                command = `../node_modules/.bin/_mocha --exit -t 10000 --require ./entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js ${testsRespectiveFile[i]}`;
            }
            
            console.log("Comando usado para monkeyPatching foi: ", command);
            shell.exec(command);

            // para o node-archiver que aparentemente tem uns testes hardcoded que dependem de estar no respectivo diretorio
            // shell.cd(pathProjectFolder);
            // const comando_novo = `./node_modules/.bin/_mocha --exit -t 10000 --require /home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/NodeRock_src/entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js ${testsRespectiveFile[i]} -f ${currentTestWithQuotes}`;
            // console.log("Comando novo eh: ", comando_novo);
            // shell.exec(comando_novo);
            // shell.cd(ROOT_PATH_NODEROCK);

            // para o FPS tambem
            // shell.cd(pathProjectFolder);
            // const comando_novo = `./node_modules/.bin/_mocha --exit -t 10000 --require /home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/NodeRock_src/entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js ${testsRespectiveFile[i]} -f ${currentTestWithQuotes}`;
            // console.log("Comando novo para monkey patching eh: ", comando_novo);
            // shell.exec(comando_novo);
            // shell.cd(ROOT_PATH_NODEROCK);

            // na verdade, isso aqui que funcionou para o FPS:
            // pedroubuntu@Aspire-A514-54:~/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/fiware-pep-steelskin$ ../../../../NodeRT-OpenSource/node_modules/.bin/_mocha --exit -t 10000 --require ../../../../NodeRT-OpenSource/NodeRock_src/entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js ./test/unit/race_simple.js -f "Reuse authentication tokens When a the PEP Proxy has an expired token and another request arrives to the proxy both requests should finish"



            

            const testDataMonkey = extractedFeaturesMonkeyPatching();
            extractedDataMonkeyTests.push(testDataMonkey);
        }

                
        console.log(`\nCreating NodeRock_Info/monkeypatching.json in ${NODEROCK_INFO_MONKEYPATCH_FILE}\n`);
        fs.writeFileSync(NODEROCK_INFO_MONKEYPATCH_FILE, JSON.stringify(extractedDataMonkeyTests));

    } else {
        console.log(`\nNodeRock_Info/monkeypatching.json already exists in ${NODEROCK_INFO_MONKEYPATCH_FILE}\n`);
    }
}

module.exports = { executeMonkeyPatching };