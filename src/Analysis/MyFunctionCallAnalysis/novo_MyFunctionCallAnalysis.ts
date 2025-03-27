// DO NOT INSTRUMENT

import { Analysis, Hooks, Sandbox } from '../../Type/nodeprof';
import * as fs from 'fs';
import async_hooks from 'async_hooks';
import path from 'path';
import { stringify } from 'flatted';
import { performance } from 'perf_hooks';

interface FuncaoComAtributo extends Function {
    callerIID?: number;
}

export class MyFunctionCallAnalysis extends Analysis {
    static logHooks: any[] = [];
    static pathLogHooks: string;

    // Hooks declarations (only necessary ones retained for brevity)
    public functionEnter: Hooks['functionEnter'] | undefined;
    public functionExit: Hooks['functionExit'] | undefined;
    public invokeFunPre: Hooks['invokeFunPre'] | undefined;
    public invokeFun: Hooks['invokeFun'] | undefined;
    public asyncFunctionEnter: Hooks['asyncFunctionEnter'] | undefined;
    public asyncFunctionExit: Hooks['asyncFunctionExit'] | undefined;
    public awaitPre: Hooks['awaitPre'] | undefined;
    public awaitPost: Hooks['awaitPost'] | undefined;

    constructor(sandbox: Sandbox) {
        super(sandbox);
        MyFunctionCallAnalysis.pathLogHooks = "/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/NodeRock_src/FoldersUsedDuringExecution/temporary_logHooks/logHooks.json";
        // console.log(path.join(__dirname,"../logHooks.json"));
    }

    protected override registerHooks() {
        this.functionEnter = (iid, f, _dis, _args) => {
            const logObject = this.createLogObject("functionEnter", iid, {
                Function_Name: f.name || "Anonymous Function",
                is_Callback: !!(f as FuncaoComAtributo).callerIID,
                valueCallerIID: (f as FuncaoComAtributo).callerIID
            });
            if (logObject) MyFunctionCallAnalysis.addHookToLog(logObject);
        };

        this.functionExit = (iid, returnVal, wrappedExceptionVal) => {
            const logObject = this.createLogObject("functionExit", iid, {
                Returned_Type: typeof returnVal,
                Returned_Value: MyFunctionCallAnalysis.stringifyValue(returnVal),
                Excession_Occurred: wrappedExceptionVal
            });
            if (logObject) MyFunctionCallAnalysis.addHookToLog(logObject);
        };

        this.invokeFunPre = (iid, f, _base, args) => {
            const makesCallBack = args.some(arg => {
                if (typeof arg === 'function') {
                    (arg as FuncaoComAtributo).callerIID = iid;
                    return true;
                }
                return false;
            });
            const logObject = this.createLogObject("invokeFunPre", iid, {
                Function_Name: f.name || "Anonymous Function",
                Makes_CallBack: makesCallBack
            });
            if (logObject) MyFunctionCallAnalysis.addHookToLog(logObject);
        };

        this.invokeFun = (iid, f, _base, _args, result) => {
            const logObject = this.createLogObject("invokeFun", iid, {
                Function_Name: f.name || "Anonymous Function",
                Tipo_Returned_Value: typeof result,
                Returned_Value: MyFunctionCallAnalysis.stringifyValue(result)
            });
            if (logObject) MyFunctionCallAnalysis.addHookToLog(logObject);
        };
    
        this.asyncFunctionEnter = (iid) => {
            const logObject = this.createLogObject("asyncFunctionEnter", iid, {});
            if (logObject) MyFunctionCallAnalysis.addHookToLog(logObject);
        };
    
        this.asyncFunctionExit = (iid, result, wrappedExceptionVal) => {
            const logObject = this.createLogObject("asyncFunctionExit", iid, {
                Returned_Value: MyFunctionCallAnalysis.stringifyValue(result),
                Excession_Occurred: wrappedExceptionVal
            });
            if (logObject) MyFunctionCallAnalysis.addHookToLog(logObject);
        };
    
        this.awaitPre = (iid, promiseOrValAwaited) => {
            const logObject = this.createLogObject("awaitPre", iid, {
                Expected_Value: MyFunctionCallAnalysis.stringifyValue(promiseOrValAwaited)
            });
            if (logObject) MyFunctionCallAnalysis.addHookToLog(logObject);
        };
    
        this.awaitPost = (iid, promiseOrValAwaited, valResolveOrRejected, isPromiseRejected) => {
            const logObject = this.createLogObject("awaitPost", iid, {
                Is_Promise_Rejected: isPromiseRejected,
                Expected_Value: MyFunctionCallAnalysis.stringifyValue(promiseOrValAwaited),
                Resolved_Value_Type: typeof valResolveOrRejected,
                Resolved_Value: MyFunctionCallAnalysis.stringifyValue(valResolveOrRejected)
            });
            if (logObject) MyFunctionCallAnalysis.addHookToLog(logObject);
        };
    }

    private createLogObject(hookName: string, iid: number, additionalProps: any) {
        const sourceObject = this.getSandbox().iidToSourceObject(iid);
        if (!sourceObject) return null;
        const { name: fileName, loc } = sourceObject;
        return {
            File_Path: path.resolve(fileName),
            Detected_Hook: hookName,
            loc,
            Async_Hook_Id: async_hooks.executionAsyncId(),
            timer: performance.now(),
            iid,
            ...additionalProps
        };
    }

    private static stringifyValue(value: any): string {
        try {
            if (typeof value === 'function') return JSON.stringify({ value: value.toString() });
            if (typeof value === 'bigint') return JSON.stringify({ value: value.toString() });
            return stringify(value);
        } catch (err) {
            return `{ "error": "Failed to stringify value", "details": "${err instanceof Error ? err.message : 'Unknown error'}" }`;
        }
    }

    public static addHookToLog(hookObject: any): void {
        this.logHooks.push(hookObject);
    }

    public static writeHooksOnLog(): void {
        fs.writeFileSync(this.pathLogHooks, JSON.stringify(this.logHooks, null, 2));
    }
}

process.on('exit', () => MyFunctionCallAnalysis.writeHooksOnLog());