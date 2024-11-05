// 7. Labeling the extracted features before applying the ML methods

const fs = require('fs');

function labelFeatures(normalizedObjects, raceConditionTests) {
    //console.log(normalizedObjects)
    let raceConditionTestsFound = 0;

    for(let i = 0; i < normalizedObjects.length; i++) {
        if(normalizedObjects[i].Invokes_with_callback === 0 && normalizedObjects[i].AsyncFunction_Count === 0) {
            normalizedObjects[i].Has_RaceCondition = false;
        }
        else {
            for(let j = 0; j < raceConditionTests.length; j++) {
                if(normalizedObjects[i].Test_Name === raceConditionTests[j]) {
                    normalizedObjects[i].Has_RaceCondition = true;
                    raceConditionTestsFound++;
                    break;
                }
            }
        }
    }

    // Talvez trocar por um throw de um error aqui!!
    if(raceConditionTestsFound !== raceConditionTests.length) {
        console.log("ERRO: ALGUM TESTE QUE EH RACECONDITION NAO FOI ENCONTRADO E ROTULADO CORRETAMENTE!!");
    }

    const jsonData = JSON.stringify(normalizedObjects, null, 2);

    const pathExtractedFeaturesLabeled = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesLabeled.json";

    try {
        fs.writeFileSync(pathExtractedFeaturesLabeled, jsonData);
        console.log("Arquivo 'dados.json' criado com sucesso!");
    } catch (err) {
        console.error("Erro ao escrever o arquivo", err);
    }


}

module.exports = { labelFeatures };