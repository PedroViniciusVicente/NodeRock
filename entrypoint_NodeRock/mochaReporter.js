// Customized Mocha report to collect all passing tests

const fs = require('fs');
const Mocha = require('mocha');

const destinationCopyFolder = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/collectedTracesFolder/";


const Base = Mocha.reporters.Base;
const {
    EVENT_TEST_PASS,
    EVENT_RUN_END
} = Mocha.Runner.constants;

function MochaReporter(runner, options) {
    Base.call(this, runner, options);

    let passedTests = [];

    runner.on(EVENT_TEST_PASS, function (test) {
        passedTests.push({
            file: test.file,
            title: test.fullTitle()
        });
    });

    runner.on(EVENT_RUN_END, function () {
        console.log(`\n${runner.stats.tests} tests were found!`);
        console.log(`${runner.stats.passes} passed and ${runner.stats.failures} failed.`);
        //console.log('mocha ends: %d-%d / %d', runner.stats.passes, runner.stats.failures, runner.stats.tests);

        let passedTestsJsonPath = destinationCopyFolder + "passingTests.json.log";
        fs.writeFileSync(passedTestsJsonPath, JSON.stringify(passedTests, null, 4), 'utf8');
    });
}
module.exports = MochaReporter;