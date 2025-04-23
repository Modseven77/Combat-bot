const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('estado')
    .setDescription('Muestra el estado actual de la batalla'),

  async execute(interaction) {
    let estadoBatalla;
    try {
      estadoBatalla = require('./data/estado_batalla.json');
    } catch (err) {
      return interaction.reply('⚠️ Error al leer el estado de la batalla.');
    }

    // Mostrar el estado actual de la batalla
    let mensaje = '🔎 Estado de la batalla:\n';
    mensaje += `Batalla en curso: ${estadoBatalla.enCurso ? 'Sí' : 'No'}\n`;
    mensaje += `Batalla pausada: ${estadoBatalla.pausada ? 'Sí' : 'No'}`;

    return interaction.reply(mensaje);
  },
};

  