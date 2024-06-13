// DO NOT INSTRUMENT

import {Analysis, Sandbox} from '../../Type/nodeprof';
import {ArrayBufferOperationLogger} from './ArrayBufferOperationLogger';
import {BufferOperationLogger} from './BufferOperationLogger';
import {DataViewOperationLogger} from './DataViewOperationLogger';
import {TypedArrayOperationLogger} from './TypedArrayOperationLogger';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class BufferLikeOperationLogger extends Analysis
{
    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("BufferLikeOperationLogger");

        super(sandbox);
        sandbox.addAnalysis(new ArrayBufferOperationLogger(sandbox));
        sandbox.addAnalysis(new BufferOperationLogger(sandbox));
        sandbox.addAnalysis(new DataViewOperationLogger(sandbox));
        sandbox.addAnalysis(new TypedArrayOperationLogger(sandbox));
    }

    protected override registerHooks()
    {
        // void
    }
}