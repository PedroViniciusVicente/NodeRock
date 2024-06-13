// DO NOT INSTRUMENT

import {StreamOperationKind} from '..';
import {ResourceOperation} from '../../Class/ResourceOperation';
import {SourceCodeInfo} from '../../Class/SourceCodeInfo';
import {StatisticsStore} from '../../StatisticsStore';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
 

export class StreamOperation extends ResourceOperation
{
    private readonly operationKind: StreamOperationKind;

    constructor(type: 'read' | 'write', operationKind: StreamOperation['operationKind'], stackTrace: string[] | null, sourceCodeScopeInfo: SourceCodeInfo | null)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("StreamOperation do LogStore");

        super(type, stackTrace, sourceCodeScopeInfo);
        this.operationKind = operationKind;
        StatisticsStore.addStreamOperationCount();
    }

    public getOperationKind()
    {
        return this.operationKind;
    }
}