const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('quick.db');

// Criação do cliente do Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Prefixo para os comandos
const prefix = "A";

// Carregar os comandos
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const command = require(path.join(__dirname, 'commands', file));

    if (!command.name || typeof command.execute !== 'function') {
      console.error(`Comando inválido em: ${file}`);
      continue;
    }

    client.commands.set(command.name, command);
  } catch (error) {
    console.error(`Erro ao carregar o comando ${file}:`, error);
  }
}

// Evento quando o bot estiver pronto
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Evento quando uma mensagem for recebida
client.on('messageCreate', async (message) => {
  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Verificar se o comando existe
  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('Houve um erro ao tentar executar esse comando!');
  }
});

client.login(process.env.token);
