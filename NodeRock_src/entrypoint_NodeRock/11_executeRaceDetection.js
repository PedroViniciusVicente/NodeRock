// 11. Executes the race detection based on collectedResultsMLFolder to find the event races 

const shell = require('shelljs');

function executePythonML() {

    const command = "python3 entrypoint_NodeRock/pythonML_scripts/race_detection_nacd.py"
    shell.exec(command);

}

module.exports = { executePythonML };