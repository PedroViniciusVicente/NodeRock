// Customized Mocha report to collect all passing tests
// PRECISA REVER COMO PASSAR O temporary_TestsNamesAndFiles DIRETO PARA O NodeRock_Info PARA NÃO PRECISAR ESCREVER ARQUIVO TEMPORARIO EM: 
// /home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/NodeRock_src/FoldersUsedDuringExecution/temporary_TestsNamesAndFiles/temporaryPassingTests.json.log

const fs = require('fs');
const Mocha = require('mocha');
const path = require('path');

// "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/NodeRock_src/FoldersUsedDuringExecution/temporary_TestsNamesAndFiles";
const TEMPORARY_TESTS_NAMES_AND_FILES = path.join(__dirname,"../FoldersUsedDuringExecution/temporary_TestsNamesAndFiles");

const Base = Mocha.reporters.Base;
const {
    EVENT_TEST_PASS,
    EVENT_RUN_END
} = Mocha.Runner.constants;

function MochaReporter(runner, options) {
    Base.call(this, runner, options);

    let passedTests = [];
    // const destinationFolder = options.reporterOptions && options.reporterOptions.pathProjectFolder 
    //     ? options.reporterOptions.pathProjectFolder 
    //     : __dirname; // Usa o diretório atual como fallback


    runner.on(EVENT_TEST_PASS, function (test) {
        passedTests.push({
            // file: "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/nedb/test/db.test.js", // para o nedb
            file: "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/known-bugs/fiware-pep-steelskin/test/unit/race_simple.js", // para o FPS
            // file: test.file, // default

            title: test.fullTitle()
        });
    });

    runner.on(EVENT_RUN_END, function () {
        // const PASSING_TESTS_PATH = path.join(destinationFolder, "NodeRock_Info", "passingTests.json.log");

        // console.log(`\n${runner.stats.tests} tests were found!`);
        // console.log(`${runner.stats.passes} passed and ${runner.stats.failures} failed.`);
        //console.log('mocha ends: %d-%d / %d', runner.stats.passes, runner.stats.failures, runner.stats.tests);

        // console.log("ACHOU O: ", JSON.stringify(passedTests, null, 4));
        // console.log("\nCHEGOU O PATH PARA CRIAR O PASSINGTESTS.JSON.LOG:", TEMPORARY_TESTS_NAMES_AND_FILES);

        fs.writeFileSync(path.join(TEMPORARY_TESTS_NAMES_AND_FILES, "temporaryPassingTests.json.log"), JSON.stringify(passedTests), 'utf8');

        /*
        ** console.log("o destination eh: ", TEMPORARY_TESTS_NAMES_AND_FILES);
        ** let passedTestsJsonPath = TEMPORARY_TESTS_NAMES_AND_FILES + "passingTests.json.log";
        ** fs.writeFileSync(passedTestsJsonPath, JSON.stringify(passedTests, null, 4), 'utf8');
        */
    });
}
module.exports = MochaReporter;