// DO NOT INSTRUMENT

// TODO:
// - Talvez refinar o getField e putFieldPre
// - Testar a leitura e recuperacao dos objetos do arquivo JSON depois
// - Dar o install com a versao correta do node nos exemplos do noderacer (e garantir que todas dependencias tao baixadas)
// - Testar os exemplos com os entry points corretos
// - GetField eh um bom exemplo de circular reference mesmo com o stringfy - REVER
//      (mas o tojson do utils.ts parece resolver essa circular reference)

import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {EventEmitter} from 'events';
import * as fs from 'fs';
import http from 'http';
import net from 'net';

import {isFunction} from 'lodash';
import {isArrayAccess} from '../../Util';

export class MyFunctionCallAnalysis extends Analysis {
    
    static monitorOnlyMyFunctionCallAnalysis: boolean = true;
    static monitorAllHooks: boolean = true;
    static pathLogHooks: string;

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
    ** ou em /coisasNodeRT/NodeRT-OpenSource/nodeprof.js/nodeprof.js/tutorial.md (na real esse eh meio inutil)
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
    
    
    // array that stores hooks log on RAM and writes to logHooks.json in the end
    //static logHooks: object[] = [];
    static logHooks: string[] = [];

    //private timeConsumed: number;


    static eventEmitter: EventEmitter = new EventEmitter();
    
    constructor(sandbox: Sandbox)
    {
        // Declaration of the Event Listener that calls addHookToLog when the event addLogToVector is detected
        MyFunctionCallAnalysis.eventEmitter.on('addLogToVector', MyFunctionCallAnalysis.addHookToLog);
        super(sandbox); // Chamada para o construtor de Analysis, que armazena o sandbox e chama o registerHooks
        //this.timeConsumed = 0;

    }

    // Function that is callend with process.on('exit', ...) it writes para escrever logHooks to the log files
    public static writeHooksOnLog(): void {

        // Starts the array of JSON objects
        fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, '[\n');

