const Discord = require("discord.js");
const db = require("quick.db");

module.exports.run = async (client, message, args) => {
    // Verifica se o usuário tem permissão para gerenciar cargos
    if (!message.member.hasPermission("MANAGE_ROLES")) {
        return message.reply("Você não tem permissão para usar este comando.");
    }

    // Verifica argumentos
    const user = message.mentions.members.first();
    if (!user) {
        return message.reply("Mencione o usuário que receberá o VIP.");
    }

    const vipRole = message.guild.roles.cache.find(role => role.name === "VIP"); // Nome do cargo VIP
    if (!vipRole) {
        return message.reply("O cargo 'VIP' não foi encontrado. Crie o cargo antes de usar este comando.");
    }

    const duration = parseInt(args[1]); // Duração em minutos
    if (!duration || isNaN(duration)) {
        return message.reply("Forneça uma duração válida em minutos. Exemplo: `aaddvip @usuario 60`.");
    }

    // Adiciona o cargo VIP
    await user.roles.add(vipRole).catch(err => {
        console.error(err);
        return message.reply("Houve um erro ao adicionar o cargo.");
    });

    // Calcula o tempo de expiração em milissegundos
    const expiration = Date.now() + duration * 60 * 1000;

    // Salva no banco de dados
    db.set(`vip_${user.id}`, expiration);

    message.channel.send(`O cargo VIP foi dado a ${user} por ${duration} minutos.`);

    // Remove o cargo automaticamente após o tempo
    setTimeout(async () => {
        if (user.roles.cache.has(vipRole.id)) {
            await user.roles.remove(vipRole).catch(err => console.error(err));
            db.delete(`vip_${user.id}`);
            message.channel.send(`${user}, seu cargo VIP expirou.`);
        }
    }, duration * 60 * 1000);
};

module.exports.help = {
    name: "addvip",
    description: "Adiciona o cargo VIP a um usuário por um período definido.",
};
