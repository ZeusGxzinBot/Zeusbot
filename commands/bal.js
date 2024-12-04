const db = require('quick.db');

module.exports = {
  name: 'bal',
  description: 'Exibe o saldo e a posição no ranking do usuário.',
  async execute(message, args) {
    // Verificar se o usuário mencionou outro usuário
    const target = message.mentions.users.first() || message.author; // Se não mencionar, pega o autor da mensagem
    const emoji = '☁️' // Emoji personalizado
    const currency = 'Nuvens'; // Nome da moeda

    // Obtém o saldo do usuário
    let balance = db.get(`bal_${target.id}`) || 0; // Se não tiver saldo, define como 0

    // Obtém todos os saldos para calcular a posição no ranking
    const allBalances = db.all()
      .filter(data => data.ID.startsWith('bal_'))
      .map(data => ({ userID: data.ID.split('_')[1], balance: data.data }))
      .sort((a, b) => b.balance - a.balance); // Ordena de maior para menor

    // Calcula a posição do usuário
    const rank = allBalances.findIndex(user => user.userID === target.id) + 1;

    // Formatação do saldo
    const formattedBalance = balance.toLocaleString('en-US');

    // Envia a resposta no formato solicitado
    message.channel.send(
      `<@${message.author.id}> <@${target.id}>, você possui **${emoji} ${formattedBalance} ${currency}** e ocupa a **#${rank || 'N/A'} posição** no ranking dos mais ricos do Zeus!`
    );
  },
};
