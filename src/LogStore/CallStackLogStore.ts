// DO NOT INSTRUMENT

import {strict as assert} from 'assert';
import {Sandbox} from '../Type/nodeprof';

import {GerenciadorRastrearChamadas} from '/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");

export class CallStackLogStore
{
    private static readonly iidCallStack: number[] = [];
    private static readonly iidToLocation: Map<number, string> = new Map();

    public static push(sandbox: Sandbox, iid: number)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("CallStackLogStore do LogStore", "push");

        this.iidCallStack.push(iid);
        this.iidToLocation.set(iid, sandbox.iidToLocation(iid));
    }

    public static getTopIid(): number
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("CallStackLogStore do LogStore", "getTopIid");

        if (CallStackLogStore.iidCallStack.length > 0)
        {
            return CallStackLogStore.iidCallStack[CallStackLogStore.iidCallStack.length - 1]!;
        }
        else
        {
            return -1;  // returns a invalid iid if call stack is empty
        }
    }

    public static pop()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("CallStackLogStore do LogStore", "pop");

        assert.ok(CallStackLogStore.iidCallStack.length > 0);
        CallStackLogStore.iidCallStack.length--;
    }

    public static getCallStackIids(): readonly number[]
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("CallStackLogStore do LogStore", "getCallStackIids");

        return CallStackLogStore.iidCallStack;
    }

    public static getCallStack(): string[]
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("CallStackLogStore do LogStore", "getCallStack");

        const locations: string[] = [];
        for (let i = CallStackLogStore.iidCallStack.length - 1; i >= 0; i--)
        {
            const iid = CallStackLogStore.iidCallStack[i]!;
            const location = CallStackLogStore.iidToLocation.get(iid);
            assert.ok(location !== undefined);
            locations.push(location);
        }
        return locations;
    }
}