const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const { chosenProjectFunction } = require('./1_chosenProject');
const { getTestsNames } = require('./2_getTestsNames');
const { executeTests } = require('./3_executeTests');
const { extractFunctions } = require('./4_extractFunctions'); 
const { extractFeatures } = require('./5_extractFeatures');
const { executeMonkeyPatching } = require('./6_executeMonkeyPatching');
const { normalizeFeatures } = require('./7_normalizeFeatures'); 
const { labelFeatures } = require('./8_labelFeatures');
const { generateCSV } = require('./9_generateCSV'); 
const { executePythonML } = require('./10_executePythonML'); 
const { executeRaceDetection } = require('./11_executeRaceDetection');


const startingNodeRockText = "____  _             _   _                   \n" +
"/ ___|| |_ __ _ _ __| |_(_)_ __   __ _       \n" +
"\\___ \\| __/ _' | '__| __| | '_ \\ / _' |      \n" +
" ___) | || (_| | |  | |_| | | | | (_| |      \n" +
"|____/ \\__\\__,_|_|   \\__|_|_| |_|\\__, |      \n" +
" _   _           _      ____     |___/  _    \n" +
"| \\ | | ___   __| | ___|  _ \\ ___   ___| | __\n" +
"|  \\| |/ _ \\ / _' |/ _ \\ |_) / _ \\ / __| |/ /\n" +
"| |\\  | (_) | (_| |  __/  _ < (_) | (__|   < \n" +
"|_| \\_|\\___/ \\__,_|\\___|_| \\_\\___/ \\___|_|\\_\\";

console.log(startingNodeRockText + "\n\n");

