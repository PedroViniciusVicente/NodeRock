import {Analysis, Hooks, Sandbox} from '../../Type/nodeprof';

export class MyFunctionCallAnalysis extends Analysis {

    /*
    ** Obs1: Aqui sao declarados os hooks que serão usados nessa analise
    ** Obs2: Cada hook tem a funcao de chamar o callback (implementado logo abaixo) quando uma
    **       acao especifica acontecer
    ** Obs3: esse "| undefined;" serve para não ficar dando erro se a funcao ainda nao estiver
    **       implementada (aparentemente so eh usada na fase de desenvolvimento)
    **
    ** Veja a lista com todos os hooks possiveis e suas funcoes:
    ** (interface original em: src/Type/nodeprof/Hooks.ts)
    */
    public read: Hooks['read'] | undefined; //sempre que uma variavel eh lida
    public write: Hooks['write'] | undefined; //sempre que uma variavel eh escrita
    public getField: Hooks['getField'] | undefined; //sempre depois que a propriedade de um objeto eh acessada
    public putFieldPre: Hooks['putFieldPre'] | undefined; //sempre antes que a propriedade de um objeto eh escrita
    public functionEnter: Hooks['functionEnter'] | undefined; //sempre antes que a execucao do corpo de uma funcao comeca
    public functionExit: Hooks['functionExit'] | undefined; //sempre depois que a execucao do corpo de uma funcao completa
    public invokeFunPre: Hooks['invokeFunPre'] | undefined; //sempre antes da invocacao de uma funcao, metodo ou construtor
    public invokeFun: Hooks['invokeFun'] | undefined; //sempre depois da invocacao de uma funcao metodo ou construtor
    //forObject
    public startExpression: Hooks['startExpression'] | undefined; // sempre antes de uma expressao
    public endExpression: Hooks['endExpression'] | undefined; // sempre depois de uma expressao
    public literal: Hooks['literal'] | undefined; // sempre depois da criacao de uma literal
    public unary: Hooks['unary'] | undefined; // sempre depois de uma operacao unaria (+, -, !, typeof, etc)
    public unaryPre: Hooks['unaryPre'] | undefined; // sempre antes de uma operacao unaria
    //asyncFunctionExit
    //asyncFunctionEnter
    //awaitPre
    //awaitPost
    public startStatement: Hooks['startStatement'] | undefined; //sempre antes e depois de um statement
    public endExecution: Hooks['endExecution'] | undefined; // sempre que uma execucao do node termina

    private debugar: boolean = false;
    private timeConsumed: number;

    constructor(sandbox: Sandbox)
    {
        // GerenciadorRastrearChamadas.registrarChamadaConstrutor("EventEmitterOperationLogger");

        super(sandbox); // Chamada para o construtor de Analysis, que armazena o sandbox e chama o registerHooks
        this.timeConsumed = 0;
    }

