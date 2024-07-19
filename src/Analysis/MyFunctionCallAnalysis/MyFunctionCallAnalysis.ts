// DO NOT INSTRUMENT

// TODO:
// - Refinar os parametros do getField e putField e invokeFun e invokeFunPre
// - Testar a leitura e recuperacao dos objetos do arquivo JSON depois
// - Dar o install com a versao correta do node nos exemplos do noderacer (e garantir que todas dependencias tao baixadas)
// - Testar os exemplos com os entry points corretos

import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {EventEmitter} from 'events';
import * as fs from 'fs';
import http from 'http';
import net from 'net';

import {isFunction} from 'lodash';

export class MyFunctionCallAnalysis extends Analysis {

    /*
    ** Aqui sao declarados os hooks que serão usados nessa analise
    ** Cada hook tem a funcao de chamar o callback (implementado logo abaixo) quando uma
    **    acao especifica acontecer
    ** Esse "| undefined;" serve para não ficar dando erro se a funcao ainda nao estiver
    **       implementada (aparentemente so eh usada na fase de desenvolvimento)
    **
    ** Veja a lista com todos os hooks possiveis e suas funcoes:
    ** (interface original em: src/Type/nodeprof/Hooks.ts)
    ** ou em  /coisasNodeRT/NodeRT-OpenSource/emptyTemplate.js que tem hooks adicionais
    */
    public read: Hooks['read'] | undefined; //sempre que um valor eh lido em uma variavel; Obs: esse valor tambem pode ser uma funcao
    public write: Hooks['write'] | undefined; //sempre que um valor eh escrito em uma variavel; Obs: esse valor tambem pode ser uma funcao
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
    public unary: Hooks['unary'] | undefined; // sempre depois de uma operacao unaria (+, -, !, typeof, delete, etc)
    public unaryPre: Hooks['unaryPre'] | undefined; // sempre antes de uma operacao unaria
    public asyncFunctionEnter: Hooks['asyncFunctionEnter'] | undefined; //sempre que uma funcao assincrona comeca
    public asyncFunctionExit: Hooks['asyncFunctionExit'] | undefined; //sempre que uma funcao assincrona termina
    public awaitPre: Hooks['awaitPre'] | undefined; //sempre antes de uma funcao com await ser chamada
    public awaitPost: Hooks['awaitPost'] | undefined; //sempre depois de uma funcao com await ser resolvida
    public startStatement: Hooks['startStatement'] | undefined; //sempre antes e depois de um statement
    public endExecution: Hooks['endExecution'] | undefined; // sempre que uma execucao do node termina
    
    private timeConsumed: number;
    
    static debugar: boolean = true;
    static apenasHooksPrincipais: boolean = false;
    static pathLogHooks: string;

    // Esse atributo eh um vetor que vai armazenando os logs dos hooks na memoria RAM e escreve no final
    //static logsDosHooks: string[] = [];
    static logsDosHooks: object[] = [];

    // Obs: Na implementação do NodeRT, esse vetor era do tipo object[] = []; para armazenar no formato JSON

    static eventEmitter: EventEmitter = new EventEmitter();
    
    constructor(sandbox: Sandbox)
    {
        // Declaracao para chamar o adicionarHookAoLog sempre que o evento 'AdicionarLogAoVetor' for detectado
        MyFunctionCallAnalysis.eventEmitter.on('AdicionarLogAoVetor', MyFunctionCallAnalysis.adicionarHookAoLog);
        super(sandbox); // Chamada para o construtor de Analysis, que armazena o sandbox e chama o registerHooks
        this.timeConsumed = 0;

    }

