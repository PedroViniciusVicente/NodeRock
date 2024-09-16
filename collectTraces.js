const shell = require('shelljs');
const fs = require('fs');

shell.echo("COMECOU!");


// 1) EXECUTING THE FIRST TIME WITH THE ENTIRE MOCHA FILE TO SEE THE NAME OF THE ITs Tests

//const pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/";
//const testFile = "teste/testeMenor.js";

const pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/del/";
const testFile = "test.js";
const parameters = "";

const entryFile = pathProjectFolder+testFile;

let completCommand = "node ./dist/bin/nodeprof.js " + pathProjectFolder + " node_modules/.bin/_mocha " + testFile + " " + parameters;
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

//shell.exec("pwd");
//shell.exec("VERBOSE=1 yarn nodeprof /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/ arquivoPrincipal.js");
shell.echo("TERMINOU!");