    protected override registerHooks()
    {
        console.log("\nTestando as funcoes do MyFunctionCallAnalysis:");
        console.log(this.timeConsumed);
        // GerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterOperationLogger", "registerHooks");
        
        this.read = (iid, name, val, isGlobal) => {
            console.log("[read] foi acionado!");
            if (this.debugar) {
                console.log(`Hook read detectou a leitura da variavel: ${name} de iid: ${iid}`);
                console.log(`Valor lido: ${val}`);
                console.log(`Variavel eh global? ${isGlobal}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        this.write = (iid, name, val, lhs, isGlobal) => {        
            console.log("[write] foi acionado!");
            if (this.debugar) {
                console.log(`Hook write detectou a escrita da variavel: ${name} de iid: ${iid}`);
                console.log(`Valor escrito: ${val}`);
                console.log(`Valor anterior a escrita: ${lhs}`);
                console.log(`Variavel eh global? ${isGlobal}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        this.getField = (iid, base, offset, _val, isComputed) => {
            console.log("[getField] foi acionado!");
            if(this.debugar) {
                if(isComputed) {
                    console.log(`Hook getField detectou o acesso da propriedade ${[offset]} do objeto ${base}`);
                    //console.log(`Com a prop prop ${String(offset)}`); // ??
                    //console.log(`Valor do val: ${_val}`);
                }
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        this.putFieldPre = (iid, base, offset, val, isComputed) => {
            console.log("[putFieldPre] foi acionado!");
            if(this.debugar) {
                if(isComputed) {
                    console.log(`Hook putFieldPre detectou a escrita propriedade ${[offset]} do objeto ${base}`);
                    //console.log(`Ou a prop ${String(offset)}`); // ??
                }
                console.log(`Valor do val: ${val}`);
                console.log(`Local ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        this.functionEnter = (iid, f, dis, args) => {
            console.log(`[functionEnter] foi acionado!`);
            if(this.debugar) {
                console.log(`Hook functionEnter detectou o comeco da execucao da funcao: ${f}`);
                console.log(`Argumentos da funcao: ${args}`);
                console.log(`Valor do dis: ${dis}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        this.functionExit = (iid, returnVal) => {
            console.log(`[functionExit] foi acionado!`);
            if(this.debugar) {
                // esse hook nao especifica qual eh a funcao que terminou
                console.log(`Hook functionExit detectou o fim da execucao de uma funcao`);
                console.log(`Valor retornado por essa funcao ${returnVal}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };


        // esses argumentos sao preenchidos pela propria funcao e usados no callback
        // o mais relevante eh esse "f", que nesse caso indentifica a funcao, metodo ou construtor invocado
        // e ele vai comparando esse f com as funcoes presentes em /node_modules/@types/node para saber
        // qual funcao dentre as catalogadas esta sendo usada
        this.invokeFunPre = (iid, f, base, args) => {
            console.log("[invokeFunPre] foi acionado!");
            if (this.debugar) {
                console.log(`Hook invokeFunPre detectou o inicio da execucao da funcao: ${f}`);
                console.log(`Objeto base que recebera a funcao: ${base}`);
                console.log(`Argumentos da funcao: ${args}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        this.invokeFun = (iid, f, _base, args, result) => {
            console.log("[invokeFun] foi acionado!");
            if (this.debugar) {
                console.log(`Hook invokeFun detectou o termino da funcao: ${f}`);
                console.log(`Objeto base que recebera a funcao: ${_base}`);
                console.log(`Argumentos da funcao: ${args}`);
                console.log(`Valor retornado pela funcao: ${result}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        this.startExpression = (iid, type) => {
            console.log("[startExpression] foi acionado!");
            if (this.debugar) {
                console.log(`Hook startExpression detectou o incio da expressao de tipo: ${type}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        this.endExpression = (iid, type, value) => {
            console.log("[endExpression] foi acionado!");
            if (this.debugar) {
                console.log(`Hook endExpression detectou o termino da expressao de tipo: ${type}`);
                console.log(`Valor da expressao: ${value}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        // Esse _fakeHasGetterSetter eh apenas para a API do Jalangi
        this.literal = (iid, val, _fakeHasGetterSetter, literalType) => {
            console.log("[literal] foi acionado!");
            if (this.debugar) {
                console.log(`Hook literal detectou a criacao da literal: ${val}`);
                console.log(`Tipo da literal: ${literalType}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        // REVER: Onde esta esse typeof detectado dentro da execucao do exemplo?? ele eh executado apenas 1 vez mesmo
        this.unary = (iid, op, left, result) => {
            console.log("[unary] foi acionado!");
            if (this.debugar) {
                console.log(`Hook unary detectou a execucao da operacao unaria: ${op}`);
                console.log(`Operando da esquerda da operacao unaria: ${left}`);
                console.log(`Resultado final da operacao unaria: ${result}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };
        
        this.unaryPre = (iid, op, left) => {
            console.log("[unaryPre] foi acionado!");
            if (this.debugar) {
                console.log(`Hook unaryPre detectou o inicio da operacao unaria: ${op}`);
                console.log(`Operando da esquerda da operacao unaria: ${left}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };
        
        this.startStatement = (iid, type) => {
            console.log("[startStatement] foi acionado!");
            if (this.debugar) {
                console.log(`Hook startStatement detectou o inicio ou fim do statement: ${type}`);
                console.log(`Local: ${this.getSandbox().iidToLocation(iid)}`);
            }
        };

        this.endExecution = () => {
            console.log("[endExecution] foi acionado!");
            if(this.debugar) {
                console.log(`Hook endExecution detectou o fim da execucao node`);
            }
        };
    }

}