let rodarTestesCompleto = true; // true para caso tenha testes e false para caso seja script
if(rodarTestesCompleto) {
    
    // 1. Selecting the test file/folder that you want to analyse
    const chosenProject = chosenProjectFunction();
    //console.log("The selected project is: ", chosenProject);


    // 2. Treatments and Path Verifications to Get the test names
    const tests = getTestsNames(chosenProject.pathProjectFolder, chosenProject.testFile, chosenProject.parameters);

    //console.log(tests.testsFullNameList);
    // for(let i = 0; i < tests.testsFullNameList.length; i++) {
    //     console.log(i+1 + ". " + tests.testsFullNameList[i]);
    // }


    // 3. Executing the tests individually and placing theirs traces in NodeRock_Info/TracesFolder from loghooks.json
    const testsTotalDuration = executeTests(chosenProject.pathProjectFolder, tests.testsFullNameList, tests.testsRespectiveFile, chosenProject);
    // for(let i = 0; i < testsTotalDuration.length; i++) {
    //     console.log("Duracao foi: ", testsTotalDuration[i]);
    // }

    // 4. Extracting the functions from the traces and calculating their callback times
    const awaitIntervalsFromTests = extractFunctions(chosenProject.pathProjectFolder, tests.testsRespectiveFile);
    console.log("AWAIT INTERVALS EH: ", awaitIntervalsFromTests);

    // 5. Extracting the main features from each test
    extractFeatures(chosenProject.pathProjectFolder, tests.testsFullNameList);

    // 6. Monkey Patching the promises to collect data about the promises executed
    const monkeyPatchedPromisesData = executeMonkeyPatching(tests.testsRespectiveFile, tests.testsFullNameList);
    // console.log("MONKEY PATCHING RESULTOU EM: ", monkeyPatchedPromisesData);

    // 7. Normalizing the extracted features before applying the ML methods
    normalizeFeatures(chosenProject.pathProjectFolder, awaitIntervalsFromTests, monkeyPatchedPromisesData);

    // 8. Labeling the extracted features before applying the ML methods
    labelFeatures(chosenProject.pathProjectFolder, chosenProject.raceConditionTests);

    // 9. Generating the .csv file based on the .json files
    // OBS: ESSES 2 ULTIMOS VALORES PODEM SER ESCRITOS DIRETO NO ARQUIVO FEATURES_RAW PRA N PRECISAR PASSAR POR PARAMETRO
    generateCSV(chosenProject.pathProjectFolder, chosenProject.benchmarkName, tests.testsRespectiveFile, tests.testsOriginalFullNameList, testsTotalDuration, awaitIntervalsFromTests, monkeyPatchedPromisesData);
    
    // 10. Executes the Python script with the Machine Learning Supervised Models and generate the result.csv
    // executePythonML();

    // 11. Executes the race detection based on collectedResultsMLFolder to find the event races 
    // executeRaceDetection(chosenProject.pathProjectFolder, chosenProject.testFile);

}
else {
    // -=+=- Escolha do Script -=+=-

    let nomeScript;
    //nomeScript = "Script do Agent Keep Alive";
    // nomeScript = "Script do WhiteboxGhost";
    // nomeScript = "Script do node-mkdirp";
    // nomeScript = "Script do node-logger-file-1";
    nomeScript = "Script do socket.io-1862";
    // nomeScript = "Script do del";
    // nomeScript = "Script do linter-stylint";
    //nomeScript = "Script do node-simpleCrawler";

    //nomeScript = "Script do bluebird-2";
    // nomeScript = "Script do express-user";
    //nomeScript = "Script do get-port";
    //nomeScript = "Script do live-server-potential-race";
    // nomeScript = "Script do socket.io-client";
    
    let pathProjectFolder;
    //pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/agentkeepalive-23";
    // pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/WhiteboxGhost";
    // pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/node-mkdirp";
    // pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/node-logger-file-1";
    pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/socket.io-1862";
    // pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/del";
    // pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/linter-stylint";
    // pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/node-simplecrawler-i298";

    //pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/bluebird-2";
    // pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/nodesamples";
    //pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/get-port";
    //pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/live-server-potential-race";
    // pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/socket.io-client";

    
    let testFile;
    //testFile = "fuzz_test/triggerRace.js";
    // testFile = "fuzz_test/add_mock.js";
    // testFile = "fuzz_test/race_subtle.js";
    //testFile = "fuzz_test/triggerRace.js";
    testFile = "fuzz_test/triggerRace.js";
    // testFile = "testissue43.js";
    // testFile = "syntetic/test.js";
    //testFile = "merged-test.js";

    //testFile = "race.js";
    // testFile = "express01/server-test.js";
    //testFile = "triggerRace.js";
    //testFile = "race-root-dir-test.js";
    // testFile = "race.js";

    
    const pathScript = path.join(pathProjectFolder, testFile);
    
    let parameters = "";
    //parameters = "--timeout 20000";
    // parameters = 10; //node-logger-file-1


    //-=+=- Criacao das folders necessarias -=+=-
    const NODEROCK_INFO_PATH = path.join(pathProjectFolder, "NodeRock_Info");
    fs.mkdirSync(NODEROCK_INFO_PATH);
    
    const NODEROCK_INFO_TRACES_PATH = path.join(pathProjectFolder, "NodeRock_Info", "tracesFolder");
    fs.mkdirSync(NODEROCK_INFO_TRACES_PATH); // (era feito no 3_executeTests.js)
    
    // -=+=- Coleta dos traces -=+=-
    let completCommand = "timeout 20 node ./dist/bin/nodeprof.js" + " " + pathProjectFolder + " " + testFile + " " + parameters;
    // let completCommand = "node ./dist/bin/nodeprof.js" + " " + pathProjectFolder + " " + testFile + " " + parameters;
    const stringExecutedTest = shell.exec(completCommand);
    
    const sourceCopyPath = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/NodeRock_src/FoldersUsedDuringExecution/temporary_logHooks/logHooks.json";
    let copiedFileName = "tracesFromIt_" + 0 + ".json";
    shell.cp(sourceCopyPath, path.join(NODEROCK_INFO_TRACES_PATH, copiedFileName));
    

    // -=+=- Coleta do tempo total do script -=+=-
    const match = stringExecutedTest.match(/analysis: ([\d.]+)s/);
    const AnalysisTime = match ? match[1] : null;
    // console.log("\n\nTEMPO ANALISE EH: ", AnalysisTime);
    const NumericAnalysisTime = parseFloat(AnalysisTime);
    let scriptDuration = [];
    scriptDuration.push(NumericAnalysisTime);
    

    // -=+=- Realizacao do Extract Functions -=+=-
    let testsRespectiveFile = [];
    testsRespectiveFile.push(pathScript);
    extractFunctions(pathProjectFolder, testsRespectiveFile);
    
    // -=+=- Realizacao do Extract Features -=+=-
    let testsFullNameList = [];
    testsFullNameList.push(nomeScript);
    extractFeatures(pathProjectFolder, testsFullNameList);

    // -=+=- Realizando a Normalizacao das features -=+=-
    normalizeFeatures(pathProjectFolder);
    
    // -=+=- Marcando o hasEventRace como true -=+=-
    let raceConditionTests = [];
    raceConditionTests.push(nomeScript);
    labelFeatures(pathProjectFolder, raceConditionTests);
    
    // -=+=- Geracao do CSV -=+=-
    generateCSV(pathProjectFolder, nomeScript, testsRespectiveFile, scriptDuration);

/*    
    // so dar o node ./dist/bin/nodeprof.js /home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/agentkeepalive-23/ fuzz_test/triggerRace
    // node ./dist/bin/nodeprof.js /home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/WhiteboxGhost/ fuzz_test/add_mock.js 

    
mkdir collectedTracesFolder
touch collectedTracesFolder/tracesFromIt_0.json
    

    let testsRespectiveFile = [];
    let pathScript;
    //pathScript = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/agentkeepalive-23/fuzz_test/triggerRace.js";
    //pathScript = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/WhiteboxGhost/fuzz_test/add_mock.js";
    //pathScript = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/node-mkdirp/fuzz_test/race_subtle.js";
    //pathScript = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/del/testissue43.js";
    //pathScript = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/linter-stylint/syntetic/test.js";
    pathScript = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/node-simplecrawler-i298/merged-test.js";
    testsRespectiveFile.push(pathScript);

    extractFunctions(testsRespectiveFile);

    let testsFullNameList = [];
    let nomeScript;
    //nomeScript = "Script do Agent Keep Alive"
    //nomeScript = "Script do WhiteboxGhost"
    //nomeScript = "Script do node-mkdirp"
    //nomeScript = "Script do linter-stylint";
    nomeScript = "Script do node-simpleCrawler";
    testsFullNameList.push(nomeScript);

    extractFeatures(testsFullNameList);
    normalizeFeatures();

    let raceConditionTests = [];
    raceConditionTests.push(nomeScript);

    labelFeatures(raceConditionTests);

    let testsTotalDuration = [];
    testsTotalDuration.push(6.602);

    generateCSV(nomeScript, testsRespectiveFile, testsTotalDuration);
*/
}


