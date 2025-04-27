// 3. Executing the tests individually and placing theirs traces in NodeRock_Info/TracesFolder from loghooks.json

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

const sourceCopyPath = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_logHooks/logHooks.json");

const executingTestsText = `
 _____                     _   _               _____         _             
| ____|_  _____  ___ _   _| |_(_)_ __   __ _  |_   _|__  ___| |_ ___       
|  _| \\ \\/ / _ \\/ __| | | | __| | '_ \\ / _\` |   | |/ _ \\/ __| __/ __|      
| |___ >  <  __/ (__| |_| | |_| | | | | (_| |   | |  __/\\__ \\ |_\\__ \\_ _ _ 
|_____/_/\\_\\___|\\___|\\__,_|\\__|_|_| |_|\\__, |   |_|\\___||___/\\__|___(_|_|_)
                                       |___/`;

function executeTests() {

    console.log(executingTestsText);

    const ANALYZED_PROJECT_FILE = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json");
    const analyzedProjectData = JSON.parse(fs.readFileSync(ANALYZED_PROJECT_FILE, 'utf8'));

    const pathProjectFolder = analyzedProjectData.pathProjectFolder;
    const parameters = analyzedProjectData.parameters; 
    const isMocha = analyzedProjectData.isMocha;
    const isScript = analyzedProjectData.isScript;


    const TEST_NAMES_AND_FILES = path.join(pathProjectFolder, "NodeRock_Info/passingTests.json.log");
    const analyzedProjectTestNamesAndFiles = JSON.parse(fs.readFileSync(TEST_NAMES_AND_FILES, 'utf8'));
    
    const testsOriginalFullNameList = analyzedProjectTestNamesAndFiles.map(test => test.title);
    const testsRespectiveFile = analyzedProjectTestNamesAndFiles.map(test => test.file);

    
    const NODEROCK_INFO_DURATIONS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "testsDuration.json");

    const NODEROCK_INFO_TRACES_PATH = path.join(pathProjectFolder, "NodeRock_Info", "tracesFolder");
    if (!fs.existsSync(NODEROCK_INFO_TRACES_PATH)) {

        fs.mkdirSync(NODEROCK_INFO_TRACES_PATH);

        let pathNode_modules = isMocha ? "node_modules/.bin/_mocha" : "node_modules/.bin/jest";

        let semiCompleteCommand;
        let completCommand;

        console.log("\nExecuting all the Tests Individually to Collect Their Traces:");

        let testsDuration = [];
        let testsAdaptedName;
        for(let i = 0; i < testsOriginalFullNameList.length; i++) {

            testsAdaptedName = testsOriginalFullNameList[i];
            testsAdaptedName = testsAdaptedName.replace(/\s/g, '\\ '); // Adiciona "\" antes dos espacos
            testsAdaptedName = testsAdaptedName.replace(/["'`+()[\]]/g, '.*'); // Substitui " ' ` + ( ) [ ] por .*
            testsAdaptedName = testsAdaptedName.replace(/[-<>]/g, '\\$&'); // Adiciona "\" antes de "-", "<", ">"

            testsAdaptedName = `"${testsAdaptedName}"` 


            try {
                let stringExecutedTest;
                if(!isScript) {

                    semiCompleteCommand = "node ../dist/bin/nodeprof.js " + pathProjectFolder + " " + pathNode_modules + " " + testsRespectiveFile[i] + " " + parameters;

                    // Diferenciando se o teste eh Mocha ou Jest
                    isMocha ? completCommand = semiCompleteCommand + " -g " + testsAdaptedName : completCommand = semiCompleteCommand + " --testNamePattern " + testsAdaptedName;

                    console.log(`\n${i+1}/${testsOriginalFullNameList.length}. Executing: ${testsOriginalFullNameList[i]}`);
                    console.log("Command used: ", completCommand);

                    stringExecutedTest = shell.exec(completCommand);
                }
                else {
                    // let local = shell.exec("pwd");
                    // console.log("local eh: ", local);
                    let commandScript = "timeout 20 node ../dist/bin/nodeprof.js" + " " + pathProjectFolder + " " + testsRespectiveFile[0] + " " + parameters;
                    // let commandScript = "node ./dist/bin/nodeprof.js" + " " + pathProjectFolder + " " + testFile + " " + parameters;
                    console.log("Command used: ", commandScript);
                    stringExecutedTest = shell.exec(commandScript);
                }

                
                const match = stringExecutedTest.match(/analysis: ([\d.]+)s/);
                const AnalysisTime = match ? match[1] : 0;
                // console.log("\n\nTEMPO ANALISE EH: ", AnalysisTime);

                const NumericAnalysisTime = parseFloat(AnalysisTime);
                testsDuration.push(NumericAnalysisTime);



                let copiedFileName = "tracesFromIt_" + i + ".json";
                fs.copyFileSync(sourceCopyPath, path.join(NODEROCK_INFO_TRACES_PATH, copiedFileName));

            } catch (error) {
                console.error('Erro executar testes individuais:', error);
                console.log("Erro ao executar a iteracao do teste individual com i=", i);
            }
        }

        // Saving the duration of the tests in a file
        if (!fs.existsSync(NODEROCK_INFO_DURATIONS_PATH)) {

            console.log(`\nCreating NodeRock_Info/testsDuration.json in ${pathProjectFolder}\n`);
            fs.writeFileSync(NODEROCK_INFO_DURATIONS_PATH, JSON.stringify(testsDuration));

        } else {
            console.log(`\nNodeRock_Info/testsDuration.json  already exists in ${pathProjectFolder}\n`);
        }

    } else {
        console.log("The Test Traces were already collected in a previos NodeRock Analysis!");
        console.log("Using the existing Traces in: ", NODEROCK_INFO_TRACES_PATH);
    }
}

module.exports = { executeTests };