        for (let i = 0; i < MyFunctionCallAnalysis.logHooks.length - 1; i++) {
            const registeredHook = MyFunctionCallAnalysis.logHooks[i];
            fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, registeredHook + ',\n', {flag:'a'});
        }
        const stringJSON = MyFunctionCallAnalysis.logHooks[MyFunctionCallAnalysis.logHooks.length - 1];
        fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, stringJSON + '\n', {flag:'a'});

        // Ends the array of JSON objects
        fs.writeFileSync(MyFunctionCallAnalysis.pathLogHooks, ']', {flag:'a'});
    }


    public static addHookToLog(hookAdicionar: string): void {
        MyFunctionCallAnalysis.logHooks.push(hookAdicionar);
    }



    protected override registerHooks()
    {
        console.log("Starting registerHooks from MyFunctionCallAnalysis:");
        
        // -=+=- Initializing with the right path to the file address -=+=-
        if(!MyFunctionCallAnalysis.monitorAllHooks) {
            MyFunctionCallAnalysis.pathLogHooks = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logRastrearPrincipaisHooks.txt";
        }
        else {
            MyFunctionCallAnalysis.pathLogHooks = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/MyFunctionCallAnalysis/logHooks.json";
        }


        // -=+=- Detecting and registering hooks -=+=-
        if (MyFunctionCallAnalysis.monitorAllHooks) {
            console.log("Calling all hooks!");
            

            // In this Hook, the attribute "val" can result in TypeError: Converting circular structure to JSON
            // Obs: This error only occur when  trying to stringify the object, but no when you do console.log
            this.read = (iid, name, val, _isGlobal) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;

                let newVal: String;
                isFunction(val) ? newVal = "Function" : newVal = "Variable";

                const ObjectLogMessage = {
                    "Detected_Hook": "read",
                    "File_Name": fileName,
                    "loc": loc,
                    "Variable_Name": name || "anonymous variable",
                    "Type_Value_Read": newVal,
                    //"isGlobal": isGlobal
                    //"iidToLocation": this.getSandbox().iidToLocation(iid),
                    //"iidToSource": this.getSandbox().iidToSourceObject(iid),
                    //"Local3": this.getSandbox().iidToCode(iid),
                    //"getSource": getSourceCodeInfoFromIid(iid, this.getSandbox()),
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };

            // In this Hook, the attribute "val" can result in TypeError: Converting circular structure to JSON
            // Obs: This error only occur when  trying to stringify the object, but no when you do console.log
            this.write = (iid, name, val, lhs, _isGlobal) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                
                let newVal: String;
                isFunction(val) ? newVal = "Function" : newVal = "Variable";
                let newLhs: String
                lhs === undefined ? newLhs = "Undefined" : isFunction(lhs) ? newLhs = "Function" : newLhs = "Variable/Objeto";

                const ObjectLogMessage = {
                    "Detected_Hook": "write",
                    "File_Name": fileName,
                    "loc": loc,
                    "Variable_Name": name || "anonymous variable",
                    "Value_Type_After_Write": newVal,
                    "Value_Type_Before_Write": newLhs,
                };
                
                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
    
            
            this.getField = (iid, base, offset, val, isComputed) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;


                const ObjectLogMessage = {
                    "Detected_Hook": "getField",
                    "File_Name": fileName,
                    "loc": loc,
                    "Accessed_Object": Buffer.isBuffer(base) && isArrayAccess(isComputed, offset) ? base[offset as number] : "couldnt access base",
                    "Accessed_Value": (typeof val === 'number' 
                         || typeof val === 'string'
                         || typeof val === 'boolean') ? val : "(Value not shown to avoid TypeError)",
                    // "Accessed_Value": val,

                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
                //let mensagemLog = `Hook getField detectou o acesso da propriedade ${[offset]} do objeto ${base}`;
                //console.log("Offset eh: ", offset);
                //console.log("isComputed eh: ", isComputed);
                //console.log("val eh: ", val);
                //console.log("base eh: ", base);

            };
            

            this.putFieldPre = (iid, base, offset, val, isComputed) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                
                //offset = typeof offset === 'number' ? offset : Number.parseInt(offset);

                const ObjectLogMessage = {
                    "Detected_Hook": "putFieldPre",
                    "File_Name": fileName,
                    "loc": loc,
                    "Written_Object": Buffer.isBuffer(base) && isArrayAccess(isComputed, offset) ? base[offset as number] : "couldnt access base",
                    "New_Value": (typeof val === 'number' 
                        || typeof val === 'string'
                        || typeof val === 'boolean') ? val : "(Value not shown to avoid TypeError)",

                };
                
                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
            
           
            this.functionEnter = (iid, f, _dis, args) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;


                let newFunctionName: String;
                f.name ? newFunctionName = f.name : newFunctionName = "Anonymous Function ";

                const ObjectLogMessage = {
                    "Detected_Hook": "functionEnter",
                    "File_Name": fileName,
                    "loc": loc,
                    "Function_Name": newFunctionName,
                    // esse join() transforma a lista de argumentos em uma string para nao dar erro de circular reference
                    "Function_Arguments": args.join(", "),

                    // Acho que esse dis nao eh importante, pois ele eh o valor do this no corpo da funcao: (?)
                    // "@param {*} dis - The value of the <tt>this</tt> variable in the function body"
                    //"Valor_do_this???": dis, 
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
                // -=+=- prints para debugar o functionEnter: -=+=-
                // console.log("O nome da funcao eh: ", newFunctionName);
                // console.log("O args eh:", args.join(", "));
                // Obs: O args eh um vetor que contem as variaveis/funcoes/objetos que foram usadas como argumentos
                //         da funcao chamada, entretanto, no caso das funcoes de callback usadas como argumento, ele
                //         armazena o corpo da funcao inteira, mas se usar o typeof em cada elemento do vetor, voce
                //         consegue visualizar facilmente se ele eh function / object / variavel(string, int, etc)
                // for (const elemento of args) {
                //    console.log(`O tipo do elemento "${elemento}" é: ${typeof elemento}`);
                // }
                // console.log(`o dis ${dis} eh do tipo do dis: ${typeof dis}`);
                // console.log("dis", dis);
            };

            
            this.functionExit = (iid, returnVal, wrappedExceptionVal) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;

                const ObjectLogMessage = {
                    "Detected_Hook": "functionExit",
                    "File_Name": fileName,
                    "loc": loc,
                    // para saber o nome provavelmente vai ter de colocar uma pilha que da o push no functionEnter e pop no functionExit
                    //"Function_Name": 
                    // OBS: se ele for Objeto/Funcao e vc tentar escrever o returnVal no arquivo, ele da erro "Circular Reference"
                    "Returned_Type" : typeof returnVal,
                    "Returned_Value": (typeof returnVal === 'number' 
                        || typeof returnVal === 'string'
                        || typeof returnVal === 'boolean') ? returnVal : "(Value not shown to avoid TypeError)",
                    "Excession_Occurred": wrappedExceptionVal,
                };
            
                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
                // Obs: Por algum motivo o functionExit consegue chamar o arguments.length sem ter esse parametro (???)
                //console.log(arguments.length);
            };
                    
            
            this.invokeFunPre = (iid, f, _base, args) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                let newFunctionName: String;
                f.name ? newFunctionName = f.name : newFunctionName = "Anonymous Function ";

                const ObjectLogMessage = {
                    "Detected_Hook": "invokeFunPre",
                    "File_Name": fileName,
                    "loc": loc,
                    "Function_Name": newFunctionName,
                    "Function_Arguments": args.join(", "),
                    //"Objeto_Base": base, // objeto base que vai receber a funcao, julgo que nao eh mt necessaria
                };
            
                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
                //console.log("Essa base eh: ", base);
            }


            this.invokeFun = (iid, f, _base, args, result) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                let newFunctionName: String;
                f.name ? newFunctionName = f.name : newFunctionName = "Anonymous Function ";

                const ObjectLogMessage = {
                    "Detected_Hook": "invokeFun",
                    "File_Name": fileName,
                    "loc": loc,
                    "Function_Name": newFunctionName,
                    "Function_Arguments": args.join(", "),
                    "Tipo_Returned_Value": typeof result,
                    "Returned_Value": (typeof result === 'number' 
                        || typeof result === 'string'
                        || typeof result === 'boolean') ? result : "(Value not shown to avoid TypeError)",
                        //"Objeto_Base": base, // objeto base que vai receber a funcao, julgo que nao eh mt necessario
                };
            
                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
                //console.log("Essa base eh: ", base);
            };
    
            this.startExpression = (iid, type) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const ObjectLogMessage = {
                    "Detected_Hook": "startExpression",
                    "File_Name": fileName,
                    "loc": loc,
                    "Expression_Type": type,
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
    
            this.endExpression = (iid, type, _value) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const ObjectLogMessage = {
                    "Detected_Hook": "endExpression",
                    "File_Name": fileName,
                    "loc": loc,
                    "Expression_Type": type,
                    //"Valor_da_Expressao": value, 
                    // acredito que esse value nao eh mt importante, pois ele quase sempre
                    // vai ser o nome e implementacao de uma funcao
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
                //console.log(`valor da expressao de tipo ${type} eh: ${value}`);
            };

    
            // Esse _fakeHasGetterSetter eh apenas para a API do Jalangi
            this.literal = (iid, val, _fakeHasGetterSetter, literalType) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const ObjectLogMessage = {
                    "Detected_Hook": "literal",
                    "File_Name": fileName,
                    "loc": loc,
                    "Literal_Type": literalType,
                    //"Valor_da_Literal": val,
                    // Obs: eu filtrei para esses 3 tipos de literal pois com alguns objetos/funcao dava erro circular reference
                    "Literal_Value": (literalType === 'NumericLiteral' 
                        || literalType === 'StringLiteral' 
                        || literalType === 'BooleanLiteral') ? val : "(Value not shown to avoid TypeError)",
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
                //console.log("literal eh: ", val);
            };
    
            // REVER: Onde esta esse typeof detectado dentro da execucao do exemplo?? ele eh executado apenas 1 vez mesmo
            this.unary = (iid, op, left, result) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const ObjectLogMessage = {
                    "Detected_Hook": "unary",
                    "File_Name": fileName,
                    "loc": loc,
                    "Unary_Operation_Executed": op,
                    "Unary_Left_Operand": left,
                    "Unary_Result": result,
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
            
            this.unaryPre = (iid, op, left) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                const ObjectLogMessage = {
                    "Detected_Hook": "unaryPre",
                    "File_Name": fileName,
                    "loc": loc,
                    "Unary_Operation_Executed": op,
                    "Unary_Left_Operand": left,
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
    
            this.asyncFunctionEnter = (iid) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const ObjectLogMessage = {
                    "Detected_Hook": "asyncFunctionEnter",
                    "File_Name": fileName,
                    "loc": loc,
                };
                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
    
            this.asyncFunctionExit = (iid, result, wrappedExceptionVal) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const ObjectLogMessage = {
                    "Detected_Hook": "asyncFunctionExit",
                    "File_Name": fileName,
                    "loc": loc,
                    "Returned_Value": result,
                    "Excession_Occurred": wrappedExceptionVal,
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
    
            this.awaitPre = (iid, promiseOrValAwaited) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const ObjectLogMessage = {
                    "Detected_Hook": "awaitPre",
                    "File_Name": fileName,
                    "loc": loc,
                    "Expected_Value": promiseOrValAwaited,
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
    
            this.awaitPost = (iid, promiseOrValAwaited, valResolveOrRejected, isPromiseRejected) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const ObjectLogMessage = {
                    "Detected_Hook": "awaitPost",
                    "File_Name": fileName,
                    "loc": loc,
                    "Is_Promise_Rejected": isPromiseRejected,
                    // !!! Por algum motivo esses valores esperados/resolvidos nao estao sendo armazenados no arquivo !!!
                    "Expected_Value": promiseOrValAwaited,
                    "Resolved_Value": valResolveOrRejected,
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
            
            this.startStatement = (iid, type) => {
                const sourceObject = this.getSandbox().iidToSourceObject(iid);
                if(!sourceObject) { return }
                const {name: fileName, loc} = sourceObject;
                

                // nao tem como saber qual a funcao??
                const ObjectLogMessage = {
                    "Detected_Hook": "awaitPost",
                    "File_Name": fileName,
                    "loc": loc,
                    "Statement_Type": type,
                };

                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };
    
            this.endExecution = () => {
                // Hook endExecution detectou o fim da execucao node.
                const ObjectLogMessage = {
                    "Detected_Hook": "endExecution",
                };
            
                const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            };



        }
        else {
            console.log("Calling just some specific hooks!");
            
            this.read = (_iid, name, _val, _isGlobal) => {
                //if(name === "fs") {
                //    const mensagemLog = `[read] Acesso de arquivo`;
                //    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                //}
                //else if(name === "openFile") {
                //    const mensagemLog = `[read] Acesso de arquivo com openFile`;
                //    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                //}
                //else if(name === "resolve") {
                if(name === "resolve") {
                    const mensagemLog = `[read]               Resolve de Promise`;
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
            };

            //this.write = (_iid, name, val, _lhs, _isGlobal) => {
            //    if(name === "sharedCounter" && (val === 1 || val === 2)) {      
            //        const mensagemLog = `[write] Aumento do sharedCounter para ${val}`;
            //        MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
            //    }
            //};

            //this.functionEnter = (_iid, f, _dis, _args) => {
            //    if (f === setImmediate) {
            //        const mensagemLog = "[functionEnter] Funcao setImmediate entrou em execucao";
            //        MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
            //    }
            //    else if (f === setTimeout) {
            //        const mensagemLog = "[functionEnter] Funcao setTimeout entrou em execucao";
            //        MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
            //    }
            //    else if (f === setInterval) {
            //        const mensagemLog = "[functionEnter] Funcao setInterval entrou em execucao";
            //        MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
            //    }
            //};

            //this.functionExit = (_iid, _returnVal) => {
            //    
            //    const mensagemLog = "[functionExit] Funcao finalizou a execucao";
            //    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
            //};

            this.invokeFunPre = (_iid, f, _base, _args) => {
                if (f === setImmediate) {
                    const mensagemLog = "[invokeFunPre]       Funcao setImmediate foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === setTimeout) {
                    const mensagemLog = "[invokeFunPre]       Funcao setTimeout foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === setInterval) {
                    const mensagemLog = "[invokeFunPre]       Funcao setInterval foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === clearImmediate || f === clearInterval || f === clearTimeout) {
                    const mensagemLog = `[invokeFunPre]       Funcao ${f.name} foi invocada`;
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                // Testando para operacoes do http:
                else if (f === http.request || f === http.get
                    || f === http.ClientRequest || f === http.ServerResponse
                ) {
                    const mensagemLog = "[invokeFunPre]       Requisicao ao servidor http foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === http.createServer) {
                    const mensagemLog = "[invokeFunPre]       Criacao do servidor http foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if(f === http.OutgoingMessage.prototype.destroy
                    || f === http.OutgoingMessage.prototype.write
                    || f === http.OutgoingMessage.prototype.end) {
                    const mensagemLog = `[invokeFunPre]       Mensagem ao servidor http foi enviada: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
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
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === EventEmitter.prototype.off
                    || f === EventEmitter.prototype.removeListener
                    || f === EventEmitter.prototype.removeAllListeners)
                {
                    const mensagemLog = "[invokeFunPre]       Remocao do Listener foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === EventEmitter.prototype.emit) {
                    const mensagemLog = "[invokeFunPre]       Evento emitido foi invocado";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                // Testando as operacoes do net
                else if (f === net.createServer) {
                    const mensagemLog = "[invokeFunPre]       Criacao Servidor Net foi invocada";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === net.createConnection || f === net.connect || f === net.Socket) {
                    const mensagemLog = `[invokeFunPre]       Conexao Net foi invocada com a operacao: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }

            };
         
            this.invokeFun = (_iid, f, _base, _args) => {
                if (f === setImmediate) {
                    const mensagemLog = "[invokeFun]          Funcao setImmediate terminou sua execucao";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === setTimeout) {
                    const mensagemLog = "[invokeFun]          Funcao setTimeout terminou sua execucao";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === setInterval) {
                    const mensagemLog = "[invokeFun]          Funcao setInterval terminou sua execucao";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                // Testando para operacoes do http:
                else if (f === http.request || f === http.get
                    || f === http.ClientRequest || f === http.ServerResponse
                ) {
                    const mensagemLog = "[invokeFun]          Requisicao ao servidor foi finalizada";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === http.createServer) {
                    const mensagemLog = "[invokeFun]          Criacao do servidor foi finalizada";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                
                // Testando com arquivo com fs
                else if ( f === fs.open || f === fs.read || f === fs.write 
                    || f === fs.readFile || f === fs.writeFile || f === fs.appendFile
                    || f === fs.rename || f === fs.access || f === fs.stat || f === fs.lstat
                    || f === fs.copyFile || f === fs.cp || f === fs.truncate) {
                    const mensagemLog = `[invokeFun]          Arquivo Assincrono foi acessado com a operacao: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === fs.close) {
                    const mensagemLog = "[invokeFun]          Arquivo Assincrono foi fechado";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if(f === fs.rm) {
                    const mensagemLog = "[invokeFun]          Arquivo foi removido de modo Assincrono";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === fs.openSync || f === fs.readSync || f === fs.writeSync 
                    || f === fs.appendFileSync || f === fs.readFileSync || f === fs.writeFileSync
                    || f === fs.renameSync || f === fs.accessSync || f === fs.statSync || f === fs.lstatSync
                    || f === fs.copyFileSync || f === fs.cpSync || f === fs.truncateSync
                    || f === fs.createReadStream || f === fs.createWriteStream ) {
                    const mensagemLog = `[invokeFun]          Arquivo Sincrono foi acessado com a operacao: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === fs.closeSync) {
                    const mensagemLog = "[invokeFun]          Arquivo Sincrono foi fechado";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if(f === fs.rmSync) {
                    const mensagemLog = "[invokeFun]          Arquivo foi removido de modo Sincrono";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                // Testando com arquivos do FileHandle e FsPromises
                else if (f === fs.promises.open || f === fs.promises.readFile || f === fs.promises.writeFile 
                    || f === fs.promises.appendFile) {
                    const mensagemLog = "[invokeFun]          Arquivo com promises foi acessado";
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                // Testando fs com folders
                else if (f === fs.mkdir || f === fs.mkdirSync 
                    || f === fs.promises.mkdir  || f === fs.promises.mkdtemp
                    || f === fs.mkdtemp || f === fs.mkdtempSync) {
                    const mensagemLog = `[invokeFun]          Folder foi criado com: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
                else if (f === fs.rmdir || f === fs.rmdirSync 
                    || f === fs.promises.rmdir  || f === fs.rm) {
                    const mensagemLog = `[invokeFun]          Folder foi removido com: ${f.name}`;
                    MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
                }
            };
         
            this.asyncFunctionEnter = (_iid) => {
                const mensagemLog = "[asyncFunctionEnter] Funcao async foi iniciada";
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
            };
            // Quando esse asyncFunctionExit eh acionado, significa que agora ele vai executar tambem os comandos
            // depois da funcao async, mas os comandos de dentro da funcao async que foram levadas aos
            // worker threads ainda podem estar executando mesmo depois do asyncFunctionExit
            this.asyncFunctionExit = (_iid, result, _wrappedExceptionVal) => {
                const mensagemLog = `[asyncFunctionExit]  Execucao saiu do escopo da funcao async (retornando: ${result})`;
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
            };

            this.awaitPre = (_iid, _promiseOrValAwaited) => {
                const mensagemLog = "[awaitPre]           Execucao parou no await";
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
            };
    
            this.awaitPost = (_iid, _promiseOrValAwaited, valResolveOrRejected, _isPromiseRejected) => {
                const mensagemLog = `[awaitPost]          Execucao do await foi finalizada (retornando: ${valResolveOrRejected})`;
                MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', mensagemLog);
            };

            // TODO:
            // verificar se tem algum exemplo de paralelismo que usa a biblioteca bluebird, workerpool, net, child_process e como detectalo

        }
        //console.log(this.timeConsumed);
    }
}

process.on('exit', () => {
    //console.log("O process.on(exit) foi detectado!");
    MyFunctionCallAnalysis.writeHooksOnLog();
});

