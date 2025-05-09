// 5. Extracting the main features from each test

const fs = require('fs');
const path = require('path');

function extractFeatures() {

    const ANALYZED_PROJECT_FILE = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json");
    const analyzedProjectData = JSON.parse(fs.readFileSync(ANALYZED_PROJECT_FILE, 'utf8'));

    const pathProjectFolder = analyzedProjectData.pathProjectFolder;


    const TEST_NAMES_AND_FILES = path.join(pathProjectFolder, "NodeRock_Info/passingTests.json.log");
    const analyzedProjectTestNamesAndFiles = JSON.parse(fs.readFileSync(TEST_NAMES_AND_FILES, 'utf8'));
    
    const testsOriginalFullNameList = analyzedProjectTestNamesAndFiles.map(test => test.title);

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
            for(let i = 0; i < testsOriginalFullNameList.length; i++) {

                functionFileName = "functionsFromTest_" + i + ".json";
                pathExtractFile = path.join(NODEROCK_INFO_FUNCTIONS_PATH, functionFileName);
                console.log(`${i+1}/${testsOriginalFullNameList.length}. Extraindo features do arquivo: ${"functionsFromTest_" + i + ".json"}`);

                const logHooks = fs.readFileSync(pathExtractFile, 'utf8');
                const objectsExtractFeatures = JSON.parse(logHooks);

                // Extracting Features
                let countInvokeFunPre = objectsExtractFeatures.length;
                let countInvokesWithCallback = 0;
                let totalDelay = 0;
                let delaysGreaterThan100 = 0;
                let invokesIntervalGreaterThan100 = 0;
                for(let j = 0; j < objectsExtractFeatures.length; j++) {

                    if(objectsExtractFeatures[j].Invokes_Interval_ms > 100) {
                        invokesIntervalGreaterThan100++;
                    }

                    if(objectsExtractFeatures[j].Called_iid.length > 0 && objectsExtractFeatures[j].callbackFromItOrDescribe === false) {
                        countInvokesWithCallback++;
                        totalDelay += objectsExtractFeatures[j].delayCb_ms;
                        if(objectsExtractFeatures[j].delayCb_ms > 100) {
                            delaysGreaterThan100++;
                        }
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

                    if (objectsExtractFeaturesAsyncAwait[j].Async_Hook_Id > max_asynchook_id) {
                        max_asynchook_id = objectsExtractFeaturesAsyncAwait[j].Async_Hook_Id;
                    }

                    if (objectsExtractFeaturesAsyncAwait[j].Detected_Hook === "awaitPre") {
                        countAwaits++;
                    }

                    if (objectsExtractFeaturesAsyncAwait[j].Detected_Hook === "asyncFunctionEnter") {
                        countAsyncFunctions++;
                        asyncLines += objectsExtractFeaturesAsyncAwait[j].loc.end.line - objectsExtractFeaturesAsyncAwait[j].loc.start.line;
                    }

                    unique_asynchook_ids_set.add(objectsExtractFeaturesAsyncAwait[j].Async_Hook_Id);

                }
                const unique_asynchook_ids = unique_asynchook_ids_set.size;

                let testName = testsOriginalFullNameList[i];

                const ObjectLogMessage = {
                    "Test_Name": testName,
                    "File_Extract_Features": pathExtractFile,
                    "InvokeFunPre_Count": countInvokeFunPre,
                    "Invokes_with_callback": countInvokesWithCallback,
                    "Cbs_Total_delay_ms": totalDelay,
                    "Average_delay_ms": avgDelay, // total_delay / invokes_with_callback
                    "Cb_Delays_Greater_Than_100_ms": delaysGreaterThan100,
                    "InvokesInterval_Greater_Than_100_ms": invokesIntervalGreaterThan100,
                    "AsyncFunction_Count": countAsyncFunctions,
                    "AsyncFunction_lines": asyncLines,
                    "Await_Count": countAwaits,
                    "Max_Asynchook_id": max_asynchook_id,
                    "Unique_Asynchook_ids": unique_asynchook_ids,
                };

                const stringJSON = JSON.stringify(ObjectLogMessage);

                if (i !== testsOriginalFullNameList.length - 1) {
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
