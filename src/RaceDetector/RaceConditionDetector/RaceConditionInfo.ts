import {Info} from '../Info';
import {ResourceInfo} from '../../LogStore/Class/ResourceInfo';
import {AsyncCalledFunctionInfo} from '../../LogStore/Class/AsyncCalledFunctionInfo';
import {ResourceOperation} from '../../LogStore/Class/ResourceOperation';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
 

export class RaceConditionInfo extends Info
{
    public readonly timeDiff: bigint;
    public readonly asyncContextToOperations1: readonly [AsyncCalledFunctionInfo, readonly ResourceOperation[]];
    public readonly asyncContextToOperations2: readonly [AsyncCalledFunctionInfo, readonly ResourceOperation[]];

    /**
     * `asyncContextToOperations1` MUST HAPPENS BEFORE `asyncContextToOperations2` in time order
     */
    constructor(resourceInfo: ResourceInfo,
                asyncContextToOperations1: RaceConditionInfo['asyncContextToOperations1'],
                asyncContextToOperations2: RaceConditionInfo['asyncContextToOperations2'],
                timeDiff: bigint)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("RaceConditionInfo do RaceDetector");

        super(resourceInfo);
        this.timeDiff = timeDiff;
        this.asyncContextToOperations1 = asyncContextToOperations1;
        this.asyncContextToOperations2 = asyncContextToOperations2;
    }
}