const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args) => {
    const user = message.author;
    const command = args[0];
    let amount = args[1];

    if (!command) {
        return message.reply('Você precisa especificar um comando. Use `!banco depositar <quantia>` ou `!banco sacar <quantia>`.');
    }

    // Função para formatar números
    const formatAmount = (amount) => {
        if (amount.endsWith('k')) return parseFloat(amount.slice(0, -1)) * 1000;
        if (amount.endsWith('m')) return parseFloat(amount.slice(0, -1)) * 1000000;
        if (amount.endsWith('b')) return parseFloat(amount.slice(0, -1)) * 1000000000;
        if (amount.endsWith('t')) return parseFloat(amount.slice(0, -1)) * 1000000000000;
        if (amount.endsWith('q')) return parseFloat(amount.slice(0, -1)) * 1000000000000000;
        return parseFloat(amount);
    }

    // Checar se o valor é válido
    if (!amount || isNaN(formatAmount(amount)) || formatAmount(amount) <= 0) {
        return message.reply('Por favor, forneça uma quantia válida para depósito ou saque.');
    }

    // Função de depositar
    if (command === 'depositar') {
        let balance = db.get(`bal_${user.id}`) || 0;
        let depositAmount = formatAmount(amount);

        db.set(`bal_${user.id}`, balance + depositAmount);

        const depositEmbed = new Discord.MessageEmbed()
            .setColor('#2ECC71')
            .setTitle('💰 Depósito realizado com sucesso!')
            .setDescription(`${user.tag}, você depositou ** ${depositAmount.toLocaleString()}** no seu banco.`)
            .addField('Novo Saldo:', ` ${(balance + depositAmount).toLocaleString()}`)
            .setFooter('Banco do Discord')
            .setTimestamp();

        return message.channel.send(depositEmbed);
    }

    // Função de sacar
    if (command === 'sacar') {
        let balance = db.get(`bal_${user.id}`) || 0;
        let withdrawAmount = formatAmount(amount);

        if (withdrawAmount > balance) {
            return message.reply('Você não tem saldo suficiente para realizar este saque.');
        }

        db.set(`bal_${user.id}`, balance - withdrawAmount);

        const withdrawEmbed = new Discord.MessageEmbed()
            .setColor('#E74C3C')
            .setTitle('💸 Saque realizado com sucesso!')
            .setDescription(`${user.tag}, você sacou ** ${withdrawAmount.toLocaleString()}** do seu banco.`)
            .addField('Novo Saldo:', ` ${(balance - withdrawAmount).toLocaleString()}`)
            .setFooter('Banco do Discord')
            .setTimestamp();

        return message.channel.send(withdrawEmbed);
    }

    // Ver saldo
    if (command === 'saldo') {
        let balance = db.get(`bal_${user.id}`) || 0;

        const balanceEmbed = new Discord.MessageEmbed()
            .setColor('#3498DB')
            .setTitle('💳 Seu Saldo no Banco')
            .setDescription(`${user.tag}, seu saldo atual é ** ${balance.toLocaleString()}** Nuvens.`)
            .setFooter('Banco do Discord')
            .setTimestamp();

        return message.channel.send(balanceEmbed);
    }

    return message.reply('Comando inválido. Use `Abanco depositar <quantia>`, `Abanco sacar <quantia>`, ou `Abanco saldo`.');
};

exports.help = {
    name: "banco",
    description: "Comando para depositar, sacar e verificar saldo no banco.",
    usage: "Abanco <depositar/sacar/saldo> <quantia>",
    category: "Economia"
};
