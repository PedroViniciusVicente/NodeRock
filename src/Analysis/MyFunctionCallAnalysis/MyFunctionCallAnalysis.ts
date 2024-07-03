// DO NOT INSTRUMENT

import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {EventEmitter} from 'events';
import * as fs from 'fs';
import http from 'http';
import net from 'net';


export class MyFunctionCallAnalysis extends Analysis {

    /*
    ** Obs1: Aqui sao declarados os hooks que serão usados nessa analise
    ** Obs2: Cada hook tem a funcao de chamar o callback (implementado logo abaixo) quando uma
    **       acao especifica acontecer
    ** Obs3: esse "| undefined;" serve para não ficar dando erro se a funcao ainda nao estiver
    **       implementada (aparentemente so eh usada na fase de desenvolvimento)
    **
    ** Veja a lista com todos os hooks possiveis e suas funcoes:
    ** (interface original em: src/Type/nodeprof/Hooks.ts)
    */
    public read: Hooks['read'] | undefined; //sempre que uma variavel eh lida
    public write: Hooks['write'] | undefined; //sempre que uma variavel eh escrita
    public getField: Hooks['getField'] | undefined; //sempre depois que a propriedade de um objeto eh acessada
    public putFieldPre: Hooks['putFieldPre'] | undefined; //sempre antes que a propriedade de um objeto eh escrita
    public functionEnter: Hooks['functionEnter'] | undefined; //sempre antes que a execucao do corpo de uma funcao comeca
    public functionExit: Hooks['functionExit'] | undefined; //sempre depois que a execucao do corpo de uma funcao completa
    public invokeFunPre: Hooks['invokeFunPre'] | undefined; //sempre antes da invocacao de uma funcao, metodo ou construtor
    public invokeFun: Hooks['invokeFun'] | undefined; //sempre depois da invocacao de uma funcao metodo ou construtor
    //forObject
    public startExpression: Hooks['startExpression'] | undefined; // sempre antes de uma expressao
    public endExpression: Hooks['endExpression'] | undefined; // sempre depois de uma expressao
    public literal: Hooks['literal'] | undefined; // sempre depois da criacao de uma literal
    public unary: Hooks['unary'] | undefined; // sempre depois de uma operacao unaria (+, -, !, typeof, etc)
    public unaryPre: Hooks['unaryPre'] | undefined; // sempre antes de uma operacao unaria
    public asyncFunctionEnter: Hooks['asyncFunctionEnter'] | undefined; //sempre que uma funcao assincrona comeca
    public asyncFunctionExit: Hooks['asyncFunctionExit'] | undefined; //sempre que uma funcao assincrona termina
    public awaitPre: Hooks['awaitPre'] | undefined; //sempre antes de uma funcao com await ser chamada
    public awaitPost: Hooks['awaitPost'] | undefined; //sempre depois de uma funcao com await ser resolvida
    public startStatement: Hooks['startStatement'] | undefined; //sempre antes e depois de um statement
    public endExecution: Hooks['endExecution'] | undefined; // sempre que uma execucao do node termina
    
    private timeConsumed: number;
    
    static debugar: boolean = true;
    static apenasHooksPrincipais: boolean = true;
    static pathLogHooks: string;

    // Esse atributo eh um vetor que vai armazenando os logs dos hooks na memoria RAM e escreve no final
    static logsDosHooks: string[] = [];
    // Obs: Na implementação do NodeRT, esse vetor era do tipo object[] = []; para armazenar no formato JSON

    static eventEmitter: EventEmitter = new EventEmitter();
    
    constructor(sandbox: Sandbox)
    {
        // Declaracao para chamar o adicionarHookAoLog sempre que o evento 'AdicionarLogAoVetor' for detectado
        MyFunctionCallAnalysis.eventEmitter.on('AdicionarLogAoVetor', MyFunctionCallAnalysis.adicionarHookAoLog);
        super(sandbox); // Chamada para o construtor de Analysis, que armazena o sandbox e chama o registerHooks
        this.timeConsumed = 0;

    }

