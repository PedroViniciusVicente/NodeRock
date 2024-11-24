// 4. Extracting the functions from the traces and calculating their callback times


const fs = require('fs');

function extractFunctions(testsRespectiveFile) {
    console.log("\nGerando a lista com todas as funcoes presentes");

    

    try {
        const diretorio = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
        const notFilteredFiles = fs.readdirSync(diretorio);

        // Filtrar para ler apenas os arquivos de nome tracesFromIt_x.json;
        const regex = /^tracesFromIt_\d+\.json$/;
        const files = notFilteredFiles.filter(file => regex.test(file));


        let destinationFile = "";
        let pathExtractFile = "";

        for(let i = 0; i < files.length; i++) {

            // Antes, precisamos pegar quais são as linhas dos "describe" ou "it" para que eles nao interfiram na contagem de callbacks do teste
            const linhas = fs.readFileSync(testsRespectiveFile[i], 'utf-8').split('\n');

            const resultado = linhas
                .map((linha, index) => ({ linha: linha.trim(), numero: index + 1 }))
                .filter(l => l.linha.startsWith('it(') || l.linha.startsWith('describe('));

            // console.log("Linhas para excluir do teste: ", i);
            // for(let j = 0; j < resultado.length; j++) {
            //     console.log(resultado[j].numero);
            // }

            const numerosLinhas = resultado.map(teste => teste.numero); // Extrair os números das linhas



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
