// 8. Generating the .csv file based on the .json files

const fs = require('fs');

const pathRawFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesResume.json";
const pathNormalizedFeatures = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesLabeled.json";

function generateCSV() {
    console.log("\nGerando o arquivo .CSV:");

    const rawFeaturesJSON = fs.readFileSync(pathRawFeatures, 'utf8');
    const rawFeaturesObject = JSON.parse(rawFeaturesJSON);

    const normalizedFeaturesJSON = fs.readFileSync(pathNormalizedFeatures, 'utf8');
    const normalizedFeaturesObject = JSON.parse(normalizedFeaturesJSON);

 
    const columns = ['BenchmarkName', 'TestFilePath', 'TestCaseName',
        'InvokeFunPre_Count_Raw', 'InvokeFunPre_Count_Normalized','Invokes_with_callback_Raw', 'Invokes_with_callback_Normalized',
        'Total_delay_ms_Raw', 'Total_delay_ms_Normalized', 'AsyncFunction_Count_Raw', 'AsyncFunction_Count_Raw',
        'Await_Count_Raw', 'Await_Count_Normalized', 'Unique_Asynchook_ids_Raw', 'Unique_Asynchook_ids_Normalized',
        'HasEventRace']
    // adicionar: funcoes com > 100 ms de delay; tempo total do teste; e se o teste falhou ou foi sucesso

    const lines = [];

    // Adding the header line to the csv
    lines.push(columns.join(','));

    // Adding the data to csv
    for (let i = 0; i < rawFeaturesObject.length; i++) {

        let hasEventRace;
        if(rawFeaturesObject[i].Has_RaceCondition === true) {
            hasEventRace = "True";
        }
        else if(rawFeaturesObject[i].Has_RaceCondition === false) {
            hasEventRace = "False";
        }
        else {
            hasEventRace = "Undefined";
        }

        const line = `${rawFeaturesObject[i].},${rawFeaturesObject[i].},${rawFeaturesObject[i].Test_Name},
        ${rawFeaturesObject[i].InvokeFunPre_Count},${normalizedFeaturesObject[i].InvokeFunPre_Count},
        ${rawFeaturesObject[i].Invokes_with_callback},${normalizedFeaturesObject[i].Invokes_with_callback},
        ${rawFeaturesObject[i].Total_delay_ms}.${normalizedFeaturesObject[i].Total_delay_ms},
        ${rawFeaturesObject[i].AsyncFunction_Count},${normalizedFeaturesObject[i].AsyncFunction_Count},
        ${rawFeaturesObject[i].Await_Count},${normalizedFeaturesObject[i].Await_Count},
        ${rawFeaturesObject[i].Unique_Asynchook_ids},${normalizedFeaturesObject[i].Unique_Asynchook_ids},
        ${hasEventRace}`;

        lines.push(line);
    }

    // Unir as linhas em uma string com quebras de linha
    const dataCSV = lines.join('\n');

    // Escrever o arquivo CSV
    const pathCSV = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/data.csv";
    fs.writeFile(pathCSV, dataCSV, 'utf8', (err) => {
    if (err) {
        console.error('Erro ao criar o arquivo CSV:', err);
    } else {
        console.log('Arquivo CSV criado com sucesso!');
    }
    });
}