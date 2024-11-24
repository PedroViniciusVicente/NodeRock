// 1. Selecting the test file/folder that you want to analyse

function chosenProjectFunction() {
    let pathProjectFolder = "";
    let testFile = "";
    let parameters = "";
    let isMocha = true;
    let raceConditionTests = [];
    let benchmarkName = "";

    let chosenProject = "ARC";

    switch (chosenProject) {

        // -=+=- 1) Meus testes de exemplo -=+=-

        case "MeuTestBasico": // teste para ver melhor o tempo com cb assincrono
            benchmarkName = "MeuTestBasico";
            console.log("Executando analise do meu teste basico para ver o tempo com cb assincrono");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testeBasico/";
            testFile = "test/test.js";
            break;
        
            // (757 linhas de trace)
        case "MeuTestBasico2": // main.js e testLeitura.js
            benchmarkName = "MeuTestBasico2";
            console.log("Executando analise do meu teste basico2 para ver o tempo ate chamar cb assincrono");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testeBasico/";
            testFile = "test/testLeitura.js";
            break;

        case "MeuTestMocha":
            benchmarkName = "MeuTestMocha";
            console.log("Executando analise do meu teste simples em Mocha");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesSimplesMocha/";
            // testFile = "teste";
            //testFile = "teste/testeMenor.js";
            testFile = "teste/arquivoTestesMocha.js";

            raceConditionTests.push("1. Testes da Primeira funcao somarEdobrar com x e y positivos");
            break;

        case "MeuTestJest":
            benchmarkName = "MeuTestJest";
            console.log("Executando analise do meu teste simples em Jest");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesJest/";
            testFile = "teste/testandoJest.test.js";
            parameters = "--runInBand"; // Roda os testes sequenciamente (em batch), e não paralelamente
            isMocha = false;
            break;
        
        case "MeuTestVerificarRuntimes":
            benchmarkName = "MeuTestVerificarRuntimes";
            console.log("Executando analise do runtime");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesVerificarTempo/";
            testFile = "test/test.js";
            break;

        case "MeuTestAsyncFunctions":
            benchmarkName = "MeuTestAsyncFunctions";
            console.log("Executando analise do async functions");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testarAsyncfunctions/";
            testFile = "test/test.js";
            break;


        // -=+=- 2) known-bugs -=+=-


        // Obs: Na analise com node v14 ele falha na maioria dos testes. isso nao ocorre ao executar os testes com node v10
        case "FPS": // known-bugs
            benchmarkName = "fiware-pep-steelskin";
            console.log("Executando analise do fiware-pep-steelskin");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/fiware-pep-steelskin/";
            //testFile = "test/unit/race_simple.js";
            testFile = "test/unit";
            parameters = "--timeout 5000";
            break;

        // Obs: Na analise com node v14 ele falha na maioria dos testes. isso nao ocorre ao executar os testes com node v10
        case "NES": // known-bugs
            benchmarkName = "nes";
            console.log("Executando analise do nes");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/nes/";
            testFile = "test/client_TP.js";
            break;

        case "DEL": // known-bugs, funciona muito bem, porem estou usando outro arquivo como entrypoint para teste
            benchmarkName = "del";
            console.log("Executando analise do del");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/del/";
            testFile = "test.js";
            break;

        // Obs: o XLS nao conseguiu ser analisado, (apenas testado). Ele exige o node v10
        case "XLS": // known-bugs
            benchmarkName = "xlsx-extract";
            console.log("Executando analise do xls");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/xlsx-extract/";
            testFile = "test/tests.js";
            parameters = "--timeout 20000 -g 'should\ read\ all\ columns\ and\ rows'";
            break;


        // -=+=- 2) open-issues -=+=-



        // -=+=- 3) exploratory -=+=-

        case "ME": // Mongo-express
            benchmarkName = "mongo-express";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/mongo-express/";
            testFile = "test/lib";
            parameters = "--exit -t 10000 -R spec";

            raceConditionTests.push("Router collection GET /db/.*dbName.*/.*collection.* should return html");
            raceConditionTests.push("Router document GET /db/.*dbName.*/.*collection.*/.*document.* should return html");
            raceConditionTests.push("Router database GET /db/.*dbName.* should return html");
            raceConditionTests.push("Router index GET / should return html");
            break;

        case "NEDB":
            benchmarkName = "nedb";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/nedb/";
            testFile = "test/db.test.js";
            parameters = `--exit -t 20000`;

            raceConditionTests.push("Database Using indexes ensureIndex can be called before a loadDatabase and still be initialized and filled correctly");
            raceConditionTests.push("Database Using indexes ensureIndex and index initialization in database loading If a unique constraint is not respected, database loading will not work and no data will be inserted");
            break;

        case "ARC":
            benchmarkName = "node-archiver";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/node-archiver/";
            //testFile = "test/archiver.js";
            testFile = "test/"
            parameters = `--exit -t 10000`;

            raceConditionTests.push("archiver api #errors should allow continue on stat failing");
            break;

        case "OBJ":
            benchmarkName = "objection.js";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/objection.js/";
            testFile = "tests/unit/utils.js";
            parameters = "--exit -t 10000 -R spec";

            raceConditionTests.push("utils promiseUtils map should not start new operations after an error has been thrown");
            break;



        // -=+=- 4) fs-extra -=+=- // rever o ENSURE e o FS e o JSON e o mkdirs e __tests__
        // pedroubuntu@Aspire-A514-54:~/coisasNodeRT/datasetNodeRT/fs-extra/jprichardson_node-fs-extra$ npx mocha lib/ensure/__tests__/link.test.js 
        // (tem 101 testes)
        case "FS_EXTRA":
            benchmarkName = "fs-extra";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/fs-extra/jprichardson_node-fs-extra/"
            //testFile = "lib";
            //testFile = "lib/ensure/__tests__/link.test.js";
            testFile = "lib/";

            raceConditionTests.push("ncp regular files and directories when copying files using filter files are copied correctly");

            //testFile = "lib/remove/__tests__/remove.test.js";
            raceConditionTests.push("remove .* remove.*.* should delete without a callback");
            // "remove + remove() should delete without a callback"
            break;


        default:
            console.log("Esse projeto ainda nao esta nesse switch case!");
            process.exit();
    }

    return {
        pathProjectFolder: pathProjectFolder,
        testFile: testFile,
        parameters: parameters,
        isMocha: isMocha,
        raceConditionTests: raceConditionTests,
        benchmarkName: benchmarkName,
    };
}

module.exports = { chosenProjectFunction };
