const Discord = require("discord.js")
const db = require("quick.db")

module.exports.run = async (client, message, args) => {

let member = message.mentions.users.first() || message.author;

let peqn = await db.get(`peqn_${message.guild.id}-${member.id}`) || "Não tem o Item"

const embed = new Discord.MessageEmbed()
.setAuthor(`Inventario de ${member.username}`, message.guild.iconURL())
.addField("Pacote Peqn", `${peqn}`)
.setThumbnail(member.displayAvatarURL())
.setColor("PURPLE")
.setFooter(`Autor do Comando`, message.author.displayAvatarURL())
message.channel.send(embed)

}