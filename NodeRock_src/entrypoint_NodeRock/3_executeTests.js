// 3. Executing the tests individually and placing theirs traces in NodeRock_Info/TracesFolder from loghooks.json

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

const sourceCopyPath = path.join(__dirname,"../FoldersUsedDuringExecution/temporary_logHooks/logHooks.json");

function executeTests(pathProjectFolder, testsOriginalFullNameList, testsRespectiveFile, chosenProject) {

    const NODEROCK_INFO_TRACES_PATH = path.join(pathProjectFolder, "NodeRock_Info", "tracesFolder");
    const NODEROCK_INFO_DURATIONS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "testsDuration.json");

    let testsDuration = [];

    if (!fs.existsSync(NODEROCK_INFO_TRACES_PATH)) {

        console.log(`\nCreating NodeRock_Info/tracesFolder in ${pathProjectFolder}\n`);
        fs.mkdirSync(NODEROCK_INFO_TRACES_PATH);

        let pathNode_modules = chosenProject.isMocha ? "node_modules/.bin/_mocha" : "node_modules/.bin/jest";

        let semiCompleteCommand;
        let completCommand;

        console.log("\nExecucao dos testes individualmente:");

        let testsAdaptedName;
        for(let i = 0; i < testsOriginalFullNameList.length; i++) {

            testsAdaptedName = testsOriginalFullNameList[i];
            testsAdaptedName = testsAdaptedName.replace(/\s/g, '\\ '); // Adiciona "\" antes dos espacos
            testsAdaptedName = testsAdaptedName.replace(/["'`+()[\]]/g, '.*'); // Substitui " ' ` + ( ) [ ] por .*
            testsAdaptedName = testsAdaptedName.replace(/[-<>]/g, '\\$&'); // Adiciona "\" antes de "-", "<", ">"

            testsAdaptedName = `"${testsAdaptedName}"` 


            try {
                semiCompleteCommand = "node ../dist/bin/nodeprof.js " + chosenProject.pathProjectFolder + " " + pathNode_modules + " " + testsRespectiveFile[i] + " " + chosenProject.parameters;

                // Diferenciando se o teste eh Mocha ou Jest
                if(chosenProject.isMocha) {
                    completCommand = semiCompleteCommand + " -g " + testsAdaptedName;
                }
                else {
                    completCommand = semiCompleteCommand + " --testNamePattern " + testsAdaptedName;
                }

                console.log(`\n${i+1}/${testsOriginalFullNameList.length}. Executando o teste: ${testsOriginalFullNameList[i]}`);
                console.log("Comando usado foi: ", completCommand);


                const stringExecutedTest = shell.exec(completCommand);

                
                const match = stringExecutedTest.match(/analysis: ([\d.]+)s/);
                const AnalysisTime = match ? match[1] : null;
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
        console.log(`\nNodeRock_Info/tracesFolder already exists in ${pathProjectFolder}\n`);
    }


    const testsDurationRecovered = JSON.parse(fs.readFileSync(NODEROCK_INFO_DURATIONS_PATH, 'utf8'));

    return testsDurationRecovered;
}

module.exports = { executeTests };
