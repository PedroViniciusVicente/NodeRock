// 8. Labeling the extracted features before applying the ML methods

const fs = require('fs');
const path = require('path');


function labelFeatures(pathProjectFolder, raceConditionTests) {

    const NODEROCK_INFO_EXTRACTED_RAW_PATH = path.join(pathProjectFolder, "NodeRock_Info", "extractedFeaturesRaw.json");

    const rawFeaturesJSON = fs.readFileSync(NODEROCK_INFO_EXTRACTED_RAW_PATH, 'utf8');
    const rawFeaturesObject = JSON.parse(rawFeaturesJSON);

    let raceConditionTestsFound = 0;

    for (let i = 0; i < rawFeaturesObject.length; i++) {

        if(raceConditionTests.includes(rawFeaturesObject[i].Test_Name)) {
            rawFeaturesObject[i].hasEventRace = "True";
            raceConditionTestsFound++;
        }
        else if(rawFeaturesObject[i].Invokes_with_callback === 0 && rawFeaturesObject[i].AsyncFunction_Count === 0) {
            rawFeaturesObject[i].hasEventRace = "False";
        }
        else {
            rawFeaturesObject[i].hasEventRace = "Undefined";
        }
    }

    // Talvez trocar por um throw de um error aqui!!
    if(raceConditionTestsFound !== raceConditionTests.length) {
        console.log("ERRO: ALGUM TESTE QUE EH RACECONDITION NAO FOI ENCONTRADO E ROTULADO CORRETAMENTE!!");
    }

    const jsonData = JSON.stringify(rawFeaturesObject, null, 2);
    fs.writeFileSync(NODEROCK_INFO_EXTRACTED_RAW_PATH, jsonData);

}

module.exports = { labelFeatures };