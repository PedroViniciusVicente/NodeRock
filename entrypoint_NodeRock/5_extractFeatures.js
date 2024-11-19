// 5. Extracting the main features from each test

const fs = require('fs');

function extractFeatures(tests) {
    console.log("\nExtracao das features a partir dos traces gerados:");
    try {
        const diretorio = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
        const files = fs.readdirSync(diretorio);
        
        const pathextractedFeaturesRaw = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesRaw.json";
        fs.writeFileSync(pathextractedFeaturesRaw, '[\n');

        // Filtrar para ler apenas os arquivos de nome tracesFromIt_x.json;
        // const regex = /^functionsFromTest_\d+\.json$/;
        // const filteredFiles = files.filter(file => regex.test(file));

        //console.log("files eh: ", files);
        for(let i = 0; i < tests.testNames.length; i++) {

            let pathExtractFile = "";
            //pathExtractFile = diretorio + filteredFiles[i];
            pathExtractFile = diretorio + "functionsFromTest_" + i + ".json";
            console.log(`${i+1}/${tests.testNames.length}. Extraindo features do arquivo: ${"functionsFromTest_" + i + ".json"}`);

            const logHooks = fs.readFileSync(pathExtractFile, 'utf8');
            const objectsExtractFeatures = JSON.parse(logHooks);

            // Extracting Features
            let countInvokeFunPre = objectsExtractFeatures.length;
            let countInvokesWithCallback = 0;
            let totalDelay = 0;
            for(let j = 0; j < objectsExtractFeatures.length; j++) {
                if(objectsExtractFeatures[j].Called_iid.length > 0) {
                    countInvokesWithCallback++;
                    totalDelay += objectsExtractFeatures[j].delayCb_ms;
                }
            }
            let avgDelay = 0;
            avgDelay = totalDelay / countInvokesWithCallback;


            let pathExtractFileAsyncAwait = "";
            pathExtractFileAsyncAwait = diretorio + "tracesFromIt_" + i + ".json";

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

            let testName = tests.testNames[i];
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

            if (i !== tests.testNames.length - 1) {
                fs.writeFileSync(pathextractedFeaturesRaw, stringJSON + ',\n', {flag:'a'});
            }
            else {
                fs.writeFileSync(pathextractedFeaturesRaw, stringJSON + '\n]', {flag:'a'});
            }

        }
    }
    catch (error) {
        console.error('Erro no extract features:', error);
    }
}

module.exports = { extractFeatures };