    // Funcao que sera chamada ao final: Com o process.on('exit', ...) 
    //   para escrever tudo do vetor logsDosHooks para o arquivo de logs desejado
    public static escreverHooksNoLog(): void {
        //console.log("O escreverHooksNoLog foi chamado!");
        //fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, MyFunctionCallAnalysis.logsDosHooks + '\n');
        
        fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, ''); // Gerar o arquivo zerado
        for (const hookRegistrado of MyFunctionCallAnalysis.logsDosHooks) {
            fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, hookRegistrado + '\n', {flag:'a'});
        }
    }

    public static adicionarHookAoLog(hookAdicionar: string): void {
        //console.log("O adicionarHooksAoLog foi chamado!");
        MyFunctionCallAnalysis.logsDosHooks.push(hookAdicionar);
    }

    protected override registerHooks()
    {
        // -=+=- Inicializacao do path para o endereco correto -=+=-
        
        console.log("Chamou o registerHooks do MyFunctionCallAnalysis:");
        if(MyFunctionCallAnalysis.apenasHooksPrincipais) {
            //console.log("Path do apenas hooks principais!");
            MyFunctionCallAnalysis.pathLogHooks = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logRastrearPrincipaisHooks.txt";
            const mensagemInicial = `-=+=- Log das chamadas dos hooks principais -=+=- \n`;
            //const mensagemLog = mensagemInicial);
            MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemInicial);
        }
        else {
            //console.log("Path de todos os hooks!");
            MyFunctionCallAnalysis.pathLogHooks = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logRastrearHooks.txt";
            const mensagemInicial = `-=+=- Log das chamadas de todos hooks -=+=- \n`;
            //const mensagemLog = mensagemInicial);
            MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemInicial);
        }
        //console.log(`pathlog eh: ${MyFunctionCallAnalysis.pathLogHooks}`);


        // -=+=- Deteccao e registro dos hooks -=+=-

        if (MyFunctionCallAnalysis.apenasHooksPrincipais) {
            // Registro apenas dos hooks principais, para ficar mais facil de entender
            console.log("Testando apenas os hooks principais!");
            
            this.read = (_iid, name, _val, _isGlobal) => {
                //if(name === "fs") {
                //    const mensagemLog = `[read] Acesso de arquivo`;
                //    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                //}
                //else if(name === "openFile") {
                //    const mensagemLog = `[read] Acesso de arquivo com openFile`;
                //    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                //}
                //else if(name === "resolve") {
                if(name === "resolve") {
                    const mensagemLog = `[read]               Resolve de Promise`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };

            //this.write = (_iid, name, val, _lhs, _isGlobal) => {
            //    if(name === "sharedCounter" && (val === 1 || val === 2)) {      
            //        const mensagemLog = `[write] Aumento do sharedCounter para ${val}`;
            //        MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
            //    }
            //};

            //this.functionEnter = (_iid, f, _dis, _args) => {
            //    if (f === setImmediate) {
            //        const mensagemLog = "[functionEnter] Funcao setImmediate entrou em execucao";
            //        MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
            //    }
            //    else if (f === setTimeout) {
            //        const mensagemLog = "[functionEnter] Funcao setTimeout entrou em execucao";
            //        MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
            //    }
            //    else if (f === setInterval) {
            //        const mensagemLog = "[functionEnter] Funcao setInterval entrou em execucao";
            //        MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
            //    }
            //};

            //this.functionExit = (_iid, _returnVal) => {
            //    
            //    const mensagemLog = "[functionExit] Funcao finalizou a execucao";
            //    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
            //};

            this.invokeFunPre = (_iid, f, _base, _args) => {
                if (f === setImmediate) {
                    const mensagemLog = "[invokeFunPre]       Funcao setImmediate foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === setTimeout) {
                    const mensagemLog = "[invokeFunPre]       Funcao setTimeout foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === setInterval) {
                    const mensagemLog = "[invokeFunPre]       Funcao setInterval foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                // Testando para operacoes do http:
                else if (f === http.request || f === http.get) {
                    const mensagemLog = "[invokeFunPre]       Requisicao ao servidor foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === http.createServer) {
                    const mensagemLog = "[invokeFunPre]       Criacao do servidor foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                // Testando para operacoes dos eventEmmiters:
                else if (f === EventEmitter.prototype.addListener
                    || f === EventEmitter.prototype.on
                    || f === EventEmitter.prototype.prependListener)
                {
                    const mensagemLog = "[invokeFunPre]       Criacao do Listener foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === EventEmitter.prototype.off
                    || f === EventEmitter.prototype.removeListener
                    || f === EventEmitter.prototype.removeAllListeners)
                {
                    const mensagemLog = "[invokeFunPre]       Remocao do Listener foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === EventEmitter.prototype.emit) {
                    const mensagemLog = "[invokeFunPre]       Evento emitido foi invocado";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                // Testando as operacoes do net
                if (f === net.createServer) {
                    const mensagemLog = "[invokeFunPre]       Servidor Net foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === net.createConnection || f === net.connect || f === net.Socket) {
                    const mensagemLog = "[invokeFunPre]       Conexao Net foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }

            };
         
            this.invokeFun = (_iid, f, _base, _args) => {
                if (f === setImmediate) {
                    const mensagemLog = "[invokeFun]          Funcao setImmediate terminou sua execucao";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === setTimeout) {
                    const mensagemLog = "[invokeFun]          Funcao setTimeout terminou sua execucao";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === setInterval) {
                    const mensagemLog = "[invokeFun]          Funcao setInterval terminou sua execucao";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                // Testando para operacoes do http:
                else if (f === http.request || f === http.get) {
                    const mensagemLog = "[invokeFun]          Requisicao ao servidor foi finalizada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === http.createServer) {
                    const mensagemLog = "[invokeFun]          Criacao do servidor foi finalizada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                
                // Testando com arquivo com fs
                else if ( f === fs.open || f === fs.read || f === fs.write 
                    || f === fs.readFile || f === fs.writeFile || f === fs.appendFile
                    || f === fs.rename || f === fs.access || f === fs.stat || f === fs.lstat
                    || f === fs.copyFile || f === fs.cp || f === fs.truncate) {
                    const mensagemLog = `[invokeFun]          Arquivo Assincrono foi acessado com a operacao: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === fs.close) {
                    const mensagemLog = "[invokeFun]          Arquivo Assincrono foi fechado";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if(f === fs.rm) {
                    const mensagemLog = "[invokeFun]          Arquivo foi removido de modo Assincrono";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === fs.openSync || f === fs.readSync || f === fs.writeSync 
                    || f === fs.appendFileSync || f === fs.readFileSync || f === fs.writeFileSync
                    || f === fs.renameSync || f === fs.accessSync || f === fs.statSync || f === fs.lstatSync
                    || f === fs.copyFileSync || f === fs.cpSync || f === fs.truncateSync
                    || f === fs.createReadStream || f === fs.createWriteStream ) {
                    const mensagemLog = `[invokeFun]          Arquivo Sincrono foi acessado com a operacao: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === fs.closeSync) {
                    const mensagemLog = "[invokeFun]          Arquivo Sincrono foi fechado";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if(f === fs.rmSync) {
                    const mensagemLog = "[invokeFun]          Arquivo foi removido de modo Sincrono";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }

                // Testando com arquivos do FileHandle e FsPromises
                else if (f === fs.promises.open || f === fs.promises.readFile || f === fs.promises.writeFile 
                    || f === fs.promises.appendFile) {
                    const mensagemLog = "[invokeFun]          Arquivo com promises foi acessado";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };
         
            this.asyncFunctionEnter = (_iid) => {
                const mensagemLog = "[asyncFunctionEnter] Funcao async foi iniciada";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
            };
            // Quando esse asyncFunctionExit eh acionado, significa que agora ele vai executar tambem os comandos
            // depois da funcao async, mas os comandos de dentro da funcao async que foram levadas aos
            // worker threads ainda podem estar executando mesmo depois do asyncFunctionExit
            this.asyncFunctionExit = (_iid, result, _wrappedExceptionVal) => {
                const mensagemLog = `[asyncFunctionExit]  Execucao saiu do escopo da funcao async (retornando: ${result})`;
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
            };

            this.awaitPre = (_iid, _promiseOrValAwaited) => {
                const mensagemLog = "[awaitPre]           Execucao parou no await";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
            };
    
            this.awaitPost = (_iid, _promiseOrValAwaited, valResolveOrRejected, _isPromiseRejected) => {
                const mensagemLog = `[awaitPost]          Execucao do await foi finalizada (retornando: ${valResolveOrRejected})`;
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
            };

            // TODO:
            // verificar se tem algum exemplo de paralelismo que usa a biblioteca bluebird, workerpool, net, child_process e como detectalo
            // Testar com os exemplos da tabela e registrar os seus logs

        }
        else {
            console.log("Testando todos os hooks!");
            this.read = (iid, name, val, isGlobal) => {
                const mensagemLog = "[read] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook read detectou a leitura da variavel: ${name} de iid: ${iid}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Valor lido: ${val}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Variavel eh global? ${isGlobal}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };
    
            this.write = (iid, name, val, lhs, isGlobal) => {        
                const mensagemLog = "[write] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook write detectou a escrita da variavel: ${name} de iid: ${iid}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Valor escrito: ${val}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Valor anterior a escrita: ${lhs}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Variavel eh global? ${isGlobal}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };
    
            this.getField = (iid, base, offset, _val, isComputed) => {
                const mensagemLog = "[getField] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                if(MyFunctionCallAnalysis.debugar) {
                    if(isComputed) {
                        let mensagemLog = `Hook getField detectou o acesso da propriedade ${[offset]} do objeto ${base}`;
                        MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                        //mensagemLog = `Com a prop prop ${String(offset)}`; // ??
                        //MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                        //mensagemLog = `Valor do val: ${_val}`;
                        //MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    }
                    const mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
    
            this.putFieldPre = (iid, base, offset, val, isComputed) => {
                const mensagemLog = "[putFieldPre] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                if(MyFunctionCallAnalysis.debugar) {
                    if(isComputed) {
                        let mensagemLog = `Hook putFieldPre detectou a escrita propriedade ${[offset]} do objeto ${base}`;
                        MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                        //mensagemLog = `Ou a prop ${String(offset)}`; // ??
                        //MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                    }
                    let mensagemLog = `Valor do val: ${val}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };
    
            this.functionEnter = (iid, f, dis, args) => {
                const mensagemLog = `[functionEnter] foi acionado!`;
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                if(MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook functionEnter detectou o comeco da execucao da funcao: ${f}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Argumentos da funcao: ${args}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Valor do dis: ${dis}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };
    
            this.functionExit = (iid, returnVal) => {
                const mensagemLog = `[functionExit] foi acionado!`;
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                if(MyFunctionCallAnalysis.debugar) {
                    // esse hook nao especifica qual eh a funcao que terminou
                    let mensagemLog = `Hook functionExit detectou o fim da execucao de uma funcao`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Valor retornado por essa funcao ${returnVal}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };
    
    
            // esses argumentos sao preenchidos pela propria funcao e usados no callback
            // o mais relevante eh esse "f", que nesse caso indentifica a funcao, metodo ou construtor invocado
            // e ele vai comparando esse f com as funcoes presentes em /node_modules/@types/node para saber
            // qual funcao dentre as catalogadas esta sendo usada
            this.invokeFunPre = (iid, f, base, args) => {
                const mensagemLog = "[invokeFunPre] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook invokeFunPre detectou o inicio da execucao da funcao: ${f}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Objeto base que recebera a funcao: ${base}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Argumentos da funcao: ${args}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };
    
            this.invokeFun = (iid, f, _base, args, result) => {
                const mensagemLog = "[invokeFun] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook invokeFun detectou o termino da funcao: ${f}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Objeto base que recebera a funcao: ${_base}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Argumentos da funcao: ${args}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Valor retornado pela funcao: ${result}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
    
            this.startExpression = (iid, type) => {
                const mensagemLog = "[startExpression] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook startExpression detectou o incio da expressao de tipo: ${type}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };
    
            this.endExpression = (iid, type, value) => {
                const mensagemLog = "[endExpression] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook endExpression detectou o termino da expressao de tipo: ${type}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Valor da expressao: ${value}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
            };
    
            // Esse _fakeHasGetterSetter eh apenas para a API do Jalangi
            this.literal = (iid, val, _fakeHasGetterSetter, literalType) => {
                const mensagemLog = "[literal] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook literal detectou a criacao da literal: ${val}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Tipo da literal: ${literalType}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
    
            // REVER: Onde esta esse typeof detectado dentro da execucao do exemplo?? ele eh executado apenas 1 vez mesmo
            this.unary = (iid, op, left, result) => {
                const mensagemLog = "[unary] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook unary detectou a execucao da operacao unaria: ${op}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Operando da esquerda da operacao unaria: ${left}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Resultado final da operacao unaria: ${result}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
            
            this.unaryPre = (iid, op, left) => {
                const mensagemLog = "[unaryPre] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook unaryPre detectou o inicio da operacao unaria: ${op}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Operando da esquerda da operacao unaria: ${left}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
    
            this.asyncFunctionEnter = (iid) => {
                const mensagemLog = "[asyncFunctionEnter] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    // nao tem como saber qual a funcao??
                    let mensagemLog = `Hook asyncFunctionEnter detectou o inicio de uma funcao assincrona`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
    
            this.asyncFunctionExit = (iid, result, _wrappedExceptionVal) => {
                const mensagemLog = "[asyncFunctionExit] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    // nao tem como saber qual a funcao??
                    let mensagemLog = `Hook asyncFunctionExit detectou o termino de uma funcao assincrona`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
 
                    mensagemLog = `Valor retornado pela funcao: ${result}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
    
            this.awaitPre = (iid, promiseOrValAwaited) => {
                const mensagemLog = "[awaitPre] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    // nao tem como saber qual a funcao??
                    let mensagemLog = `Hook awaitPre detectou o inicio de uma funcao com await`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
 
                    mensagemLog = `Valor esperado pela funcao: ${promiseOrValAwaited}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
    
            this.awaitPost = (iid, promiseOrValAwaited, valResolveOrRejected, isPromiseRejected) => {
                const mensagemLog = "[awaitPost] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    // nao tem como saber qual a funcao??
                    let mensagemLog = `Hook awaitPost detectou o termino de uma funcao com await`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
 
                    mensagemLog = `Valor esperado pela funcao: ${promiseOrValAwaited}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Valor resolvid/rejetado obtido: ${valResolveOrRejected}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `A promise foi rejeitada? ${isPromiseRejected}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
            
            this.startStatement = (iid, type) => {
                const mensagemLog = "[startStatement] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if (MyFunctionCallAnalysis.debugar) {
                    let mensagemLog = `Hook startStatement detectou o inicio ou fim do statement: ${type}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                    mensagemLog = `Local: ${this.getSandbox().iidToLocation(iid)}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
    
            this.endExecution = () => {
                const mensagemLog = "[endExecution] foi acionado!";
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                if(MyFunctionCallAnalysis.debugar) {
                    const mensagemLog = `Hook endExecution detectou o fim da execucao node`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);

                }
            };
        }
        console.log(this.timeConsumed);
    }
}

process.on('exit', () => {
    //console.log("O process.on(exit) foi detectado!");
    MyFunctionCallAnalysis.escreverHooksNoLog();
});

