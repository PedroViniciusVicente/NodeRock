const shell = require('shelljs');
const fs = require('fs');

shell.echo("COMECOU!");


// 1) EXECUTING THE FIRST TIME WITH THE ENTIRE MOCHA FILE TO SEE THE NAME OF THE ITs Tests
const pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/";
const testFile = "teste/testeMenor.js";

let completCommand = "node ./dist/bin/nodeprof.js " + pathProjectFolder + " node_modules/.bin/_mocha " + testFile;
//console.log(completCommand);

shell.exec(completCommand);

try {
    // 2) COLLECTING THE NAME OF THE ITs Tests
    const logHooks = fs.readFileSync('src/Analysis/MyFunctionCallAnalysis/logHooks.json', 'utf8');

    // Converting the JSON content  to JavaScript object
    const elementosParseados = JSON.parse(logHooks);

    // Filtrar os elemtos pra pegar as linhas dos its
    const elementosFiltrados = elementosParseados.filter(elemento => (elemento.Detected_Hook === "read" && elemento.Variable_Name === "it"));
    //console.log(elementosFiltrados);

    // Obter os valores de startline dos its filtrados
    const linhasDosIts = elementosFiltrados.map(elemento => elemento.loc.start.line);
    //console.log(linhasDosIts);

    // Pegar o nome dos testes its encontrados
    const nomesDosIts = elementosParseados.filter(elemento => {
        let linhaDoLiteral;
        linhaDoLiteral = elemento && elemento.loc && elemento.loc.start && elemento.loc.start.line ? elemento.loc.start.line : -1;
        //console.log("Verificando elemento:", linhaDoLiteral);
        return linhasDosIts.includes(linhaDoLiteral) && elemento.Detected_Hook === "literal" && elemento.Literal_Value_Type === "string";
    });
        
    for(let i = 0; i < nomesDosIts.length; i++) {
        nomesDosIts[i] = nomesDosIts[i].Literal_Value;
        nomesDosIts[i] = nomesDosIts[i].replace(/\[|\]/g, "");
    }

    console.log("Os nomes dos its detectados sao: ")
    console.log(nomesDosIts);

    // 3) EXECUTING ALL THE IT TESTS INDIVIDUALLY
    for(let i = 0; i < nomesDosIts.length; i++) {
        completCommand = completCommand + " -g " + nomesDosIts[i];
        shell.exec(completCommand);
        // TODO: AQUI FAZER UM NEGOCIO PRA COPIAR O AQRUIVO LOGHOOKS.JSON PARA O COLLECTEDTRACERSFOLDER
    }




    // Executar um comando
    //shell.echo('Hello, world!'); // Imprime "Hello, world!" no terminal

    // Criar um diretório
    //shell.mkdir('novo-diretorio');

    // Copiar um arquivo
    //shell.cp('arquivo.txt', 'novo-diretorio');

    // Executar um comando e capturar o código de retorno
    //let result = shell.exec('ls -la');
    //if (result.code !== 0) {
    //	console.log('Erro ao executar o comando');
    //}

    // Navegar no sistema de arquivos
    //shell.cd('novo-diretorio');
    //shell.ls(); // Lista os arquivos no diretório atual
    //shell.cd('..'); // Volta um diretório

} catch (error) {
    console.error('Erro ao processar os elementos:', error);
}

shell.exec("pwd");
//shell.exec("VERBOSE=1 yarn nodeprof /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/ arquivoPrincipal.js");
shell.echo("TERMINOU!");