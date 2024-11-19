// 7. Labeling the extracted features before applying the ML methods

const fs = require('fs');

const pathRawFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesRaw.json";

function labelFeatures(raceConditionTests) {

    const rawFeaturesJSON = fs.readFileSync(pathRawFeatures, 'utf8');
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
    fs.writeFileSync(pathRawFeatures, jsonData);

}

module.exports = { labelFeatures };