const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args) => {
    const allUsers = db.all().filter(data => data.ID.startsWith('balance_'));

    if (!allUsers || allUsers.length === 0) {
        return message.reply('Ainda não há usuários com saldo registrado.');
    }

    // Ordenar usuários por saldo
    const sortedUsers = allUsers
        .map(data => ({
            id: data.ID.split('_')[1], // Pega o ID do usuário
            balance: data.data
        }))
        .sort((a, b) => b.balance - a.balance);

    // Limitar a quantidade de jogadores no ranking a 10
    const top10 = sortedUsers.slice(0, 10);

    // Montar a descrição do ranking
    let rankDescription = '';
    for (let i = 0; i < top10.length; i++) {
        const user = await client.users.fetch(top10[i].id).catch(() => null);
        if (user) {
            rankDescription += `**${i + 1}.** ${user.tag} - R$ ${top10[i].balance.toLocaleString()}\n`;
        }
    }

    // Criar embed
    const rankEmbed = new Discord.MessageEmbed()
        .setColor('#FFD700')
        .setTitle('🏆 **Top Moedas**')
        .setDescription(rankDescription || 'Não há dados suficientes para exibir o ranking.')
        .setImage('')  // Imagem para o embed
        .setFooter('Ranking de todos os usuários')
        .setTimestamp();

    message.channel.send(rankEmbed);
};

exports.help = {
    name: "topmoedas",
    description: "Exibe o ranking dos usuários com mais moedas.",
    usage: "topmoedas",
    category: "Economia"
};
