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
    
    private debugar: boolean = false;
    private ApenasHooksPrincipais: boolean = true;
    private pathLogHooks: string;

    constructor(sandbox: Sandbox)
    {
        super(sandbox); // Chamada para o construtor de Analysis, que armazena o sandbox e chama o registerHooks
        this.timeConsumed = 0;

        if(this.ApenasHooksPrincipais) {
            this.pathLogHooks = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logRastrearPrincipaisHooks.txt";
        }
        else {
            this.pathLogHooks = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logRastrearHooks.txt";
        }
        fs.writeFileSync(this.pathLogHooks, '', {flag: 'w'});
        const mensagemInicial = `-=+=- Log das chamadas dos hooks -=+=- \n\n`;
        fs.writeFileSync(this.pathLogHooks, mensagemInicial);
    }

    protected override registerHooks()
    {

        //console.log("\nTestando as funcoes do MyFunctionCallAnalysis:");
        console.log(this.timeConsumed);
        // GerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterOperationLogger", "registerHooks");
        if (this.ApenasHooksPrincipais == false) {
            this.read = (iid, name, val, isGlobal) => {
                fs.appendFileSync(this.pathLogHooks, "[read] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook read detectou a leitura da variavel: ${name} de iid: ${iid}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Valor lido: ${val}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Variavel eh global? ${isGlobal}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.write = (iid, name, val, lhs, isGlobal) => {        
                fs.appendFileSync(this.pathLogHooks, "[write] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook write detectou a escrita da variavel: ${name} de iid: ${iid}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Valor escrito: ${val}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Valor anterior a escrita: ${lhs}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Variavel eh global? ${isGlobal}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.getField = (iid, base, offset, _val, isComputed) => {
                fs.appendFileSync(this.pathLogHooks, "[getField] foi acionado!\n");
                if(this.debugar) {
                    if(isComputed) {
                        fs.appendFileSync(this.pathLogHooks, `Hook getField detectou o acesso da propriedade ${[offset]} do objeto ${base}\n`);
                        //fs.appendFileSync(this.pathLogHooks, `Com a prop prop ${String(offset)}\n`); // ??
                        //fs.appendFileSync(this.pathLogHooks, `Valor do val: ${_val}\n`);
                    }
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.putFieldPre = (iid, base, offset, val, isComputed) => {
                fs.appendFileSync(this.pathLogHooks, "[putFieldPre] foi acionado!\n");
                if(this.debugar) {
                    if(isComputed) {
                        fs.appendFileSync(this.pathLogHooks, `Hook putFieldPre detectou a escrita propriedade ${[offset]} do objeto ${base}\n`);
                        //fs.appendFileSync(this.pathLogHooks, `Ou a prop ${String(offset)}\n`); // ??
                    }
                    fs.appendFileSync(this.pathLogHooks, `Valor do val: ${val}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.functionEnter = (iid, f, dis, args) => {
                fs.appendFileSync(this.pathLogHooks, `[functionEnter] foi acionado!\n`);
                if(this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook functionEnter detectou o comeco da execucao da funcao: ${f}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Argumentos da funcao: ${args}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Valor do dis: ${dis}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.functionExit = (iid, returnVal) => {
                fs.appendFileSync(this.pathLogHooks, `[functionExit] foi acionado!\n`);
                if(this.debugar) {
                    // esse hook nao especifica qual eh a funcao que terminou
                    fs.appendFileSync(this.pathLogHooks, `Hook functionExit detectou o fim da execucao de uma funcao\n`);
                    fs.appendFileSync(this.pathLogHooks, `Valor retornado por essa funcao ${returnVal}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };


            // esses argumentos sao preenchidos pela propria funcao e usados no callback
            // o mais relevante eh esse "f", que nesse caso indentifica a funcao, metodo ou construtor invocado
            // e ele vai comparando esse f com as funcoes presentes em /node_modules/@types/node para saber
            // qual funcao dentre as catalogadas esta sendo usada
            this.invokeFunPre = (iid, f, base, args) => {
                fs.appendFileSync(this.pathLogHooks, "[invokeFunPre] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook invokeFunPre detectou o inicio da execucao da funcao: ${f}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Objeto base que recebera a funcao: ${base}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Argumentos da funcao: ${args}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.invokeFun = (iid, f, _base, args, result) => {
                fs.appendFileSync(this.pathLogHooks, "[invokeFun] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook invokeFun detectou o termino da funcao: ${f}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Objeto base que recebera a funcao: ${_base}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Argumentos da funcao: ${args}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Valor retornado pela funcao: ${result}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.startExpression = (iid, type) => {
                fs.appendFileSync(this.pathLogHooks, "[startExpression] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook startExpression detectou o incio da expressao de tipo: ${type}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.endExpression = (iid, type, value) => {
                fs.appendFileSync(this.pathLogHooks, "[endExpression] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook endExpression detectou o termino da expressao de tipo: ${type}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Valor da expressao: ${value}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            // Esse _fakeHasGetterSetter eh apenas para a API do Jalangi
            this.literal = (iid, val, _fakeHasGetterSetter, literalType) => {
                fs.appendFileSync(this.pathLogHooks, "[literal] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook literal detectou a criacao da literal: ${val}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Tipo da literal: ${literalType}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            // REVER: Onde esta esse typeof detectado dentro da execucao do exemplo?? ele eh executado apenas 1 vez mesmo
            this.unary = (iid, op, left, result) => {
                fs.appendFileSync(this.pathLogHooks, "[unary] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook unary detectou a execucao da operacao unaria: ${op}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Operando da esquerda da operacao unaria: ${left}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Resultado final da operacao unaria: ${result}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };
            
            this.unaryPre = (iid, op, left) => {
                fs.appendFileSync(this.pathLogHooks, "[unaryPre] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook unaryPre detectou o inicio da operacao unaria: ${op}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Operando da esquerda da operacao unaria: ${left}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.asyncFunctionEnter = (iid) => {
                fs.appendFileSync(this.pathLogHooks, "[asyncFunctionEnter] foi acionado!\n");
                if (this.debugar) {
                    // nao tem como saber qual a funcao??
                    fs.appendFileSync(this.pathLogHooks, `Hook asyncFunctionEnter detectou o inicio de uma funcao assincrona\n`); 
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.asyncFunctionExit = (iid, result, _wrappedExceptionVal) => {
                fs.appendFileSync(this.pathLogHooks, "[asyncFunctionExit] foi acionado!\n");
                if (this.debugar) {
                    // nao tem como saber qual a funcao??
                    fs.appendFileSync(this.pathLogHooks, `Hook asyncFunctionExit detectou o termino de uma funcao assincrona\n`); 
                    fs.appendFileSync(this.pathLogHooks, `Valor retornado pela funcao: ${result}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.awaitPre = (iid, promiseOrValAwaited) => {
                fs.appendFileSync(this.pathLogHooks, "[awaitPre] foi acionado!\n");
                if (this.debugar) {
                    // nao tem como saber qual a funcao??
                    fs.appendFileSync(this.pathLogHooks, `Hook awaitPre detectou o inicio de uma funcao com await\n`); 
                    fs.appendFileSync(this.pathLogHooks, `Valor esperado pela funcao: ${promiseOrValAwaited}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.awaitPost = (iid, promiseOrValAwaited, valResolveOrRejected, isPromiseRejected) => {
                fs.appendFileSync(this.pathLogHooks, "[awaitPost] foi acionado!\n");
                if (this.debugar) {
                    // nao tem como saber qual a funcao??
                    fs.appendFileSync(this.pathLogHooks, `Hook awaitPost detectou o termino de uma funcao com await\n`); 
                    fs.appendFileSync(this.pathLogHooks, `Valor esperado pela funcao: ${promiseOrValAwaited}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Valor resolvid/rejetado obtido: ${valResolveOrRejected}\n`);
                    fs.appendFileSync(this.pathLogHooks, `A promise foi rejeitada? ${isPromiseRejected}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };
            
            this.startStatement = (iid, type) => {
                fs.appendFileSync(this.pathLogHooks, "[startStatement] foi acionado!\n");
                if (this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook startStatement detectou o inicio ou fim do statement: ${type}\n`);
                    fs.appendFileSync(this.pathLogHooks, `Local: ${this.getSandbox().iidToLocation(iid)}\n`);
                }
            };

            this.endExecution = () => {
                fs.appendFileSync(this.pathLogHooks, "[endExecution] foi acionado!\n");
                if(this.debugar) {
                    fs.appendFileSync(this.pathLogHooks, `Hook endExecution detectou o fim da execucao node\n`);
                }
            };
        }
        else {
            // Registro apenas dos hooks principais, para ficar mais facil de entender

            // talvez adicionar o rastreamento de eventEmmiters e fileOperations tambem
            this.invokeFunPre = (_iid, f, _base, _args) => {
                if (f === setImmediate) {
                    fs.appendFileSync(this.pathLogHooks, "[invokeFunPre] Funcao setImmediate foi detectada!\n");
                }
                else if (f === setTimeout) {
                    fs.appendFileSync(this.pathLogHooks, "[invokeFunPre] Funcao setTimeout foi detectada!\n");
                }
                else if (f === setInterval) {
                    fs.appendFileSync(this.pathLogHooks, "[invokeFunPre] Funcao setInterval foi detectada!\n");
                }
                //else {
                //    fs.appendFileSync(this.pathLogHooks, "[invokeFunPre] Funcao indefinida foi detectada!\n");
                //}
            };

            this.invokeFun = (_iid, f, _base, _args) => {
                if (f === setImmediate) {
                    fs.appendFileSync(this.pathLogHooks, "[invokeFun] Funcao setImmediate foi detectada!\n");
                }
                else if (f === setTimeout) {
                    fs.appendFileSync(this.pathLogHooks, "[invokeFun] Funcao setTimeout foi detectada!\n");
                }
                else if (f === setInterval) {
                    fs.appendFileSync(this.pathLogHooks, "[invokeFun] Funcao setInterval foi detectada!\n");
                }
                //else {
                //    fs.appendFileSync(this.pathLogHooks, "[invokeFun] Funcao indefinida foi detectada!\n");
                //}
            };

            this.asyncFunctionEnter = (_iid) => {
                fs.appendFileSync(this.pathLogHooks, "[asyncFunctionEnter] Funcao async foi detectada!\n");
            };

            this.asyncFunctionExit = (_iid, result, _wrappedExceptionVal) => {
                fs.appendFileSync(this.pathLogHooks, `[asyncFunctionExit] Funcao async foi detectada! (retornando ${result}\n`);
            };



        }
    }
}

