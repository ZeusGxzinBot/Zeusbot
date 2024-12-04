const Discord = require('discord.js');
const db = require('quick.db');

module.exports.run = async (client, message, args) => {
    // Verificação do saldo e entrada inicial
    const user = message.author;
    const betInput = args[0];
    const balance = db.get(`bal_${user.id}`) || 0;

    // Converte apostas como 'k', 'm', 'b', etc.
    const bet = parseBet(betInput, balance);
    if (!bet) return message.reply('Por favor, insira um valor válido para aposta.');
    if (bet > balance) return message.reply('Você não tem saldo suficiente para essa aposta.');

    // Inicialização das mãos
    let userHand = drawCards(2);
    let dealerHand = drawCards(2);

    // Calcula valores iniciais
    let userScore = calculateScore(userHand);
    let dealerScore = calculateScore(dealerHand);

    // Criação da mensagem inicial
    const blackjackEmbed = new Discord.MessageEmbed()
        .setTitle('Mesa de Blackjack')
        .addField('Suas cartas', formatHand(userHand) + ` --> **${userScore}**`)
        .addField('Cartas do oponente', formatHand([dealerHand[0]]) + ' | ?')
        .setFooter('Reaja abaixo para comprar ou parar.');

    const gameMessage = await message.channel.send(blackjackEmbed);

    // Reações
    await gameMessage.react('🃏'); // Comprar carta
    await gameMessage.react('✋'); // Parar

    // Filtro de reações
    const filter = (reaction, userReact) => {
        return ['🃏', '✋'].includes(reaction.emoji.name) && userReact.id === user.id;
    };

    const collector = gameMessage.createReactionCollector(filter, { time: 60000 });

    // Coleta de reações
    collector.on('collect', async (reaction) => {
        if (reaction.emoji.name === '🃏') {
            // Comprar carta
            userHand.push(drawCards(1)[0]);
            userScore = calculateScore(userHand);

            if (userScore > 21) {
                collector.stop('bust');
            } else {
                const updatedEmbed = new Discord.MessageEmbed()
                    .setTitle('Mesa de Blackjack')
                    .addField('Suas cartas', formatHand(userHand) + ` --> **${userScore}**`)
                    .addField('Cartas do oponente', formatHand([dealerHand[0]]) + ' | ?')
                    .setFooter('Reaja abaixo para comprar ou parar.');
                await gameMessage.edit(updatedEmbed);
            }
        } else if (reaction.emoji.name === '✋') {
            // Parar
            collector.stop('stand');
        }
    });

    collector.on('end', async (_, reason) => {
        // Revela as cartas do oponente
        dealerScore = playDealer(dealerHand);

        const finalEmbed = new Discord.MessageEmbed()
            .setTitle('Mesa de Blackjack')
            .addField('Suas cartas', formatHand(userHand) + ` --> **${userScore}**`)
            .addField('Cartas do oponente', formatHand(dealerHand) + ` --> **${dealerScore}**`);

        if (reason === 'bust' || (dealerScore <= 21 && dealerScore > userScore)) {
            db.subtract(`bal_${user.id}`, bet);
            finalEmbed.setDescription(`> O seu oponente obteve uma pontuação maior que a sua e por isso ganhou. Você perdeu **${formatCurrency(bet)}** Nuvens.`);
        } else if (userScore === dealerScore) {
            finalEmbed.setDescription('> Empate! Ninguém ganhou ou perdeu.');
        } else {
            db.add(`bal_${user.id}`, bet);
            finalEmbed.setDescription(`> Você venceu e ganhou **${formatCurrency(bet)}** Nuvens!`);
        }

        await gameMessage.edit(finalEmbed);
    });

    // Funções auxiliares
    function parseBet(input, max) {
        if (!input) return null;
        if (input.toLowerCase() === 'all') return max;
        if (input.toLowerCase() === 'half') return Math.floor(max / 2);

        const multiplier = { k: 1e3, m: 1e6, b: 1e9, t: 1e12, q: 1e15 };
        const match = input.match(/^(\d+)([kmbtq]?)$/i);
        if (!match) return null;

        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        return amount * (multiplier[unit] || 1);
    }

    function drawCards(num) {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
        const cards = [];
        for (let i = 0; i < num; i++) {
            const value = values[Math.floor(Math.random() * values.length)];
            const suit = suits[Math.floor(Math.random() * suits.length)];
            cards.push(`${value}${suit}`);
        }
        return cards;
    }

    function calculateScore(hand) {
        let score = 0;
        let aces = 0;

        for (const card of hand) {
            const value = card.slice(0, -1);
            if (['J', 'Q', 'K'].includes(value)) {
                score += 10;
            } else if (value === 'A') {
                aces += 1;
                score += 11;
            } else {
                score += parseInt(value);
            }
        }

        while (score > 21 && aces > 0) {
            score -= 10;
            aces -= 1;
        }

        return score;
    }

    function formatHand(hand) {
        return hand.join(' | ');
    }

    function playDealer(hand) {
        let score = calculateScore(hand);
        while (score < 17) {
            hand.push(drawCards(1)[0]);
            score = calculateScore(hand);
        }
        return score;
    }

    function formatCurrency(amount) {
        return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
};

module.exports.help = {
    name: 'blackjack'
};