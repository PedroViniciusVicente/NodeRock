const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

shell.echo("COMECOU!");

let pathProjectFolder = "";
let testFile = "";
let parameters = "";
let isMocha = true;

// 1) CHOOSING THE TEST FILE THAT YOU WANT TO ANALYSE
let chosenProject = "MeuTestVerificarRuntimes";

switch (chosenProject) {
    case "MeuTestMocha":
        console.log("Executando analise do meu teste simples em Mocha");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/";
        testFile = "teste";
        //testFile = "teste/testeMenor.js";
        break;

    case "MeuTestJest":
        console.log("Executando analise do meu teste simples em Jest");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesJest/";
        testFile = "teste/testandoJest.test.js";
        parameters = "--runInBand"; // Roda os testes sequenciamente (em batch), e não paralelamente
        isMocha = false;
        break;
    
    case "MeuTestVerificarRuntimes":
        console.log("Executando analise do runtime");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesVerificarTempo/";
        testFile = "test/test.js";
        break;

    // Obs: o FPS funciona, mas ele eh apenas 1 teste e ele so printa o sucesso do teste caso esteja usando o node v10 (nvm use 10) 
    case "FPS": // known-bugs
        console.log("Executando analise do fiware-pep-steelskin");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/fiware-pep-steelskin/";
        testFile = "test/unit/race_simple.js";
        parameters = "--timeout 50000";
        break;

    // Obs: o NES nao conseguiu ser analisado, (apenas testado). Ele exige o node v10 e parece que ele usa uma lib que n eh mocha nem jest
    case "NES": // known-bugs
        console.log("Executando analise do nes");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/nes/";
        testFile = "test/client_TP.js";
        break;

    case "DEL": // known-bugs, funciona muito bem, porem estou usando outro arquivo como entrypoint para teste
        console.log("Executando analise do del");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/del/";
        testFile = "test.js";
        break;

    // Obs: o XLS nao conseguiu ser analisado, (apenas testado). Ele exige o node v10
    case "XLS": // known-bugs
        console.log("Executando analise do xls");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/xlsx-extract/";
        testFile = "test/tests.js";
        parameters = "--timeout 20000 -g 'should\ read\ all\ columns\ and\ rows'";
        break;

    // case "ME1": // known-bugs
    //     break;
    // case "ME2": // known-bugs
    //     break;
    // case "ME3": // known-bugs
    //     break;
    // case "ME4": // known-bugs
    //     break;
    // case "NEDB1": // known-bugs
    //     break;
    // case "NEDB2": // known-bugs
    //     break;

    // Obs: o ARC funciona, mas apenas mantendo a limitacao dele para apenas esse teste
    case "ARC": // exploratory
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/node-archiver/";
        testFile = "test/archiver.js";
        parameters = `--exit -t 10000 -g "archiver\ api\ #errors\ should\ allow\ continue\ on\ stat\ failing"`;
        break;

    // case "OBJ": // exploratory
    //     break;
    default:
        console.log("Esse projeto ainda nao esta nesse switch case!");
}

// 2) Treatments and Path Verifications

const entryFile = pathProjectFolder+testFile;

let testNames = [];
let testNamesRespectiveFile = [];

