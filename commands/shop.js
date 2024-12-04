const Discord = require("discord.js");
 
module.exports.run = async (client, message, args) => {
  
  const embed = new Discord.MessageEmbed()
  .setTitle("Work Shop")
  .addField("Caixinha", "`500 Coins`")
  .setColor("BLACK")
  message.channel.send(embed)
  
}