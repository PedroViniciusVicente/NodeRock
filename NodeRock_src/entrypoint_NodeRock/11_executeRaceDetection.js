// 11. Executes the race detection based on collectedResultsMLFolder to find the event races 

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');


const config = require('./NodeRockConfig.js');

const ROOT_PATH_NODEROCK = path.join(__dirname, "../");


function executeRaceDetection(pathProjectFolder, testFile) {
    // const errorMessage = ['0 passing', '1 test failed', 'timed out', 'Error: ENOENT:', '1 failing'];
    const errorMessage = ['0 passing'];
    
    const RESULTS_CSV_PATH = path.join(__dirname, "../FoldersUsedDuringExecution/collectedResultsMLFolder/resultados_testes.csv");
    console.log("RESULTS_CSV_PATH: ", RESULTS_CSV_PATH);


    // Read and collect data from csv
    const results_csv = fs.readFileSync(RESULTS_CSV_PATH, 'utf-8');

    const parsedData = Papa.parse(results_csv, {
        header: true,  // Usa a primeira linha como cabeçalho
        skipEmptyLines: true, // Ignora linhas vazias
    });

    const testCaseNames = parsedData.data.map(row => row.TestCaseName);
    const positiveLabels = parsedData.data.map(row => row.QuantidadeRotulosPositivo);
    
    // Detecting races
    shell.cd(pathProjectFolder);

    let detectionIterations = 0;

    let arrayNumberOfFails = [];
    let arrayFirstFail = []
    
    let numberOfFails = 0;
    let firstFail = 0;

    const baseNumberOfIterations = 1;
    const multiplyPositiveLabelsToIteration = 0;
    
    const NODEROCK_INFO_NACDRESULTS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "nacdResultsFolder");

    fs.mkdirSync(NODEROCK_INFO_NACDRESULTS_PATH);

    let currentTestWithQuotes; 
    for(let i = 0; i < testCaseNames.length; i++) { // i represents the test case
        
        testCaseNames[i].includes('"') 
        ? currentTestWithQuotes = `'${testCaseNames[i]}'` 
        : currentTestWithQuotes = `"${testCaseNames[i]}"` 

        numberOfFails = 0;
        firstFail = 0;
        detectionIterations = baseNumberOfIterations + multiplyPositiveLabelsToIteration * positiveLabels[i];
        let command = `nacd plain2 ./node_modules/.bin/mocha --exit -t 60000 -R spec ${testFile} -f ${currentTestWithQuotes}`;
        
        console.log(`\n${i+1}/${testCaseNames.length}. Looking for event races in test: ${currentTestWithQuotes}`);
        console.log(`${positiveLabels[i]} Positive Labels == ${detectionIterations} Iterations\n`);
        console.log(`Command used: ${command}`);

        let nacd_individual_test_folder_name = "nacdLogFolderFromTest_" + (i + 1);
        let PATH_NACD_TEST_FOLDERS = path.join(NODEROCK_INFO_NACDRESULTS_PATH, nacd_individual_test_folder_name); 
        fs.mkdirSync(PATH_NACD_TEST_FOLDERS);

        for(let j = 0; j < detectionIterations; j++) { // j represents the iteration of the same test case
            
            console.log(`Iteration: ${j+1}/${detectionIterations}. Test: ${i+1}/${testCaseNames.length}.`);

            let nacd_iteration_file_name = "nacdLogFileFromIteration_" + (j + 1) + ".txt";
            let PATH_NACD_ERROR_FILE = path.join(PATH_NACD_TEST_FOLDERS, nacd_iteration_file_name)

            let execOut = shell.exec(command + `> ${PATH_NACD_ERROR_FILE} 2>&1`);
            // console.log(execOut);

            let fileContent = fs.readFileSync(PATH_NACD_ERROR_FILE, 'utf8');

            if (fileContent.includes(errorMessage)) {

                console.log("ERROR WAS FOUND!!!!");
                numberOfFails++;
                if (firstFail === 0) {
                    firstFail = j;
                }
            }
            shell.exec(`sleep 0.5`);
        }

        arrayNumberOfFails.push(numberOfFails)
        arrayFirstFail.push(firstFail)
    }

    // Returns to NodeRock original path
    shell.cd(`${ROOT_PATH_NODEROCK}`);


    // Generates CSV with race detection results
    // console.log("O VETOR DE RESULTADOS FICOU: ");

    const columns_csv_generate = ['pathProjectFolder', 'testFile', 'testName', 'positiveLabels', 'numberOfIteration', 'numberOfFails', 'firstFail']
    const lines_csv_generate = [];
    lines_csv_generate.push(columns_csv_generate.join(','));
    
    // adding data to the csv
    for(let i = 0; i < testCaseNames.length; i++) {

        testCaseNames[i].includes('"') 
        ? testCaseNames[i] = `"${testCaseNames[i].replace(/"/g, '""')}"`
        : testCaseNames[i] = `"${testCaseNames[i]}"`;

        // talvez seria legal adicionar a procentagem das iteracoes que deram fail, e avaliar se os testes de maior iteracoes tambem apresentam maiores taxas de erro (indicando que o algoritmo de ML esta acertando bem)
        const line_csv_generate = [pathProjectFolder, testFile, testCaseNames[i], positiveLabels[i], baseNumberOfIterations+positiveLabels[i]*multiplyPositiveLabelsToIteration, arrayNumberOfFails[i], arrayFirstFail[i]];

        lines_csv_generate.push(line_csv_generate.join(','));

    }
    const dataCSV = lines_csv_generate.join('\n');

    // Writing the CSV File
    const pathCSV = path.join(__dirname, '../FoldersUsedDuringExecution/collectedResultsRaceDetectionFolder/raceDetectionCSV.csv');
    console.log(`\nCreating the CSV file in collectedResultsRaceDetectionFolder\n`);
    fs.writeFileSync(pathCSV, dataCSV);
}

