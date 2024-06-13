import * as fs from 'fs';

export class GerenciadorRastrearChamadas {
    private pathDoArquivoLog: string; // Caminho do arquivo de log

    constructor(pathDoArquivoLog: string) {
        this.pathDoArquivoLog = pathDoArquivoLog;
        //console.log("o construtor do registrador do log foi chamado!");
    }

    public criarArquivoVazio() {
        try {
            fs.writeFileSync(this.pathDoArquivoLog, '', {flag: 'w'});
            const mensagemInicial = `-=+=- Log das chamadas de funcoes do \"${__dirname}\" -=+=- \n\n`;
            fs.writeFileSync(this.pathDoArquivoLog, mensagemInicial);
        }
        catch(error) {
            console.error('Erro ao criar o arquivo:', error);
            console.log('O erro aconteceu ao criar o arquivo inicial');
        }
    }

    public registrarChamadaConstrutor(nomeClasse: string) {
        //console.log("A funcao de registrar foi chamda!");
        const mensagem = `Construtor da classe \"${nomeClasse}\" foi chamado\n`;

        try {
            fs.appendFileSync(this.pathDoArquivoLog, mensagem);
            //console.log('Mensagem de log anexada com sucesso.');
        } catch (error) {
            console.error('Erro ao anexar uma mensagem de log:', error);
            console.log('O erro ocorreu no local: ', process.cwd());
        }
    }

    public registrarChamadaFuncao(nomeClasse: string, nomeFuncao: string) {
        const mensagem = `    Funcao \"${nomeFuncao}\" da classe \"${nomeClasse}\" foi chamado\n`;

        try {
            fs.appendFileSync(this.pathDoArquivoLog, mensagem);
            //console.log('Mensagem de log anexada com sucesso.');
        } catch (error) {
            console.error('Erro ao anexar uma mensagem de log:', error);
            console.log('O erro ocorreu no local: ', process.cwd());
        }
    }
}
