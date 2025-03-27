// DO NOT INSTRUMENT

import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
//import {isArrayAccess} from '../../Util';

import * as fs from 'fs';
import EventEmitter from 'events';
//import http from 'http';
//import net from 'net';
import async_hooks from 'async_hooks';

const { performance } = require('perf_hooks'); // lib to calculate runtime in invokefun

import path from 'path'; // lib to get full path in file name
import { stringify } from 'flatted'; // lib to remove json circular reference with objects
import { parse } from 'flatted';

//const config = require('../../../../entrypoint_NodeRock/NodeRockConfig.js');

if(false) { // temporary instructions to remember to try later the use of parse from 'flatted'
    const jsonString = 'object that received stringify';
    const parsedObj = parse(jsonString);
    console.log(parsedObj);
    //shell.echo('Hello, world!');
}

// Interface que possibilita marcar o iid das funcoes chamadas por callback
interface FuncaoComAtributo extends Function {
    callerIID?: number;
}

export class MyFunctionCallAnalysis extends Analysis {
    
    static monitorOnlyMyFunctionCallAnalysis: boolean = true;
    static pathLogHooks: string;

    // Map to calculate the runtime of the functions detected in invokeFunPre and invokeFun
    //static startTimesInvokeFunPre: Map<number, number> = new Map();
    //static startTimesFunctionEnter: Map<number, number> = new Map();


    /*
    ** Lista com todos os hooks possiveis e suas funcoes:
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
    
    
    // Array that stores hooks log on RAM and writes to logHooks.json in the end
    static logHooks: string[] = [];
    //private timeConsumed: number;


    static eventEmitter: EventEmitter = new EventEmitter();
    
    constructor(sandbox: Sandbox)
    {
        // Declaration of the Event Listener that calls addHookToLog when the event addLogToVector is detected
        MyFunctionCallAnalysis.eventEmitter.on('addLogToVector', MyFunctionCallAnalysis.addHookToLog);
        super(sandbox); // Chamada para o construtor de Analysis, que armazena o sandbox e chama o registerHooks
        //this.timeConsumed = 0;
        // console.log(path.join(__dirname,"../src/Analysis/MyFunctionCallAnalysis/logHooks.json"));

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
        //console.log("Starting registerHooks from MyFunctionCallAnalysis:");
        
        // -=+=- Initializing with the right path to the file address -=+=-
        MyFunctionCallAnalysis.pathLogHooks = path.join(__dirname,"../NodeRock_src/FoldersUsedDuringExecution/temporary_logHooks/logHooks.json");
        //console.log("\n\nPATH DO LOGHOOKS EH: \n", __dirname); // /home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/dist

        // -=+=- Detecting and registering hooks -=+=-
        //console.log("Calling all hooks!");
        

        /*this.read = (iid, name, val, _isGlobal) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;

            let stringJSONdoVal : string;
            try {
                if (typeof(val) === 'function') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else if (typeof(val) === 'bigint') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else {
                    stringJSONdoVal = stringify(val);
                }
            } catch (err) {
                stringJSONdoVal = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "read",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Variable_Name": name || "anonymous variable",
                "Type_Value_Read": typeof(val),
                "val": stringJSONdoVal,
            };

            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };


        this.write = (iid, name, val, lhs, _isGlobal) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;
            

            let stringJSONdoVal : string;
            try {
                if (typeof(val) === 'function') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else if (typeof(val) === 'bigint') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else {
                    stringJSONdoVal = stringify(val);
                }
            } catch (err) {
                stringJSONdoVal = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            let newLhs: String
            try {
                if (typeof(lhs) === 'function') {
                    newLhs = JSON.stringify({ lhs: lhs.toString() });
                }
                else if (typeof(lhs) === 'bigint') {
                    newLhs = JSON.stringify({ lhs: lhs.toString() });
                }
                else {
                    newLhs = stringify(lhs);
                }
            } catch (err) {
                newLhs = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "write",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Variable_Name": name || "anonymous variable",
                "Value_Type_Before_Write": typeof(lhs),
                "Value_Before_Write": newLhs,
                "Value_Type_After_Write": typeof(val),
                "Value_After_Write": stringJSONdoVal,
            };
            
            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };

        
        this.getField = (iid, base, offset, val, isComputed) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;

            let stringJSONdoVal : string;
            try {
                if (typeof(val) === 'function') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else if (typeof(val) === 'bigint') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else {
                    stringJSONdoVal = stringify(val);
                }
            } catch (err) {
                stringJSONdoVal = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "getField",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Accessed_Object": Buffer.isBuffer(base) && isArrayAccess(isComputed, offset) ? base[offset as number] : "couldnt access base",
                "Accessed_Value_Type": typeof(val),
                "Accessed_Value": stringJSONdoVal,
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
            let stringJSONdoVal : string;
            try {
                if (typeof(val) === 'function') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else if (typeof(val) === 'bigint') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else {
                    stringJSONdoVal = stringify(val);
                }
            } catch (err) {
                stringJSONdoVal = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "putFieldPre",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Written_Object": Buffer.isBuffer(base) && isArrayAccess(isComputed, offset) ? base[offset as number] : "couldnt access base",
                "New_Value_Type": typeof(val),
                "New_Value": stringJSONdoVal,

            };
            
            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };*/
        
        
        this.functionEnter = (iid, f, _dis, _args) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;

