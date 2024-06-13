import {SourceCodeInfo} from './SourceCodeInfo';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export abstract class ResourceInfo
{
    private readonly type: string;
    private readonly possibleDefineCodeScope: SourceCodeInfo | null;

    protected constructor(type: string, possibleDefineCodeScope: SourceCodeInfo | null)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("ResourceInfo do LogStore");

        this.type = type;
        this.possibleDefineCodeScope = possibleDefineCodeScope;
    }

    public getType()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceInfo do LogStore", "getType");

        return this.type;
    };

    public getPossibleDefineCodeScope()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("ResourceInfo do LogStore", "getPossibleDefineCodeScope");

        return this.possibleDefineCodeScope;
    }

    public abstract is(...other: unknown[]): boolean;

    /**
     * Used for filtering duplicates
     */
    public abstract getHash(): string | object;
}