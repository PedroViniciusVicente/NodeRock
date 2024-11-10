// 8. Applying knn on the tests features to try to find tests that are most likely to have race conditions

const fs = require('fs');

const pathExtractedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesLabeled.json";

function carregarDados() {
    const featuresJSON = fs.readFileSync(pathExtractedFeatures, 'utf8');
    const featuresObject = JSON.parse(featuresJSON);

    // Transformar em matriz de arrays
    const pontos = featuresObject.map(obj => [
        obj.InvokeFunPre_Count,
        obj.Invokes_with_callback,
        obj.Total_delay_ms,
        obj.Average_delay_ms,
        obj.AsyncFunction_Count,
        obj.AsyncFunction_lines,
        obj.Await_Count,
        obj.Max_Asynchook_id,
        obj.Unique_Asynchook_ids,
        obj.Has_RaceCondition
    ]);

    return { pontos, featuresObject }; // Retornar ambos para uso posterior
}

// Função para calcular a distância Euclidiana entre dois pontos
function calculateDistance(point1, point2) {
    const distance_InvokeFunPre_Count = point1.InvokeFunPre_Count - point2.InvokeFunPre_Count;
    const distance_Invokes_with_callback = point1.Invokes_with_callback - point2.Invokes_with_callback;
    const distance_Total_delay_ms = point1.Total_delay_ms - point2.Total_delay_ms;
    const distance_Average_delay_ms = point1.Average_delay_ms - point2.Average_delay_ms;
    const distance_AsyncFunction_Count = point1.AsyncFunction_Count - point2.AsyncFunction_Count;
    const distance_AsyncFunction_lines = point1.AsyncFunction_lines - point2.AsyncFunction_lines;
    const distance_Await_Count = point1.Await_Count - point2.Await_Count;
    const distance_Unique_Asynchook_ids = point1.Unique_Asynchook_ids - point2.Unique_Asynchook_ids;


    return Math.sqrt(distance_InvokeFunPre_Count * distance_InvokeFunPre_Count + 
        distance_Invokes_with_callback * distance_Invokes_with_callback +
        distance_Total_delay_ms * distance_Total_delay_ms +
        distance_Average_delay_ms * distance_Average_delay_ms +
        distance_AsyncFunction_Count * distance_AsyncFunction_Count +
        distance_AsyncFunction_lines * distance_AsyncFunction_lines +
        distance_Await_Count * distance_Await_Count +
        distance_Unique_Asynchook_ids * distance_Unique_Asynchook_ids
    );
}

// Função para classificar os objetos sem `Has_RaceCondition`
function classifyDataWithoutCondition(k, data) {
    //console.log(data);
    for (let i = 0; i < data.length; i++) {
        const target = data[i];
        
        // Verifica se o ponto não possui `Has_RaceCondition`
        if (!('Has_RaceCondition' in target)) {
            // Array para armazenar as distâncias entre `target` e pontos com `Has_RaceCondition`
            let distances = [];

            // Calcula a distância para cada ponto que possui `Has_RaceCondition`
            for (let j = 0; j < data.length; j++) {
                const neighbor = data[j];
                
                // Apenas considera os pontos com `Has_RaceCondition`
                if ('Has_RaceCondition' in neighbor) {
                    const distance = calculateDistance(target, neighbor);
                    // o vetor distances armazena a tupla que contem o label e a distancia 
                    distances.push({ Has_RaceCondition: neighbor.Has_RaceCondition, distance: distance });
                }
            }


            distances.sort((a, b) => a.distance - b.distance);


            // Conta as ocorrências de `true` e `false` nos k vizinhos mais próximos
            let trueCount = 0;
            let falseCount = 0;

            //console.log("o valor de k eh: ", k);
            //console.log("o valor de distances.length eh: ", distances.length);
            for (let p = 0; p < k && p < distances.length; p++) {
                if (distances[p].Has_RaceCondition) {
                    trueCount++;
                } else {
                    falseCount++;
                }
            }

            // Define `Has_RaceCondition` para o `target` com base na maioria dos vizinhos
            target.May_Have_RaceCondition = trueCount > falseCount;

            // Imprime o resultado para esse ponto
        }
    }
}

// Executa a classificação para os objetos sem `Has_RaceCondition` usando KNN
const { pontos, featuresObject } = carregarDados();

const k = 1;
classifyDataWithoutCondition(k, featuresObject);

for(let i = 0; i < featuresObject.length; i++) {
    if('Has_RaceCondition' in featuresObject[i]) {
        if(featuresObject[i].Has_RaceCondition === true) {
            console.log(`++ ${i+1}/${featuresObject.length}. "${featuresObject[i].Test_Name}" has a race condition`)
        }
        else {
            console.log(`-- ${i+1}/${featuresObject.length}. "${featuresObject[i].Test_Name}" does NOT have a race condition`)
        }
    }
    else {
        if(featuresObject[i].May_Have_RaceCondition === true) {
            console.log(`+ ${i+1}/${featuresObject.length}. "${featuresObject[i].Test_Name}" may have a race condition`)
        }
        else {
            console.log(`- ${i+1}/${featuresObject.length}. "${featuresObject[i].Test_Name}" may NOT have a race condition`)
        }

    }
}


// Exibe o conjunto de dados atualizado
//console.log("Dados atualizados:", pontos);