try {
    const stats = fs.lstatSync(entryFile);

    if (stats.isDirectory()) {
        console.log(`${entryFile} é um diretório.`);

        const files = fs.readdirSync(entryFile);
    
        const jsFiles = files.filter(file => path.extname(file) === '.js');

        console.log(`\nForam encontrados ${jsFiles.length} Arquivos .js:`);
        for(let i = 0; i < jsFiles.length; i++) {
            console.log(`${i}. ${jsFiles[i]}`);
        }

        for(let i = 0; i < jsFiles.length; i++) {
            const TemporaryTestName = getTestsNamev2(entryFile + "/" + jsFiles[i]);

            if (TemporaryTestName.length === 0) {
                console.log('No tests were found in the file: ', entryFile);
            }
            else {
                for(let j = 0; j < TemporaryTestName.length; j++) {
                    testNames.push(TemporaryTestName[j]);
                    testNamesRespectiveFile.push(jsFiles[i]);
                }
            }
        }

        console.log(`\nForam encontrados um total de ${testNames.length} testes no folder '${testFile}':`);
        for(let i = 0; i < testNames.length; i++) {
            console.log(`${i}. ${testNames[i]}; --- file: ${testNamesRespectiveFile[i]}`);
        }
    }
    else if (stats.isFile()) {
        console.log(`${entryFile} é um arquivo.`);
        const TemporaryTestName = getTestsNamev2(entryFile);

        if (TemporaryTestName.length === 0) {
            console.log('No tests were found in the file: ', entryFile);
        } else {

            for(let j = 0; j < TemporaryTestName.length; j++) {
                testNames.push(TemporaryTestName[j]);
            }

            console.log(`\nForam encontrados um total de ${testNames.length} testes no file '${testFile}':`);
            for(let i = 0; i < testNames.length; i++) {
                console.log(`${i}. ${testNames[i]};`);
            }
        }
    }
    else {
        console.log(`${entryFile} existe, mas não é um arquivo nem um diretório.`);
    }
}
catch (error) {
    if (error.code === 'ENOENT') {
        console.log(`${entryFile} não existe.`);
    }
    else {
        console.error(`Erro ao verificar o path do projeto desejado: ${error.message}`);
    }
}


let pathNode_modules = isMocha ? "node_modules/.bin/_mocha" : "node_modules/.bin/jest";

// 3) CREATING THE DESTINATION FOLDER FOR THE TRACES THAT WILL BE OBTAINED
const sourceCopyPath = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logHooks.json";
const destinationCopyFolder = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
let copiedFileName;

// Refazendo o diretorio do collectedTracesFolder
shell.rm('-rf', destinationCopyFolder);
shell.mkdir(destinationCopyFolder);

// 4) EXECUTING EACH TESTS INDIVIDUALLY
let semiCompleteCommand;
let completCommand;
console.log("\nExecucao dos testes individualmente:");
for(let i = 0; i < testNames.length; i++) {
    try {
        // Diferenciando se o teste era de um folder inteiro ou de apenas um file especifico 
        if(testNamesRespectiveFile.length > 0) {
            semiCompleteCommand = "node ./dist/bin/nodeprof.js " + pathProjectFolder + " " + pathNode_modules + " " + testFile + "/" + testNamesRespectiveFile[i] + " " + parameters;
        }
        else {
            semiCompleteCommand = "node ./dist/bin/nodeprof.js " + pathProjectFolder + " " + pathNode_modules + " " + testFile + " " + parameters;
        }

        // Diferenciando se o teste eh Mocha ou Jest
        if(isMocha) {
            completCommand = semiCompleteCommand + " -g " + testNames[i];
            //shell.exec(semiCompletCommand + " -g " + testNames[i]);
            //console.log("Comando com o -g eh: ", completCommand);
        }
        else {
            completCommand = semiCompleteCommand + " --testNamePattern " + testNames[i];
            //shell.exec(semiCompletCommand + " --testNamePattern " + testNames[i]);
            //console.log("Comando com o --testNamePattern eh: ", completCommand);
        }

        console.log(`\n${i+1}/${testNames.length}. Executando o teste: ${testNames[i]}`);
        console.log("Comando usado foi: ", completCommand);

        shell.exec(completCommand);

        copiedFileName = "tracesFromIt_" + i.toString() + ".json";
        shell.cp(sourceCopyPath, (destinationCopyFolder + copiedFileName));
    } catch (error) {
        console.error('Erro executar testes individuais:', error);
        console.log("Erro ao executar a iteracao do teste individual com i=", i);
    }
}

