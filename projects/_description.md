# This folder stores the projects that are being analysed by NodeRock.
You can download the projects in: https://drive.google.com/drive/folders/1tSmqRCo-l0s_pRtEbzld8SCLYkLamiD3?usp=sharing

To extract the projects along with their NodeRock analysis log, use:
```
tar -xzvf compacted_projects.tar.gz
```

## NodeRacer Benchmarks

Files used to run the projects

Exploratory: https://github.com/andreendo/nacd/blob/main/benchmarks/noderacer-benchmarks-3.js

Open-issues: https://github.com/andreendo/nacd/blob/main/benchmarks/noderacer-benchmarks-2.js

Known-bugs: https://github.com/andreendo/noderacer/blob/master/tests/experiments/known-bugs/start-noderacer.js or https://github.com/andreendo/nacd/blob/main/benchmarks/noderacer-benchmarks.js

### exploratory

#### Mongo-express
(Deve dar o docker compose up no coisasNACD2/nacd/benchmarks/large-scale antes para deixar o mongodb v4.4 rodando)
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/exploratory/mongo-express$

./node_modules/.bin/mocha --exit -t 10000 -R spec test/
```
33/49 - (16 pending)

Testes com event race:
- Router collection GET /db/<dbName>/<collection> should return html
- Router document GET /db/<dbName>/<collection>/<document> should return html
- Router database GET /db/<dbName> should return html
- Router index GET / should return html

##### nedb
(quando utiliza o node v14, os testes não são printados, precisa pegar os testes em uma etapa específica apenas para pegar os testes com node v10)
(para resolver isso, tentar baixar o mocha da versao 14:)
```
npm install --save-dev mocha@9
```

```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/exploratory/nedb$

./node_modules/.bin/mocha --exit -t 20000 -R spec test/
```
330/330

Testes com event race:
- ensureIndex can be called before a loadDatabase and still be initialized and filled correctly
- database loading will not work and no data will be inserted

#### node-archiver
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/exploratory/node-archiver$

./node_modules/.bin/mocha --exit -t 10000 -R spec test/
```
35/37

Teste com event race
- archiver api #errors should allow continue on stat failing


#### objection.js
(Apenas consegui rodar os testes unitários do objection.js, mas está OK :D)
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/exploratory/objection.js$

./node_modules/.bin/mocha --exit -t 10000 -R spec tests/unit/utils.js
```
48/48

Teste com event race:
- utils promiseUtils map should not start new operations after an error has been thrown


### known-bugs

#### agentkeepalive-23
(tive de dar npm install --save-dev mocha , nvm use 16, npm i , criar o arquivo .mocharc.json)
```
{
  "spec": "test/**/*.test.js",
  "reporter": "spec"
}
```
Além de adicionar um try catch e adicionar um done();
E precisa usar o nvm use 16. para funcionar no node 14 precisa usar o seguinte comando:
```
npm install --save-dev mocha@9
```
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/known-bugs/agentkeepalive-23$
./node_modules/.bin/mocha --exit -t 10000 -R spec test/
```
24/24

Teste com event race:
- transforms script in a test event race script


#### fiware-pep-steelskin
(tive de apenas descomentar os arquivo de tests/unit que começavam com ".")
e precisa usar nvm use 10 ou usar i comando abaixo:

```
npm install --save-dev mocha@9
```

```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/known-bugs/fiware-pep-steelskin$
./node_modules/.bin/mocha test/unit/ --timeout 10000
```
210/270

Teste com event race:
- Reuse authentication tokens When a the PEP Proxy has an expired token and another request arrives to the proxy both requests should finish

#### WhiteboxGhost
(nao consegui achar os demais testes)

#### node-mkdirp
(nao consegui achar os demais testes)

