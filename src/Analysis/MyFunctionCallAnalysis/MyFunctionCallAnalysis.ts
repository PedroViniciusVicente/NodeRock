// DO NOT INSTRUMENT

import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import * as fs from 'fs';

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
    
    constructor(sandbox: Sandbox)
    {
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
            MyFunctionCallAnalysis.adicionarHookAoLog(mensagemInicial);
        }
        else {
            //console.log("Path de todos os hooks!");
            MyFunctionCallAnalysis.pathLogHooks = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logRastrearHooks.txt";
            const mensagemInicial = `-=+=- Log das chamadas de todos hooks -=+=- \n`;
            MyFunctionCallAnalysis.adicionarHookAoLog(mensagemInicial);
        }
        //console.log(`pathlog eh: ${MyFunctionCallAnalysis.pathLogHooks}`);
        console.log(this.timeConsumed);


        // -=+=- Deteccao e registro dos hooks -=+=-

        if (MyFunctionCallAnalysis.apenasHooksPrincipais) {
            // Registro apenas dos hooks principais, para ficar mais facil de entender
            console.log("Testando apenas os hooks principais!");

            this.read = (_iid, name, _val, _isGlobal) => {
                if(name === "fs") {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`[read] Leitura do arquivo da primeira/segunda funcao`);
                }
                else if(name === "resolve") {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`[read] Resolve da primeira/segunda funcao`);
                }
            };

            this.write = (_iid, name, val, _lhs, _isGlobal) => {
                if(name === "sharedCounter" && (val === 1 || val === 2)) {      
                    MyFunctionCallAnalysis.adicionarHookAoLog(`[write] Aumento do sharedCounter para ${val}`);
                }
            };

            this.functionEnter = (_iid, f, _dis, _args) => {
                if(f.name === "incrementCounter") {
                    //console.log(`O nome eh: ${f.name}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`[functionEnter] Inicio da primeira/segunda funcao`);
                }   

            };

            this.invokeFunPre = (_iid, f, _base, _args) => {
                if (f === setImmediate) {
                    MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFunPre] Funcao setImmediate foi detectada!");
                }
                else if (f === setTimeout) {
                    MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFunPre] Funcao setTimeout foi detectada!");
                }
                else if (f === setInterval) {
                    MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFunPre] Funcao setInterval foi detectada!");
                }
                //else {
                //    MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFunPre] Funcao indefinida foi detectada!");
                //}
            };
         
            this.invokeFun = (_iid, f, _base, _args) => {
                if (f === setImmediate) {
                    MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFun] Funcao setImmediate foi detectada!");
                }
                else if (f === setTimeout) {
                    MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFun] Funcao setTimeout foi detectada!");
                }
                else if (f === setInterval) {
                    MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFun] Funcao setInterval foi detectada!");
                }
                //else {
                //    MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFun] Funcao indefinida foi detectada!");
                //}
            };
         
            this.asyncFunctionEnter = (_iid) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[asyncFunctionEnter] Funcao async do raceConditionNode foi iniciada!");
            };
         
            //this.asyncFunctionExit = (_iid, result, _wrappedExceptionVal) => {
            //    MyFunctionCallAnalysis.adicionarHookAoLog(`[asyncFunctionExit] Funcao async foi detectada! (retornando ${result})`);
            //};

            //this.awaitPre = (_iid, _promiseOrValAwaited) => {
            //    MyFunctionCallAnalysis.adicionarHookAoLog("[awaitPre] Promise foi inciada!");
            //};
    
            this.awaitPost = (_iid, _promiseOrValAwaited, valResolveOrRejected, _isPromiseRejected) => {
                MyFunctionCallAnalysis.adicionarHookAoLog(`[awaitPost] Promise.all foi finalizada! (retornando ${valResolveOrRejected})`);
            };
        }
        else {
            console.log("Testando todos os hooks!");
            this.read = (iid, name, val, isGlobal) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[read] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook read detectou a leitura da variavel: ${name} de iid: ${iid}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor lido: ${val}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Variavel eh global? ${isGlobal}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.write = (iid, name, val, lhs, isGlobal) => {        
                MyFunctionCallAnalysis.adicionarHookAoLog("[write] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook write detectou a escrita da variavel: ${name} de iid: ${iid}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor escrito: ${val}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor anterior a escrita: ${lhs}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Variavel eh global? ${isGlobal}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.getField = (iid, base, offset, _val, isComputed) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[getField] foi acionado!");
                if(MyFunctionCallAnalysis.debugar) {
                    if(isComputed) {
                        MyFunctionCallAnalysis.adicionarHookAoLog(`Hook getField detectou o acesso da propriedade ${[offset]} do objeto ${base}`);
                        //MyFunctionCallAnalysis.adicionarHookAoLog(`Com a prop prop ${String(offset)}`); // ??
                        //MyFunctionCallAnalysis.adicionarHookAoLog(`Valor do val: ${_val}`);
                    }
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.putFieldPre = (iid, base, offset, val, isComputed) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[putFieldPre] foi acionado!");
                if(MyFunctionCallAnalysis.debugar) {
                    if(isComputed) {
                        MyFunctionCallAnalysis.adicionarHookAoLog(`Hook putFieldPre detectou a escrita propriedade ${[offset]} do objeto ${base}`);
                        //MyFunctionCallAnalysis.adicionarHookAoLog(`Ou a prop ${String(offset)}`); // ??
                    }
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor do val: ${val}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.functionEnter = (iid, f, dis, args) => {
                MyFunctionCallAnalysis.adicionarHookAoLog(`[functionEnter] foi acionado!`);
                if(MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook functionEnter detectou o comeco da execucao da funcao: ${f}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Argumentos da funcao: ${args}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor do dis: ${dis}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.functionExit = (iid, returnVal) => {
                MyFunctionCallAnalysis.adicionarHookAoLog(`[functionExit] foi acionado!`);
                if(MyFunctionCallAnalysis.debugar) {
                    // esse hook nao especifica qual eh a funcao que terminou
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook functionExit detectou o fim da execucao de uma funcao`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor retornado por essa funcao ${returnVal}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
    
            // esses argumentos sao preenchidos pela propria funcao e usados no callback
            // o mais relevante eh esse "f", que nesse caso indentifica a funcao, metodo ou construtor invocado
            // e ele vai comparando esse f com as funcoes presentes em /node_modules/@types/node para saber
            // qual funcao dentre as catalogadas esta sendo usada
            this.invokeFunPre = (iid, f, base, args) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFunPre] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook invokeFunPre detectou o inicio da execucao da funcao: ${f}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Objeto base que recebera a funcao: ${base}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Argumentos da funcao: ${args}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.invokeFun = (iid, f, _base, args, result) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[invokeFun] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook invokeFun detectou o termino da funcao: ${f}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Objeto base que recebera a funcao: ${_base}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Argumentos da funcao: ${args}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor retornado pela funcao: ${result}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.startExpression = (iid, type) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[startExpression] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook startExpression detectou o incio da expressao de tipo: ${type}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.endExpression = (iid, type, value) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[endExpression] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook endExpression detectou o termino da expressao de tipo: ${type}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor da expressao: ${value}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            // Esse _fakeHasGetterSetter eh apenas para a API do Jalangi
            this.literal = (iid, val, _fakeHasGetterSetter, literalType) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[literal] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook literal detectou a criacao da literal: ${val}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Tipo da literal: ${literalType}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            // REVER: Onde esta esse typeof detectado dentro da execucao do exemplo?? ele eh executado apenas 1 vez mesmo
            this.unary = (iid, op, left, result) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[unary] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook unary detectou a execucao da operacao unaria: ${op}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Operando da esquerda da operacao unaria: ${left}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Resultado final da operacao unaria: ${result}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
            
            this.unaryPre = (iid, op, left) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[unaryPre] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook unaryPre detectou o inicio da operacao unaria: ${op}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Operando da esquerda da operacao unaria: ${left}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.asyncFunctionEnter = (iid) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[asyncFunctionEnter] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    // nao tem como saber qual a funcao??
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook asyncFunctionEnter detectou o inicio de uma funcao assincrona`); 
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.asyncFunctionExit = (iid, result, _wrappedExceptionVal) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[asyncFunctionExit] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    // nao tem como saber qual a funcao??
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook asyncFunctionExit detectou o termino de uma funcao assincrona`); 
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor retornado pela funcao: ${result}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.awaitPre = (iid, promiseOrValAwaited) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[awaitPre] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    // nao tem como saber qual a funcao??
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook awaitPre detectou o inicio de uma funcao com await`); 
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor esperado pela funcao: ${promiseOrValAwaited}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.awaitPost = (iid, promiseOrValAwaited, valResolveOrRejected, isPromiseRejected) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[awaitPost] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    // nao tem como saber qual a funcao??
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook awaitPost detectou o termino de uma funcao com await`); 
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor esperado pela funcao: ${promiseOrValAwaited}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Valor resolvid/rejetado obtido: ${valResolveOrRejected}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`A promise foi rejeitada? ${isPromiseRejected}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
            
            this.startStatement = (iid, type) => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[startStatement] foi acionado!");
                if (MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook startStatement detectou o inicio ou fim do statement: ${type}`);
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Local: ${this.getSandbox().iidToLocation(iid)}`);
                }
            };
    
            this.endExecution = () => {
                MyFunctionCallAnalysis.adicionarHookAoLog("[endExecution] foi acionado!");
                if(MyFunctionCallAnalysis.debugar) {
                    MyFunctionCallAnalysis.adicionarHookAoLog(`Hook endExecution detectou o fim da execucao node`);
                }
            };
        }
    }
}

process.on('exit', () => {
    //console.log("O process.on(exit) foi detectado!");
    MyFunctionCallAnalysis.escreverHooksNoLog();
});

