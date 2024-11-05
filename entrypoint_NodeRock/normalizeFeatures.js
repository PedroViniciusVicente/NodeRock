// 5. Normalizing and rotulating the extracted features before applying the ML methods

const fs = require('fs');

//const pathExtractedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesResume.json";
const pathExtractedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolderNodeArchiver/extractedFeaturesResume.json";


// Função para normalizar um único valor
const normalizeValue = (value, min, max) => {
    return (value - min) / (max - min);
};

function normalizeFeatures() {
    const featuresJSON = fs.readFileSync(pathExtractedFeatures, 'utf8');
    const featuresObject = JSON.parse(featuresJSON);


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
            }
        }
        
        normalizedData.push(normalizedItem);
    }
    
    return normalizedData;
}

const normalizedFeatures = normalizeFeatures();
console.log(normalizedFeatures);