//nacd plain2 ./node_modules/.bin/mocha --exit -t 10000 -R spec test/archiver.js -f "archiver api #errors should allow continue on stat failing"
// pedroubuntu@Aspire-A514-54:~/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/node-archiver$ nacd plain2 ./node_modules/.bin/_mocha --exit -t 10000 -R spec test/ -f "plugins zip should allow for archive comment"




// let pathProjectFolder = path.join(config.BENCHMARK_PATH, "datasetDoNodeRacer/exploratory/mongo-express");
// let testFile = "test/lib"

// let pathProjectFolder = path.join(config.BENCHMARK_PATH, "datasetDoNodeRacer/exploratory/node-archiver");
// let testFile = "test/";

// let pathProjectFolder = path.join(config.BENCHMARK_PATH, "datasetDoNodeRacer/exploratory/objection.js");
// let testFile = "tests/unit/utils.js";

// let pathProjectFolder = path.join(config.BENCHMARK_PATH, "datasetDoNodeRacer/exploratory/nedb");
// let testFile = "test/";

// let pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/almost_through2-concurrent");
// let testFile = "tests";

// let pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/QingWei-Li_docsify");
// let testFile = "test";

// let pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/SGrondin_bottleneck");
// let testFile = "test";

// let pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/Swaagie_minimize");
// let testFile = "test";

// let pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/animir_node-rate-limiter-flexible");
// let testFile = "test";

// let pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/animir_node-rate-limiter-flexible");
// let testFile = "test";

// let pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "meuDatasetParaTestes/testesSimplesMocha");
// let testFile = "teste/arquivoTestesMocha.js";




const ANALYZED_PROJECT_FILE = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json");
const analyzedProjectData = JSON.parse(fs.readFileSync(ANALYZED_PROJECT_FILE, 'utf8'));

const pathProjectFolder = analyzedProjectData.pathProjectFolder;
const testFile = analyzedProjectData.testFile;

executeRaceDetection(pathProjectFolder, testFile);