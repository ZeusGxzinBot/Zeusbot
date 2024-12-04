const Discord = require("discord.js")
const config = require("../config.json")

module.exports.run = async (client, message, args) => {

const embed = new Discord.MessageEmbed()
.setTitle("Help Coins")
.addField("Add Money", `${config.prefix}addmoney [@user] [quantia]`)
.addField("Remove Money", `${config.prefix}removemoney [@user] [quantia]`)
.addField("Roubar", `${config.prefix}rob (@user)`)
.addField("Trabalhar", `${config.prefix}work`)
.addField("Daily", `${config.prefix}daily`)
.addField("Inventario", `${config.prefix}inv (@user)`)
.addField("Mercadin", `${config.prefix}shop`)
.addField("Use Item", `${config.prefix}buy <item>`)

.setColor("GREEN")
message.channel.send(embed)
}