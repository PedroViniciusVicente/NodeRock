// DO NOT INSTRUMENT

import {Analysis, Sandbox} from '../../Type/nodeprof';
import {FileHandleOperationLogger} from './SubLogger/FileHandleOperationLogger';
import {FsAsyncOperationLogger} from './SubLogger/FsAsyncOperationLogger';
import {FsPromisesOperationLogger} from './SubLogger/FsPromisesOperationLogger';
import {FsSyncOperationLogger} from './SubLogger/FsSyncOperationLogger';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class FsOperationLogger extends Analysis
{
    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("FsOperationLogger");

        super(sandbox);
    }

    protected override registerHooks()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("FsOperationLogger", "registerHooks");

        const sandbox = this.getSandbox();
        sandbox.addAnalysis(new FileHandleOperationLogger(sandbox));
        sandbox.addAnalysis(new FsAsyncOperationLogger(sandbox));
        sandbox.addAnalysis(new FsSyncOperationLogger(sandbox));
        sandbox.addAnalysis(new FsPromisesOperationLogger(sandbox));
    }
}