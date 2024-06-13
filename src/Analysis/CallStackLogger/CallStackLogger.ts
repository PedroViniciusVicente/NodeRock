import assert from 'assert';
import {CallStackLogStore} from '../../LogStore/CallStackLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
 

export class CallStackLogger extends Analysis
{
    public functionEnter: Hooks['functionEnter'] | undefined;
    public functionExit: Hooks['functionExit'] | undefined;

    constructor(sandbox: Sandbox)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("CallStackLogger");

        super(sandbox);
    }

    protected override registerHooks()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("CallStackLogger", "registerHooks");

        this.functionEnter = iid =>
        {
            CallStackLogStore.push(this.getSandbox(), iid);
        };

        this.functionExit = iid =>
        {
            const topIid = CallStackLogStore.getTopIid();
            assert.equal(iid, topIid);
            CallStackLogStore.pop();
        };
    }
}