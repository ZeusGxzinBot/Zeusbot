const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require('discord.js');
const { unabbreviate } = require('util-stunks');

module.exports = {
    name: 'race',
    aliases: ['race'],
    description: 'Abra uma corrida de Ametistas apostada com limite de até 20 usuários.',
    cooldown: 2200,
    usage: '<valor> [limite]',

    run: async (client, message, args) => {
        const AuthorData = await client.mysql.findUser(message.author.id, true);
        let Value = Math.floor(unabbreviate(args[0] || 0));

        // Verificando valores "half" ou "all"
        if (args[0].toLowerCase() === 'half') {
            Value = Math.floor(AuthorData.money / 2);
            if (Value > 100_000_000_000_000_000_000) Value = 100_000_000_000_000_000_000;
        }

        if (args[0].toLowerCase() === 'all') {
            Value = Math.floor(AuthorData.money);
            if (Value > 100_000_000_000_000_000_000) Value = 100_000_000_000_000_000;
        }

        let Limit = parseInt(args[1]), Users = [await getCar(client, message.author.id)];

        if (!Limit || isNaN(Limit) || Limit > 20) Limit = 20;
        if (Limit < 2) Limit = 2;

        // Verificando a validade do valor de entrada
        if ((isNaN(Value) || Value < 0 || Value > 100_000_000_000_000_000)) {
            return client.sendReply(message, {
                content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **0 Flocos** para iniciar uma corrida.`
            });
        }

        if (AuthorData.money < Value) {
            return client.sendReply(message, {
                content: `${client.config.emojis.error} ${message.author}, você não tem tantas Flocos assim para iniciar uma corrida.`
            });
        }

        // Embed inicial
        const Embed = new EmbedBuilder()
            .setColor('#FF00DB')
            .setFooter({
                text: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()
            .setTitle('# Corrida Iniciada')
            .setDescription(`Preço para participar: **${Value.toLocaleString()} Flocos** 
                            Para entrar clique em: 🏁!
                            O ganhador será revelado após ${message.author}, clicar em ✅, após se passar 60 segundos ou após atingir ${Limit} participantes.`)
            .addFields([
                {
                    name: 'Prêmio:',
                    value: `${client.config.emojis.money} **${Value.toLocaleString()} Flocos**`,
                    inline: true
                },
                {
                    name: `Participantes (1/${Limit})`,
                    value: Users.map(u => `${u.car} <@${u.id}>`).join('\n'),
                }
            ]);

        // Ação de botões para entrar e finalizar
        const Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('enter')
                    .setLabel('Entrar')
                    .setEmoji('🏁')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('Finalizar')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
            );

        const Message = await client.sendReply(message, {
            content: message.author.toString(),
            embeds: [Embed],
            components: [Row]
        });

        const Collector = new InteractionCollector(client, { message: Message, time: 1 * 60 * 1000, filter: f => !f.user.bot });

        Collector.on('collect', async (button) => {
            // Fechar a corrida
            if (button.customId === 'stop' && button.user.id === message.author.id) {
                await button.deferUpdate();
                Message.components[0].components[0].data.disabled = true;
                Message.components[0].components[1].data.disabled = true;

                await Message.edit({ components: Message.components });
                return Collector.stop();
            }

            // Entrar na corrida
            if (button.customId === 'enter' && button.user.id !== message.author.id) {
                try {
                    if (Users.map(x => x.id).includes(button.user.id)) return;

                    let UserEnterData = await client.mysql.findUser(button.user.id, true);
                    if (UserEnterData?.ban_is) return;

                    const emoji = await getCar(client, button.user.id);
                    if (UserEnterData?.money >= Value) {
                        Users.push({ id: button.user.id, car: emoji });
                    } else {
                        return;
                    }

                    let EmbedFields = Message.embeds[0].data;

                    EmbedFields.fields[0] = { name: `Prêmio`, value: `${client.config.emojis.money} **${(Value * Users.length).toLocaleString()} Flocos**`, inline: true };
                    EmbedFields.fields[1] = { name: `Participantes (${Users.length}/${Limit})`, value: Users.map(u => `${u.car} <@${u.id}>`).join('\n'), inline: false };

                    await Message.edit({ embeds: [EmbedFields] });

                    if (Users.length >= Limit) return Collector.stop();
                } catch (e) {
                    console.log(e);
                }
            }
        });

        const UsersTrueArray = [];

        Collector.on('end', async () => {
            // Verifica se os usuários ainda têm dinheiro suficiente para ganhar
            for (let i of Users) {
                let CheckData = await client.mysql.findUser(i.id, true);
                if (CheckData?.money >= Value) UsersTrueArray.push(i);
            }

            if (UsersTrueArray.length < 2) {
                return message.reply(`${client.config.emojis.error} ${message.author}, não haviam participantes suficientes. A corrida foi cancelada.`);
            } else {
                // Sorteia o vencedor
                let Winner = UsersTrueArray[Math.floor(Math.random() * UsersTrueArray.length)],
                    TrueValue = (Value * UsersTrueArray.length) - Value;
                let TaxedValue = await client.mysql.findUserPremium(Winner.id) ? TrueValue : Math.floor(TrueValue * 0.95);

                for (let i of UsersTrueArray) {
                    await client.mysql.updateUserMoney(i.id, i.id === Winner.id ? TaxedValue : -Value);

                    await client.mysql.transactions.create({
                        source: 5,
                        received_by: i.id,
                        given_at: Date.now(),
                        amount: (i.id === Winner.id ? TaxedValue : -Value)
                    });
                }

                // Atualiza a mensagem com o vencedor
                let EmbedFields = Message.embeds[0].data;

                EmbedFields.fields[0] = { name: `Prêmio`, value: `${client.config.emojis.money} **${(TrueValue + Value).toLocaleString()} Flocos**`, inline: true };
                EmbedFields.fields[1] = { name: `Ganhador`, value: `<@${Winner.id}> e seu **Emoji:** ${Winner.car}`, inline: true };
                EmbedFields.fields[2] = { name: `Participantes (${Users.length}/${Limit})`, value: Users.map(u => `${u.car} <@${u.id}>`).join('\n'), inline: false };

                Message.components[0].components[0].data.disabled = true;
                Message.components[0].components[1].data.disabled = true;

                await Message.edit({ embeds: [EmbedFields], components: Message.components });

                Message.reply(`<:estrela:1229113192278524005> | O ${Winner.car} saiu vitorioso na corrida! **Ganhou ${TaxedValue.toLocaleString()} Flocos**.`);
            }
        });
    }
};

// Função que retorna o emoji do usuário (carro)
async function getCar(client, id) {
    const user = await client.mysql.findUser(id, true);

    const cars = ['🐵', '🦁', '🐯', '🐱', '🐶', '🐺', '🐻', '🐨', '🐼', '🐹', '🐭', '🐰', '🦊', '🦝', '🐮', '🐷', '🐗', '🦓', '🦄', '🐴', '🐲', '🦎', '🐉', '🦖', '🦕', '🐢', '🐊', '🐍', '🐸', '🐇', '🐁', '🐀', '🐈', '🐩', '🐕', '🦮', '🐕‍🦺', '🐖', '🐎', '🐄', '🐂', '🐃', '🐏', '🐑', '🐐', '🦌', '🦙', '🦥', '🦘', '🐘', '🦏', '🦛', '🦒', '🐆', '🐅', '🦍', '🦧', '🐪', '🐫', '🐿️', '🦨', '🦡', '🦔', '🦦', '🦇', '🐦', '🐓', '🐔'];
    let car = await user.emoji || cars[Math.floor(Math.random() * cars.length)];
    if (user.premium < Date.now()) car = cars[Math.floor(Math.random() * cars.length)];

    return { id, car };
}
