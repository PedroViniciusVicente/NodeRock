# NodeRTDataset

Dataset of NodeRT. 

All original outputs are putted under the `detectResult` folder.

In the known races dataset, the reproducing test case is named `testcase.js`.

In the exploration dataset, the reproducing test cases are putted under the `testcases` folders.

## About NRace

[The source code of NRace](https://github.com/tcse-iscas/nrace) open sourced by Chang etc. includes some bugs and is not executable. 

We fixed the bugs with the help of Chang. The source code of NRace that we used in the experiments is stored [here](https://github.com/NodeRT-OpenSource/nrace). Further, to remove the trace size limitation we mention in the paper, check out our [description](https://github.com/NodeRT-OpenSource/nrace#unlocked-version).

## Races that NodeRT detects

### Known Races Dataset

1. https://github.com/telefonicaid/fiware-pep-steelskin/issues/477 
    - Fix: https://github.com/telefonicaid/fiware-pep-steelskin/pull/478
2. https://github.com/socketio/socket.io-adapter/pull/76

### Exploration Dataset

1. https://github.com/jonschlinkert/write/issues/13
2. https://github.com/flosse/json-file-store/issues/22
3. https://github.com/alexkwolfe/json-fs-store/issues/12
4. https://github.com/AvianFlu/ncp/issues/141
5. https://github.com/AvianFlu/ncp/issues/142
6. https://github.com/AvianFlu/ncp/issues/144
7. https://github.com/AvianFlu/ncp/issues/145