import {Analysis, Sandbox} from '../../Type/nodeprof';
import {TimeoutLogger} from './TimeoutLogger';
import {ImmediateLogger} from './ImmediateLogger';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
 

export class AsyncAPILogger extends Analysis
{
    constructor(sandbox: Sandbox)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("AsyncAPILogger");

        super(sandbox);
        sandbox.addAnalysis(new TimeoutLogger(sandbox));
        sandbox.addAnalysis(new ImmediateLogger(sandbox));
    }

    protected override registerHooks()
    {
        // void
    }
}