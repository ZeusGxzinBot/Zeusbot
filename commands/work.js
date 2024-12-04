const db = require("quick.db");
const Discord = require("discord.js");
const ms = require("parse-ms")

module.exports.run = async (client, message, args) => {
  
  
  let cooldown = 8.10e64
  let cd = db.get(`cooldown_${message.guild.id}-${message.author.id}`)
  let amount = Math.floor(Math.random() * 600 + 1)
   if (cd !== null && cooldown - (Date.now() - cd) > 0) {
      let timeobj = ms(cooldown - (Date.now() - cd));

  const cool = new Discord.MessageEmbed()
   
      cool.setDescription(
        `**Você ja trabalhou ${message.member}, por favor espere ${timeobj.hours} horas, ${timeobj.minutes} minutos e ${timeobj.seconds} segundos!**`
      );
      cool.setColor(`#ff0000`);

      message.channel.send(cool);
  
  } else {
  
  let works = [
    "Padeiro",
    "Arquiteto",
    "Pedreiro",
    "Policial",
    "Streamer",
    "Programador",
    "YouTuber",
    "Juiz",
    "Advogado"
];

 let work = works[Math.floor(Math.random() * 1)]
 
 const job = new Discord.MessageEmbed()
 .setDescription(`**🔬 \`${message.author.username}\` Você trabalhou como \`${work}\` e ganhou \`${amount}\` Coins**`)
 .setColor("GREEN")
  message.channel.send(job)
  
  await db.add(`bal_${message.guild.id}-${message.author.id}`, amount)
  await db.set(`cooldown_${message.guild.id}-${message.author.id}`, Date.now())
}
}
