const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

const { chosenProjectFunction } = require('./chosenProject');
const { getTestsNames } = require('./getTestsNames');
const { executeTests } = require('./executeTests');
const { extractFunctions } = require('./extractFunctions'); 


const chosenProject = chosenProjectFunction();
//console.log(chosenProject);

const tests = getTestsNames(chosenProject.pathProjectFolder, chosenProject.testFile);
//console.log(tests.testNames);
// for(let i = 0; i < tests.testNames.length; i++) {
//     console.log(i+1 + ". " + tests.testNames[i]);
// }

shell.echo("COMECOU!");


// 3. CREATING THE DESTINATION FOLDER FOR THE TRACES THAT WILL BE OBTAINED
const sourceCopyPath = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logHooks.json";
const destinationCopyFolder = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
let copiedFileName;

// Refazendo o diretorio do collectedTracesFolder
shell.rm('-rf', destinationCopyFolder);
shell.mkdir(destinationCopyFolder);

executeTests(tests, sourceCopyPath, destinationCopyFolder, chosenProject);

extractFunctions();
/*
// 4) COLLECT STATISTICS FROM THE LOGS OBTAINED (EXTRACT FEATURES)
console.log("\nExtracao das features a partir dos traces gerados:");
try {
    const diretorio = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
    const files = fs.readdirSync(diretorio);
    
    const pathExtractedFeaturesResume = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesResume.json";
    fs.writeFileSync(pathExtractedFeaturesResume, '[\n');

    // Filtrar para ler apenas os arquivos de nome tracesFromIt_x.json;
    //const regex = /^tracesFromIt_\d+\.json$/;
    const regex = /^functionsFromTest_\d+\.json$/;
    const filteredFiles = files.filter(file => regex.test(file));

    //console.log("files eh: ", files);
    for(let i = 0; i < filteredFiles.length; i++) {

        let pathExtractFile = "";
        pathExtractFile = diretorio + filteredFiles[i];
        console.log(`${i+1}/${filteredFiles.length}. Extraindo features do arquivo: ${filteredFiles[i]}`);
        const logHooks = fs.readFileSync(pathExtractFile, 'utf8');
        const objectsExtractFeatures = JSON.parse(logHooks);

        // Extracting Features
        let countInvokeFunPre = objectsExtractFeatures.length;
        let countInvokesWithCallback = 0;
        let totalDelay = 0;
        let avgDelay = 0;
        for(let j = 0; j < objectsExtractFeatures.length; j++) {
            if(objectsExtractFeatures[j].Called_iid.length > 0) {
                countInvokesWithCallback++;
                totalDelay += objectsExtractFeatures[j].delayCb_ms;
            }
        }
        avgDelay = totalDelay / countInvokesWithCallback;

        const ObjectLogMessage = {
            //"Test_Name": aaaa,
            "File_Extract_Features": pathExtractFile,
            "InvokeFunPre_Count": countInvokeFunPre,
            "Invokes_with_callback": countInvokesWithCallback,
            "Total_delay_ms": totalDelay,
            "Average_delay_ms": avgDelay, // total_delay / invokes_with_callback
        };

        const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);

        if (i !== filteredFiles.length - 1) {
            fs.writeFileSync(pathExtractedFeaturesResume, stringJSON + ',\n', {flag:'a'});
        }
        else {
            fs.writeFileSync(pathExtractedFeaturesResume, stringJSON + '\n]', {flag:'a'});
        }

    }
}
catch (error) {
    console.error('Erro no extract features:', error);
}
*/
shell.echo("TERMINOU!");