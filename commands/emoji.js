module.exports.run = async (client, message, args) => {
  const emoji = args[0];
  if (!emoji) return message.reply("Informe um emoji válido para configurar.");
  const vip = db.get(`vip_${message.author.id}`);
  if (!vip) return message.reply("Apenas usuários VIP podem configurar emojis personalizados.");

  db.set(`aemoji_${message.author.id}`, emoji);
  message.reply(`Seu emoji personalizado foi configurado como ${emoji}.`);
};

module.exports.help = {
  name: "aemoji",
};
