// 3. Executing the tests individually and placing theirs traces in collectedTracesFolder

const shell = require('shelljs');

const sourceCopyPath = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logHooks.json";
const destinationCopyFolder = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";

function executeTests(testsFullNameList, testsRespectiveFile, chosenProject) {
    let copiedFileName;

    let pathNode_modules = chosenProject.isMocha ? "node_modules/.bin/_mocha" : "node_modules/.bin/jest";

    let semiCompleteCommand;
    let completCommand;

    let testsDuration = [];

    console.log("\nExecucao dos testes individualmente:");
    for(let i = 0; i < testsFullNameList.length; i++) {
        try {
            semiCompleteCommand = "node ./dist/bin/nodeprof.js " + chosenProject.pathProjectFolder + " " + pathNode_modules + " " + testsRespectiveFile[i] + " " + chosenProject.parameters;

            // Diferenciando se o teste eh Mocha ou Jest
            if(chosenProject.isMocha) {
                completCommand = semiCompleteCommand + " -g " + testsFullNameList[i];
            }
            else {
                completCommand = semiCompleteCommand + " --testNamePattern " + testsFullNameList[i];
            }

            console.log(`\n${i+1}/${testsFullNameList.length}. Executando o teste: ${testsFullNameList[i]}`);
            console.log("Comando usado foi: ", completCommand);


            const stringExecutedTest = shell.exec(completCommand);

            const match = stringExecutedTest.match(/analysis: ([\d.]+)s/);
            const AnalysisTime = match ? match[1] : null;

            // console.log("\n\nTEMPO ANALISE EH: ");
            // console.log(AnalysisTime);
            const NumericAnalysisTime = parseFloat(AnalysisTime);
            testsDuration.push(NumericAnalysisTime);

            copiedFileName = "tracesFromIt_" + i.toString() + ".json";
            shell.cp(sourceCopyPath, (destinationCopyFolder + copiedFileName));
        } catch (error) {
            console.error('Erro executar testes individuais:', error);
            console.log("Erro ao executar a iteracao do teste individual com i=", i);
        }
    }
    return testsDuration;
}

module.exports = { executeTests };
