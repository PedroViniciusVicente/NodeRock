// DO NOT INSTRUMENT

import {Range} from './Range';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
 

export class SourceCodeInfo
{
    public readonly file: string;
    public readonly range: Readonly<Range>;

    /**
     * @param file - code file path
     * @param range
     * */
    constructor(file: string, range: Readonly<Range>)
    {
         GerenciadorRastrearChamadas.registrarChamadaConstrutor("SourceCodeInfo do LogStore");

        this.file = file;
        this.range = Object.freeze(range);
    }

    public toJSON()
    {
         GerenciadorRastrearChamadas.registrarChamadaFuncao("SourceCodeInfo do LogStore", "toJSON");

        const {startRow, startCol, endRow, endCol} = this.range;
        return `${this.file}:${startRow}:${startCol}:${endRow}:${endCol}`;
    }
}