// 8. Applying kmenas on the tests features to try to find tests that are most likely to have race conditions


const fs = require('fs');
const { kmeans } = require('ml-kmeans');

const pathExtractedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesResume.json";

// 77 e 79: testes que apresentam race condition 
//const pathExtractedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolderNEDB/extractedFeaturesResume.json";

// 21: teste que apresenta race condition
//const pathExtractedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolderNodeArchiver/extractedFeaturesResume.json";

// Carregar dados do JSON
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
        obj.Max_Asynchook_id
    ]);

    return { pontos, featuresObject }; // Retornar ambos para uso posterior
}

// Função assíncrona para aplicar K-means
async function aplicarKmeans(k) {
    const { pontos, featuresObject } = carregarDados();

    // Configurações para o algoritmo K-means
    const options = {
        initialization: 'kmeans++',
        iterations: 100
    };

    const resultado = kmeans(pontos, k, options);

    console.log("Labels:", resultado.clusters);
    console.log("Número de iterações:", resultado.iterations);
    console.log("Convergiu:", resultado.converged);
    console.log("Erro:", resultado.error);

    // Exibir os testes que pertencem a cada cluster
    for (let j = 0; j < k; j++) {
        console.log(`\nTestes do Cluster ${j}:`);
        //featuresObject.forEach((feature, i) => {
        for (let i = 0; i < featuresObject.length; i++) {
            if (resultado.clusters[i] === j) {
                console.log(`- ${i+1}/${featuresObject.length}. ${featuresObject[i].Test_Name}`);
            }
        }
    }

    //return resultado.clusters;
}

// Definir quantidade de clusters e chamar a função com Promise
let kClusters = 3;
aplicarKmeans(kClusters).catch(err => {
    console.error("Erro ocorrido:", err);
});
