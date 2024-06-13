import {Analysis, Sandbox} from '../../Type/nodeprof';
import {TimeoutLogger} from './TimeoutLogger';
import {ImmediateLogger} from './ImmediateLogger';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class AsyncAPILogger extends Analysis
{
    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("AsyncAPILogger");

        super(sandbox);
        sandbox.addAnalysis(new TimeoutLogger(sandbox));
        sandbox.addAnalysis(new ImmediateLogger(sandbox));
    }

    protected override registerHooks()
    {
        // void
    }
}