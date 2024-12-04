const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args) => {
    // Verifica se o usuário tem permissão para usar o comando
     const mentionedUser = message.mentions.users.first();
    
    message.reply
    
    if (!message.member.hasPermission('ADMINISTRATOR')) {
        return message.reply('Você não tem permissão para usar este comando!');
    }

    // Verifica se o comando foi utilizado corretamente
    const target = message.mentions.users.first();
    const amount = args[1];

    if (!target || !amount || isNaN(amount) || amount <= 0) {
        return message.reply('Por favor, mencione um usuário válido e forneça um valor positivo para remover.');
    }

    // Verifica se o valor está disponível no saldo do usuário
    const targetBalance = db.get(`bal_${target.id}`) || 0;
    if (targetBalance < amount) {
        return message.reply(`${mentionedUser.tag} não tem moedas suficientes para remover.`);
    }

    // Remove as moedas do saldo do usuário
    db.subtract(`bal_${target.id}`, amount);

    // Envia uma confirmação
    const successEmbed = new Discord.MessageEmbed()
        .setColor('#e74c3c')
        .setTitle('💸 Moedas Removidas!')
        .setDescription (`${amount} moedas foram removidas do saldo de ${target.tag}.`)
        .addField('Novo Saldo', `${mentionedUser} agora tem ${targetBalance - amount} moedas.`)
        .setFooter('Comando de remoção de moedas.')
        .setTimestamp();

    message.channel.send(successEmbed);
};

exports.help = {
    name: "removemoedas",
    description: "Remove uma quantidade de moedas do saldo de um usuário.",
    usage: "Aremovemoedas @user <quantidade>",
    category: "Economia"
};
