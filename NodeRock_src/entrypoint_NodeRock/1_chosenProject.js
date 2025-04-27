// 1. Selecting the test file/folder that you want to analyse

const path = require('path');
const fs = require('fs');


function chosenProjectFunction() {
    let pathProjectFolder = "";
    let testFile = "";
    let parameters = "";
    let isMocha = true;
    let raceConditionTests = [];
    let benchmarkName = "";
    let isScript = false;


    // let chosenProject = "MeuTestVerificarRuntimes";
    // let chosenProject = "ARC";
    // let chosenProject = "socket.io-1862";
    let chosenProject = "FPS";




    switch (chosenProject) {

        // -=+=- 1) Meus testes de exemplo -=+=-

        case "MeuTestBasico": // teste para ver melhor o tempo com cb assincrono
            benchmarkName = "MeuTestBasico";
            console.log("Executando analise do meu teste basico para ver o tempo com cb assincrono");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "meuDatasetParaTestes/testeBasico");
            testFile = "test/test.js";
            break;
        
            // (757 linhas de trace)
        case "MeuTestBasico2": // main.js e testLeitura.js
            benchmarkName = "MeuTestBasico2";
            console.log("Executando analise do meu teste basico2 para ver o tempo ate chamar cb assincrono");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "meuDatasetParaTestes/testeBasico");
            testFile = "test/testLeitura.js";
            break;

        case "MeuTestMocha":
            benchmarkName = "MeuTestMocha";
            console.log("Executando analise do meu teste simples em Mocha");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "meuDatasetParaTestes/testesSimplesMocha");
            // testFile = "teste";
            //testFile = "teste/testeMenor.js";
            testFile = "teste/arquivoTestesMocha.js";

            raceConditionTests.push("1. Testes da Primeira funcao somarEdobrar com x e y positivos");
            break;

        case "MeuTestJest": 
        // comando rodar testes jest direto:
        // node ./dist/bin/nodeprof.js /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testesJest/ node_modules/.bin/jest teste/testandoJest.test.js
            benchmarkName = "MeuTestJest";
            console.log("Executando analise do meu teste simples em Jest");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "meuDatasetParaTestes/testesJest");
            testFile = "teste/testandoJest.test.js";
            parameters = "--runInBand"; // Roda os testes sequenciamente (em batch), e não paralelamente
            isMocha = false;
            break;
        
        case "MeuTestVerificarRuntimes":
            benchmarkName = "MeuTestVerificarRuntimes";
            console.log("Executando analise do runtime");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "meuDatasetParaTestes/testesVerificarTempo");
            testFile = "test/test.js";
            break;

        case "MeuTestAsyncFunctions":
            benchmarkName = "MeuTestAsyncFunctions";
            console.log("Executando analise do async functions");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "meuDatasetParaTestes/testarAsyncfunctions");
            testFile = "test/test.js";
            break;

        case "MeuTestAwait":
            benchmarkName = "MeuTestAwait";
            console.log("Executando analise do teste com await para medir o tempo de functions com tempo > 100 ms");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "meuDatasetParaTestes/coletarTempoFunctions");
            testFile = "test/";
            parameters = "-t 50000";
            break;

        // -=+=- 2) known-bugs -=+=-


        // Obs: Na analise com node v14 ele falha na maioria dos testes. isso nao ocorre ao executar os testes com node v10
        // PRECISA MODIFICAR NO GETTESTSNAMES
        case "FPS": // known-bugs
            benchmarkName = "fiware-pep-steelskin";
            console.log("Executando analise do fiware-pep-steelskin");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "datasetDoNodeRacer/known-bugs/fiware-pep-steelskin");
            // testFile = "test/unit/race_simple.js";
            testFile = "test/unit";
            parameters = "--timeout 5000";
            raceConditionTests.push("Reuse authentication tokens When a the PEP Proxy has an expired token and another request arrives to the proxy both requests should finish");
            break;

        // Obs: Na analise com node v14 ele falha na maioria dos testes. isso nao ocorre ao executar os testes com node v10
        case "NES": // known-bugs
            benchmarkName = "nes";
            console.log("Executando analise do nes");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "datasetDoNodeRacer/known-bugs/nes");
            testFile = "test/client_TP.js";
            break;

        case "DEL": // known-bugs, funciona muito bem, porem estou usando outro arquivo como entrypoint para teste
            benchmarkName = "del";
            console.log("Executando analise do del");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "datasetDoNodeRacer/known-bugs/del");
            testFile = "test.js";
            break;

        // Obs: o XLS nao conseguiu ser analisado, (apenas testado). Ele exige o node v10
        case "XLS": // known-bugs
            benchmarkName = "xlsx-extract";
            console.log("Executando analise do xls");
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "datasetDoNodeRacer/known-bugs/xlsx-extract");
            testFile = "test/tests.js";
            parameters = "--timeout 20000";
            break;


        // -=+=- 2) open-issues -=+=-



        // -=+=- 3) exploratory -=+=-

        case "ME": // Mongo-express
            benchmarkName = "mongo-express";
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "datasetDoNodeRacer/exploratory/mongo-express");
            testFile = "test/lib";
            parameters = "--exit -t 10000";

            raceConditionTests.push("Router collection GET /db/.*dbName.*/.*collection.* should return html");
            raceConditionTests.push("Router document GET /db/.*dbName.*/.*collection.*/.*document.* should return html");
            raceConditionTests.push("Router database GET /db/.*dbName.* should return html");
            raceConditionTests.push("Router index GET / should return html");
            break;

        case "NEDB":
            benchmarkName = "nedb";
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "datasetDoNodeRacer/exploratory/nedb");
            testFile = "test/db.test.js";
            // testFile = "test/";
            parameters = `--exit -t 20000`;
            raceConditionTests.push("Database Using indexes ensureIndex and index initialization in database loading ensureIndex can be called before a loadDatabase and still be initialized and filled correctly");
            raceConditionTests.push("Database Using indexes ensureIndex and index initialization in database loading If a unique constraint is not respected, database loading will not work and no data will be inserted");
            break;

        case "ARC":
            benchmarkName = "node-archiver";
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "datasetDoNodeRacer/exploratory/node-archiver/");
            // testFile = "test/archiver.js";
            testFile = "test/"
            parameters = `--exit -t 10000`;
            raceConditionTests.push("archiver api #errors should allow continue on stat failing");
            break;

        case "OBJ":
            benchmarkName = "objection.js";
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "datasetDoNodeRacer/exploratory/objection.js");
            testFile = "tests/unit/utils.js";
            parameters = "--exit -t 10000";

            raceConditionTests.push("utils promiseUtils map should not start new operations after an error has been thrown");
            break;



        // -=+=- 4) fs-extra -=+=- // rever o ENSURE e o FS e o JSON e o mkdirs e __tests__
        // pedroubuntu@Aspire-A514-54:~/coisasNodeRT/datasetNodeRT/fs-extra/jprichardson_node-fs-extra$ npx mocha lib/ensure/__tests__/link.test.js 
        // (tem 101 testes)
        case "FS_EXTRA":
            benchmarkName = "fs-extra";
            pathProjectFolder = path.join("/home/pedroubuntu/coisasNodeRT/datasetNodeRT", "fs-extra/jprichardson_node-fs-extra/");
            testFile = "lib";
            // testFile = "lib/__tests__/promise.test.js";

            // testFile = "lib/ensure/__tests__/link.test.js";
            raceConditionTests.push("ncp regular files and directories when copying files using filter files are copied correctly");

            //testFile = "lib/remove/__tests__/remove.test.js";
            raceConditionTests.push("remove + remove() should delete without a callback");
            // "remove + remove() should delete without a callback"

            parameters = "--exit -t 10000";
            break;

        // NNNN OTHER PROJECTS

        case "ALMOST":
            benchmarkName = "almost";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/almost_through2-concurrent");
            testFile = "tests";
            parameters = "--exit -t 10000";
            break;

        case "QINGWEI":
            benchmarkName = "QingWei";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/QingWei-Li_docsify");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;

        case "SGRODIN":
            benchmarkName = "SGrodin";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/SGrondin_bottleneck");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;
            

        case "SWAAGIE":
            benchmarkName = "Swaagie_minimize";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/Swaagie_minimize");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;

        case "ANIMIR":
            benchmarkName = "animir_node-rate-limiter-flexible";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/animir_node-rate-limiter-flexible");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;

        case "BITINN":
            benchmarkName = "bitinn_node-fetch";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/bitinn_node-fetch");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;

        case "IRONNODE":
            benchmarkName = "s-a_iron-node";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/s-a_iron-node");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;


        case "YARGS":
            benchmarkName = "yargs_yargs";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/yargs_yargs");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;

        case "PENCIL":
            benchmarkName = "pencilblue_pencilblue";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/pencilblue_pencilblue");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;

        case "CODEKIREI":
            benchmarkName = "codekirei_node-multispinner";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/codekirei_node-multispinner");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;

        case "CGIFFARD":
            benchmarkName = "cgiffard_node-simplecrawler";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/cgiffard_node-simplecrawler");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;

        case "BBCFLASHHEART":
            benchmarkName = "bbc_flashheart";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/bbc_flashheart");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;

        case "TJATSE":
            benchmarkName = "Tjatse_node-readability";
            pathProjectFolder = path.join("/home/pedroubuntu/Downloads", "nacd/Tjatse_node-readability");
            testFile = "test";
            parameters = "--exit -t 10000";
            break;
            



        // SCRIPTS (NÃO TEM TESTES AUTOMATIZADOS, É APENAS UM SCRIPT)
        
        case "AKA":
            benchmarkName = "Script do Agent Keep Alive";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/agentkeepalive-23";
            testFile = "fuzz_test/triggerRace.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
            
        case "WBG":
            benchmarkName = "Script do WhiteboxGhost";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/WhiteboxGhost";
            testFile = "fuzz_test/add_mock.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
                
        case "node-mkdirp":
            benchmarkName = "Script do node-mkdirp";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/node-mkdirp";
            testFile = "fuzz_test/race_subtle.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
                    
        case "node-logger-file-1":
            benchmarkName = "Script do node-logger-file-1";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/node-logger-file-1";
            testFile = "fuzz_test/triggerRace.js";
            parameters = 10;
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
                        
        case "socket.io-1862":
            benchmarkName = "Script do socket.io-1862";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/socket.io-1862";
            testFile = "fuzz_test/triggerRace.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
                            
        case "del":
            benchmarkName = "Script do del";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/del";
            testFile = "testissue43.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
                                
        case "linter-stylint":
            benchmarkName = "Script do linter-stylint";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/linter-stylint";
            testFile = "syntetic/test.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
            
        case "node-simpleCrawler":
            benchmarkName = "Script do node-simpleCrawler";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/node-simplecrawler-i298";
            testFile = "merged-test.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
            
        case "bluebird-2":
            benchmarkName = "Script do bluebird-2";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/bluebird-2";
            testFile = "race.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
                                            
        case "express-user":
            benchmarkName = "Script do express-user";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/nodesamples";
            testFile = "express01/server-test.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
                                                
        case "get-port":
            benchmarkName = "Script do get-port";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/get-port";
            testFile = "triggerRace.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
                                                    
        case "live-server":
            benchmarkName = "Script do live-server-potential-race";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/live-server-potential-race";
            testFile = "race-root-dir-test.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;
            
        case "socket.io-client":
            benchmarkName = "Script do socket.io-client";
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/open-issues/socket.io-client";
            testFile = "race.js";
            // parameters = "--timeout 20000";
            raceConditionTests.push(`Script for ${benchmarkName}`);
            isScript = true;
            break;

        // case "fiware-pep-steelskin":
        //     benchmarkName = "Script do fiware-pep-steelskin";
        //     pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/fiware-pep-steelskin";
        //     testFile = "test/unit/race_simple.js";
        //     // parameters = "--timeout 20000";
        //     raceConditionTests.push(`Script for ${benchmarkName}`);
        //     isScript = true;
        //     break;



        default:
            console.log("Esse projeto ainda nao esta nesse switch case!");
            process.exit();
    }

    const data = {
        pathProjectFolder: pathProjectFolder,
        testFile: testFile,
        parameters: parameters,
        isMocha: isMocha,
        raceConditionTests: raceConditionTests,
        benchmarkName: benchmarkName,
        isScript: isScript,
    };

    const TEMPORARY_ANALYZED_PROJECT = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json");
    fs.writeFileSync(TEMPORARY_ANALYZED_PROJECT, JSON.stringify(data, null, 2));

    console.log("Analyzed Project Path: ", data.pathProjectFolder);
    console.log("Analyzed Root Test Folder/File: ", data.testFile);
    
}

module.exports = { chosenProjectFunction };
