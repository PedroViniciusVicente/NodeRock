const shell = require('shelljs');
const fs = require('fs');

shell.echo("COMECOU!");


// 1) EXECUTING THE FIRST TIME WITH THE ENTIRE MOCHA FILE TO GET THE NAME OF THE ITs Tests
shell.exec("node ./dist/bin/nodeprof.js /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/  node_modules/.bin/_mocha teste/testeMenor.js");

// 2) COLLECTING THE NAME OF THE ITs Tests
// a) collecting the generated json objects
//try {
    
  //const data = fs.readFileSync('src/Analysis/MyFunctionCallAnalysis/logHooks.json', 'utf8');
  //const logHooks = fs.readFileSync('src/Analysis/MyFunctionCallAnalysis/logHooks.json', 'utf8');

  // Converting the JSON content  to JavaScript object
  //const logHooks = JSON.parse(data);

  
// Verifica se é um vetor

//   if (Array.isArray(objetos)) {
//     console.log('Objetos recuperados:', objetos[2]);
//   } else {
//     console.log('O arquivo JSON não contém um vetor.');
//   }

//} catch (err) {
//  console.error('Erro ao ler o arquivo JSON:', err);
//}
try {
    const logHooks = fs.readFileSync('src/Analysis/MyFunctionCallAnalysis/logHooks.json', 'utf8');
    // Parse cada string para um objeto JSON
    const elementosParseados = logHooks.map(elementoStr => JSON.parse(elementoStr));

    //nomesDosIts = getTestsName(elementosParseados);

    // Filtrar os elemtos pra pegar as linhas dos its
    const elementosFiltrados = elementosParseados.filter(elemento => (elemento.Detected_Hook === "read" && elemento.Variable_Name === "it"));
    console.log(elementosFiltrados);

    // Obter os valores de startline dos its filtrados
    const linhasDosIts = elementosFiltrados.map(elemento => elemento.loc.start.line);
    console.log(linhasDosIts);

    // Pegar o nome dos testes its encontrados
    const nomesDosIts = elementosParseados.filter(elemento => {
        let linhaDoLiteral;
        linhaDoLiteral = elemento && elemento.loc && elemento.loc.start && elemento.loc.start.line ? elemento.loc.start.line : -1;
        //console.log("Verificando elemento:", linhaDoLiteral);
        return linhasDosIts.includes(linhaDoLiteral) && elemento.Detected_Hook === "literal" && elemento.Literal_Value_Type === "string";
    });

    // for(let elemento of nomesDosIts) {
    // 	console.log("Nomes dos its eh: ", elemento.Literal_Value);
    // }
        
    for(let i = 0; i < nomesDosIts.length; i++) {
        nomesDosIts[i] = nomesDosIts[i].Literal_Value;//.replace(/[, "");
        nomesDosIts[i] = nomesDosIts[i].replace(/\[|\]/g, "");
    }

    console.log("Os nomes dos its detectados sao: ")
    console.log(nomesDosIts);

    //executeEachTest();

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