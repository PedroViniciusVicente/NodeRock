//import shell from 'shell-exec';
// const shell = require('shelljs');


export function divideMochaTests(logHooks: string[]): void {
	try {
		if(false) {
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
				let linhaDoLiteral: number;
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
		}
	
	} catch (error) {
		console.error('Erro ao processar os elementos:', error);
	}
}

// function getTestsName(elementosParseados: object[]) {

// }
/*
async function executeEachTest() {
    try {
		let out = shell(`whoami`);
		console.log(out);


        //const { stdout, stderr } = await shell('node ./dist/bin/nodeprof.js /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/node_modules/.bin/_mocha teste/testeMenor.js -g "subtrairEdividir"');
        //console.log('Saída padrão:', stdout);
        //console.log('Saída de erro:', stderr);
    } catch (error) {
        console.error('Erro ao executar o comando:', error);
    }
}
*/