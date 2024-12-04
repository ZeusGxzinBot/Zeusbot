const Discord = require("discord.js");
const db = require("quick.db");

module.exports.run = async (client, message, args) => {

if(args[0] === "peqn") {
  let peqn = "<:boost:802210537810952192> Pacote Peqn"
  await db.set(`peqn_${message.guild.id}-${message.author.id}`, peqn) 
  let bal = await db.get(`bal_${message.guild.id}-${message.author.id}`)
  if(bal <= 500) return message.channel.send("Você não consegue comprar este item")

  const embed = new Discord.MessageEmbed()
  .setDescription(`Você acabou de comprar o item de pacote peqn`)
 .setColor("GREEN")
 message.channel.send(embed)


}
}

