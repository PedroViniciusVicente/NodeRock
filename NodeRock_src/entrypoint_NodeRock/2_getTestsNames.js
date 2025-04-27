// 2. Treatments and Path Verifications to get the test names

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');


// "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/entrypoint_NodeRock/mochaReporter.js";
const CUSTOM_REPORTER = path.join(__dirname, "mochaReporter.js");

// "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource";
const ROOT_PATH_NODEROCK = path.join(__dirname, "../");

const getTestsNamesText = `
  ____      _   _   _               _____         _         _   _                                 
 / ___| ___| |_| |_(_)_ __   __ _  |_   _|__  ___| |_ ___  | \\ | | __ _ _ __ ___   ___  ___       
| |  _ / _ \\ __| __| | '_ \\ / _\` |   | |/ _ \\/ __| __/ __| |  \\| |/ _\` | '_ \` _ \\ / _ \\/ __|      
| |_| |  __/ |_| |_| | | | | (_| |   | |  __/\\__ \\ |_\\__ \\ | |\\  | (_| | | | | | |  __/\\__ \\_ _ _ 
 \\____|\\___|\\__|\\__|_|_| |_|\\__, |   |_|\\___||___/\\__|___/ |_| \\_|\\__,_|_| |_| |_|\\___||___(_|_|_)
                            |___/`;

                            
                            
function getTestsNames() {
    
    const ANALYZED_PROJECT_FILE = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json");
    const analyzedProjectData = JSON.parse(fs.readFileSync(ANALYZED_PROJECT_FILE, 'utf8'));
    // console.log(analyzedProjectData);

    const pathProjectFolder = analyzedProjectData.pathProjectFolder;
    const testFile = analyzedProjectData.testFile;
    const parameters = analyzedProjectData.parameters;
    const isScript = analyzedProjectData.isScript;
    const benchmarkName = analyzedProjectData.benchmarkName;

    // Creates NodeRock_Info folder in the analyzed project if it does not exists yet
    const NODEROCK_INFO_PATH = path.join(pathProjectFolder, "NodeRock_Info");
    fs.mkdirSync(NODEROCK_INFO_PATH, { recursive: true });
    
    if(!isScript) {
        console.log(getTestsNamesText);
    }


    const PASSING_TESTS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "passingTests.json.log");
    if (!fs.existsSync(PASSING_TESTS_PATH)) {

        let testsObject;
        if(!isScript) {
            shell.cd(`${pathProjectFolder}`);

            // console.log("Comando usado para extrair os testes: ", commandGetTests);
            
            // O trecho --reporter-options pathProjectFolder=${pathProjectFolder} só serve para passar o pathProjectFolder como argumento
            // let out = shell.exec(`npx mocha ${testFile} --recursive --exit -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}`, { silent: false }); // default

            // let out = shell.exec(`./node_modules/.bin/mocha ${testFile} --recursive --exit -R ${CUSTOM_REPORTER} ${parameters}`, { silent: false });

            // shell.exec(`./node_modules/.bin/_mocha --exit -t 20000 test/db.test.js -R ${CUSTOM_REPORTER}`, {silent: false}); // SOMENTE PARA O NEDB
            shell.exec(`./node_modules/.bin/_mocha ${testFile} ${parameters} -R ${CUSTOM_REPORTER}`, {silent: false}); // para o fps
            // shell.exec(`mocha --recursive --require ./scripts/mocha-require`) // PARA O ZENPARSING

            shell.cd(ROOT_PATH_NODEROCK);

            // "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/NodeRock_src/FoldersUsedDuringExecution/temporary_TestsNamesAndFiles";
            const TEMPORARY_TESTS_NAMES_AND_FILES = path.join(__dirname,"../FoldersUsedDuringExecution/temporary_TestsNamesAndFiles/temporaryPassingTests.json.log");
    
            // Writing the passed tests names and files to NodeRock_Info
            testsObject = JSON.parse(fs.readFileSync(TEMPORARY_TESTS_NAMES_AND_FILES, 'utf8'));
        }
        else {
            let scriptFileAndName = [];
            scriptFileAndName.push({
                file: path.join(pathProjectFolder, testFile),
                title: `Script for ${benchmarkName}`
            });
            testsObject = scriptFileAndName;
            shell.cd(ROOT_PATH_NODEROCK);
        }

        // let local = shell.exec("pwd");
        // console.log("\nO LOCAL EH: ", local);

        
        fs.writeFileSync(PASSING_TESTS_PATH, JSON.stringify(testsObject, null, 4), 'utf8');

    } else {
        console.log("The Test Names and files were already collected in a previos NodeRock Analysis!");
        console.log(`Using the existing PassingTests.json.log in: ${PASSING_TESTS_PATH}`);
    }

    
    const testsObject = JSON.parse(fs.readFileSync(PASSING_TESTS_PATH, 'utf8'));

    // Obtendo a quantidade de arquivos únicos
    const uniqueFilesNames = new Set();
    testsObject.forEach(obj => {
        uniqueFilesNames.add(obj.file);
    });

    let fileCounter = 1;
    console.log(`\n${uniqueFilesNames.size} Test Files Were Found:`);
    for (const uniqueFileName of uniqueFilesNames) {
        console.log(`${fileCounter}. ${uniqueFileName}`);
    }

    // Obtendo os nomes dos testes
    let testsRespectiveFile = [];
    let testsOriginalFullNameList = [];
    for(let i = 0; i < testsObject.length; i++) {
        testsOriginalFullNameList.push(testsObject[i].title);
        testsRespectiveFile.push(testsObject[i].file);
    }

    console.log(`\n${testsOriginalFullNameList.length} Tests Were Found:`);
    for(let i = 0; i < testsOriginalFullNameList.length; i++) {
        console.log(`${i+1}. ${testsOriginalFullNameList[i]}`);
    }

}

module.exports = {getTestsNames};