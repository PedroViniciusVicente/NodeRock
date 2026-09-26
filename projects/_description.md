# Projects

This folder holds the Node.js projects analysed by NodeRock: the 24 projects with known event races that make up the dataset described in the paper (1,660 tests, 32 confirmed event races).

## Download

The built projects, together with their NodeRock analysis logs, are archived on Zenodo:

**https://doi.org/10.5281/zenodo.22968741**

Download `compacted_projects.tar.gz` and extract it inside this folder:

```
tar -xzvf compacted_projects.tar.gz
```

## Origin of the projects

Projects come from the benchmarks of previous event race studies:

| Benchmark | Source |
|---|---|
| NodeRacer: exploratory | [noderacer-benchmarks-3.js](https://github.com/andreendo/nacd/blob/main/benchmarks/noderacer-benchmarks-3.js) |
| NodeRacer: open-issues | [noderacer-benchmarks-2.js](https://github.com/andreendo/nacd/blob/main/benchmarks/noderacer-benchmarks-2.js) |
| NodeRacer: known-bugs | [start-noderacer.js](https://github.com/andreendo/noderacer/blob/master/tests/experiments/known-bugs/start-noderacer.js) or [noderacer-benchmarks.js](https://github.com/andreendo/nacd/blob/main/benchmarks/noderacer-benchmarks.js) |
| NodeRT | NodeRT benchmark suite (`explore`) |
| NACD | NACD benchmark suite (`fs-extra`) |

NRace also reported `json-file-store` and `nodejs-websocket`; both are already part of the NodeRT benchmark.

## Project table

Run every command from the root folder of the corresponding project, using Node.js 14 (see [setup notes](#project-specific-setup-notes) for exceptions). `#Tests` is the number of passing tests eligible for feature extraction, as reported in the paper.

Projects marked with † were provided by the original studies as isolated scripts that expose a specific race, not as full test suites. Each one contributes only its race-exposing script to the dataset.

| Project | Origin | Test command | #Tests | Test(s) with event race |
|---|---|---|---:|---|
| mongo-express | exploratory | `./node_modules/.bin/mocha --exit -t 10000 -R spec test/` | 33 | `Router collection GET /db/<dbName>/<collection> should return html`<br>`Router document GET /db/<dbName>/<collection>/<document> should return html`<br>`Router database GET /db/<dbName> should return html`<br>`Router index GET / should return html` |
| nedb | exploratory | `./node_modules/.bin/mocha --exit -t 20000 -R spec test/` | 330 | `ensureIndex can be called before a loadDatabase and still be initialized and filled correctly`<br>`database loading will not work and no data will be inserted` |
| node-archiver | exploratory | `./node_modules/.bin/mocha --exit -t 10000 -R spec test/` | 35 | `archiver api #errors should allow continue on stat failing` |
| objection.js | exploratory | `./node_modules/.bin/mocha --exit -t 10000 -R spec tests/unit/utils.js` | 48 | `utils promiseUtils map should not start new operations after an error has been thrown` |
| agentkeepalive-23 | known-bugs | `./node_modules/.bin/mocha --exit -t 10000 -R spec test/` | 24 | `transforms script in a test event race script` |
| fiware-pep-steelskin | known-bugs | `./node_modules/.bin/mocha test/unit/ --timeout 10000` | 210 | `Reuse authentication tokens When a the PEP Proxy has an expired token and another request arrives to the proxy both requests should finish` |
| WhiteboxGhost † | known-bugs | n/a (single script) | - | race-exposing script |
| node-mkdirp † | known-bugs | n/a (single script) | - | race-exposing script |
| node-logger-file-1 | known-bugs | `rm -rf test/log/* && ./node_modules/mocha/bin/mocha --timeout 20000 test/*.js -R spec` | 10 | `triggerRace () should create 6 files and roll 5` |
| socket.io-1862 | known-bugs | `npx mocha test/ -t 20000` | 26 | `base socket.io connect, connect again after delay1 ms, and disconnect each connection after delay2 ms have passed since it connected` |
| del | known-bugs | `./node_modules/.bin/mocha --timeout 1000` | 10 | `should reveal event race` |
| linter-stylint † | known-bugs | n/a (single script) | - | race-exposing script |
| node-simplecrawler-i298 | known-bugs | `./node_modules/.bin/mocha "test/**/*.js"` | 81 | `event race reveals event race` |
| xlsx-extract | known-bugs | `npx mocha` | 14 | `should read all columns and rows` |
| bluebird-2 † | open-issues | n/a (single script) | - | race-exposing script |
| nodesamples (express-user) † | open-issues | n/a (single script) | - | race-exposing script |
| get-port † | open-issues | `npx ava` | - | race-exposing script |
| live-server-potential-race † | open-issues | n/a (single script) | - | race-exposing script |
| socket.io-client | open-issues | `./node_modules/.bin/gulp build && ./node_modules/.bin/gulp test-node` | 59 | race test in `race.js` |
| json-file-store-6aada66 | NodeRT | `./node_modules/.bin/mocha "Store.spec.js" "testcases/*"` | 27 | `testcase1 should reveal event race` |
| json-fs-store-4e75c4f | NodeRT | `./node_modules/.bin/mocha "spec/*" "testcases/"` | 7 | `testcase1 should reveal event race` |
| ncp-6820b0f | NodeRT | `./node_modules/.bin/mocha -R spec` | 15 | `testcase1` to `testcase4` (`should reveal event race 1` to `4`) |
| write-f537eb6 | NodeRT | `./node_modules/mocha/bin/mocha --timeout 20000` | 12 | `reveal event race` |
| fs-extra | NACD | `npm test` | 719 | `ncp regular files and directories when copying files using filter files are copied correctly`<br>`remove + remove() should delete without a callback` |
| **Total** | | | **1,660** | **32 races** |

## Project-specific setup notes

Most projects run out of the box once `npm install` has been done. The following need extra steps.

**General (Node.js 14).** Some projects only print their tests under an older Node.js version. Installing a newer Mocha usually fixes it:

```
npm install --save-dev mocha@9
```

**Test suites wrapped for NodeRock.** For several projects (`agentkeepalive-23`, `del`, `ncp`, `write`, `node-simplecrawler-i298`, `json-file-store`, `json-fs-store`), the original race script was wrapped in a Mocha `it(...)` block so that it runs as a regular test. Some also need a `.mocharc.json`, for example:

```json
{
  "spec": "test/**/*.test.js",
  "reporter": "spec"
}
```

**mongo-express.** Requires a running MongoDB 4.4 instance (for example through Docker Compose, using the `large-scale` benchmark of NACD).

**agentkeepalive-23.** Needs `mocha` installed as a dev dependency and a `.mocharc.json`. One test was adjusted with a `try/catch` and a `done()` call.

**node-logger-file-1.** Remove `this.timeout(0);` from `test/triggerrace.js` to avoid the test hanging, and clean `test/log/*` before each execution (already done in the command above).

**xlsx-extract.** To run under Node.js 14, `unzip2` is replaced by `unzipper`:

```
rm -rf node_modules package-lock.json
# remove "unzip2" from package.json and replace require("unzip2") with require("unzipper")
npm install graceful-fs@4 --save
npm install fstream@latest --save
npm install unzipper --save
npx npm-force-resolutions
npm ls graceful-fs   # must be 4.x
npm install
```

**socket.io-client.** The race test in `race.js` is run through `gulp`.
