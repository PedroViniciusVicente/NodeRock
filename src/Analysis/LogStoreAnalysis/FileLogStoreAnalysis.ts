// DO NOT INSTRUMENT

import {FileLogStore} from '../../LogStore/FileLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
 

export class FileLogStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("FileLogStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("FileLogStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(FileLogStore.getFileDeclarations()), 'fileLogStore.json');
        };
    }
}