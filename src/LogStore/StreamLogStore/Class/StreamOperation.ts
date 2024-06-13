// DO NOT INSTRUMENT

import {StreamOperationKind} from '..';
import {ResourceOperation} from '../../Class/ResourceOperation';
import {SourceCodeInfo} from '../../Class/SourceCodeInfo';
import {StatisticsStore} from '../../StatisticsStore';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class StreamOperation extends ResourceOperation
{
    private readonly operationKind: StreamOperationKind;

    constructor(type: 'read' | 'write', operationKind: StreamOperation['operationKind'], stackTrace: string[] | null, sourceCodeScopeInfo: SourceCodeInfo | null)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("StreamOperation do LogStore");

        super(type, stackTrace, sourceCodeScopeInfo);
        this.operationKind = operationKind;
        StatisticsStore.addStreamOperationCount();
    }

    public getOperationKind()
    {
        return this.operationKind;
    }
}