console.log("\nGerando a lista com todas as funcoes presentes");
try {
    const diretorio = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";

    let destinationFile = "";
    let pathExtractFile = "";
    const files = fs.readdirSync(diretorio);
    for(let i = 0; i < files.length; i++) {
        destinationFile = diretorio + "functionsFromTest_" + i + ".json";
        fs.writeFileSync(destinationFile, '');


        pathExtractFile = diretorio + "tracesFromIt_" + i + ".json";
        const logHooks = fs.readFileSync(pathExtractFile, 'utf8');
        const objectsExtractFeatures = JSON.parse(logHooks);

        let runtime = 0;
        let callBackDetectedFunction;

        // LEMBRAR QUE NESSE LACO EH PARA USAR O J
        for(let j = 0; j < objectsExtractFeatures.length; j++) {
            if (objectsExtractFeatures[j].Detected_Hook === "invokeFunPre") {

                if(objectsExtractFeatures.Makes_CallBack === true) {
                    for(let k = 0; k < objectsExtractFeatures.length; k++) {
                        if (objectsExtractFeatures[k].Detected_Hook === "functionEnter") {
                            if(objectsExtractFeatures[k].is_Callback && valueCallerIID === objectsExtractFeatures[j].iid) {
                                callBackDetectedFunction = objectsExtractFeatures[k];
                                runtime = objectsExtractFeatures[k].timer - objectsExtractFeatures[j].timer;
                            }
                        }
                    }
                }
                else { // funcoes invocadas que nao fazem callback
                    for (let k = 0; k < objectsExtractFeatures.length; k++) {
                        if (objectsExtractFeatures[k].Detected_Hook === "invokeFunPre" && 
                            objectsExtractFeatures[k].iid === objectsExtractFeatures[j].iid) {
                                runtime = objectsExtractFeatures[j].timer - objectsExtractFeatures[k].timer;
                        }
                    }
                }

                const ObjectLogMessage = {
                    "Name": objectsExtractFeatures[j].Function_Name,
                    "File_Path": objectsExtractFeatures[j].File_Path,
                    "loc": objectsExtractFeatures[j].loc,
                    "Runtime_ms": runtime,
                    "Args": objectsExtractFeatures[j].Args,
                    "CallBack": callBackDetectedFunction,
                };
        
                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
        
                fs.writeFileSync(destinationFile, stringJSON + ',\n', {flag:'a'});
            }

        }
    }

} catch(error) {
    console.error("Erro foi detectado no gerando a lista das funcoes: ", error);
}


// 4) COLLECT STATISTICS FROM THE LOGS OBTAINED (EXTRACT FEATURES)
console.log("\nExtracao das features a partir dos traces gerados:");
try {
    const diretorio = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
    const files = fs.readdirSync(diretorio);
    
    const pathExtractedFeaturesLog = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/extractedFeaturesLog.json";
    fs.writeFileSync(pathExtractedFeaturesLog, '[\n');

    // Filtrar para ler apenas os arquivos de nome tracesFromIt_x.json;
    const regex = /^tracesFromIt_\d+\.json$/;
    const filteredFiles = files.filter(file => regex.test(file));

    //console.log("files eh: ", files);
    for(let i = 0; i < filteredFiles.length; i++) {

        let pathExtractFile = "";
        pathExtractFile = diretorio + filteredFiles[i];
        console.log(`${i+1}/${filteredFiles.length}. Extraindo features do arquivo: ${filteredFiles[i]}`);
        const logHooks = fs.readFileSync(pathExtractFile, 'utf8');
        const objectsExtractFeatures = JSON.parse(logHooks);

        // Extracting Features
        const countFunctionEnter = objectsExtractFeatures.filter(obj => obj.Detected_Hook === "functionEnter").length;
        //console.log("Number of objects with Detected_Hook = functionEnter:", countFunctionEnter);

        const countFunctionExit = objectsExtractFeatures.filter(obj => obj.Detected_Hook === "functionExit").length;
        //console.log("Number of objects with Detected_Hook = functionExit:", countFunctionExit);

        let totalTimeFunctions = objectsExtractFeatures
            .filter(obj => obj.Detected_Hook === "functionExit")
            .reduce((sum, obj) => sum + obj.Runtime_ms, 0);

        const countInvokeFunPre = objectsExtractFeatures.filter(obj => obj.Detected_Hook === "invokeFunPre").length;
        //console.log("Number of objects with Detected_Hook = invokeFunPre:", countInvokeFunPre);

        const countInvokeFun = objectsExtractFeatures.filter(obj => obj.Detected_Hook === "invokeFun").length;
        //console.log("Number of objects with Detected_Hook = invokeFun:", countInvokeFun);

        let totalTimeInvokes = objectsExtractFeatures
            .filter(obj => obj.Detected_Hook === "invokeFun")
            .reduce((sum, obj) => sum + obj.Runtime_ms, 0);

        const ObjectLogMessage = {
            "File_Extract_Features": pathExtractFile,
            "FunctionEnter_Count": countFunctionEnter,
            "FunctionExit_Count": countFunctionExit,
            "Total_Time_Functions": totalTimeFunctions,
            "InvokeFunPre_Count": countInvokeFunPre,
            "InvokeFun_Count": countInvokeFun,
            "Total_time_Invokes": totalTimeInvokes,
        };

        const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);

        fs.writeFileSync(pathExtractedFeaturesLog, stringJSON + ',\n', {flag:'a'});

    }
    fs.writeFileSync(pathExtractedFeaturesLog, ']', {flag:'a'});

} catch (error) {
    console.error('Erro no extract features:', error);
}



