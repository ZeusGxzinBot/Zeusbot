const Discord = require("discord.js")
const db = require("quick.db")

module.exports.run = async (client, message, args) => {

if(args[0] === "peqn") {


let item = await db.get(`peqn_${message.guild.id}-${message.author.id}`)
if(item) {

let amount = Math.floor(Math.random() * 300 + 1)

const embed = new Discord.MessageEmbed()
.setDescription(`Você usou o item Peqn e ganhou ${amount} coins`)
.setColor("GREEN")
message.channel.send(embed)

await db.delete(`peqn_${message.guild.id}-${message.author.id}`)
await db.add(`bal_${message.guild.id}-${message.author.id}`, amount)
} else {
  return message.channel.send("Você não possui este item, então não pode usa-lo")
}
}
}