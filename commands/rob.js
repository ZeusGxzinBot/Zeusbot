const Discord = require("discord.js")
const db = require("quick.db");
const ms = require("parse-ms");

module.exports.run = async (client, message, args) => {
  let cooldown = 8.7e64
  let last = await db.get(`robc_${message.guild.id}-${message.author.id}`);

    if (last !== null && cooldown - (Date.now() - last) > 0) {
      let timeobj = ms(cooldown - (Date.now() - last));

const robs = new Discord.MessageEmbed()
      robs.setColor("#ff0000");
      robs.setDescription(
        `**${message.member} você ja roubou ou tentou rounar, por favor espere ${timeobj.hours} horas, ${timeobj.minutes} minutos e ${timeobj.seconds} segundos! para executar o comando de novo**`
      );

      message.channel.send(robs);
    } else {
    
  let user = message.mentions.users.first()
  if(!user) return message.channel.send({embed: {
    description: "**Mencione um user**",
    color: "#ff0000"
  }})
  if(user.id === message.author.id) return message.channel.send({embed: {
    description: "**Você não pode roubar de você mesmo**",
    color: "#ff0000"
  }})
  
  let amount = Math.floor(Math.random() * 900 + 1)
  
  let bal = await db.get(`bal_${message.guild.id}-${user.id}`)
  if(bal < 600) return message.channel.send({embed: {
    description: "**Você não consegue roubar usuarios com menos de 600 coins**",
    color: "#ff0000"
  }})
  
  const robo = new Discord.MessageEmbed()
  .setDescription(`**${message.author.username} Você acabou de roubar ${amount} de ${user}**`)
  .setColor("GREEN")
  message.channel.send(robo)
  
  await db.set(`robc_${message.guild.id}-${message.author.id}`, Date.now())
  await db.subtract(`bal_${message.guild.id}-${user.id}`, amount)
  await db.add(`bal_${message.guild.id}-${message.author.id}`, amount)
  
  
    }
}

