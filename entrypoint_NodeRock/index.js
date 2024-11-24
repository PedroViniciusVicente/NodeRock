const shell = require('shelljs');
const fs = require('fs');
//const path = require('path');

const { chosenProjectFunction } = require('./1_chosenProject');
const { getTestsNames } = require('./2_getTestsNames');
const { executeTests } = require('./3_executeTests');
const { extractFunctions } = require('./4_extractFunctions'); 
const { extractFeatures } = require('./5_extractFeatures');
const { normalizeFeatures } = require('./6_normalizeFeatures'); 
const { labelFeatures } = require('./7_labelFeatures');
const { generateCSV } = require('./8_generateCSV'); 



shell.echo("COMECOU!");

// 1. Selecting the test file/folder that you want to analyse
const chosenProject = chosenProjectFunction();
//console.log("The selected project is: ", chosenProject);


// 2. Treatments and Path Verifications to Get the test names
const tests = getTestsNames(chosenProject.pathProjectFolder, chosenProject.testFile);

//console.log(tests.testsFullNameList);
// for(let i = 0; i < tests.testsFullNameList.length; i++) {
//     console.log(i+1 + ". " + tests.testsFullNameList[i]);
// }


// 3. Executing the tests individually and placing theirs traces in collectedTracesFolder
testsTotalDuration = executeTests(tests.testsFullNameList, tests.testsRespectiveFile, chosenProject);
// for(let i = 0; i < testsTotalDuration.length; i++) {
//     console.log("Duracao foi: ", testsTotalDuration[i]);
// }
// 4. Extracting the functions from the traces and calculating their callback times
extractFunctions(tests.testsRespectiveFile);

// 5. Extracting the main features from each test
extractFeatures(tests.testsFullNameList);

// 6. Normalizing the extracted features before applying the ML methods
normalizeFeatures();

// 7. Labeling the extracted features before applying the ML methods
labelFeatures(chosenProject.raceConditionTests);

// 8. Generating the .csv file based on the .json files
generateCSV(chosenProject.benchmarkName, tests.testsRespectiveFile, testsTotalDuration);



shell.echo("TERMINOU!");