// DO NOT INSTRUMENT

import {ResourceOperation} from '../../Class/ResourceOperation';
import {SourceCodeInfo} from '../../Class/SourceCodeInfo';
import {StatisticsStore} from '../../StatisticsStore';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class BufferOperation extends ResourceOperation
{
    private readonly accessStage: 'start' | 'finish';
    /***
     * [start, end)
     * */
    private readonly accessRange: { start: number, end: number };

    constructor(type: 'read' | 'write', accessStage: BufferOperation['accessStage'], accessRange: BufferOperation['accessRange'], stackTrace: string[] | null, sourceCodeScopeInfo: SourceCodeInfo | null)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("BufferOperation do LogStore");

        super(type, stackTrace, sourceCodeScopeInfo);
        this.accessStage = accessStage;
        const {start, end} = accessRange;
        this.accessRange = {start, end};
        StatisticsStore.addBufferOperationCount();
    }

    public getAccessStage()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("BufferOperation do LogStore", "getAccessStage");

        return this.accessStage;
    }

    public getAccessRange()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("BufferOperation do LogStore", "getAccessRange");

        return this.accessRange;
    }
}