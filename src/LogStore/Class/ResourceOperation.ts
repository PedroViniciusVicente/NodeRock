// DO NOT INSTRUMENT

import {SourceCodeInfo} from './SourceCodeInfo';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
 

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
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("ResourceOperation do LogStore");

        this.type = type;
        this.stackTrace = stackTrace;
        this.scopeCodeInfo = sourceCodeScopeInfo;
        this.index = ResourceOperation.lastIndex++;
        this.timestamp = process.hrtime.bigint();
    }

    public getType()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getType");

        return this.type;
    }

    public getScopeCodeInfo()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getScopeCodeInfo");

        return this.scopeCodeInfo;
    }

    public getStackTrace()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getStackTrace");

        return this.stackTrace;
    }

    public getIndex()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getIndex");

        return this.index;
    }

    public getTimestamp()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceOperation do LogStore", "getTimestamp");

        return this.timestamp;
    }
}