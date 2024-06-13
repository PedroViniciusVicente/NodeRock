// DO NOT INSTRUMENT

import {SourceCodeInfo} from './SourceCodeInfo';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export abstract class ResourceOperation
{
    private static lastIndex = 0;
    private readonly type: 'read' | 'write';
    private readonly scopeCodeInfo: SourceCodeInfo | null;
    private readonly stackTrace: string[] | null;
    private readonly index: number;
    private readonly timestamp: bigint; // nanoseconds

    protected constructor(type: 'read' | 'write', stackTrace: string[] | null, sourceCodeScopeInfo: SourceCodeInfo | null)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("ResourceOperation do LogStore");

        this.type = type;
        this.stackTrace = stackTrace;
        this.scopeCodeInfo = sourceCodeScopeInfo;
        this.index = ResourceOperation.lastIndex++;
        this.timestamp = process.hrtime.bigint();
    }

    public getType()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getType");

        return this.type;
    }

    public getScopeCodeInfo()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getScopeCodeInfo");

        return this.scopeCodeInfo;
    }

    public getStackTrace()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getStackTrace");

        return this.stackTrace;
    }

    public getIndex()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getIndex");

        return this.index;
    }

    public getTimestamp()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getTimestamp");

        return this.timestamp;
    }
}