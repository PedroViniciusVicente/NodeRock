// 4. Extracting the functions from the traces and calculating their callback times


const fs = require('fs');
const path = require('path');

const extractingFeaturesText = `
 _____      _                  _   _               _____          _                             
| ____|_  _| |_ _ __ __ _  ___| |_(_)_ __   __ _  |  ___|__  __ _| |_ _   _ _ __ ___  ___       
|  _| \\ \\/ / __| '__/ _\` |/ __| __| | '_ \\ / _\` | | |_ / _ \\/ _\` | __| | | | '__/ _ \\/ __|      
| |___ >  <| |_| | | (_| | (__| |_| | | | | (_| | |  _|  __/ (_| | |_| |_| | | |  __/\\__ \\_ _ _ 
|_____/_/\\_\\\\__|_|  \\__,_|\\___|\\__|_|_| |_|\\__, | |_|  \\___|\\__,_|\\__|\\__,_|_|  \\___||___(_|_|_)
                                           |___/`;

function extractFunctions() {

    console.log(extractingFeaturesText);

    const ANALYZED_PROJECT_FILE = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json");
    const analyzedProjectData = JSON.parse(fs.readFileSync(ANALYZED_PROJECT_FILE, 'utf8'));
    const pathProjectFolder = analyzedProjectData.pathProjectFolder;

    const TEST_NAMES_AND_FILES = path.join(pathProjectFolder, "NodeRock_Info/passingTests.json.log");
    const analyzedProjectTestNamesAndFiles = JSON.parse(fs.readFileSync(TEST_NAMES_AND_FILES, 'utf8'));
    const testsRespectiveFile = analyzedProjectTestNamesAndFiles.map(test => test.file);

    const NODEROCK_INFO_TRACES_PATH = path.join(pathProjectFolder, "NodeRock_Info", "tracesFolder");
    
    const NODEROCK_INFO_FUNCTIONS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "functionsFolder");

    const NODEROCK_INFO_AWAITS_FILE = path.join(pathProjectFolder, "NodeRock_Info", "awaitIntervals.json")

    let awaitIntervalsFromTests = [];

    if (!fs.existsSync(NODEROCK_INFO_FUNCTIONS_PATH)) {

        console.log(`\nCreating NodeRock_Info/functionsFolder in ${pathProjectFolder}\n`);
        fs.mkdirSync(NODEROCK_INFO_FUNCTIONS_PATH);
        
        try {
            const files = fs.readdirSync(NODEROCK_INFO_TRACES_PATH);

            for(let i = 0; i < files.length; i++) {

                // Antes, precisamos pegar quais são as linhas dos "describe" ou "it" para que eles nao interfiram na contagem de callbacks do teste
                const linhas = fs.readFileSync(testsRespectiveFile[i], 'utf-8').split('\n');

                // Desconsidera as funcoes do it e do Describe
                const resultado = linhas
                    .map((linha, index) => ({ linha: linha.trim(), numero: index + 1 }))
                    .filter(l => l.linha.startsWith('it(') || l.linha.startsWith('describe('));

                // console.log("Linhas para excluir do teste: ", i);
                // for(let j = 0; j < resultado.length; j++) {
                //     console.log(resultado[j].numero);
                // }

                const numerosLinhas = resultado.map(teste => teste.numero); // Extrair os números das linhas


                const functionFileName = "functionsFromTest_" + i + ".json";
                const destinationFile = path.join(NODEROCK_INFO_FUNCTIONS_PATH, functionFileName);

                console.log(`${i+1}/${files.length}. Selecionando funcoes e calculando delays de Callbacks do arquivo: ${destinationFile}`);

                fs.writeFileSync(destinationFile, '[\n');


                const tracesFileName = "tracesFromIt_" + i + ".json";
                const pathExtractFile = path.join(NODEROCK_INFO_TRACES_PATH, tracesFileName);

                const logHooks = fs.readFileSync(pathExtractFile, 'utf8');
                const objectsExtractFeatures = JSON.parse(logHooks);

                let delayCb = 0;
                let invokesInterval = 0;
                let awaitsInterval = 0;
                let callbackMade = [];
                let firstWrite = true;

                let DEBUG = false;
                // LEMBRAR QUE NESSE LACO EH PARA USAR O J
                
                for (let j = 0; j < objectsExtractFeatures.length; j++)
                {
                    if (objectsExtractFeatures[j].Detected_Hook === "awaitPre")
                    {
                        for(let l = j; l < objectsExtractFeatures.length; l++)
                        {
                            if(objectsExtractFeatures[l].Detected_Hook === "awaitPost" && 
                                objectsExtractFeatures[l].iid === objectsExtractFeatures[j].iid)
                            {
                                awaitsInterval += objectsExtractFeatures[l].timer - objectsExtractFeatures[j].timer;
                                break;
                            }
                        }
                    }

                    if (objectsExtractFeatures[j].Detected_Hook === "invokeFunPre")
                    {
                        for(let l = j; l < objectsExtractFeatures.length; l++)
                        {
                            if(objectsExtractFeatures[l].Detected_Hook === "invokeFun" && 
                                objectsExtractFeatures[l].iid === objectsExtractFeatures[j].iid)
                            {
                                invokesInterval = objectsExtractFeatures[l].timer - objectsExtractFeatures[j].timer;
                                break;
                            }
                        }

                        if (objectsExtractFeatures[j].Makes_CallBack === true)
                        {
                            if(DEBUG) {
                                console.log(`a) A FUNCAO DE IID = ${objectsExtractFeatures[j].iid} FAZ CALLBACKS, E SEU TIMER EH: ${objectsExtractFeatures[j].timer}`);
                            }

                            // o objeto na posicao k eh o funtionEnter da funcao de callback
                            // NOTE: UM CALLBACKMADE SERA MARCADO APENAS SE TIVER O RESPECTIVO FUNCTIONENTER DO INVOKEFUNPRE
                            for (let k = j; k < objectsExtractFeatures.length; k++)
                            {
                                if (objectsExtractFeatures[k].Detected_Hook === "functionEnter" &&
                                    objectsExtractFeatures[k].is_Callback === true &&
                                    objectsExtractFeatures[k].valueCallerIID === objectsExtractFeatures[j].iid)
                                {

                                    if(DEBUG) {
                                        console.log(`b) A FUNCAO DE IID = ${objectsExtractFeatures[k].iid} EH O CALLBACK DA ${objectsExtractFeatures[j].iid}\n`);
                                    }

                                    callbackMade.push(objectsExtractFeatures[k].iid);
                                    delayCb = objectsExtractFeatures[k].timer - objectsExtractFeatures[j].timer;
                                    break;
                                }
                            }
                        }
                        // else { // funcoes invocadas que nao fazem callback
                        //     for (let k = 0; k < objectsExtractFeatures.length; k++)
                        //     {
                        //         if (objectsExtractFeatures[k].Detected_Hook === "invokeFun" && 
                        //             objectsExtractFeatures[k].iid === objectsExtractFeatures[j].iid)
                        //         {
                        //             delayCb = objectsExtractFeatures[k].timer - objectsExtractFeatures[j].timer;
                        //         }
                        //     }
                        // }
                        
                        let callbackFromItOrDescribe = false;
                        if (objectsExtractFeatures[j].File_Path === testsRespectiveFile[i] && numerosLinhas.includes(objectsExtractFeatures[j].loc.start.line)) {
                            callbackFromItOrDescribe = true;
                        }

                        const ObjectLogMessage = {
                            "Name": objectsExtractFeatures[j].Function_Name,
                            "iid": objectsExtractFeatures[j].iid,
                            "File_Path": objectsExtractFeatures[j].File_Path,
                            "loc": objectsExtractFeatures[j].loc,
                            "delayCb_ms": delayCb,
                            //"Args": objectsExtractFeatures[j].args,
                            "Called_iid": callbackMade,
                            "callbackFromItOrDescribe": callbackFromItOrDescribe,
                            "Invokes_Interval_ms": invokesInterval,
                        };
                        callbackMade = [] // zerando o vetor
                        delayCb = 0;
                        // awaitsInterval = 0;
                
                        const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                        if(firstWrite) {
                            fs.writeFileSync(destinationFile, stringJSON, {flag:'a'});
                            firstWrite = false;
                        }
                        else {
                            fs.writeFileSync(destinationFile, ',\n' + stringJSON, {flag:'a'});
                        }
                    }

                    if(j === objectsExtractFeatures.length - 1) {
                        fs.writeFileSync(destinationFile, '\n]', {flag:'a'});
                    }
                }
                
                awaitIntervalsFromTests.push(awaitsInterval);
                awaitsInterval = 0;
            }

            if (!fs.existsSync(NODEROCK_INFO_AWAITS_FILE)) {
            
                console.log(`\nCreating NodeRock_Info/awaitIntervals.json in ${NODEROCK_INFO_AWAITS_FILE}\n`);
                fs.writeFileSync(NODEROCK_INFO_AWAITS_FILE, JSON.stringify(awaitIntervalsFromTests));
    
            } else {
                console.log(`\nNodeRock_Info/awaitIntervals.json already exists in ${NODEROCK_INFO_AWAITS_FILE}\n`);
            }

        } catch(error) {
            console.error("Erro foi detectado no gerando a lista das funcoes: ", error);
        }

    } else {
        console.log(`\nNodeRock_Info/functionsFolder already exists in ${pathProjectFolder}\n`);
    }



}

module.exports = { extractFunctions };
