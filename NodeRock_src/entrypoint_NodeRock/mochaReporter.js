// Customized Mocha report to collect all passing tests

const fs = require('fs');
const Mocha = require('mocha');
const path = require('path');

const ANALYZED_PROJECT_FILE = path.join(__dirname, "../FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json");
const analyzedProjectData = JSON.parse(fs.readFileSync(ANALYZED_PROJECT_FILE, 'utf8'));

const pathProjectFolder = analyzedProjectData.pathProjectFolder;
const benchmarkName = analyzedProjectData.benchmarkName;

const PASSING_TESTS_PATH = path.join(pathProjectFolder, "NodeRock_Info", "passingTests.json.log");

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
        // caso preise setar o arquivo "na marra" para algum benchmark especifico
        if(benchmarkName === "xxx") {
            correctFile = path.join(pathProjectFolder, "test", "api.js");
        }
        else { // default
            correctFile = test.file;
        }

        passedTests.push({
            file: correctFile,

            title: test.fullTitle()
        });
    });

    runner.on(EVENT_RUN_END, function () {
        // const PASSING_TESTS_PATH = path.join(destinationFolder, "NodeRock_Info", "passingTests.json.log");

        // console.log(`\n${runner.stats.tests} tests were found!`);
        // console.log(`${runner.stats.passes} passed and ${runner.stats.failures} failed.`);
        //console.log('mocha ends: %d-%d / %d', runner.stats.passes, runner.stats.failures, runner.stats.tests);

        // console.log("ACHOU O: ", JSON.stringify(passedTests, null, 4));

        fs.writeFileSync(PASSING_TESTS_PATH, JSON.stringify(passedTests, null, 4), 'utf8');

    });
}
module.exports = MochaReporter;