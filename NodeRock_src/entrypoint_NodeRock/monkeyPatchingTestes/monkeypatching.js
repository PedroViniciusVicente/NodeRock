const fs = require('fs');
const path = require('path');

const OldPromise = global.Promise;
let ___promiseIDCounter = 0;

// Caminho para o arquivo JSON que armazenará todas as informações das promises
const logFilePath = path.join(__dirname, "../../FoldersUsedDuringExecution/temporary_promises_logs/promises.json");

// Certifique-se de que o diretório para o arquivo JSON exista
const logsDirectory = path.dirname(logFilePath);
if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
}

// Função para salvar ou atualizar o arquivo JSON com os dados de todas as promises
function saveLog(logData) {
    let allLogs = [];

    // Tenta ler o arquivo existente e carregar os dados
    if (fs.existsSync(logFilePath)) {
        try {
            const existingData = fs.readFileSync(logFilePath, 'utf8');
            allLogs = existingData.trim() ? JSON.parse(existingData) : []; // Evita erro em arquivo vazio
        } catch (err) {
            console.error('Erro ao ler o arquivo de logs:', err);
            allLogs = []; // Se der erro, inicializa como array vazio
        }
    }

    // Adiciona as novas informações e salva novamente
    allLogs.push(logData);
    fs.writeFileSync(logFilePath, JSON.stringify(allLogs, null, 4));
}

global.Promise = class Promise extends OldPromise {
    constructor(executor) {
        const creationTime = Date.now();
        const promiseID = ++___promiseIDCounter;

        executor = new Proxy(executor, {
            apply: function (target, thisArg, argsList) {
                const logData = {
                    promiseID,
                    createdAt: new Date(creationTime).toISOString(),
                    status: 'pending',
                };

                // console.log(`Promise criada: { promiseID: ${promiseID}, time: ${creationTime} }`);
                saveLog(logData);

                if (argsList.length > 0 && typeof argsList[0] === 'function') {
                    argsList[0] = new Proxy(argsList[0], {
                        apply: function (target, thisArg, argsList) {
                            const duration = Date.now() - creationTime;
                            logData.status = 'resolved';
                            logData.durationMs = duration;
                            logData.resolvedAt = new Date().toISOString();

                            // console.log(`Promise resolvida: { promiseID: ${promiseID}, duration: ${duration}ms }`);
                            saveLog(logData);
                            return Reflect.apply(target, thisArg, argsList);
                        }
                    });
                }

                if (argsList.length > 1 && typeof argsList[1] === 'function') {
                    argsList[1] = new Proxy(argsList[1], {
                        apply: function (target, thisArg, argsList) {
                            const duration = Date.now() - creationTime;
                            logData.status = 'rejected';
                            logData.durationMs = duration;
                            logData.rejectedAt = new Date().toISOString();

                            // console.log(`Promise rejeitada: { promiseID: ${promiseID}, duration: ${duration}ms }`);
                            saveLog(logData);
                            return Reflect.apply(target, thisArg, argsList);
                        }
                    });
                }

                return Reflect.apply(target, thisArg, argsList);
            }
        });

        super(executor);
    }
};

// npx mocha --require ./entrypoint_NodeRock/monkeyPatchingTestes/monkeypatching.js /home/pedroubuntu/coisasNodeRT/datasetNodeRT/meuDatasetParaTestes/monkeyPatchingTest/test/test.js