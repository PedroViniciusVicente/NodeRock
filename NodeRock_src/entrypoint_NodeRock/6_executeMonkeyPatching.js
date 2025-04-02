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

    
    const TEST_NAMES_AND_FILES = path.join(pathProjectFolder, "NodeRock_Info/passingTests.json.log");
    const analyzedProjectTestNamesAndFiles = JSON.parse(fs.readFileSync(TEST_NAMES_AND_FILES, 'utf8'));
    
    const testsOriginalFullNameList = analyzedProjectTestNamesAndFiles.map(test => test.title);
    const testsRespectiveFile = analyzedProjectTestNamesAndFiles.map(test => test.file);
    
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

            const command = `../node_modules/.bin/_mocha --exit -t 10000 --require ./entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js ${testsRespectiveFile[i]} -f ${currentTestWithQuotes}`;
            console.log("Comando usado para monkeyPatching foi: ", command);
            shell.exec(command);

            const testDataMonkey = extractedFeaturesMonkeyPatching();
            extractedDataMonkeyTests.push(testDataMonkey);
        }

                
        console.log(`\nCreating NodeRock_Info/monkeypatching.json in ${NODEROCK_INFO_MONKEYPATCH_FILE}\n`);
        fs.writeFileSync(NODEROCK_INFO_MONKEYPATCH_FILE, JSON.stringify(extractedDataMonkeyTests, null, 4));

    } else {
        console.log(`\nNodeRock_Info/monkeypatching.json already exists in ${NODEROCK_INFO_MONKEYPATCH_FILE}\n`);
    }
}

module.exports = { executeMonkeyPatching };