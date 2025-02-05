// 9. Executes the Python script with the Machine Learning Supervised Models and generate the result.csv

const shell = require('shelljs');

function executePythonML(pathProjectFolder) {

    // shell.exec("pwd"); // /home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource pois eh o endereco que vc esta antes de executar o comando
    const command = "python3 entrypoint_NodeRock/testsPython/main.py"
    shell.exec(command);

}

module.exports = { executePythonML };