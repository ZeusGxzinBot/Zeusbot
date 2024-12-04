const Discord = require("discord.js");
const db = require("quick.db");

module.exports.run = async (client, message, args) => {
  const user1 = message.author;
  const user2 = message.mentions.users.first();
  if (!user2 || user1.id === user2.id) {
    return message.reply("Você deve mencionar outro usuário válido para realizar a aposta.");
  }

  const betArg = args[1];
  if (!betArg) return message.reply("Informe um valor válido para a aposta.");

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

  // Verifica os saldos
  const user1Balance = db.get(`bal_${user1.id}`) || 0;
  const user2Balance = db.get(`bal_${user2.id}`) || 0;
  const amount = parseAmount(betArg, user1Balance);
  if (!amount || amount <= 0) return message.reply("O valor informado não é válido.");
  if (amount > user1Balance || amount > user2Balance) {
    return message.reply("Ambos os participantes precisam ter saldo suficiente para realizar a aposta.");
  }

  // Emojis
  const vipEmoji1 = db.get(`aemoji_${user1.id}`); // Emoji personalizado para VIP
  const vipEmoji2 = db.get(`aemoji_${user2.id}`);
  const emoji1 = vipEmoji1 || "🤑";
  const emoji2 = vipEmoji2 || "🎲";

  // Configurações de tempo limite
  const timeout = 10 * 60 * 1000; // 10 minutos
  const expirationTimestamp = Math.floor((Date.now() + timeout) / 1000);

  // Mensagem de aposta
  const betMessage = await message.channel.send(
    `🤑 **|** <@${user1.id}>, <@${user2.id}> quer fazer uma aposta com você! Cada um irá pagar **${amount.toLocaleString()} Nuvens** (sem precisar pagar taxa).\n` +
      `Se ${emoji1} vencer, <@${user1.id}> ganha **${amount.toLocaleString()}**.\n` +
      `Se ${emoji2} vencer, <@${user2.id}> ganha **${amount.toLocaleString()}**.\n` +
      `${
        vipEmoji1 || vipEmoji2
          ? "✨ *(Como um dos participantes possui VIP, essa aposta não possui taxa e será por conta da casa!)*\n"
          : ""
      }` +
      `🤝 **|** Para confirmar a aposta, <@${user1.id}> e <@${user2.id}> devem clicar em ✅!\n` +
      `⏰ **Essa aposta expira** <t:${expirationTimestamp}:R>.`
  );

  await betMessage.react("✅");

  // Reações e filtro
  const filter = (reaction, user) =>
    reaction.emoji.name === "✅" && [user1.id, user2.id].includes(user.id);
  const reactions = await betMessage
    .awaitReactions(filter, { max: 2, time: timeout, errors: ["time"] })
    .catch(() => null);

  // Sorteio do vencedor
  const winner = Math.random() < 0.5 ? user1 : user2;
  const loser = winner.id === user1.id ? user2 : user1;

  // Transações
  db.subtract(`bal_${user1.id}`, amount);
  db.subtract(`bal_${user2.id}`, amount);
  db.add(`bal_${winner.id}`, amount * 2);

  betMessage.edit(
    `🎉 **|** A aposta foi concluída! ${winner} venceu a aposta de **${amount.toLocaleString()} Nuvens**.\n` +
      `${loser} perdeu seu montante.`
  );
};

module.exports.help = {
  name: "bet",
};
