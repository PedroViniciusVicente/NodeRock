// DO NOT INSTRUMENT

import {ResourceOperation} from '../../Class/ResourceOperation';
import {SourceCodeInfo} from '../../Class/SourceCodeInfo';
import {StatisticsStore} from '../../StatisticsStore';
import {FileOperationOnType} from '../Type/FileOperationOnType';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class FileOperation extends ResourceOperation
{
    private readonly accessStage: 'start' | 'finish';
    private readonly operationOn: FileOperationOnType;

    constructor(type: 'read' | 'write', accessStage: FileOperation['accessStage'], operationOn: FileOperation['operationOn'], stackTrace: string[] | null, sourceCodeScopeInfo: SourceCodeInfo | null)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("FileInfo do FileOperation");

        super(type, stackTrace, sourceCodeScopeInfo);
        this.accessStage = accessStage;
        this.operationOn = operationOn;
        StatisticsStore.addFileOperationCount();
    }

    public getOperationOn()
    {
        return this.operationOn;
    }

    public getAccessStage()
    {
        return this.accessStage;
    }
}