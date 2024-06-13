import assert from 'assert';
import {CallStackLogStore} from '../../LogStore/CallStackLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class CallStackLogger extends Analysis
{
    public functionEnter: Hooks['functionEnter'] | undefined;
    public functionExit: Hooks['functionExit'] | undefined;

    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("CallStackLogger");

        super(sandbox);
    }

    protected override registerHooks()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("CallStackLogger", "registerHooks");

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