#### nes
precisa do nvm use 10
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/known-bugs/nes$
node_modules/lab/bin/lab -v test/
```
60/94

Teste com event race:
- Browser Client _reconnect() Requests 1 close and 1 disconnect

#### node-logger-file-1
(precisou setar o arquivo de testes na mão)
(tem que comentar o this.timeout(0); em test/triggerrace.js para não dar hang no teste, além de lembrar de limpar o folder de log/* antes de executar os testes)


```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/known-bugs/node-logger-file-1$
rm -rf test/log/* && ./node_modules/mocha/bin/mocha --timeout 20000 test/*.js -R spec
```
9/10

Teste com event race:
- triggerRace () should create 6 files and roll 5:
- maxfiles () should create 6 files and delete 4


#### socket.io-1862
precisou fazer:
```
rm -rf node_modules
rm -rf package-lock.json

npm i
npm install backo2
```
aumentar o valor do this.timeout(0); de 0 para 20000
```
npx mocha test/ -t 20000
```
13/35

- base socket.io connect, connect again after delay1 ms, and disconnect each connection after delay2 ms have passed since it connected

#### del
(added a .mocharc.json e envolveu o script com o it(''))
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/known-bugs/del$
./node_modules/.bin/mocha --timeout 1000
```
10/10

Teste com event race:
- should reveal event race

#### linter-stylint

#### node-simplecrawler-i298
(envolveu o script testcase/client/crawler.js com o it('') e colocou essa pasta dentro de test/)
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/nodert/knownbugs/simplecrawler-issue298-ab1af21$
./node_modules/.bin/mocha "test/**/*.js"
```
81/96

Teste com event race:
- event race reveals event race

#### xlsx-extract
(nvm use 10)

para funcionar no nvm use 14, precisou:
```
rm -rf node_modules
rm -rf package-lock.json

(remover o unzip2 do package.json)
substituur o require de "unzip2" por "unzipper"

npm install graceful-fs@4 --save
npm install fstream@latest --save
npm install unzipper --save

npx npm-force-resolutions

(garantir que o graceful-fs esta na versao 4.x e não na versao 3.x)
npm ls graceful-fs

npm install
```
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/known-bugs/xlsx-extract$

<!-- ./node_modules/mocha/bin/mocha test/ --timeout 20000 -->
npx mocha
```
14/14

Teste com event races:
- should read all columns and rows

### open-issues


#### bluebird-2

#### nodesamples (express-user)

#### get-port

```
npx ava
```
11/11

Teste com event race:
- (Tem que encapsular o triggerRace ainda)

#### live-server-potential-race

#### socket.io-client
Ainda tem que encapsular o teste em race.js
```
./node_modules/.bin/gulp build
./node_modules/.bin/gulp test-node
```
21/22


## NodeRT Benchmarks

### explore

#### json-file-store-6aada66

```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/nodert/explore/json-file-store-6aada66$
./node_modules/.bin/mocha "Store.spec.js" "testcases/*"
```
27/27

Teste com event race:
- testcase1 should reveal event race

#### json-fs-store-4e75c4f
(talvez vá precisar rever o fato de que precisa ter 2 argumentos para rodar os testes)
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/nodert/explore/json-fs-store-4e75c4f$
./node_modules/.bin/mocha "spec/*" "testcases/"
```
7/7

Teste com event race:
- tescase1 should reveal event race

#### ncp-6820b0f
(precisou adicionar o .mocharc.json, atualizar o mocha para versao 9, e envolver os testcases. Talvez tenha de remover alguns prints ou asserts exagerados)
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/nodert/explore/ncp-6820b0f$ ./node_modules/.bin/mocha -R spec
```
15/15

Testes com event race:
- tescase1 should reveal event race 1
- tescase2 should reveal event race 2
- tescase3 should reveal event race 3
- tescase4 should reveal event race 4

#### write-f537eb6
(precisou adicionar o .mocharc.json e envolver o testcases com o it)
```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/nodert/explore/write-f537eb6$
./node_modules/mocha/bin/mocha --timeout 20000
```
12/12

Teste com event race:
- reveal event race

## NACD

#### fs-extra

```
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource/projects/fsextra$
npm test
```
729/732

Testes com event race:
- ncp regular files and directories when copying files using filter files are copied correctly
- remove + remove() should delete without a callback

## NRace
(descobriu o json-file-store e o nodejs-websocket. ambos já estão no dataset do NodeRT)
