// DO NOT INSTRUMENT

import {Analysis, Sandbox} from '../../Type/nodeprof';
import {FileHandleOperationLogger} from './SubLogger/FileHandleOperationLogger';
import {FsAsyncOperationLogger} from './SubLogger/FsAsyncOperationLogger';
import {FsPromisesOperationLogger} from './SubLogger/FsPromisesOperationLogger';
import {FsSyncOperationLogger} from './SubLogger/FsSyncOperationLogger';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
 

export class FsOperationLogger extends Analysis
{
    constructor(sandbox: Sandbox)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("FsOperationLogger");

        super(sandbox);
    }

    protected override registerHooks()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("FsOperationLogger", "registerHooks");

        const sandbox = this.getSandbox();
        sandbox.addAnalysis(new FileHandleOperationLogger(sandbox));
        sandbox.addAnalysis(new FsAsyncOperationLogger(sandbox));
        sandbox.addAnalysis(new FsSyncOperationLogger(sandbox));
        sandbox.addAnalysis(new FsPromisesOperationLogger(sandbox));
    }
}