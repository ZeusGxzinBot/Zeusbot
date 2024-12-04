const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message) => {
    const vipData = db.get(`vip_${message.author.id}`);

    if (!vipData || !vipData.isActive) {
        return message.reply("Você não é VIP no momento.");
    }

    const timeLeft = vipData.expiresAt - Date.now();
    if (timeLeft <= 0) {
        db.delete(`vip_${message.author.id}`);
        return message.reply("Seu status VIP expirou.");
    }

    const embed = new MessageEmbed()
        .setTitle("💎 Status VIP")
        .setDescription(`Você é VIP!`)
        .addField("Expira em", `${Math.ceil(timeLeft / 86400000)} dias restantes.`)
        .setColor("#FFD700");

    message.channel.send(embed);
};

module.exports.help = {
    name: "vipstatus",
    description: "Verifica seu status VIP.",
    usage: "vipstatus",
    category: "Economia"
};