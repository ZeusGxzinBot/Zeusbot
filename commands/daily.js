const { EmbedBuilder } = require('discord.js'); // Atualizado para v14
const db = require('quick.db');

module.exports = {
  name: 'daily',
  description: 'Recompensa diária do usuário.',
  async execute(message, args) {
    // Definindo o tempo da próxima recompensa diária (meia-noite, horário de Brasília)
    const now = new Date();
    const nextRewardTime = new Date(now);
    nextRewardTime.setHours(24, 0, 0, 0); // Definindo para a próxima meia-noite

    // Ajuste para o horário de Brasília
    const timeOffset = -3; // Horário de Brasília (UTC-3)
    nextRewardTime.setHours(nextRewardTime.getHours() + timeOffset);

    // Verificando se o usuário já coletou a recompensa diária
    const userId = message.author.id;
    const lastClaimed = db.get(`daila_${userId}`);

    if (lastClaimed) {
      const lastClaimedDate = new Date(lastClaimed);
      if (lastClaimedDate.getDate() === now.getDate()) {
        // O usuário já coletou a recompensa hoje
        return message.reply('Você já coletou sua recompensa diária hoje! Tente novamente amanhã.');
      }
    }

    // Gerar um valor aleatório entre 400.000 e 800.000 Nuvens
    const rewardAmount = Math.floor(Math.random() * (800000 - 400000 + 1)) + 400000;

    // Atualizar o saldo do usuário
    let balance = db.get(`bal_${userId}`) || 0;
    db.set(`bal_${userId}`, balance + rewardAmount);

    // Atualizar a data de quando o usuário coletou a recompensa
    db.set(`daila_${userId}`, now);

    // Criar o embed para a resposta
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Recompensa Diária')
      .setDescription(`<@${userId}>, parabéns, você coletou sua recompensa diária de hoje!`)
      .addFields(
        { name: 'Você ganhou', value: `**☁️ ${rewardAmount.toLocaleString()} Nuvens**`, inline: true },
        { name: 'Próxima recompensa', value: `${nextRewardTime.toLocaleDateString('pt-BR')} às ${nextRewardTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, inline: true }
      )
      .setFooter({ text: 'Zeus Bot | Recompensas diárias' });

    // Enviar o embed
    message.channel.send({ embeds: [embed] });
  },
};
