// 2. Treatments and Path Verifications to get the test names

const fs = require('fs');
const path = require('path');

let testNames = [];
let testNamesRespectiveFile = [];

function getTestsNames(pathProjectFolder, testFile) {
    const entryFile = pathProjectFolder + testFile;


    try {
        const stats = fs.lstatSync(entryFile);
        
        if (stats.isFile())
        {
            //console.log(`${entryFile} é um arquivo.`);
            const TemporaryTestName = getTestsNamev3(entryFile);

            if (TemporaryTestName.length === 0) {
                console.log('No tests were found in the file: ', entryFile);
            } else {

                for(let j = 0; j < TemporaryTestName.length; j++) {
                    testNames.push(TemporaryTestName[j]);
                    //testNamesRespectiveFile.push(testFile);
                }

                console.log(`\nForam encontrados um total de ${testNames.length} testes no file '${testFile}':`);
                for(let i = 0; i < testNames.length; i++) {
                    console.log(`${i+1}. ${testNames[i]};`);
                }
            }
        }
        else if (stats.isDirectory())
        {
            exploreDirectory(pathProjectFolder, testFile);

            console.log(`\nForam encontrados um total de ${testNames.length} testes no folder '${testFile}'`);
            for(let i = 0; i < testNames.length; i++) {
                console.log(`${i+1}. ${testNames[i]}; \n--- file: ${testNamesRespectiveFile[i]}`);
            }
        }
        else {
            console.log(`${entryFile} existe, mas não é um arquivo nem um diretório.`);
        }

        //return [testNames, testNamesRespectiveFile];
        return {
            testNames: testNames,
            testNamesRespectiveFile: testNamesRespectiveFile,
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
}

function exploreDirectory(pathProjectFolder, testFile) {
    const entryFile = pathProjectFolder + testFile;
    // console.log(`${entryFile} é um diretório.`);

    const files = fs.readdirSync(entryFile);

    for(let i = 0; i < files.length; i++) {
        let currentFile = entryFile + "/" + files[i];
        const statsInsideFolder = fs.lstatSync(currentFile);

        if (statsInsideFolder.isFile()) {

            if(currentFile.endsWith(".js")) {

                console.log("Encontrou o file: ", files[i]);
                const TemporaryTestName = getTestsNamev3(currentFile);

                if (TemporaryTestName.length === 0) {
                    console.log('No tests were found in the file: ', currentFile);
                } else {
                    for(let j = 0; j < TemporaryTestName.length; j++) {
                        testNames.push(TemporaryTestName[j]);
                        testNamesRespectiveFile.push(testFile + "/" + files[i]);
                    }
                }
            }
        }
        else if (statsInsideFolder.isDirectory()) {
            console.log("Encontrou o folder: ", files[i]);
            exploreDirectory(pathProjectFolder, testFile + "/" + files[i]);
        }
    }
}

// -=+=- Used Functions -=+=-

// ESSA ABRODAGEM CONSEGUE PEGAR O DESCRIBE DE CADA IT TAMBEM
function getTestsNamev3(filePath) {
    const testFileContent = fs.readFileSync(filePath, 'utf8');

    const lines = testFileContent.split('\n');
    const describeStack = [];
    let columnUltimoDescribe = 0;
    //let qtdTestes = 0;
    arrayTestFullNames = [];


    lines.forEach((line, lineNumber) => {
        // Remove leading/trailing whitespace
        const trimmedLine = line.trim();

        // Check for describe blocks and print their location
        if (trimmedLine.startsWith('describe(')) {
            const match = line.match(/describe\(['"`](.*?)['"`],/);
            if (match) {
                const column = line.indexOf('describe(') + 1; // Column number, starting from 1
                const describeName = match[1];
                //console.log(`Found 'describe' block for "${describeName}" at line ${lineNumber + 1}, column ${column}`);

                let par_nomedescribe_coluna = {
                    nome: describeName,
                    coluna: column
                }

                if(column === columnUltimoDescribe) {
                    describeStack.pop();
                    describeStack.push(par_nomedescribe_coluna);
                    // (e o columnUltimoDescribe mantem o mesmo)
                }
                else if(column > columnUltimoDescribe) {
                    describeStack.push(par_nomedescribe_coluna);
                    columnUltimoDescribe = column;
                }
                else if(column < columnUltimoDescribe) {
                    describeStack.pop();
                    while(describeStack.length > 0 && column <= describeStack[describeStack.length-1].coluna) {
                        describeStack.pop();
                    }
                    describeStack.push(par_nomedescribe_coluna);
                    columnUltimoDescribe = column;
                }
            }
        }

        if (trimmedLine.startsWith('it(')) {
            const match = line.match(/it\(['"`](.*?)['"`],/);
            if (match) {
                const column = line.indexOf('it(') + 1; // Column number, starting from 1
                const itName = match[1];
                //console.log(`Found 'it' block for "${describeName}" at line ${lineNumber + 1}, column ${column}`);

                if(column <= columnUltimoDescribe) {
                    describeStack.pop();
                    while(describeStack.length > 0 && column <= describeStack[describeStack.length-1].coluna) {
                        describeStack.pop();
                    }
                    columnUltimoDescribe = describeStack[describeStack.length-1].coluna;
                }

                let testFullNames = "";
                for (let i = 0; i < describeStack.length; i++) {
                    testFullNames += describeStack[i].nome + " ";
                }
                testFullNames += itName;
                arrayTestFullNames.push(testFullNames);
                //qtdTestes++;
                //console.log(qtdTestes + ". " + testFullNames);
            }
        }
    });
    for(let i = 0; i < arrayTestFullNames.length; i++) {
        arrayTestFullNames[i] = `"` + arrayTestFullNames[i] + `"`;
        arrayTestFullNames[i] = arrayTestFullNames[i].replace(/\s/g, '\\ '); // Adicionando "\" antes dos espacos

        arrayTestFullNames[i] = arrayTestFullNames[i].replace(/['`+\-()<>[\]]/g, '.*');
    }
    return arrayTestFullNames;
}



/*
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
        if(chosenProject.isMocha) {
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
} */

module.exports = {getTestsNames};