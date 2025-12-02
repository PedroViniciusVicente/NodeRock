// 10. Executes the Python script with the Machine Learning Supervised Models and generate the predicted_tests_results.json

const shell = require('shelljs');

function executePythonML() {

    const command = "python3 entrypoint_NodeRock/pythonML_scripts/PUL_selection.py"
    shell.exec(command);

}

module.exports = { executePythonML };