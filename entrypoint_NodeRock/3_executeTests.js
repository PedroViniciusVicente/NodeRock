// 3. Executing the tests individually and placing theirs traces in collectedTracesFolder

const shell = require('shelljs');

function executeTests(tests, chosenProject) {
    const sourceCopyPath = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logHooks.json";
    const destinationCopyFolder = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
    let copiedFileName;

// Refazendo o diretorio do collectedTracesFolder
shell.rm('-rf', destinationCopyFolder);
shell.mkdir(destinationCopyFolder);

    let pathNode_modules = chosenProject.isMocha ? "node_modules/.bin/_mocha" : "node_modules/.bin/jest";

    let semiCompleteCommand;
    let completCommand;
    console.log("\nExecucao dos testes individualmente:");
    for(let i = 0; i < tests.testNames.length; i++) {
        try {
            // Diferenciando se o teste era de um folder inteiro ou de apenas um file especifico 
            if(tests.testNamesRespectiveFile.length > 0) {
                semiCompleteCommand = "node ./dist/bin/nodeprof.js " + chosenProject.pathProjectFolder + " " + pathNode_modules + " " + tests.testNamesRespectiveFile[i] + " " + chosenProject.parameters;
            }
            else {
                semiCompleteCommand = "node ./dist/bin/nodeprof.js " + chosenProject.pathProjectFolder + " " + pathNode_modules + " " + chosenProject.testFile + " " + chosenProject.parameters;
            }

            // Diferenciando se o teste eh Mocha ou Jest
            if(chosenProject.isMocha) {
                completCommand = semiCompleteCommand + " -g " + tests.testNames[i];
                //shell.exec(semiCompletCommand + " -g " + tests.testNames[i]);
                //console.log("Comando com o -g eh: ", completCommand);
            }
            else {
                completCommand = semiCompleteCommand + " --testNamePattern " + tests.testNames[i];
                //shell.exec(semiCompletCommand + " --testNamePattern " + tests.testNames[i]);
                //console.log("Comando com o --testNamePattern eh: ", completCommand);
            }

            console.log(`\n${i+1}/${tests.testNames.length}. Executando o teste: ${tests.testNames[i]}`);
            console.log("Comando usado foi: ", completCommand);

            shell.exec(completCommand);

            copiedFileName = "tracesFromIt_" + i.toString() + ".json";
            shell.cp(sourceCopyPath, (destinationCopyFolder + copiedFileName));
        } catch (error) {
            console.error('Erro executar testes individuais:', error);
            console.log("Erro ao executar a iteracao do teste individual com i=", i);
        }
    }
}

module.exports = { executeTests };
