const db = require('quick.db');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  name: 'addmoney',
  description: 'Adicionar dinheiro ao usuário com suporte a sufixos.',
  async execute(message, args) {
    // Verificar se o comando foi chamado corretamente
    if (args.length !== 2) {
      return message.reply('Por favor, forneça um valor e o usuário! Exemplo: `addmoney @usuário 500k`');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Você deve mencionar um usuário!');
    }

    const amountWithSuffix = args[1].toLowerCase(); // O valor com sufixo

    // Regular expression para encontrar os valores com sufixos
    const regex = /^([0-9]+)([kmbtq])$/;
    const match = amountWithSuffix.match(regex);

    if (!match) {
      return message.reply('Por favor, use um valor válido com sufixo (k, m, b, t, q). Exemplo: `500k`');
    }

    const amount = parseInt(match[1]); // O valor numérico
    const suffix = match[2]; // O sufixo (k, m, b, t, q)

    // Converter o valor com sufixo para número
    let multiplier = 1;
    switch (suffix) {
      case 'k': multiplier = 1000; break; // mil
      case 'm': multiplier = 1000000; break; // milhão
      case 'b': multiplier = 1000000000; break; // bilhão
      case 't': multiplier = 1000000000000; break; // trilhão
      case 'q': multiplier = 1000000000000000; break; // quatrilhão
      default: return message.reply('Sufixo inválido. Use k, m, b, t ou q.');
    }

    const totalAmount = amount * multiplier;

    // Atualizar o saldo do usuário
    const userId = user.id;
    let balance = db.get(`balance_${userId}`) || 0;
    db.set(`balance_${userId}`, balance + totalAmount);

    // Reagir com "✅" (ou qualquer outro emoji)
    await message.react('✅');
  },
};