            // Registering the starttime of this function
            //MyFunctionCallAnalysis.startTimesFunctionEnter.set(iid, performance.now());


            let newFunctionName: String;
            f.name ? newFunctionName = f.name : newFunctionName = "Anonymous Function ";

            let isCallBack = false;
            const valueCallerIID = (f as FuncaoComAtributo).callerIID;
            if (valueCallerIID) {
                isCallBack = true;
            }

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "functionEnter",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Function_Name": newFunctionName,
                // esse join() transforma a lista de argumentos em uma string para nao dar erro de circular reference
                //"Function_Arguments": args.join(", "),
                "iid": iid,
                "timer": performance.now(),
                "is_Callback": isCallBack, 
                "valueCallerIID": valueCallerIID,

                // Acho que esse dis nao eh importante, pois ele eh o valor do this no corpo da funcao: (?)
                // "@param {*} dis - The value of the <tt>this</tt> variable in the function body"
                //"Valor_do_this???": dis, 
            };

            // if(loc.start.line === 20) {
            //     console.log("\nFunctionEnter");
            //     //console.log("O IID EH: ", iid);
            //     //console.log("O IIDTOCODE EH: ", this.getSandbox().iidToCode(iid));
            //     //console.log("O IIDTOSOURCE EH: ", this.getSandbox().iidToSourceObject(iid));
            //     //console.log("O IID TOLOCATION EH: ", this.getSandbox().iidToLocation(iid));

            //     if(typeof(f) === 'function') {
            //         console.log((f as FuncaoComAtributo).callerIID);
            //     }
            // }

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
            //console.log("args eh: ", args);
        };

        
        this.functionExit = (iid, returnVal, wrappedExceptionVal) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;

            // Calculating runTime
            //const startTime = MyFunctionCallAnalysis.startTimesFunctionEnter.get(iid);
            //const endTime = performance.now();
            //const runtime = startTime ? endTime - startTime : null;

            // Removing startTime from the map
            //MyFunctionCallAnalysis.startTimesFunctionEnter.delete(iid);

            let stringJSONdoreturnVal : string;
            try {
                if (typeof(returnVal) === 'function') {
                    stringJSONdoreturnVal = JSON.stringify({ returnVal: returnVal.toString() });
                }
                else if (typeof(returnVal) === 'bigint') {
                    stringJSONdoreturnVal = JSON.stringify({ returnVal: returnVal.toString() });
                }
                else {
                    stringJSONdoreturnVal = stringify(returnVal);
                }
            } catch (err) {
                stringJSONdoreturnVal = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "functionExit",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                // para saber o nome provavelmente vai ter de colocar uma pilha que da o push no functionEnter e pop no functionExit
                //"Function_Name": 
                "Returned_Type" : typeof(returnVal),
                "Returned_Value": stringJSONdoreturnVal,
                "Excession_Occurred": wrappedExceptionVal,
                "iid": iid,
                "timer": performance.now(),
                //"Runtime_ms": runtime,
            };
        
            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            // Obs: Por algum motivo o functionExit consegue chamar o arguments.length sem ter esse parametro (???)
            //console.log(arguments.length);
        };
                
        
        this.invokeFunPre = (iid, f, _base, args, _isConstructor, _isMethod, _functionIid,) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;
            
            // Registering the starttime of this function
            //MyFunctionCallAnalysis.startTimesInvokeFunPre.set(iid, performance.now());

            let newFunctionName: String;
            f.name ? newFunctionName = f.name : newFunctionName = "Anonymous Function ";

            let makesCallBack = false;
            for(let i = 0; i < args.length; i++) {
                if(typeof(args[i]) === 'function') {
                    (args[i] as FuncaoComAtributo).callerIID = iid;
                    makesCallBack = true;
                    //console.log("Atribuiu um callerIID com valor: ", iid);
                }
            }

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "invokeFunPre",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Function_Name": newFunctionName,
                //"Function_Arguments": args.join(", "),
                "iid": iid,
                //"Objeto_Base": base, // objeto base que vai receber a funcao, julgo que nao eh mt necessaria
                "timer": performance.now(),
                "Makes_CallBack": makesCallBack,
            };
            // console.log("\nInvokeFunPre:");
            // console.log("iid eh: ", iid);
            // console.log("functionIid eh: ", functionIid);
            // console.log("loc start line eh: ", loc.start.line);

            

            //if(loc.start.line === 20) {
            //    console.log("\nInvokeFunPre");
                //console.log("O IID EH: ", iid);
                //console.log("O IIDTOCODE EH: ", this.getSandbox().iidToCode(iid));
                //console.log("O IIDTOSOURCE EH: ", this.getSandbox().iidToSourceObject(iid));
                //console.log("O IID TOLOCATION EH: ", this.getSandbox().iidToLocation(iid));

                

                // if(typeof(args[2]) === 'function') {
                //     (args[2] as FuncaoComAtributo).callerIID = 100;
                //     console.log((args[2] as FuncaoComAtributo).callerIID);
                // }

                // Object.defineProperty(args[2], 'idCaller', {
                //     value: '100',
                //     writable: true, // Permite que o valor seja alterado posteriormente
                //     enumerable: true, // Permite que a propriedade apareça em loops
                //     configurable: true // Permite que a propriedade seja deletada ou alterada
                // });

                // typeof(args[2]) === "function" ? console.log("IDCALLER EH: ", args[2].idCaller) : console.log("Nao eh function");
            //}

        
            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            //console.log("Essa base eh: ", base);
        }


        this.invokeFun = (iid, f, _base, _args, result, _isConstructor, _isMethod, _functionIid) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;
            
            // Calculating runTime
            // const startTime = MyFunctionCallAnalysis.startTimesInvokeFunPre.get(iid);
            // const endTime = performance.now();
            // const runtime = startTime ? endTime - startTime : null;

            // Removing startTime from the map
            //MyFunctionCallAnalysis.startTimesInvokeFunPre.delete(iid);

            let newFunctionName: String;
            f.name ? newFunctionName = f.name : newFunctionName = "Anonymous Function ";

            let stringJSONdoResult : string;
            try {
                if (typeof(result) === 'function') {
                    stringJSONdoResult = JSON.stringify({ result: result.toString() });
                }
                else if (typeof(result) === 'bigint') {
                    stringJSONdoResult = JSON.stringify({ result: result.toString() });
                }
                else {
                    stringJSONdoResult = stringify(result);
                }
            } catch (err) {
                stringJSONdoResult = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "invokeFun",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Function_Name": newFunctionName,
                //"Function_Arguments": args.join(", "),
                "Tipo_Returned_Value": typeof result,
                "Returned_Value": stringJSONdoResult,
                "iid": iid,
                //"Runtime_ms": runtime,
                //"Objeto_Base": base, // objeto base que vai receber a funcao, julgo que nao eh mt necessario
                "timer": performance.now(),
            };
        
            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
            //console.log("Essa base eh: ", base);
        };
        /*
        this.startExpression = (iid, type) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;
            

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "startExpression",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
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
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "endExpression",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
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


            let stringJSONdoVal : string;
            try {
                if (typeof(val) === 'function') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else if (typeof(val) === 'bigint') {
                    stringJSONdoVal = JSON.stringify({ val: val.toString() });
                }
                else {
                    stringJSONdoVal = stringify(val);
                }
            } catch (err) {
                stringJSONdoVal = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }


            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "literal",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Literal_Type": literalType,
                "Literal_Value_Type": typeof(val),
                "Literal_Value": stringJSONdoVal,
            };

            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };

        // REVER: Onde esta esse typeof detectado dentro da execucao do exemplo?? ele eh executado apenas 1 vez mesmo
        this.unary = (iid, op, left, result) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;
            

            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "unary",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
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
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "unaryPre",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Unary_Operation_Executed": op,
                "Unary_Left_Operand": left,
            };

            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };
        */
       
        
        this.asyncFunctionEnter = (iid) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;
            

            // nao tem como saber qual a funcao??
            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "asyncFunctionEnter",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "timer": performance.now(),
                "iid": iid,
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
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "asyncFunctionExit",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Returned_Value": result,
                "Excession_Occurred": wrappedExceptionVal,
                "timer": performance.now(),
                "iid": iid,
            };

            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };
        
        this.awaitPre = (iid, promiseOrValAwaited) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;
            

            let stringJSONdopromiseOrValAwaited : string;
            try {
                if (typeof(promiseOrValAwaited) === 'function') {
                    stringJSONdopromiseOrValAwaited = JSON.stringify({ promiseOrValAwaited: promiseOrValAwaited.toString() });
                }
                else if (typeof(promiseOrValAwaited) === 'bigint') {
                    stringJSONdopromiseOrValAwaited = JSON.stringify({ promiseOrValAwaited: promiseOrValAwaited.toString() });
                }
                else {
                    stringJSONdopromiseOrValAwaited = stringify(promiseOrValAwaited);
                }
            } catch (err) {
                stringJSONdopromiseOrValAwaited = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            // nao tem como saber qual a funcao??
            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "awaitPre",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Expected_Value": stringJSONdopromiseOrValAwaited,
                "timer": performance.now(),
                "iid": iid,
            };

            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };

        this.awaitPost = (iid, promiseOrValAwaited, valResolveOrRejected, isPromiseRejected) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;
            
            let stringJSONdopromiseOrValAwaited : string;
            try {
                if (typeof(promiseOrValAwaited) === 'function') {
                    stringJSONdopromiseOrValAwaited = JSON.stringify({ promiseOrValAwaited: promiseOrValAwaited.toString() });
                }
                else if (typeof(promiseOrValAwaited) === 'bigint') {
                    stringJSONdopromiseOrValAwaited = JSON.stringify({ promiseOrValAwaited: promiseOrValAwaited.toString() });
                }
                else {
                    stringJSONdopromiseOrValAwaited = stringify(promiseOrValAwaited);
                }
            } catch (err) {
                stringJSONdopromiseOrValAwaited = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            let stringJSONdovalResolveOrRejected : string;
            try {
                if (typeof(valResolveOrRejected) === 'function') {
                    stringJSONdovalResolveOrRejected = JSON.stringify({ valResolveOrRejected: valResolveOrRejected.toString() });
                }
                else if (typeof(valResolveOrRejected) === 'bigint') {
                    stringJSONdovalResolveOrRejected = JSON.stringify({ valResolveOrRejected: valResolveOrRejected.toString() });
                }
                else {
                    stringJSONdovalResolveOrRejected = stringify(valResolveOrRejected);
                }
            } catch (err) {
                stringJSONdovalResolveOrRejected = err instanceof Error
                ? `{ "error": "Failed to stringify value", "details": "${err.message}" }`
                : `{ "error": "Failed to stringify value", "details": "Unknown error" }`;
            }

            // nao tem como saber qual a funcao??
            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "awaitPost",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Is_Promise_Rejected": isPromiseRejected,
                // !!! Por algum motivo esses valores esperados/resolvidos nao estao sendo armazenados no arquivo !!!
                "Expected_Value_Type": typeof(promiseOrValAwaited),
                "Expected_Value": stringJSONdopromiseOrValAwaited,
                "Resolved_Value_Type": typeof(valResolveOrRejected),
                "Resolved_Value": stringJSONdovalResolveOrRejected,
                "timer": performance.now(),
                "iid": iid,
            };

            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };
        

        /*
        this.startStatement = (iid, type) => {
            const sourceObject = this.getSandbox().iidToSourceObject(iid);
            if(!sourceObject) { return }
            const {name: fileName, loc} = sourceObject;
            

            // nao tem como saber qual a funcao??
            const ObjectLogMessage = {
                "File_Path": path.resolve(fileName),
                "Detected_Hook": "awaitPost",
                "loc": loc,
                "Async_Hook_Id": async_hooks.executionAsyncId(),
                "Statement_Type": type,
            };

            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };

        this.endExecution = () => {
            // Hook endExecution detectou o fim da execucao node.
            const ObjectLogMessage = {
                "Detected_Hook": "endExecution",
                "Async_Hook_Id": async_hooks.executionAsyncId(),
            };
        
            const stringJSON = JSON.stringify(ObjectLogMessage, null, 4);
            MyFunctionCallAnalysis.eventEmitter.emit('addLogToVector', stringJSON);
        };
        */
    //console.log(this.timeConsumed);
    }
}

process.on('exit', () => {
    //console.log("O process.on(exit) foi detectado!");
    MyFunctionCallAnalysis.writeHooksOnLog();
});