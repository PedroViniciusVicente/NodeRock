// 9. Generating the .csv file based on the .json files

const fs = require('fs');
const path = require('path');


function generateCSV(pathProjectFolder, benchmarkName, testsRespectiveFile, testsOriginalFullNameList, testsTotalDuration, awaitIntervalsFromTests, monkeyPatchedPromisesData) {
    console.log("\nGerando o arquivo .CSV:");

    const NODEROCK_INFO_EXTRACTED_RAW_PATH = path.join(pathProjectFolder, "NodeRock_Info", "extractedFeaturesRaw.json");
    const NODEROCK_INFO_EXTRACTED_NORMALIZED_PATH = path.join(pathProjectFolder, "NodeRock_Info", "extractedFeaturesNormalized.json");


    const rawFeaturesJSON = fs.readFileSync(NODEROCK_INFO_EXTRACTED_RAW_PATH, 'utf8');
    const rawFeaturesObject = JSON.parse(rawFeaturesJSON);

    const normalizedFeaturesJSON = fs.readFileSync(NODEROCK_INFO_EXTRACTED_NORMALIZED_PATH, 'utf8');
    const normalizedFeaturesObject = JSON.parse(normalizedFeaturesJSON);

 
    const columns = ['BenchmarkName', 'TestFilePath', 'TestCaseName',
        'InvokeFunPre_Count_Raw', 'InvokeFunPre_Count_Normalized',
        'Invokes_with_callback_Raw', 'Invokes_with_callback_Normalized',
        'Cbs_Total_delay_ms_Raw', 'Cbs_Total_delay_ms_Normalized',
        'Cb_Delays_Greater_Than_100_ms_Raw', 'Cb_Delays_Greater_Than_100_ms_Normalized',
        'InvokesInterval_Greater_Than_100_ms_Raw', 'InvokesInterval_Greater_Than_100_ms_Normalized',
        'AsyncFunction_Count_Raw', 'AsyncFunction_Count_Normalized',
        'Await_Count_Raw', 'Await_Count_Normalized',
        'Unique_Asynchook_ids_Raw', 'Unique_Asynchook_ids_Normalized',

        'totalSettledPromises_Raw', 'totalSettledPromises_Normalized',
        'avgResolved_Raw', 'avgResolved_Normalized',
        'avgRejected_Raw', 'avgRejected_Normalized',
        'longestResolved_Raw', 'longestResolved_Normalized',
        'resolvedPercentage_Raw', 'resolvedPercentage_Normalized',
        'awaitIntervals_Raw', 'awaitIntervals_Normalized',

        'Total_duration_s', 'HasEventRace']
    // adicionar: funcoes com > 100 ms de delay; tempo total do teste; e se o teste falhou ou foi sucesso

    const lines = [];

    // Adding the header line to the csv
    lines.push(columns.join(','));

    // Adding the data to csv
    for (let i = 0; i < rawFeaturesObject.length; i++) {
        const line = [
            benchmarkName, testsRespectiveFile[i], testsOriginalFullNameList[i],
            rawFeaturesObject[i].InvokeFunPre_Count, normalizedFeaturesObject[i].InvokeFunPre_Count,
            rawFeaturesObject[i].Invokes_with_callback, normalizedFeaturesObject[i].Invokes_with_callback,
            rawFeaturesObject[i].Cbs_Total_delay_ms, normalizedFeaturesObject[i].Cbs_Total_delay_ms,
            rawFeaturesObject[i].Cb_Delays_Greater_Than_100_ms, normalizedFeaturesObject[i].Cb_Delays_Greater_Than_100_ms,
            rawFeaturesObject[i].InvokesInterval_Greater_Than_100_ms, normalizedFeaturesObject[i].InvokesInterval_Greater_Than_100_ms,
            rawFeaturesObject[i].AsyncFunction_Count, normalizedFeaturesObject[i].AsyncFunction_Count,
            rawFeaturesObject[i].Await_Count, normalizedFeaturesObject[i].Await_Count,
            rawFeaturesObject[i].Unique_Asynchook_ids, normalizedFeaturesObject[i].Unique_Asynchook_ids,
    
            monkeyPatchedPromisesData[i]?.totalSettledPromises ?? 0, normalizedFeaturesObject[i]?.totalSettledPromises ?? 0,
            monkeyPatchedPromisesData[i]?.avgResolved ?? 0, normalizedFeaturesObject[i]?.avgResolved ?? 0,
            monkeyPatchedPromisesData[i]?.avgRejected ?? 0, normalizedFeaturesObject[i]?.avgRejected ?? 0,
            monkeyPatchedPromisesData[i]?.longestResolved ?? 0, normalizedFeaturesObject[i]?.longestResolved ?? 0,
            monkeyPatchedPromisesData[i]?.resolvedPercentage ?? 0, normalizedFeaturesObject[i]?.resolvedPercentage ?? 0,
            awaitIntervalsFromTests?.[i] ?? 0, normalizedFeaturesObject[i]?.awaitIntervals ?? 0,
    
            testsTotalDuration[i], rawFeaturesObject[i].hasEventRace
        ];
    
        lines.push(line.join(','));
    }
    

    // Unir as linhas em uma string com quebras de linha
    const dataCSV = lines.join('\n');

    // Writing the CSV File
    const csvName = benchmarkName + ".csv";
    const pathCSV = path.resolve(__dirname, "../FoldersUsedDuringExecution/collectedCsvFolder/data.csv");
    if (!fs.existsSync(pathCSV)) {

        console.log(`\nCreating the CSV file in collectedCsvFolder\n`);
        fs.writeFileSync(pathCSV, dataCSV);

    } else {
        console.log(`\nthe CSV file in the collectedCsvFolder already exists\n`);
    }
    

    const NODEROCK_INFO_CSV_PATH = path.join(pathProjectFolder, "NodeRock_Info", csvName);

    if (!fs.existsSync(NODEROCK_INFO_CSV_PATH)) {

        console.log(`\nCreating the CSV file in NodeRock_Info\n`);
        fs.writeFileSync(NODEROCK_INFO_CSV_PATH, dataCSV);
        
    } else {
        console.log(`\nthe CSV file already exists in NodeRock_Info\n`);
    }

}

module.exports = { generateCSV };
