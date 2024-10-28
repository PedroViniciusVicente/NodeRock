

const fs = require('fs');

function extractFunctions() {
    console.log("\nGerando a lista com todas as funcoes presentes");
    try {
        const diretorio = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";

        let destinationFile = "";
        let pathExtractFile = "";
        const files = fs.readdirSync(diretorio);
        for(let i = 0; i < files.length; i++) {
            
            destinationFile = diretorio + "functionsFromTest_" + i + ".json";

            console.log(`${i+1}/${files.length}. Selecionando funcoes e calculando delays de Callbacks do arquivo: ${destinationFile}`);

            fs.writeFileSync(destinationFile, '[\n');


            pathExtractFile = diretorio + "tracesFromIt_" + i + ".json";
            const logHooks = fs.readFileSync(pathExtractFile, 'utf8');
            const objectsExtractFeatures = JSON.parse(logHooks);

            let delayCb = 0;
            let callbackMade = [];
            let firstWrite = true;

            let DEBUG = false;
            // LEMBRAR QUE NESSE LACO EH PARA USAR O J
            for (let j = 0; j < objectsExtractFeatures.length; j++)
            {
                if (objectsExtractFeatures[j].Detected_Hook === "invokeFunPre")
                {
                    if (objectsExtractFeatures[j].Makes_CallBack === true)
                    {
                        if(DEBUG) {
                            console.log(`a) A FUNCAO DE IID = ${objectsExtractFeatures[j].iid} FAZ CALLBACKS, 
                                E SEU TIMER EH: ${objectsExtractFeatures[j].timer}`);
                        }

                        // o objeto na posicao k eh o funtionEnter da funcao de callback
                        for (let k = j; k < objectsExtractFeatures.length; k++)
                        {
                            if (objectsExtractFeatures[k].Detected_Hook === "functionEnter" &&
                                objectsExtractFeatures[k].is_Callback === true &&
                                objectsExtractFeatures[k].valueCallerIID === objectsExtractFeatures[j].iid)
                            {

                                if(DEBUG) {
                                    console.log(`b) A FUNCAO DE IID = ${objectsExtractFeatures[k].iid} EH O CALLBACK DA ${objectsExtractFeatures[j].iid}`);
                                }

                                callbackMade.push(objectsExtractFeatures[k].iid);
                                delayCb = objectsExtractFeatures[k].timer - objectsExtractFeatures[j].timer;

                                // o objeto na posicao l eh o functionExit da funcao de callback
                                // for (l = k; l < objectsExtractFeatures.length; l++)
                                // {
                                //     if (objectsExtractFeatures[l].Detected_Hook === "functionExit" &&
                                //         objectsExtractFeatures[l].iid === objectsExtractFeatures[k].iid)
                                //     {
                                //         if(DEBUG) {
                                //             console.log(`c) A FUNCAO DE CALLBACK TERMINA NO TIMER: ${objectsExtractFeatures[l].timer}`);
                                //         }

                                //         // delayCb = timerDoFunctionExit - timerDoInvokeFunPre
                                //         // ESSE RUNTIME NA VERDADE SERIA A DEMORA PARA UM CALLBACK COMECAR A SER EXECUTADO A PARTIR DO MOMENTO QUE ELE FOI INVOCADO
                                //         delayCb = objectsExtractFeatures[l].timer - objectsExtractFeatures[j].timer;
                                //         // TALVEZ LEMBRAR DE ZERAR O delayCb PRA NAO DAR ERRO??
                                //         break;
                                //     }
                                // }
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
                    

                    const ObjectLogMessage = {
                        "Name": objectsExtractFeatures[j].Function_Name,
                        "iid": objectsExtractFeatures[j].iid,
                        "File_Path": objectsExtractFeatures[j].File_Path,
                        "loc": objectsExtractFeatures[j].loc,
                        "delayCb_ms": delayCb,
                        //"Args": objectsExtractFeatures[j].args,
                        "Called_iid": callbackMade,
                    };
                    callbackMade = [] // zerando o vetor
                    delayCb = 0;
            
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
        }

    } catch(error) {
        console.error("Erro foi detectado no gerando a lista das funcoes: ", error);
    }
}

module.exports = { extractFunctions };
