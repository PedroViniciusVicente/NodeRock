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

    private timeConsumed: number;

    constructor(sandbox: Sandbox)
    {
        // GerenciadorRastrearChamadas.registrarChamadaConstrutor("EventEmitterOperationLogger");

        super(sandbox); // Chamada para o construtor de Analysis, que armazena o sandbox e chama o registerHooks
        this.timeConsumed = 0;
    }

    protected override registerHooks()
    {
        console.log("testando funcoes do MyFunctionCallAnalysis");
        console.log(this.timeConsumed);
        // GerenciadorRastrearChamadas.registrarChamadaFuncao("EventEmitterOperationLogger", "registerHooks");
        
        // esses argumentos sao preenchidos pela propria funcao e usados no callback
        // o mais relevante eh esse "f", que nesse caso indentifica a funcao, metodo ou construtor invocado
        // e ele vai comparando esse f com as funcoes presentes em /node_modules/@types/node para saber
        // qual funcao dentre as catalogadas esta sendo usada
        this.invokeFunPre = (iid, f, base, args) =>
        {
            console.log(`Hook invokeFunPre detectou a funcao: ${f} de iid: ${iid}`);
            console.log(`base: ${base} args: ${args}`);
        };

        this.endExecution = () =>
        {
            console.log(`Hook endExecution foi acionado`);
        };
    }
}