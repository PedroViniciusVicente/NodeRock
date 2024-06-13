// DO NOT INSTRUMENT

import {FileLogStore} from '../../LogStore/FileLogStore';
import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';
import {outputSync, toJSON} from '../../Util';

import {GerenciadorRastrearChamadas} from '../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class FileLogStoreAnalysis extends Analysis
{
    public endExecution: Hooks['endExecution'] | undefined;

    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("FileLogStoreAnalysis");

        super(sandbox);
    }

    protected registerHooks(): void
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("FileLogStoreAnalysis", "registerHooks");

        this.endExecution = () =>
        {
            outputSync(toJSON(FileLogStore.getFileDeclarations()), 'fileLogStore.json');
        };
    }
}