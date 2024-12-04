const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args) => {
    // Verifica se o usuário forneceu a quantidade de moedas para o drop
    const valor = args[0];

    if (!valor) {
        return message.reply('Por favor, forneça a quantidade de moedas para o drop.');
    }

    let amount = 0;
    if (valor.includes('k')) {
        amount = parseFloat(valor) * 1e3;
    } else if (valor.includes('m')) {
        amount = parseFloat(valor) * 1e6;
    } else if (valor.includes('b')) {
        amount = parseFloat(valor) * 1e9;
    } else if (valor.includes('t')) {
        amount = parseFloat(valor) * 1e12;
    } else if (valor.includes('q')) {
        amount = parseFloat(valor) * 1e15;
    } else if (valor === 'all') {
        amount = db.get(`bal_${message.author.id}`); // Pega todo o saldo do usuário
    } else if (valor === 'half') {
        amount = db.get(`balance_${message.author.id}`) / 2; // Pega metade do saldo
    } else {
        amount = parseFloat(valor); // Valor numérico normal
    }

    if (isNaN(amount) || amount <= 0) {
        return message.reply('Valor inválido fornecido!');
    }

    const userBalance = db.get(`bal_${message.author.id}`) || 0;

    if (amount > userBalance) {
        return message.reply('Você não tem saldo suficiente para fazer esse drop!');
    }

    // Criação da mensagem de drop
    const dropEmbed = new Discord.MessageEmbed()
        .setColor('#ff9900')
        .setTitle('Drop de Moedas!')
        .setDescription(`${message.author} iniciou um drop de **${amount} Nuvens**!`)
        .addField('Participantes', 'Clique na reação para participar!')
        .setFooter('O ganhador será escolhido aleatoriamente entre os participantes.');

    // Envia a mensagem com reações para participar
    let dropMessage = await message.channel.send(dropEmbed);
    await dropMessage.react('🎉');  // Reação para entrar no drop

    // Cria um coletor para capturar as reações
    const filter = (reaction, user) => {
        return reaction.emoji.name === '🎉' && user.id !== message.author.id; // Exclui o dono do comando da participação
    };

    // Tempo de expiração do drop (exemplo: 60 segundos)
    const collector = dropMessage.createReactionCollector(filter, { time: 60000 }); // 60 segundos

    const participants = [];

    collector.on('collect', (reaction, user) => {
        // Adiciona o usuário à lista de participantes
        if (!participants.includes(user.id)) {
            participants.push(user.id);
        }
    });

    collector.on('end', () => {
        if (participants.length === 0) {
            dropMessage.edit(new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Drop Expirado!')
                .setDescription('Nenhum participante entrou no drop a tempo.')
            );
        } else {
            // Escolhe um ganhador aleatório da lista de participantes
            const winnerID = participants[Math.floor(Math.random() * participants.length)];
            const winner = client.users.cache.get(winnerID);

            // Realiza o drop
            db.subtract(`bal_${message.author.id}`, amount); // Subtrai do autor
            db.add(`bal_${winner.id}`, amount); // Adiciona ao ganhador

            // Atualiza a mensagem com o ganhador
            dropMessage.edit(new Discord.MessageEmbed()
                .setColor('#00ff00')
                .setTitle('Drop Concluído!')
                .setDescription(`O drop de **${amount} Nuvens** foi vencido por <@${winner.id}>!`)
                .addField('Ganhador', `🎉 <@${winner.id}>`)
            );

            message.channel.send(`Parabéns @${winner.id}, você ganhou **${amount} Nuvens**!`);
        }
    });
};

exports.help = {
    name: 'drop',
    description: 'Inicia um drop de moedas onde os usuários podem participar.',
    usage: '!drop <valor>',
    category: 'Economia'
};
