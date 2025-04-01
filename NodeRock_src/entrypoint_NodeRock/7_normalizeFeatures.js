// 7. Normalizing the extracted features before applying the ML methods

const fs = require('fs');
const path = require('path');

// Função para normalizar um único valor
const normalizeValue = (value, min, max) => {
    return (value - min) / (max - min);
};

function normalizeFeatures(awaitIntervalsFromTests, monkeyPatchedPromisesData) {

    const ANALYZED_PROJECT_FILE = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json");
    const analyzedProjectData = JSON.parse(fs.readFileSync(ANALYZED_PROJECT_FILE, 'utf8'));

    const pathProjectFolder = analyzedProjectData.pathProjectFolder;

    
    const NODEROCK_INFO_EXTRACTED_RAW_PATH = path.join(pathProjectFolder, "NodeRock_Info", "extractedFeaturesRaw.json");
    const NODEROCK_INFO_EXTRACTED_NORMALIZED_PATH = path.join(pathProjectFolder, "NodeRock_Info", "extractedFeaturesNormalized.json");

    if (!fs.existsSync(NODEROCK_INFO_EXTRACTED_NORMALIZED_PATH)) {

        console.log(`\nCreating the normalized features file in NodeRock_Info\n`);

        const featuresJSON = fs.readFileSync(NODEROCK_INFO_EXTRACTED_RAW_PATH, 'utf8');
        const featuresObject = JSON.parse(featuresJSON);

        // Adicionando os valores coletados no Moneky Patching
        for(let i = 0; i < featuresObject.length; i++) {
            featuresObject[i] = {...featuresObject[i], ...monkeyPatchedPromisesData[i], awaitIntervals: awaitIntervalsFromTests[i] }
            // console.log("\n\nO OBJETO CONCATENADO FICOU ASSIM: ");
            // console.log(featuresObject[i]);
        }


        // Obter os valores min e max de cada atributo numerico que é colocado no extract features
        const numericFields = {};
        
        for (let i = 0; i < featuresObject.length; i++) {
            const currentObject = featuresObject[i];
            const keys = Object.keys(currentObject); // esse keys na verdade são os nomes dos atributos do objeto

            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                const value = currentObject[key];
                
                // Ignora campos não numéricos
                if (typeof value !== 'number') continue;
                
                // Se é a primeira vez que encontramos este campo
                if (!numericFields[key]) {
                    numericFields[key] = {
                        minValue: value,
                        maxValue: value
                    };
                } else {
                    // Atualiza min e max se necessário
                    numericFields[key].minValue = Math.min(numericFields[key].minValue, value);
                    numericFields[key].maxValue = Math.max(numericFields[key].maxValue, value);
                }
            }
        }

        // Normalizacao dos dados
        const normalizedData = [];

        // Normaliza os dados
        for (let i = 0; i < featuresObject.length; i++) {
            const item = featuresObject[i];
            const normalizedItem = { ...item };
            const keys = Object.keys(item);
            
            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                const value = item[key];
                
                if (numericFields[key]) {
                    const min = numericFields[key].minValue;
                    const max = numericFields[key].maxValue;
                    // Só normaliza se min e max forem diferentes
                    if (min !== max) {
                        normalizedItem[key] = normalizeValue(value, min, max);
                    }
                    else if (min === max && min !== 0) { // os valores sao iguais e diferentes de zero
                        normalizedItem[key] = 1;
                    }
                    else { // os valores sao iguais a zero
                        normalizedItem[key] = 0;
                    }
                }
            }
            
            normalizedData.push(normalizedItem);
        }

        const jsonData = JSON.stringify(normalizedData, null, 2);
        fs.writeFileSync(NODEROCK_INFO_EXTRACTED_NORMALIZED_PATH, jsonData);
        //return normalizedData;
    } else {
        console.log(`\nthe normalized features file already exists in NodeRock_Info\n`);
    }

    
}

// const normalizedFeatures = normalizeFeatures();
// console.log(normalizedFeatures);

module.exports = { normalizeFeatures };
