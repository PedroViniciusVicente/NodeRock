// 11. Executes the race detection based on collectedResultsMLFolder to find the event races 

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');


const config = require('./NodeRockConfig.js');



function executeRaceDetection(pathProjectFolder, testFile) {
    
    // const errorMessage = ['0 passing', '1 test failed', 'timed out', 'Error: ENOENT:', '1 failing'];
    const errorMessage = ['0 passing'];

    const RESULTS_CSV_PATH = "FoldersUsedDuringExecution/collectedResultsMLFolder/resultados_testes.csv";


    // Read and collect data from csv
    const results_csv = fs.readFileSync(RESULTS_CSV_PATH, 'utf-8');
    const lines_csv = results_csv.split('\n');
    const header_csv = lines_csv[0].split(',');
    
    const indexTestCaseName = header_csv.indexOf('TestCaseName');
    const indexQuantidadeRotulosPositivo = header_csv.indexOf('QuantidadeRotulosPositivo');
    
    const testCaseNames = [];
    const positiveLabels = [];
    for (let i = 1; i < lines_csv.length -1; i++) {
        const columns = lines_csv[i].split(',');
        if (columns[indexTestCaseName]) {
          testCaseNames.push(columns[indexTestCaseName]);
        }
        if(columns[indexQuantidadeRotulosPositivo]) {
            positiveLabels.push(columns[indexQuantidadeRotulosPositivo]);
        }
    }
    
    // Detecting races
    shell.cd(pathProjectFolder);

    let detectionIterations = 0;

    let arrayNumberOfFails = [];
    let arrayFirstFail = []
    
    let numberOfFails = 0;
    let firstFail = 0;

    const baseNumberOfIterations = 10;
    const multiplyPositiveLabelsToIteration = 2;
    
    const NODEROCK_INFO_NACDRESULTS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "nacdResultsFolder");
    fs.mkdirSync(NODEROCK_INFO_NACDRESULTS_PATH);

    for(let i = 0; i < testCaseNames.length; i++) { // i represents the test case
        
        numberOfFails = 0;
        firstFail = 0;
        detectionIterations = baseNumberOfIterations + multiplyPositiveLabelsToIteration * positiveLabels[i];
        let command = `nacd plain2 ./node_modules/.bin/mocha --exit -t 60000 -R spec ${testFile} -f '${testCaseNames[i]}'`;
        
        console.log(`\n${i+1}/${testCaseNames.length}. Looking for event races in test: "${testCaseNames[i]}"`);
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
    shell.cd(`${config.NODEROCK_ROOT_PATH}`);


    // Generates CSV with race detection results
    // console.log("O VETOR DE RESULTADOS FICOU: ");

    const columns_csv_generate = ['pathProjectFolder', 'testFile', 'testName', 'positiveLabels', 'numberOfIteration', 'numberOfFails', 'firstFail']
    const lines_csv_generate = [];
    lines_csv_generate.push(columns_csv_generate.join(','));
    
    // adding data to the csv
    for(let i = 0; i < testCaseNames.length; i++) {
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

// executeRaceDetection(pathProjectFolder, testFile);