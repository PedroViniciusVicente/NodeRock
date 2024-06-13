import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {AsyncContextLogStore} from '../../LogStore/AsyncContextLogStore';
import asyncHooks from 'async_hooks';
import {AsyncCalledFunctionInfo} from '../../LogStore/Class/AsyncCalledFunctionInfo';
import {ImmediateLogStore} from '../../LogStore/ImmediateLogStore';
import {ImmediateInfo} from '../../LogStore/Class/ImmediateInfo';
import {getUnboundFunction} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class ImmediateLogger extends Analysis
{
    public invokeFunPre: Hooks['invokeFunPre'] | undefined;
    public invokeFun: Hooks['invokeFun'] | undefined;

    private immediateIdToCallbackInfo: WeakMap<ReturnType<typeof setImmediate>, { asyncContext: AsyncCalledFunctionInfo, callback: Function }>;

    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("ImmediateLogger");

        super(sandbox);
        this.immediateIdToCallbackInfo = new WeakMap();
    }

    protected override registerHooks()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("ImmediateLogger", "registerHooks");

        this.invokeFunPre = (_iid, f, _base, args) =>
        {
            if (f === setImmediate)
            {
                let [callback] = args as Parameters<typeof setImmediate>;
                callback = getUnboundFunction(callback);
                const asyncContext = AsyncContextLogStore.getNonTickObjectAsyncContextFromAsyncId(asyncHooks.executionAsyncId());
                ImmediateLogStore.addImmediateInfo(asyncContext, new ImmediateInfo(callback));
            }
        };

        this.invokeFun = (_iid, f, _base, args, result) =>
        {
            if (f === setImmediate)
            {
                let [callback] = args as Parameters<typeof setImmediate>;
                callback = getUnboundFunction(callback);
                const asyncContext = AsyncContextLogStore.getNonTickObjectAsyncContextFromAsyncId(asyncHooks.executionAsyncId());
                if (f === setTimeout)
                {
                    this.immediateIdToCallbackInfo.set(result as ReturnType<typeof setImmediate>, {
                        asyncContext,
                        callback,
                    });
                }
            }
            else if (f === clearImmediate)
            {
                const immediate = result as ReturnType<typeof setImmediate>;
                const callbackInfo = this.immediateIdToCallbackInfo.get(immediate);
                if (callbackInfo !== undefined)
                {
                    ImmediateLogStore.deleteImmediateInfo(callbackInfo.asyncContext, callbackInfo.callback);
                }
            }
        };
    }
}