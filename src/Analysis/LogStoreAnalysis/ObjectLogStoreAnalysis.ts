// DO NOT INSTRUMENT

import {ObjectLogStore} from '../../LogStore/ObjectLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
 

export class ObjectLogStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("ObjectLogStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("ObjectLogStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(ObjectLogStore.getObjectDeclarations()), 'objectLogStore.json');
        };
    }
}