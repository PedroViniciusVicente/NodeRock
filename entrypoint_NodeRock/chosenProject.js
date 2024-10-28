// 1. Selecting the test file/folder that you want to analyse

function chosenProjectFunction() {
    let pathProjectFolder = "";
    let testFile = "";
    let parameters = "";
    let isMocha = true;

    let chosenProject = "MeuTestMocha";

    switch (chosenProject) {

        case "MeuTestBasico": // teste para ver melhor o tempo com cb assincrono
            console.log("Executando analise do meu teste basico para ver o tempo com cb assincrono");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testeBasico/";
            testFile = "test/test.js";
            break;
        
            // (757 linhas de trace)
        case "MeuTestBasico2": // teste para ver melhor o tempo com cb assincrono
            console.log("Executando analise do meu teste basico2 para ver o tempo ate chamar cb assincrono");
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/testeBasico/";
            testFile = "test/testLeitura.js";
            break;

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


        // Obs: o FPS "funciona", mas ele eh apenas 1 teste e ele so printa o sucesso do teste caso esteja usando o node v10 (nvm use 10) 
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

        case "NEDB": // exploratory
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/nedb/";
            testFile = "test/db.test.js";
            parameters = `--exit -t 20000`;
            break;

        case "ARC": // exploratory
            pathProjectFolder = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/node-archiver/";
            testFile = "test/archiver.js";
            parameters = `--exit -t 10000`;
            // Obs: O teste com a race condition era -g "archiver\ api\ #errors\ should\ allow\ continue\ on\ stat\ failing"
            break;

        // case "OBJ": // exploratory
        //     break;

        default:
            console.log("Esse projeto ainda nao esta nesse switch case!");
            process.exit();
    }

    return {
        pathProjectFolder: pathProjectFolder,
        testFile: testFile,
        parameters: parameters,
        isMocha: isMocha,
    };
}

module.exports = { chosenProjectFunction };