    // Funcao chamada ao final: Com o process.on('exit', ...) para escrever o vetor logsDosHooks no arquivo de logs
    public static escreverHooksNoLog(): void {
        //console.log("O escreverHooksNoLog foi chamado!");

        // Escrita do vetor de objetos do tipo JSON
        fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, '[\n');
        // Itera apenas sobre os n-1 elementos, deixando o ultimo de fora
        for (let i = 0; i < MyFunctionCallAnalysis.logsDosHooks.length - 1; i++) {
            const hookRegistrado = MyFunctionCallAnalysis.logsDosHooks[i];
            const stringJSON = JSON.stringify(hookRegistrado, null, 4);
            fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, stringJSON + ',\n', {flag:'a'});
        }
        // Escrita do ultimo elemento do vetor (o ultimo objeto nao pode finalizar com , para o .json funncionar)
        const stringJSON = JSON.stringify(MyFunctionCallAnalysis.logsDosHooks[MyFunctionCallAnalysis.logsDosHooks.length - 1], null, 4);
        fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, stringJSON + '\n', {flag:'a'});
        
        fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, ']', {flag:'a'});
    }

    public static adicionarHookAoLog(hookAdicionar: object): void {
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
            //const mensagemInicial = `-=+=- Log das chamadas dos hooks principais -=+=- \n`;
            //MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemInicial);
        }
        else {
            //console.log("Path de todos os hooks!");
            MyFunctionCallAnalysis.pathLogHooks = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logHooks.json";
            //const mensagemInicial = `-=+=- Log das chamadas de todos hooks -=+=- \n`;
            //MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemInicial);
        }
        //console.log(`pathlog eh: ${MyFunctionCallAnalysis.pathLogHooks}`);


        // -=+=- Deteccao e registro dos hooks -=+=-

        if (!MyFunctionCallAnalysis.apenasHooksPrincipais) { // Testar o rastreamento de todos os hooks
            console.log("Testando todos os hooks!");

            this.read = (iid, name, val, _isGlobal) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;

                // Obs: Dependendo do val, ele pode dar erro de TypeError: Converting circular structure to JSON
                // pois o val eh o valor que vai ser atribuido a nossa variavel
                let novoVal: String;
                isFunction(val) ? novoVal = "Function" : novoVal = "Variable";

                const objMensagemLog = {
                    "Hook_Detectado": "read",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Nome_da_Variavel": name || "Variavel Anonima",
                    "Tipo_Valor_Lido": novoVal,
                    //"isGlobal": isGlobal
                    //"iidToLocation": this.getSandbox().iidToLocation(iid),
                    //"iidToSource": this.getSandbox().iidToSourceObject(iid),
                    //"Local3": this.getSandbox().iidToCode(iid),
                    //"getSource": getSourceCodeInfoFromIid(iid, this.getSandbox()),
                };
                
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };


            this.write = (iid, name, val, lhs, _isGlobal) => {
                //console.log("valor do lhs eh: ", lhs);
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                
                // Obs: Dependendo do val, ele pode dar erro de TypeError: Converting circular structure to JSON
                // pois o val eh o valor que vai ser atribuido a nossa variavel
                let novoVal: String;
                isFunction(val) ? novoVal = "Function" : novoVal = "Variable";
                let novoLhs: String
                lhs === undefined ? novoLhs = "Undefined" : isFunction(lhs) ? novoLhs = "Function" : novoLhs = "Variable/Objeto";

                const objMensagemLog = {
                    "Hook_Detectado": "write",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Nome_da_Variavel": name || "Variavel Anonima",
                    "Tipo_Valor_Escrito": novoVal,
                    "Tipo_Valor_Antes_da_Escrita": novoLhs,
                };
                
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
            
            
            this.getField = (iid, _base, _offset, _val, _isComputed) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const objMensagemLog = {
                    "Hook_Detectado": "write",
                    "Arquivo": fileName,
                    "loc": loc,
                    //"Base?": base,
                    //"Offset?": offset,
                    //"Val?": val,
                    //"IsComputed?": isComputed,
                };
                
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
                //let mensagemLog = `Hook getField detectou o acesso da propriedade ${[offset]} do objeto ${base}`;
            };
            
            this.putFieldPre = (iid, _base, _offset, _val, _isComputed) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                


                const objMensagemLog = {
                    "Hook_Detectado": "write",
                    "Arquivo": fileName,
                    "loc": loc,
                    //"Base?": base,
                    //"Offset?": offset,
                    //"Val?": val,
                    //"IsComputed?": isComputed,
                };
                
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
                /*
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
                }*/
            };
            
           
            this.functionEnter = (iid, f, _dis, args) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;


                let novoNomeFuncao: String;
                f.name ? novoNomeFuncao = f.name : novoNomeFuncao = "funcao anonima";

                const objMensagemLog = {
                    "Hook_Detectado": "functionEnter",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Nome_da_Funcao": novoNomeFuncao,
                    // esse join() transforma a lista de argumentos em uma string para nao dar erro de circular reference
                    "Argumentos_da_Funcao": args.join(", "),

                    // Acho que esse dis nao eh importante, pois ele eh o valor do this no corpo da funcao: (?)
                    // "@param {*} dis - The value of the <tt>this</tt> variable in the function body"
                    //"Valor_do_this???": dis, 
                };
            
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
                // -=+=- prints para debugar o functionEnter: -=+=-
                //console.log("O nome da funcao eh: ", novoNomeFuncao);
                //console.log("O args eh:", args.join(", "));
                // Obs: O args eh um vetor que contem as variaveis/funcoes/objetos que foram usadas como argumentos
                //         da funcao chamada, entretanto, no caso das funcoes de callback usadas como argumento, ele
                //         armazena o corpo da funcao inteira, mas se usar o typeof em cada elemento do vetor, voce
                //         consegue visualizar facilmente se ele eh function / object / variavel(string, int, etc)
                //for (const elemento of args) {
                //    console.log(`O tipo do elemento "${elemento}" é: ${typeof elemento}`);
                //}
                //console.log(`o dis ${dis} eh do tipo do dis: ${typeof dis}`);
                //console.log("dis", dis);
            };
            
            this.functionExit = (iid, returnVal, wrappedExceptionVal) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;

                const objMensagemLog = {
                    "Hook_Detectado": "functionExit",
                    "Arquivo": fileName,
                    "loc": loc,
                    // para saber o nome provavelmente vai ter de colocar uma pilha que da o push no functionEnter e pop no functionExit
                    //"Nome_da_Funcao": 
                    // OBS: se ele for Objeto/Funcao e vc tentar escrever o returnVal no arquivo, ele da erro "Circular Reference"
                    "Tipo_Retorno" : typeof returnVal,
                    "Valor_Retornado": (typeof returnVal === 'number' 
                        || typeof returnVal === 'string'
                        || typeof returnVal === 'boolean') ? returnVal : "(Valor nao mostrado para evitar erro)",
                    "Ocorreu_Excessao": wrappedExceptionVal,
                };
            
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
                // Obs: Por algum motivo o functionExit consegue chamar o arguments.length sem ter esse parametro (???)
                //console.log(arguments.length);
            };
                    
            
            this.invokeFunPre = (iid, f, base, args) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                let novoNomeFuncao: String;
                f.name ? novoNomeFuncao = f.name : novoNomeFuncao = "funcao anonima";

                const objMensagemLog = {
                    "Hook_Detectado": "invokeFunPre",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Nome_da_Funcao": novoNomeFuncao,
                    "Argumentos_da_Funcao": args.join(", "),
                    //"Objeto_Base": base, // objeto base que vai receber a funcao
                };
            
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
                console.log("Essa base eh: ", base);
            }
            
            this.invokeFun = (iid, f, base, args, result) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                let novoNomeFuncao: String;
                f.name ? novoNomeFuncao = f.name : novoNomeFuncao = "funcao anonima";

                const objMensagemLog = {
                    "Hook_Detectado": "invokeFun",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Nome_da_Funcao": novoNomeFuncao,
                    "Argumentos_da_Funcao": args.join(", "),
                    //"Objeto_Base": base, // objeto base que vai receber a funcao
                    "Tipo_Valor_Retornado": typeof result
                    //"Valor_Retornado": result,
                    // Adicionar esse aqui para o valor_retornado:
                    //(typeof returnVal === 'number' 
                    //    || typeof returnVal === 'string'
                    //    || typeof returnVal === 'boolean') ? returnVal : "(Valor nao mostrado para evitar erro)",
                };
            
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
                console.log("Essa base eh: ", base);
            };
    
            this.startExpression = (iid, type) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const objMensagemLog = {
                    "Hook_Detectado": "startExpression",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Tipo_Expressao": type,
                };

                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
    
            this.endExpression = (iid, type, _value) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const objMensagemLog = {
                    "Hook_Detectado": "endExpression",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Tipo_Expressao": type,
                    //"Valor_da_Expressao": value,
                };

                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
                //console.log(`valor da expressao de tipo ${type} eh: ${value}`);
            };
    
            // Esse _fakeHasGetterSetter eh apenas para a API do Jalangi
            this.literal = (iid, val, _fakeHasGetterSetter, literalType) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const objMensagemLog = {
                    "Hook_Detectado": "literal",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Tipo_Literal": literalType,
                    //"Valor_da_Literal": val,
                    // Obs: eu filtrei para esses 3 tipos de literal pois com alguns objetos/funcao dava erro circular reference
                    "Valor_Literal": (literalType === 'NumericLiteral' 
                        || literalType === 'StringLiteral' 
                        || literalType === 'BooleanLiteral') ? val : "(Valor nao mostrado para evitar erro)",
                };

                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
                //console.log("literal eh: ", val);
            };
    
            // REVER: Onde esta esse typeof detectado dentro da execucao do exemplo?? ele eh executado apenas 1 vez mesmo
            this.unary = (iid, op, left, result) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const objMensagemLog = {
                    "Hook_Detectado": "unary",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Operacao_Unaria_Executada": op,
                    "Operando_da_Esquerda": left,
                    "Resultado_unario": result,
                };

                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
            
            this.unaryPre = (iid, op, left) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const objMensagemLog = {
                    "Hook_Detectado": "unaryPre",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Operacao_Unaria_Executada": op,
                    "Operando_da_Esquerda": left,
                };

                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
    
            this.asyncFunctionEnter = (iid) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const objMensagemLog = {
                    "Hook_Detectado": "asyncFunctionEnter",
                    "Arquivo": fileName,
                    "loc": loc,
                };
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
    
            this.asyncFunctionExit = (iid, result, wrappedExceptionVal) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const objMensagemLog = {
                    "Hook_Detectado": "asyncFunctionExit",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Valor_Retornado": result,
                    "Ocorreu_Excessao": wrappedExceptionVal,
                };

                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
    
            this.awaitPre = (iid, promiseOrValAwaited) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const objMensagemLog = {
                    "Hook_Detectado": "awaitPre",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Valor_Esperado": promiseOrValAwaited,
                };

                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
    
            this.awaitPost = (iid, promiseOrValAwaited, valResolveOrRejected, isPromiseRejected) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const objMensagemLog = {
                    "Hook_Detectado": "awaitPost",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Promise_Rejeitada?": isPromiseRejected,
                    // !!! Por algum motivo esses valores esperados/resolvidos nao estao sendo armazenados no arquivo !!!
                    "Valor_Esperado": promiseOrValAwaited,
                    "Valor_Resolvido": valResolveOrRejected,
                };

                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
            
            this.startStatement = (iid, type) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const objMensagemLog = {
                    "Hook_Detectado": "awaitPost",
                    "Arquivo": fileName,
                    "loc": loc,
                    "Tipo_Statement": type,
                };

                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
    
            this.endExecution = () => {
                // Hook endExecution detectou o fim da execucao node.
                const objMensagemLog = {
                    "Hook_Detectado": "endExecution",
                };
            
                MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', objMensagemLog);
            };
        }
        else { // Testar o rastreamento apenas dos hooks principais
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
                else if (f === clearImmediate || f === clearInterval || f === clearTimeout) {
                    const mensagemLog = `[invokeFunPre]       Funcao ${f.name} foi invocada`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                // Testando para operacoes do http:
                else if (f === http.request || f === http.get
                    || f === http.ClientRequest || f === http.ServerResponse
                ) {
                    const mensagemLog = "[invokeFunPre]       Requisicao ao servidor http foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === http.createServer) {
                    const mensagemLog = "[invokeFunPre]       Criacao do servidor http foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if(f === http.OutgoingMessage.prototype.destroy
                    || f === http.OutgoingMessage.prototype.write
                    || f === http.OutgoingMessage.prototype.end) {
                    const mensagemLog = `[invokeFunPre]       Mensagem ao servidor http foi enviada: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                // Testando para operacoes dos eventEmmiters:
                else if (f === EventEmitter.prototype.addListener
                    || f === EventEmitter.prototype.on
                    || f === EventEmitter.prototype.prependListener
                    || f === EventEmitter.prototype.once // Ouve apenas 1 evento emitido e ja eh destruido
                    || f === EventEmitter.prototype.prependOnceListener
                    )
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
                else if (f === net.createServer) {
                    const mensagemLog = "[invokeFunPre]       Criacao Servidor Net foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === net.createConnection || f === net.connect || f === net.Socket) {
                    const mensagemLog = `[invokeFunPre]       Conexao Net foi invocada com a operacao: ${f.name}`;
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
                else if (f === http.request || f === http.get
                    || f === http.ClientRequest || f === http.ServerResponse
                ) {
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
                // Testando fs com folders
                else if (f === fs.mkdir || f === fs.mkdirSync 
                    || f === fs.promises.mkdir  || f === fs.promises.mkdtemp
                    || f === fs.mkdtemp || f === fs.mkdtempSync) {
                    const mensagemLog = `[invokeFun]          Folder foi criado com: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('AdicionarLogAoVetor', mensagemLog);
                }
                else if (f === fs.rmdir || f === fs.rmdirSync 
                    || f === fs.promises.rmdir  || f === fs.rm) {
                    const mensagemLog = `[invokeFun]          Folder foi removido com: ${f.name}`;
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

        }
        console.log(this.timeConsumed);
    }
}

process.on('exit', () => {
    //console.log("O process.on(exit) foi detectado!");
    MyFunctionCallAnalysis.escreverHooksNoLog();
});