const finishedNodeRockText = " _   _           _      ____            _    \n" +
"| \\ | | ___   __| | ___|  _ \\ ___   ___| | __\n" +
"|  \\| |/ _ \\ / _\` |/ _ \\ |_) / _ \\ / __| |/ /\n" +
"| |\\  | (_) | (_| |  __/  _ < (_) | (__|   < \n" +
"|_| \\_|\\___/ \\__,_|\\___|_| \\_\\___/ \\___|_|\\_\\\n" +
"    _                _           _           \n" +
"   / \\   _ __   __ _| |_   _ ___(_)___       \n" +
"  / _ \\ | '_ \\ / _\` | | | | / __| / __|      \n" +
" / ___ \\| | | | (_| | | |_| \\__ \\ \\__ \\      \n" +
"/_/   \\_\\_| |_|\\__,_|\\|\\__, |___/_|___/      \n" +
" _____ _       _     _ |___/        _ _      \n" +
"|  ___(_)_ __ (_)___| |__   ___  __| | |     \n" +
"| |_  | | '_ \\| / __| '_ \\ / _ \\/ _\` | |     \n" +
"|  _| | | | | | \\__ \\ | | |  __/ (_| |_|     \n" +
"|_|   |_|_| |_|_|___/_| |_|\\___|\\__,_(_)";

console.log(finishedNodeRockText + "\n");