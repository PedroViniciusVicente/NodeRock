const shell = require('shelljs');
const fs = require('fs');

shell.echo("COMECOU!");

let pathProjectFolder = "";
let testFile = "";
let parameters = "";

// 0) CHOOSING THE TEST FILE THAT YOU WANT TO ANALYSE
let chosenProject = "MeuTestMocha";

switch (chosenProject) {
    case "MeuTestMocha":
        console.log("Executando analise do meu teste simples em Mocha");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/";
        testFile = "teste/testeMenor.js";
        break;

    // case "MeuTestJest":
    //     console.log("Executando analise do Jest");

    //     break;

    case "FPS": // known-bugs
        console.log("Executando analise do fiware-pep-steelskin");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/fiware-pep-steelskin/";
        testFile = "test/unit/race_simple.js";
        parameters = "--timeout 50000";
        break;

    // case "NES": // known-bugs
    //     console.log("Executando analise do nes");
    //     pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/nes/";
    //     testFile = "test/client_TP.js";
    //     break;

    case "DEL": // known-bugs, porem estou usando outro arquivo como entrypoint para teste
        console.log("Executando analise do del");
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/del/";
        testFile = "test.js";
        break;

    // case "XLS": // known-bugs

    //     break;

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

    case "ARC": // exploratory
        pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/node-archiver/";
        testFile = "test/archiver.js";
        parameters = `--exit -t 10000 - g "archiver\ api\ #errors\ should\ allow\ continue\ on\ stat\ failing"`;
        break;

    case "OBJ": // exploratory
        break;
    default:
        console.log("Esse projeto ainda nao esta nesse switch case!");
}

const entryFile = pathProjectFolder+testFile;

const completCommand = "node ./dist/bin/nodeprof.js " + pathProjectFolder + " node_modules/.bin/_mocha " + testFile + " " + parameters;

// 1) EXECUTING THE FIRST TIME WITH THE ENTIRE MOCHA FILE TO SEE THE NAME OF THE ITs Tests

//console.log(completCommand);

shell.exec(completCommand);

try {
    // 2) COLLECTING THE NAME OF THE ITs Tests
    const logHooks = fs.readFileSync('src/Analysis/MyFunctionCallAnalysis/logHooks.json', 'utf8');

    // Converting the JSON content to JavaScript object
    const elementosParseados = JSON.parse(logHooks);

    // Filtrar os elementos pra pegar as linhas dos its
    const elementosFiltrados = elementosParseados.filter(elemento => (elemento.Detected_Hook === "read" && elemento.Variable_Name === "it"));
    //console.log(elementosFiltrados);

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
    
    // 3) EXECUTING ALL THE IT TESTS INDIVIDUALLY
    const sourceCopyPath = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logHooks.json";
    const destinationCopyFolder = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";
    let copiedFileName;

    // Refazendo o diretorio do collectedTracesFolder
    shell.rm('-rf', destinationCopyFolder);
    shell.mkdir(destinationCopyFolder);
    
    for(let i = 0; i < vetorNomesDosIts.length; i++) {

        shell.exec(completCommand + " -g " + vetorNomesDosIts[i]);

        copiedFileName = "tracesFromIt_" + i.toString() + ".json";
        shell.cp(sourceCopyPath, (destinationCopyFolder + copiedFileName));
        console.log("executou com i = ", i);
        console.log("comando com o -g eh: ", completCommand + " -g " + vetorNomesDosIts[i]);
    }

} catch (error) {
    console.error('Erro ao processar os elementos:', error);
}

// 4) COLLECT STATISTICS FROM THE LOGS OBTAINED (EXTRACT FEATURES)
try {

} catch (error) {
    console.error('Erro ao processar os elementos:', error);
}




//shell.exec("pwd");
//shell.exec("VERBOSE=1 yarn nodeprof /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/ arquivoPrincipal.js");
shell.echo("TERMINOU!");