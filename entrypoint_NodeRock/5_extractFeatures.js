// 5. Extracting the main features from each test

const fs = require('fs');
const path = require('path');

function extractFeatures(pathProjectFolder, testsFullNameList) {
    console.log("\nExtracao das features a partir dos traces gerados:");

    const NODEROCK_INFO_TRACES_PATH = path.join(pathProjectFolder, "NodeRock_Info", "tracesFolder");
    const NODEROCK_INFO_FUNCTIONS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "functionsFolder");
    const NODEROCK_INFO_EXTRACTED_RAW_PATH = path.join(pathProjectFolder, "NodeRock_Info", "extractedFeaturesRaw.json");

    try {

        if (!fs.existsSync(NODEROCK_INFO_EXTRACTED_RAW_PATH)) {

            console.log(`\nCreating NodeRock_Info/extractedFeaturesRaw.json in ${pathProjectFolder}\n`);
            fs.writeFileSync(NODEROCK_INFO_EXTRACTED_RAW_PATH, '[\n');

            // Filtrar para ler apenas os arquivos de nome tracesFromIt_x.json;
            // const regex = /^functionsFromTest_\d+\.json$/;
            // const filteredFiles = files.filter(file => regex.test(file));

            //console.log("files eh: ", files);
            for(let i = 0; i < testsFullNameList.length; i++) {

                functionFileName = "functionsFromTest_" + i + ".json";
                pathExtractFile = path.join(NODEROCK_INFO_FUNCTIONS_PATH, functionFileName);
                console.log(`${i+1}/${testsFullNameList.length}. Extraindo features do arquivo: ${"functionsFromTest_" + i + ".json"}`);

                const logHooks = fs.readFileSync(pathExtractFile, 'utf8');
                const objectsExtractFeatures = JSON.parse(logHooks);

                // Extracting Features
                let countInvokeFunPre = objectsExtractFeatures.length;
                let countInvokesWithCallback = 0;
                let totalDelay = 0;
                for(let j = 0; j < objectsExtractFeatures.length; j++) {
                    if(objectsExtractFeatures[j].Called_iid.length > 0 && objectsExtractFeatures[j].callbackFromItOrDescribe === false) {
                        countInvokesWithCallback++;
                        totalDelay += objectsExtractFeatures[j].delayCb_ms;
                    }
                }
                let avgDelay = 0;
                avgDelay = totalDelay / countInvokesWithCallback;

                const tracesFileName = "tracesFromIt_" + i + ".json";
                const pathExtractFileAsyncAwait = path.join(NODEROCK_INFO_TRACES_PATH, tracesFileName);

                const logHooksAsyncAwait = fs.readFileSync(pathExtractFileAsyncAwait);
                const objectsExtractFeaturesAsyncAwait = JSON.parse(logHooksAsyncAwait);

                let countAsyncFunctions = 0;
                let asyncLines = 0;
                let countAwaits = 0;
                let max_asynchook_id = 0;
                const unique_asynchook_ids_set = new Set();

                for(let j = 0; j < objectsExtractFeaturesAsyncAwait.length; j++) {

                    if(objectsExtractFeaturesAsyncAwait[j].Async_Hook_Id > max_asynchook_id) {
                        max_asynchook_id = objectsExtractFeaturesAsyncAwait[j].Async_Hook_Id;
                    }

                    if(objectsExtractFeaturesAsyncAwait[j].Detected_Hook === "awaitPre") {
                        countAwaits++;
                    }

                    if(objectsExtractFeaturesAsyncAwait[j].Detected_Hook === "asyncFunctionEnter") {
                        countAsyncFunctions++;
                        asyncLines += objectsExtractFeaturesAsyncAwait[j].loc.end.line - objectsExtractFeaturesAsyncAwait[j].loc.start.line;
                    }

                    unique_asynchook_ids_set.add(objectsExtractFeaturesAsyncAwait[j].Async_Hook_Id);

                }
                const unique_asynchook_ids = unique_asynchook_ids_set.size;

                let testName = testsFullNameList[i];
                // Remove as aspas iniciais e finais
                testName = testName.replace(/^"|"$/g, '');
                // Remove as barras invertidas antes dos espaços
                testName = testName.replace(/\\ /g, ' ');


                const ObjectLogMessage = {
                    "Test_Name": testName,
                    "File_Extract_Features": pathExtractFile,
                    "InvokeFunPre_Count": countInvokeFunPre,
                    "Invokes_with_callback": countInvokesWithCallback,
                    "Total_delay_ms": totalDelay,
                    "Average_delay_ms": avgDelay, // total_delay / invokes_with_callback
                    "AsyncFunction_Count": countAsyncFunctions,
                    "AsyncFunction_lines": asyncLines,
                    "Await_Count": countAwaits,
                    "Max_Asynchook_id": max_asynchook_id,
                    "Unique_Asynchook_ids": unique_asynchook_ids,
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);

                if (i !== testsFullNameList.length - 1) {
                    fs.writeFileSync(NODEROCK_INFO_EXTRACTED_RAW_PATH, stringJSON + ',\n', {flag:'a'});
                }
                else {
                    fs.writeFileSync(NODEROCK_INFO_EXTRACTED_RAW_PATH, stringJSON + '\n]', {flag:'a'});
                }

            }
            
        } else {
            console.log(`\nNodeRock_Info/extractedFeaturesRaw.json already exists in ${pathProjectFolder}\n`);
        }
    }
    catch (error) {
        console.error('Erro no extract features:', error);
    }
        
}

module.exports = { extractFeatures };
