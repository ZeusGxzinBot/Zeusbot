const { MessageEmbed } = require('discord.js');
const db = require('quick.db');

module.exports.run = async (client, message, args) => {
    // Verificar valor da aposta
    const raceValue = parseInt(args[0]);
    if (!raceValue || raceValue <= 0) {
        return message.reply("Por favor, insira um valor válido para a aposta.");
    }

    // Verificar número máximo de participantes
    const maxParticipants = parseInt(args[1]) || 2;
    if (maxParticipants < 2) {
        return message.reply("O número mínimo de participantes é 2.");
    }

    const emojisDefault = ["🏎️", "🚴", "🚀", "🐎", "🚤", "🏇", "🛶"];
    const participants = [];

    // Adicionar o criador automaticamente
    const ownerEmoji = db.get(`emoji_${message.author.id}`) || emojisDefault[Math.floor(Math.random() * emojisDefault.length)];
    participants.push({
        user: message.author,
        emoji: ownerEmoji
    });

    // Criar embed inicial
    const embed = new MessageEmbed()
        .setTitle("🏁 Nova Corrida de Apostas! 🏁")
        .setDescription(`**${message.author}** iniciou uma corrida no valor de **${raceValue.toLocaleString()} Nuvens**! A mesma será finalizada em **60 segundos**, quando atingir ${maxParticipants} participantes, ou quando o criador clicar em "✅".`)
        .addField("Prêmio", `☁️ **${raceValue.toLocaleString()} Nuvens**`, true)
        .addField("Ganhador", "Ninguém por enquanto", true)
        .addField("Participantes", `${ownerEmoji} ${message.author}`, true)
        .setColor("#FFD700")
        .setFooter("Clique em ✅ para finalizar ou espere o tempo acabar.");

    const raceMessage = await message.channel.send(embed);
    await raceMessage.react("✅");

    // Coletor de reações e mensagens
    const reactionFilter = (reaction, user) => reaction.emoji.name === "✅" && user.id === message.author.id;
    const reactionCollector = raceMessage.createReactionCollector(reactionFilter, { time: 60000 });

    const messageCollector = message.channel.createMessageCollector(
        (msg) => msg.content.toLowerCase() === "entrar" && !participants.some(p => p.user.id === msg.author.id),
        { time: 60000 }
    );

    // Adicionar participantes
    messageCollector.on("collect", (msg) => {
        if (participants.length >= maxParticipants) return;

        const userEmoji = db.get(`emoji_${msg.author.id}`) || emojisDefault[Math.floor(Math.random() * emojisDefault.length)];
        participants.push({ user: msg.author, emoji: userEmoji });

        embed.fields[2].value += `\n${userEmoji} ${msg.author}`;
        raceMessage.edit(embed);

        if (participants.length >= maxParticipants) {
            messageCollector.stop();
            reactionCollector.stop("maxParticipants");
        }
    });

    // Finalizar manualmente
    reactionCollector.on("collect", () => {
        reactionCollector.stop("manualEnd");
        messageCollector.stop();
    });

    // Encerrar corrida
    messageCollector.on("end", (_, reason) => {
        if (reason === "time" || reason === "manualEnd" || reason === "maxParticipants") {
            if (participants.length < 2) {
                embed.setDescription("A corrida foi cancelada por falta de participantes.");
                embed.setColor("#FF0000");
                return raceMessage.edit(embed);
            }

            // Escolher ganhador aleatoriamente
            const winner = participants[Math.floor(Math.random() * participants.length)];
            embed.fields[1].value = `${winner.emoji} ${winner.user}`;
            embed.setColor("#00FF00");
            embed.setDescription("A corrida foi finalizada!");

            raceMessage.edit(embed);
        }
    });
};

module.exports.help = {
    name: "race",
    description: "Inicia uma corrida de apostas com suporte a VIP.",
    usage: "race <valor> [número de participantes]",
    category: "Economia"
};