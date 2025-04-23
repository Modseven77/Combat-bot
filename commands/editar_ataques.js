// commands/editarataques.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Rutas a los archivos JSON
const PERSONAJES_FILE     = path.join(__dirname, '../data/personajes.json');
const ESTADO_BATALLA_FILE = path.join(__dirname, '../data/estado_batalla.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('editarataques')
    .setDescription('Edita los ataques de un personaje registrado')
    .addStringOption(opt => opt.setName('nombre').setDescription('Nombre del personaje').setRequired(true))
    .addStringOption(opt => opt.setName('ataquebasico').setDescription('Nuevo nombre para Ataque Básico'))
    .addStringOption(opt => opt.setName('ataquecargado').setDescription('Nuevo nombre para Ataque Cargado'))
    .addStringOption(opt => opt.setName('ataqueespecial').setDescription('Nuevo nombre para Ataque Especial'))
    .addStringOption(opt => opt.setName('ataqueultimate').setDescription('Nuevo nombre para Ataque Ultimate')),

  async execute(interaction) {
    const nombre                = interaction.options.getString('nombre');
    const nuevoAtaqueBasico     = interaction.options.getString('ataquebasico');
    const nuevoAtaqueCargado    = interaction.options.getString('ataquecargado');
    const nuevoAtaqueEspecial   = interaction.options.getString('ataqueespecial');
    const nuevoAtaqueUltimate   = interaction.options.getString('ataqueultimate');

    // 1️⃣ Verificar estado de batalla
    let estado;
    try {
      estado = JSON.parse(fs.readFileSync(ESTADO_BATALLA_FILE, 'utf8'));
      if (estado.enCurso || estado.pausada) {
        return interaction.reply({ content: '⛔ No puedes editar ataques durante una batalla activa o pausada.', ephemeral: true });
      }
    } catch (err) {
      console.error('Error leyendo estado_batalla.json:', err);
      return interaction.reply({ content: '⚠️ Error al verificar el estado de la batalla.', ephemeral: true });
    }

    // 2️⃣ Cargar personajes existentes
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

    // 4️⃣ Aplicar cambios
    let cambios = [];
    if (nuevoAtaqueBasico) {
      cambios.push({ tipo: 'Básico', antes: pj.ataques.basico.nombre, ahora: nuevoAtaqueBasico });
      pj.ataques.basico.nombre = nuevoAtaqueBasico;
    }
    if (nuevoAtaqueCargado) {
      cambios.push({ tipo: 'Cargado', antes: pj.ataques.cargado.nombre, ahora: nuevoAtaqueCargado });
      pj.ataques.cargado.nombre = nuevoAtaqueCargado;
    }
    if (nuevoAtaqueEspecial) {
      cambios.push({ tipo: 'Especial', antes: pj.ataques.especial.nombre, ahora: nuevoAtaqueEspecial });
      pj.ataques.especial.nombre = nuevoAtaqueEspecial;
    }
    if (nuevoAtaqueUltimate) {
      cambios.push({ tipo: 'Ultimate', antes: pj.ataques.ultimate.nombre, ahora: nuevoAtaqueUltimate });
      pj.ataques.ultimate.nombre = nuevoAtaqueUltimate;
    }

    if (cambios.length === 0) {
      return interaction.reply({ content: '⚠️ No se realizaron cambios. Proporciona al menos un nuevo nombre de ataque.', ephemeral: true });
    }

    // 5️⃣ Guardar cambios
    try {
      fs.writeFileSync(PERSONAJES_FILE, JSON.stringify(personajes, null, 2));
    } catch (err) {
      console.error('Error guardando personajes.json:', err);
      return interaction.reply({ content: '❌ Error al guardar los cambios.', ephemeral: true });
    }

    // 6️⃣ Construir Embed de confirmación
    const embed = new EmbedBuilder()
      .setTitle(`🗡️ Ataques de ${pj.nombre} actualizados`)
      .setColor('#00AAFF')
      .setDescription(`Se han renombrado los siguientes ataques:`)
      .addFields(
        cambios.map(c => ({
          name: `• ${c.tipo}`,
          value: `🔴 Antes: **${c.antes}**\n🔵 Ahora: **${c.ahora}**`,
          inline: false
        }))
      )
      .setFooter({ text: '¡Que las batallas comiencen!', iconURL: 'https://i.imgur.com/wSTFkRM.png' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};

