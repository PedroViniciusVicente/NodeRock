// DO NOT INSTRUMENT

import {IncomingMessage} from 'http';
import {SocketLogStore} from '../../../LogStore/SocketLogStore';
import {Analysis, Hooks, Sandbox} from '../../../Type/nodeprof';
import {shouldBeVerbose} from '../../../Util';

import {GerenciadorRastrearChamadas} from '../../GerenciadorRastrearChamadas';
const meuGerenciadorRastrearChamadas = new 
GerenciadorRastrearChamadas("/home/pedroubuntu/coisasNodeRT/NodeRT-OpenSource/src/Analysis/logRastrearChamadas.txt");


export class HttpIncomingMessageOperationLogger extends Analysis
{
    public invokeFunPre: Hooks['invokeFunPre'] | undefined;
    public endExecution: Hooks['endExecution'] | undefined;

    private timeConsumed: number;

    constructor(sandbox: Sandbox)
    {
        meuGerenciadorRastrearChamadas.registrarChamadaConstrutor("HttpIncomingMessageOperationLogger");

        super(sandbox);
        this.timeConsumed = 0;
    }

    protected override registerHooks()
    {
        meuGerenciadorRastrearChamadas.registrarChamadaFuncao("HttpIncomingMessageOperationLogger", "registerHooks");

        this.invokeFunPre = (iid, f, base) =>
        {
            const startTimestamp = Date.now();

            if (base instanceof IncomingMessage)
            {
                if (f === IncomingMessage.prototype.destroy)
                {
                    const socket = base.socket;
                    if (socket !== null)
                    {
                        SocketLogStore.appendSocketOperation(socket, 'write', 'destroy', this.getSandbox(), iid);
                    }
                }
            }

            this.timeConsumed += Date.now() - startTimestamp;
        };

        this.endExecution = () =>
        {
            if (shouldBeVerbose())
            {
                console.log(`HttpIncomingMessage: ${this.timeConsumed / 1000}s`);
            }
        };
    }
}