shell.echo("TERMINOU!");











// -=+=- Used Functions -=+=-

// ESSA ABORDAGEM ACABA GERANDO FALSO POSITIVOS SE O TEST/IT ESTIVER EM UM COMENTARIO DE BLOCO
function getTestsNamev2(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const testRegex = /(?:^|\s)(?:it|test)\s*\(\s*['"`](.+?)['"`]/gm;
    const tests = [];
    let match;

    while ((match = testRegex.exec(content)) !== null) {
        tests.push(match[1]);
    }

    for(let i = 0; i < tests.length; i++) {
        tests[i] = `"` + tests[i] + `"`;
        tests[i] = tests[i].replace(/\s/g, '\\ '); // Adicionando "\" antes dos espacos

    }

    return tests;
}

// Abordagem original, que executa os traces primeiro e depois vai coletando os nomes dos tests files
// (abordagem mais lenta, porem nao gera falso positivo com trechos comentados)
function getTestsNamev1(completCommand) {
    // 1) EXECUTING THE FIRST TIME WITH THE ENTIRE MOCHA FILE TO SEE THE NAME OF THE ITs Tests
    //console.log(completCommand);
    shell.exec(completCommand);
    
    try {
        // 2) COLLECTING THE NAME OF THE ITs Tests
        const logHooks = fs.readFileSync('src/Analysis/MyFunctionCallAnalysis/logHooks.json', 'utf8');
    
        // Converting the JSON content to JavaScript object
        const elementosParseados = JSON.parse(logHooks);
    
        // Filtrar os elementos pra pegar as linhas dos its
        let elementosFiltrados;
        if(isMocha) {
            elementosFiltrados = elementosParseados.filter(elemento => (elemento.Detected_Hook === "read" && elemento.Variable_Name === "it"));
            console.log("Objetos filtrados no Mocha", elementosFiltrados);
        }
        else {
            elementosFiltrados = elementosParseados.filter(elemento => (elemento.Detected_Hook === "invokeFunPre" && elemento.Function_Name === "test"));
            console.log("Objetos filtrados no Jest", elementosFiltrados);
        }
    
        // Obter os valores de startline dos its filtrados
        const vetorLinhasDosIts = elementosFiltrados.map(elemento => elemento.loc.start.line);
        console.log("Linha dos its eh: ", vetorLinhasDosIts);
        
        // Pegar o nome dos testes its encontrados
        const vetorNomesDosIts = elementosParseados.filter(elemento => {
            let linhaDoLiteral;
            linhaDoLiteral = elemento && elemento.loc && elemento.loc.start && elemento.loc.start.line ? elemento.loc.start.line : -1;
            //console.log("Verificando elemento:", linhaDoLiteral);
    
            return vetorLinhasDosIts.includes(linhaDoLiteral) &&
            elemento.Detected_Hook === "literal" &&
            elemento.Literal_Value_Type === "string" &&
            elemento.File_Path === (entryFile);
        });
            
        for(let i = 0; i < vetorNomesDosIts.length; i++) {
            vetorNomesDosIts[i] = vetorNomesDosIts[i].Literal_Value;
            vetorNomesDosIts[i] = vetorNomesDosIts[i].replace(/\[|\]/g, ""); // Removendo os colchetes "[" "]"
            vetorNomesDosIts[i] = vetorNomesDosIts[i].replace(/\s/g, '\\ '); // Adicionando "\" antes dos espacos
        }
        
        console.log("Os nomes dos its detectados sao: ")
        console.log(vetorNomesDosIts);
        return vetorLinhasDosIts;
        
    } catch (error) {
        console.error('Erro ao processar os elementos:', error);
    }
} 