const Discord = require("discord.js");
const db = require("quick.db");

module.exports.run = async (client, message, args) => {
  const sender = message.author;
  const recipient = message.mentions.users.first();
  if (!recipient) return message.reply("Mencione um usuário válido para enviar o pagamento.");

  // Verifica o valor
  const amountArg = args[1];
  if (!amountArg) return message.reply("Informe um valor válido para o pagamento.");

  const parseAmount = (value, balance) => {
    if (value.toLowerCase() === "all") return balance;
    if (value.toLowerCase() === "half") return Math.floor(balance / 2);

    const abbreviations = {
      k: 1e3,
      m: 1e6,
      b: 1e9,
      t: 1e12,
      q: 1e15,
    };

    const match = value.toLowerCase().match(/^(\d+)([kmqbt]?)$/);
    if (!match) return null;

    const number = parseInt(match[1]);
    const multiplier = abbreviations[match[2]] || 1;
    return number * multiplier;
  };

  const senderBalance = db.get(`balance_${sender.id}`) || 0;
  const amount = parseAmount(amountArg, senderBalance);
  if (!amount || amount <= 0) return message.reply("O valor informado não é válido.");
  if (amount > senderBalance) return message.reply("Você não tem saldo suficiente para realizar esse pagamento.");

  // Configurações de tempo limite e criação do pagamento
  const timeout = 10 * 60 * 1000; // 10 minutos
  const expirationTimestamp = Math.floor((Date.now() + timeout) / 1000); // Timestamp para `<t:>` no Discord

  // Mensagem de confirmação
  const confirmationMessage = await message.channel.send(
    `<@${recipient.id}>, <@${sender.id}> quer lhe enviar um pagamento no valor de **${amount.toLocaleString()} Nuvens**!\n` +
      `🤝 Para confirmar o pagamento, <@${recipient.id}> e <@${sender.id}> devem clicar em "✅ Aceitar".\n\n` +
      `🚷 **Lembre-se que é proibido** trocar **Nuvens** por itens com valores monetários (Discord Nitro, dinheiro, conteúdo ilegal/NSFW, etc!).\n\n` +
      `**AVISO:** A Equipe do Zeus não se responsabiliza pelo mal uso do pay e não extornamos Nuvens em caso de conflitos.\n\n` +
      `⏰ **Esse pagamento expira** <t:${expirationTimestamp}:R>`
  );

  await confirmationMessage.react("✅");

  // Reações e filtro
  const filter = (reaction, user) => reaction.emoji.name === "✅" && [sender.id, recipient.id].includes(user.id);
  const reactions = await confirmationMessage.awaitReactions(filter, { max: 2, time: timeout, errors: ["time"] }).catch(() => null);

  if (!reactions || reactions.size < 2) {
    return confirmationMessage.edit(
      `⏰ O pagamento entre <@${sender.id}> e <@${recipient.id}> expirou.`
    );
  }

  // Conclusão do pagamento
  db.subtract(`bal_${sender.id}`, amount);
  db.add(`bal_${recipient.id}`, amount);

  confirmationMessage.edit(
    `✅ O pagamento de **${amount.toLocaleString()} Nuvens** entre <@${sender.id}> e <@${recipient.id}> foi concluído com sucesso!`
  );
};

module.exports.help = {
  name: "pay",
};
