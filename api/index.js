module.exports = (req, res) => {
    try {
        // Define o fuso horário desejado
        const timeZone = 'America/Sao_Paulo';
        
        // Pega a data/hora atual (UTC)
        const now = new Date();

        // 1. Obter a HORA pura no Brasil (0-23) para a lógica
        const horaBrasil = parseInt(new Intl.DateTimeFormat('pt-BR', {
            hour: 'numeric',
            hour12: false,
            timeZone
        }).format(now));

        // 2. Obter o DIA DA SEMANA numérico no Brasil para a lógica (0=Dom, 1=Seg... 6=Sáb)
        // Precisamos criar uma data "fake" baseada na string brasileira para o .getDay() funcionar no fuso certo
        const dataStringBrasil = new Date().toLocaleString("en-US", { timeZone });
        const dataObjBrasil = new Date(dataStringBrasil);
        const diaSemanaIndex = dataObjBrasil.getDay(); 

        // 3. Formatadores para exibição bonita (JSON)
        const dataFormatada = new Intl.DateTimeFormat('pt-BR', { 
            timeZone, day: '2-digit', month: '2-digit', year: 'numeric' 
        }).format(now);

        const horaFormatada = new Intl.DateTimeFormat('pt-BR', { 
            timeZone, hour: '2-digit', minute: '2-digit' 
        }).format(now);

        let diaSemanaTexto = new Intl.DateTimeFormat('pt-BR', { 
            timeZone, weekday: 'long' 
        }).format(now);
        
        // Capitalizar primeira letra (segunda-feira -> Segunda-feira)
        diaSemanaTexto = diaSemanaTexto.charAt(0).toUpperCase() + diaSemanaTexto.slice(1);

        // 4. Lógica de Abertura Granatto
        // Seg(1) a Sex(5): 09h as 18h
        // Sáb(6): 09h as 13h
        // Dom(0): Fechado
        
        let statusLoja = "FECHADO";

        if (diaSemanaIndex >= 1 && diaSemanaIndex <= 5) { // Segunda a Sexta
            if (horaBrasil >= 9 && horaBrasil < 18) {
                statusLoja = "ABERTO";
            }
        } else if (diaSemanaIndex === 6) { // Sábado
            if (horaBrasil >= 9 && horaBrasil < 13) {
                statusLoja = "ABERTO";
            }
        }

        // 5. Retorno
        res.status(200).json({
            data: dataFormatada,
            hora: horaFormatada,
            dia_semana: diaSemanaTexto,
            status_comercial: statusLoja,
            hora_brasil_debug: horaBrasil, // Para você conferir se está pegando a hora certa (0-23)
            fuso: "America/Sao_Paulo"
        });

    } catch (error) {
        console.error(error);
        // Mesmo se der erro catastrófico, retorna JSON válido para a IA não alucinar
        res.status(200).json({ 
            error: "Erro interno", 
            status_comercial: "FECHADO", // Assume fechado por segurança
            hora: "00:00" 
        });
    }
};