const Discord = require('discord.js'); // aqui está puxando a livraria discord.js

const db = require("quick.db"); // aqui está puxando a livraria quick.db

const ms = require("parse-ms"); // aqui está puxando a livraria parse-ms
 
exports.run = async (bot, message, args, client, arg_teste, chat) => { // aqui está puxando as definições do comando

  let cooldown = 0.4e64

  let col = await db.get(`cd_${message.guild.id}-${message.author.id}`);

    if (col !== null && cooldown - (Date.now() - col) > 0) {
      let timeobj = ms(cooldown - (Date.now() - col));

  const cool = new Discord.MessageEmbed()
      cool.setColor("#ff0000");
      cool.setDescription(
        `**Você ja coletou o daily ${message.author.username}, por favor espere ${timeobj.hours} horas, ${timeobj.minutes} minutos e ${timeobj.seconds} segundos!**`
      );

      message.channel.send(cool);
    } else {


  let autor = message.author; // aqui está setando a let autor, para poder ser puxado em outras partes do comando e facilitar o processo

    let autor_money = await db.fetch(`money_${message.guild.id}_${autor.id}`) // aqui está puxando o seu dinheiro, usado para o próximo if

    if(autor_money == null) autor_money = 0; // como dito no let anterior, puxou o dinheiro, aqui está determinando que "null" é = a 0, ou seja, se você não tiver dinheiro, terá 0 

    let argumentos = args.join(" "); // aqui está puxando o argumento lançado, que seria a quantidade roletada

        const noArgs = new Discord.MessageEmbed() // aqui está criando uma embed para mandar caso não mande nenhum dinheiro na roleta
        .setTitle('Falta de Argumento')
        .setColor('#dfcaff')
        .setDescription('Tente colocar a quantia de dinheiro para roletar!')
        .setTimestamp()
    if(!args[0]) return message.channel.send(noArgs); // aqui está mandando um if para enviar a embed anterior ao canal caso não tenha nenhum argumento (número)

            let sorte = Math.floor(Math.random() * 2) + 1; // está definindo a sorte do comando, usado para randomizar tudo

        if(sorte == 1) { // aqui está definindo se vai ser executado, como um "e se der um o resultado"

            let amount = (args[0]) * 2; // aqui está definindo que pegará o argumento número 1 e multiplicará por dois, exemplo: a!roleta 100, virará 200, transformando na amount

            let moneyEmbed = new Discord.MessageEmbed() // aqui está criando a embed

            .setTitle("💖 Você conseguiu e venceu!")
            .setColor("#dfcaff")
            .setDescription(`Você ganhou um total de **R$${amount}**!`);
            message.channel.send(`${autor}`, moneyEmbed); // aqui está definindo para mandar a embed no canal executado, te marcando

            db.add(`money_${message.guild.id}_${autor.id}`, amount); // aqui irá setar o amount, lembrando, só é válido caso a sorte caia 1 

            db.set(`roleta_${message.guild.id}_${autor.id}`, Date.now());
        }else{ // aqui está falando que vai ser executado caso não consiga 1

            let amount = (args[0]); // aqui está falando que vai puxar o argumento e transformar na amount, sem multiplicar
            let moneyEmbed = new Discord.MessageEmbed() // aqui está criando a embed

            .setTitle("🖤 Você perdeu!")
            .setColor("#dfcaff")
            .setDescription(`Você perdeu um total de **R$${amount}**!`);
            message.channel.send(`${autor}`, moneyEmbed);
            db.subtract(`money_${message.guild.id}_${autor.id}`,  amount); // aqui está setado para tirar o dinheiro, lembrando que só será caso NÃO caia 1

            db.set(`roleta_${message.guild.id}_${autor.id}`, Date.now());
            db.set(`cd_${message.guild.id}-${message.author.id}`, Date.now());
        };
    }
}