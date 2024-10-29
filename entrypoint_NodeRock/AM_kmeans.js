const fs = require('fs');
const { kmeans } = require('ml-kmeans');  // Correct import syntax

const pathExtractedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesResume.json";

//const pathExtractedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolderNodeArchiver3/extractedFeaturesResume.json";
//const pathExtractedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolderNEDB/extractedFeaturesResume.json";

// Load data from JSON
function carregarDados() {
    const featuresJSON = fs.readFileSync(pathExtractedFeatures, 'utf8');
    const featuresObject = JSON.parse(featuresJSON);
    
    // Transform into matrix of arrays
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
    return pontos;
}

async function aplicarKmeans(k) {
    const pontos = carregarDados();
    
    // Execute K-means with K clusters
    // kmeans() accepts options as the third parameter
    const options = {
        initialization: 'kmeans++',
        iterations: 100
    };
    
    const resultado = kmeans(pontos, k, options);

    console.log("Centroides:", resultado.centroids);
    console.log("Labels:", resultado.clusters);
    
    // Additional information you might find useful
    console.log("Number of iterations:", resultado.iterations);
    console.log("Converged:", resultado.converged);
    console.log("Error:", resultado.error);
}

// Proper promise handling
aplicarKmeans(3)
    .catch(err => {
        console.error("Error occurred:", err);
    });