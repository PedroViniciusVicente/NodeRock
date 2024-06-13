// DO NOT INSTRUMENT

import {SocketLogStore} from '../../LogStore/SocketLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class SocketLogStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("SocketLogStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("SocketLogStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(SocketLogStore.getSocketDeclarations()), 'socketLogStore.json');
        };
    }
}