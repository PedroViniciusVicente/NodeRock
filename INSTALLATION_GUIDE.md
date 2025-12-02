<!-- # NodeRock -->

<!-- **NodeRock** is a tool... that does this and can be used for thiss... designed by... and .. acknoledgemts... the implementation is made with ... -->

# Guide for installing and Using NodeRock

_Adapted from [Matheus Ranzani's NodeRT installation Guide](https://github.com/matheusranzani/Desenvolvimento-TT1/blob/main/README.md)._

**NodeRock** is built on top of **NodeRT**, and therefore a basic installation guide can be found in the official [project repository](https://github.com/NodeRT-OpenSource/NodeRT-OpenSource). However, some errors may occur during the installation of the tool. \
Therefore, here is a more detailed guide for installing **NodeRock**. \
_Note: the commands used here are for Debian/Ubuntu-based Linux distributions._

### Prerequisites

To use NodeRT, you first need to have Node.js and yarn installed on your machine.

#### Installing Node.js
```sh
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Installing yarn
```sh
npm install --global yarn
```

### Installing GraalVM

Now that the basic tools are installed, you need to install GraalVM, which is a JDK capable of running Node.js applications. In the case of **NodeRock**, version 21.2.0 was used. \
The link to download version 21.2.0 is [here](https://github.com/graalvm/graalvm-ce-builds/releases/tag/vm-21.2.0). There are various options available — here, the file graalvm-ce-java11-linux-amd64-21.2.0.tar.gz was used. \
Once the file is downloaded, extract it to a directory of your choice on your machine. \
After extracting the file, you'll have access to the folder graalvm-ce-java11-21.2.0. Now, you can set the `JAVA_HOME` environment variable and add GraalVM to your `PATH`.\
To do both, add the following lines to your `~/.bashrc` or `~/.zshrc` file (if you're using Z shell):

Open the file for editing:
```sh
nano ~/.bashrc
```
Add the following lines:
```bash
export PATH=$PATH:/path_to/graalvm-ce-java11-21.2.0/bin
export PATH=/path_to/graalvm-ce-java11-21.2.0/bin:$PATH
export JAVA_HOME=/path_to/graalvm-ce-java11-21.2.0
```

Save the file, then run:
```sh
source ~/.bashrc
```

To confirm everything is working, run:
```sh
java --version
```

Your shell should display something like (you may need to restart the shell):
```
openjdk 11.0.12 2021-07-20
OpenJDK Runtime Environment GraalVM CE 21.2.0 (build 11.0.12+6-jvmci-21.2-b08)
OpenJDK 64-Bit Server VM GraalVM CE 21.2.0 (build 11.0.12+6-jvmci-21.2-b08, mixed mode, sharing)
```

With GraalVM installed, now install Node.js through it. To do so, run the following commands:
```sh
cd /path_to/graalvm-ce-java11-21.2.0/bin
gu install nodejs
```

Now, create a symbolic link for the _node_ binary in the _graalvm-ce-java11-21.2.0/bin_ folder as follows:

```sh
ln -s node graalnode
```

Check if the installation was successful by executing the symbolic link:
```sh
graalnode -v
```

If everything worked, your shell should display `v14.16.1`, which is the Node.js version installed via GraalVM.

## Example Usage

With the tools described above installed, you can now test **NodeRock**. To do so, first clone the [project repository](https://github.com/PedroViniciusVicente/NodeRock):
```sh
git clone https://github.com/PedroViniciusVicente/NodeRock
```

Navigate to the root of the **NodeRock** project using the shell and run the following command to build the tool:
```sh
yarn && yarn build
```

Before executing the tool, you must prepare the application you wish to analyze.
For example, to reproduce the analysis from RQ3, download and extract the builded version of node-archiver project from [here](https://drive.google.com/drive/folders/1tSmqRCo-l0s_pRtEbzld8SCLYkLamiD3?usp=sharing).

```bash
tar -xzvf compacted_projects.tar.gz
```

Build the target project (the project you want to analyze), and ensure the project is placed in the correct directory. It must align with the path defined in the [1_chosenProject.js](NodeRock_src/entrypoint_NodeRock/1_chosenProject.js) file.

Once the target project is built and correctly positioned, navigate to the source directory and run the entry point:
```
cd NodeRock_src
node entrypoint_NodeRock
```

After running the command, wait for the metrics collection process to finish.

Once completed, the results will be generated in a directory named NodeRock_Info, which can be found in the root directory of the analyzed project. In this directory, there will be the execution log of all the analyzed tests, along with a json file with the selected and prioritized tests according to the Machine Learning strategy (selected_tests_results.json).

After that, switch node version to 10 and execute the [race_detection_nacd.py](NodeRock_src/entrypoint_NodeRock/pythonML_scripts/race_detection_nacd.py) script to execute the NACD 100 runs analysis.

<!-- ```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/NodeRock_src$ node entrypoint_NodeRock/
``` -->

<!-- (Terminar o tutorial com a instalação dos projetos de teste, npm install neles, colocar o path direitinho no 1_chosenProject.js e depois dar `node NodeRock_src/entrypoint_NodeRock`, talvez deixar um arquivo main.js na raiz do NodeRock para apenas dar o node main.js mais facilmente com o path já configurado certinho nele...) -->

<!-- Após clonar o projeto, para não ocorrer conflitos entre os arquivos `package.json` do **NodeRT** e dos projetos do _dataset_, é preciso mover a pasta _dataset_ para outro diretório fora do projeto do **NodeRT**.\ 
Depois de mover a pasta _dataset_, entre na raiz do projeto do **NodeRT** através do shell e execute o seguinte comando para buildar a ferramenta: 
```sh
yarn && yarn build
```

Para a ferramenta funcionar corretamente é preciso alterar o arquivo `src/Analysis/index.ts`. A única alteração que deve ser feita é comentar a linha 145:

```ts
// sandbox.addAnalysis(new MemoryUsageAnalysis(sandbox));
```

Com a linha acima comentada, é preciso escolher qual projeto do _dataset_ será testado. Para exemplificar aqui, vou escolher o projeto _json-file-store-issue20-6aada66_ que está no diretório `dataset/knownBugs`.\
Antes de utilizar a ferramenta, para cada projeto do _dataset_ é preciso adicionar a pasta `node_modules`. Para fazer isso, basta entrar pelo shell na raiz do projeto selecionado e executar o comando:
```sh
npm install
```

Feito isso, volte para a raiz do repositório do **NodeRT** através do shell. Agora, vamos testar a ferramenta em si utilizando o seguinte comando:
```sh
yarn nodeprof /caminho_para/dataset/knownBugs/json-file-store-issue20-6aada66 testcase.js
```

Ao executar o comando acima, a ferramenta começará a analisar o caso de teste apontado, no escopo deste projeto o caso de teste está em sua raiz e tem o nome `testcase.js`.\
Em outros projetos, o caso de teste pode estar numa pasta `test`, por exemplo. Dessa maneira, para referenciar o teste usando o comando acima é necessário passar o caminho relativo da raiz do projeto até o caso de teste, neste exemplo ficaria:
```sh
yarn nodeprof /caminho_para/dataset/knownBugs/json-file-store-issue20-6aada66 test/testcase.js
```

Após a ferramenta terminar sua execução, um arquivo `violations.json` será criado no diretório do caso de teste analisado. Caso a análise tenha dado certo, este arquivo provavelmente não estará vazio e seu conteúdo será composto por referências para as condições de corrida identificadas no teste.

### Executando projetos que utilizam o Mocha

Alguns projetos do dataset utilizam o **Mocha** para fazer seus testes. Desse modo, é preciso rodar a ferramenta de um jeito um pouco diferente:

```sh
yarn nodeprof /caminho_para/dataset/explore/nodejs-websocket-e6a57ed/ node_modules/bin/_mocha test/test.js
```

Passando como segundo argumento o caminho `node_modules/bin/_mocha`, o **NodeRT** será capaz de executar e analisar os testes escritos em **Mocha**.\
Da mesma forma descrita anteriormente, se a análise for bem sucedida, um arquivo `violations.json` será criado com o conteúdo dos _event races_ identificados. -->