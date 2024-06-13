import {EnhancedSet} from '@datastructures-js/set';
import {ResourceOperation} from '../../Class/ResourceOperation';
import {SourceCodeInfo} from '../../Class/SourceCodeInfo';
import {EventEmitterOperationKind} from '../Type/EventEmitterOperationKind';
import {StatisticsStore} from '../../StatisticsStore';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
 

export class EventEmitterOperation extends ResourceOperation
{
    private readonly operationKind: EventEmitterOperationKind;
    private readonly affectedListeners: EnhancedSet<Function>;

    constructor(type: 'read' | 'write', operationKind: EventEmitterOperation['operationKind'], affectedListeners: EventEmitterOperation['affectedListeners'], stackTrace: string[] | null, sourceCodeScopeInfo: SourceCodeInfo | null)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("EventEmitterOperation do LogStore");

        super(type, stackTrace, sourceCodeScopeInfo);
        this.operationKind = operationKind;
        this.affectedListeners = affectedListeners;
        StatisticsStore.addEventEmitterOperationCount();
    }

    public getOperationKind()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterOperation do LogStore", "getOperationKind");

        return this.operationKind;
    }

    public getAffectedListeners()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterOperation do LogStore", "getAffectedListeners");

        return this.affectedListeners;
    }
}