const axios = require('axios');

module.exports = async (req, res) => {
    try {
        // 1. Chama a API pública
        const response = await axios.get('http://worldtimeapi.org/api/timezone/America/Sao_Paulo');
        const data = response.data;

        // 2. Cria objeto de data
        const dataObj = new Date(data.datetime);

        // --- CORREÇÃO AQUI ---
        // Forçamos o javascript a nos dar a hora (0-23) no fuso de SP, não do Servidor UTC
        const horaBrasilString = dataObj.toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
            hour: "numeric",
            hour12: false
        });
        const horaAtual = parseInt(horaBrasilString);
        // ---------------------

        // Formatações visuais (já estavam certas)
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo'
        });
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo'
        });
        const diaSemanaNome = diasSemana[data.day_of_week];

        // 3. Lógica Granatto
        // Seg-Sex (09:00 - 17:59) -> ABERTO
        // Sáb (09:00 - 12:59) -> ABERTO
        
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

        // 4. Retorno
        res.status(200).json({
            data: dataFormatada,
            hora: horaFormatada,
            dia_semana: diaSemanaNome,
            status_comercial: statusLoja,
            hora_servidor_debug: dataObj.getHours(), // Só para você ver a diferença se quiser
            hora_brasil_debug: horaAtual,
            fuso: "America/Sao_Paulo"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao consultar a hora externa." });
    }
};