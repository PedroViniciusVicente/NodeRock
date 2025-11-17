// 2. Treatments and Path Verifications to get the test names

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');


// "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/entrypoint_NodeRock/mochaReporter.js";
const CUSTOM_REPORTER = path.join(__dirname, "mochaReporter.js");

// "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource";
const ROOT_PATH_NODEROCK = path.join(__dirname, "../");     
                            
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
        console.log("=".repeat(60));
        console.log("2) Getting the Test Names and Files from the Chosen Project:");
        console.log("=".repeat(60));
    }


    const PASSING_TESTS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "passingTests.json.log");
    if (!fs.existsSync(PASSING_TESTS_PATH)) {

        let testsObject;
        if(!isScript) {
            shell.cd(`${pathProjectFolder}`);

            if(benchmarkName === "node-logger-file-1") {
                shell.exec(`rm -rf test/log/* && ./node_modules/mocha/bin/mocha test/*.js --exit -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}`, { silent: false });
            }
            else if(benchmarkName === "del") { // for some reason this benchmark can not have the --recursive parameter
                shell.exec(`npx mocha --exit -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}`, { silent: false });
            }
            else if(benchmarkName === "node-simplecrawler-i298") {
                shell.exec(`npx mocha "test/**/*.js" -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}`, { silent: false });
            }
            else if(benchmarkName === "ncp-6820b0f" || benchmarkName === "write-f537eb6" || benchmarkName == "socket.io-1862") {
                // shell.exec(`npx mocha -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}`, { silent: false });
                shell.exec(`npx mocha test/ -R ${CUSTOM_REPORTER} --reporter-options pathProjectFolder=${pathProjectFolder}`);
            }
            else if(benchmarkName === "json-file-store-6aada66") {
                shell.exec(`npx mocha "Store.spec.js" "testcases/*" -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}`, { silent: false });
            }
            else if(benchmarkName === "json-fs-store-4e75c4f") {
                shell.exec(`npx mocha "spec/*" "testcases/" -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}`, { silent: false });
            }
            else if(benchmarkName === "xlsx-extract") {
                shell.exec(`npx mocha test/ -R ${CUSTOM_REPORTER} --reporter-options pathProjectFolder=${pathProjectFolder}`);
            }
            else { // Default command to extract the test names and files
                let out = shell.exec(`npx mocha ${testFile} --recursive --exit -R ${CUSTOM_REPORTER} ${parameters} --reporter-options pathProjectFolder=${pathProjectFolder}`, { silent: false }); // default
            }

            shell.cd(ROOT_PATH_NODEROCK);
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
    console.log(`Test Files Found: ${uniqueFilesNames.size}`);
    for (const uniqueFileName of uniqueFilesNames) {
        console.log(`${fileCounter}. ${uniqueFileName}`);
        fileCounter++;
    }

    // Obtendo os nomes dos testes
    let testsRespectiveFile = [];
    let testsOriginalFullNameList = [];
    for(let i = 0; i < testsObject.length; i++) {
        testsOriginalFullNameList.push(testsObject[i].title);
        testsRespectiveFile.push(testsObject[i].file);
    }

    console.log(`\nTests Found: ${testsOriginalFullNameList.length}`);
    for(let i = 0; i < testsOriginalFullNameList.length; i++) {
        console.log(`${i+1}. ${testsOriginalFullNameList[i]}`);
    }

}

module.exports = {getTestsNames};