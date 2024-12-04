const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args) => {
    const user = message.author;

    // Pega o histórico de transações
    const userHistory = db.get(`transactionHistory_${user.id}`);

    if (!userHistory || userHistory.length === 0) {
        return message.reply("Você não tem transações registradas.");
    }

    // Cria o embed de histórico
    const historyEmbed = new Discord.MessageEmbed()
        .setColor('#8E44AD')
        .setTitle(`${user.tag} - Transações`)
        .setDescription('Aqui está o seu histórico de transações:')
        .setFooter('Banco do Discord')
        .setTimestamp();

    // Adiciona cada transação ao embed
    userHistory.slice(0, 5).forEach((transaction, index) => {
        historyEmbed.addField(
            `Transação ${index + 1}`,
            `**Tipo:** ${transaction.type}\n**Valor:** R$ ${transaction.amount.toLocaleString()}\n**Data:** ${transaction.date}`
        );
    });

    // Envia o embed de histórico
    message.channel.send(historyEmbed);
};

exports.help = {
    name: "historico",
    description: "Exibe o histórico de transações de economia do usuário.",
    usage: "!historico",
    category: "Economia"
};
