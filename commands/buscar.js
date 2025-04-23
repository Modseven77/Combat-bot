// commands/buscar.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const PERSONAJES_FILE     = path.join(__dirname, '../data/personajes.json');
const ESTADO_BATALLA_FILE = path.join(__dirname, '../data/estado_batalla.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buscar')
    .setDescription('Busca y muestra la información de un personaje registrado')
    .addStringOption(opt =>
      opt.setName('nombre')
         .setDescription('Nombre del personaje')
         .setRequired(true)
    ),

  async execute(interaction) {
    const nombre = interaction.options.getString('nombre');

    // 1️⃣ Verificar estado de batalla
    try {
      const estado = JSON.parse(fs.readFileSync(ESTADO_BATALLA_FILE, 'utf8'));
      if (estado.enCurso || estado.pausada) {
        return interaction.reply({ content: '⛔ No puedes buscar personajes durante una batalla activa o pausada.', ephemeral: true });
      }
    } catch (err) {
      console.error('Error leyendo estado_batalla.json:', err);
      return interaction.reply({ content: '⚠️ Error al verificar el estado de la batalla.', ephemeral: true });
    }

    // 2️⃣ Cargar personajes
    let personajes;
    try {
      personajes = JSON.parse(fs.readFileSync(PERSONAJES_FILE, 'utf8'));
    } catch (err) {
      console.error('Error leyendo personajes.json:', err);
      return interaction.reply({ content: '⚠️ Error al leer los personajes.', ephemeral: true });
    }

    // 3️⃣ Buscar personaje
    const pj = personajes.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
    if (!pj) {
      return interaction.reply({ content: `❌ No se encontró un personaje llamado "${nombre}".`, ephemeral: true });
    }

    // 4️⃣ Construir embed con nombres dinámicos de ataque
    const embed = new EmbedBuilder()
      .setTitle('📜 ¡Personaje encontrado!')
      .setColor('#00AAFF')
      .setDescription(
        `🔹 **Nombre:** ${pj.nombre}\n` +
        `🔹 **Especie:** ${pj.especie}\n` +
        `⚔️ **Ataque Base:** ${pj.ataqueBase} | 🛡️ **Defensa Base:** ${pj.defensaBase} | ❤️ **Vida Base:** ${pj.vidaBase}\n\n` +
        `📑 **Ataques iniciales:**`
      )
      .addFields(
        { name: '• ' + pj.ataques.basico.nombre,   value: `(PP ${pj.ataques.basico.pp} ● Daño ${pj.ataques.basico.daño})`, inline: false },
        { name: '• ' + pj.ataques.cargado.nombre,  value: `(PP ${pj.ataques.cargado.pp} ● Daño ${pj.ataques.cargado.daño})`, inline: false },
        { name: '• ' + pj.ataques.especial.nombre, value: `(PP ${pj.ataques.especial.pp} ● Daño ${pj.ataques.especial.daño})`, inline: false },
        { name: '• ' + pj.ataques.ultimate.nombre, value: `(PP ${pj.ataques.ultimate.pp} ● Daño ${pj.ataques.ultimate.daño})`, inline: false },
      )
      .setFooter({ text: '¡Prepárate para la batalla!' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};






