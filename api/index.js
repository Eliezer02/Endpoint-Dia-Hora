const axios = require('axios');

module.exports = async (req, res) => {
    try {
        // 1. Chama a API pública (WorldTimeAPI)
        const response = await axios.get('http://worldtimeapi.org/api/timezone/America/Sao_Paulo');
        const data = response.data;

        // 2. Configurações de exibição
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        
        // Cria objeto de data
        const dataObj = new Date(data.datetime);
        
        // Formata Hora (ex: 14:30)
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo'
        });

        // Formata Data (ex: 04/12/2025)
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo'
        });

        const diaSemanaNome = diasSemana[data.day_of_week];
        const horaAtual = dataObj.getHours(); 

        // 3. Lógica Granatto: Seg-Sex (09-18), Sáb (09-13)
        let statusLoja = "FECHADO";
        
        if (data.day_of_week >= 1 && data.day_of_week <= 5) { // Seg a Sex
            if (horaAtual >= 9 && horaAtual < 18) {
                statusLoja = "ABERTO";
            }
        } else if (data.day_of_week === 6) { // Sábado
            if (horaAtual >= 9 && horaAtual < 13) {
                statusLoja = "ABERTO";
            }
        }

        // 4. Retorna a resposta (Status 200 = Sucesso)
        res.status(200).json({
            data: dataFormatada,
            hora: horaFormatada,
            dia_semana: diaSemanaNome,
            status_comercial: statusLoja,
            fuso: "America/Sao_Paulo"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao consultar a hora externa." });
    }
};