const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const { chosenProjectFunction } = require('./1_chosenProject');
const { getTestsNames } = require('./2_getTestsNames');
const { executeTests } = require('./3_executeTests');
const { extractFunctions } = require('./4_extractFunctions'); 
const { extractFeatures } = require('./5_extractFeatures');
const { executeMonkeyPatching } = require('./6_executeMonkeyPatching');
const { normalizeFeatures } = require('./7_normalizeFeatures'); 
const { labelFeatures } = require('./8_labelFeatures');
const { generateCSV } = require('./9_generateCSV'); 
const { executePythonML } = require('./10_executePythonML');
const { executeRaceDetection } = require('./11_executeRaceDetection');


const startingNodeRockText = `
 ____  _             _   _               _   _           _                     _    
/ ___|| |_ __ _ _ __| |_(_)_ __   __ _  | \\ | | ___   __| | ___ _ __ ___   ___| | __
\\___ \\| __/ _\` | '__| __| | '_ \\ / _\` | |  \\| |/ _ \\ / _\` |/ _ \\ '__/ _ \\ / __| |/ /
 ___) | || (_| | |  | |_| | | | | (_| | | |\\  | (_) | (_| |  __/ | | (_) | (__|   < 
|____/ \\__\\__,_|_|   \\__|_|_| |_|\\__, | |_| \\_|\\___/ \\__,_|\\___|_|  \\___/ \\___|_|\\_\\
                                 |___/`;

console.log(startingNodeRockText + "\n\n");


const machineLearningClassifyingText = `
 __  __            _     _              _                          _                ____ _               _  __       _                   
|  \\/  | __ _  ___| |__ (_)_ __   ___  | |    ___  __ _ _ __ _ __ (_)_ __   __ _   / ___| | __ _ ___ ___(_)/ _|_   _(_)_ __   __ _       
| |\\/| |/ _\` |/ __| '_ \\| | '_ \\ / _ \\ | |   / _ \\/ _\` | '__| '_ \\| | '_ \\ / _\` | | |   | |/ _\` / __/ __| | |_| | | | | '_ \\ / _\` |      
| |  | | (_| | (__| | | | | | | |  __/ | |__|  __/ (_| | |  | | | | | | | | (_| | | |___| | (_| \\__ \\__ \\ |  _| |_| | | | | | (_| |_ _ _ 
|_|  |_|\\__,_|\\___|_| |_|_|_| |_|\\___| |_____\\___|\\__,_|_|  |_| |_|_|_| |_|\\__, |  \\____|_|\\__,_|___/___/_|_|  \\__, |_|_| |_|\\__, (_|_|_)
                                                                           |___/                               |___/         |___/`;



// 1. Selecting the test file/folder that you want to analyse
chosenProjectFunction();

// 2. Treatments and Path Verifications to Get the test names
getTestsNames();

// 3. Executing the tests individually and placing theirs traces in NodeRock_Info/TracesFolder from loghooks.json
executeTests();

// 4. Extracting the functions from the traces and calculating their callback times
extractFunctions();

// 5. Extracting the main features from each test
extractFeatures();

// 6. Monkey Patching the promises to collect data about the promises executed
executeMonkeyPatching();

// 7. Normalizing the extracted features before applying the ML methods
normalizeFeatures();

// 8. Labeling the extracted features before applying the ML methods
labelFeatures();

// 9. Generating the .csv file based on the .json files
generateCSV();  

// 10. Executes the Python script with the Machine Learning Supervised Models and generate the result.csv
// console.log(machineLearningClassifyingText);
executePythonML();

console.log("\n");
console.log("(Remember to switch to node version 10 to continue with the execution of the race detection script with NACD)\n");

// 11. Executes the race detection based on collectedResultsMLFolder to find the event races 
// executeRaceDetection();



const finishedNodeRockText = `
 _   _           _                     _         _                _           _        ____                      _      _           _ _ 
| \\ | | ___   __| | ___ _ __ ___   ___| | __    / \\   _ __   __ _| |_   _ ___(_)___   / ___|___  _ __ ___  _ __ | | ___| |_ ___  __| | |
|  \\| |/ _ \\ / _\` |/ _ \\ '__/ _ \\ / __| |/ /   / _ \\ | '_ \\ / _\` | | | | / __| / __| | |   / _ \\| '_ \` _ \\| '_ \\| |/ _ \\ __/ _ \\/ _\` | |
| |\\  | (_) | (_| |  __/ | | (_) | (__|   <   / ___ \\| | | | (_| | | |_| \\__ \\ \\__ \\ | |__| (_) | | | | | | |_) | |  __/ ||  __/ (_| |_|
|_| \\_|\\___/ \\__,_|\\___|_|  \\___/ \\___|_|\\_\\ /_/   \\_\\_| |_|\\__,_|_|\\__, |___/_|___/  \\____\\___/|_| |_| |_| .__/|_|\\___|\\__\\___|\\__,_(_)
                                                                    |___/                                 |_|`;

console.log(finishedNodeRockText + "\n");
