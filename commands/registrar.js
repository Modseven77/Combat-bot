// commands/registrar.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Rutas a los archivos JSON
const PERSONAJES_FILE     = path.join(__dirname, '../data/personajes.json');
const ESTADO_BATALLA_FILE = path.join(__dirname, '../data/estado_batalla.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('registrar')
    .setDescription('Registra un personaje con ataques por defecto')
    .addStringOption(opt => opt.setName('nombre').setDescription('Nombre del personaje').setRequired(true))
    .addStringOption(opt => opt.setName('especie').setDescription('Especie del personaje').setRequired(true))
    .addIntegerOption(opt => opt.setName('ataque').setDescription('Valor de ataque base').setRequired(true))
    .addIntegerOption(opt => opt.setName('defensa').setDescription('Valor de defensa base').setRequired(true))
    .addIntegerOption(opt => opt.setName('vida').setDescription('Cantidad de vida').setRequired(true)),

  async execute(interaction) {
    const nombre  = interaction.options.getString('nombre');
    const especie = interaction.options.getString('especie');
    const atk     = interaction.options.getInteger('ataque');
    const def     = interaction.options.getInteger('defensa');
    const hp      = interaction.options.getInteger('vida');

    // 1️⃣ Verificar estado de batalla
    try {
      const estado = JSON.parse(fs.readFileSync(ESTADO_BATALLA_FILE, 'utf8'));
      if (estado.enCurso || estado.pausada) {
        return interaction.reply('⛔ No puedes registrar personajes durante una batalla activa o pausada.');
      }
    } catch (err) {
      console.error('Error leyendo estado_batalla.json:', err);
      return interaction.reply('⚠️ Error al verificar el estado de la batalla.');
    }

    // 2️⃣ Cargar personajes existentes
    let personajes = [];
    if (fs.existsSync(PERSONAJES_FILE)) {
      try {
        personajes = JSON.parse(fs.readFileSync(PERSONAJES_FILE, 'utf8'));
      } catch (err) {
        console.error('Error leyendo personajes.json:', err);
        return interaction.reply('⚠️ Error al leer los personajes.');
      }
    }

    // 3️⃣ Verificar duplicado
    if (personajes.some(p => p.nombre.toLowerCase() === nombre.toLowerCase())) {
      return interaction.reply(`❌ Ya existe un personaje llamado "${nombre}".`);
    }

    // 4️⃣ Crear el objeto del personaje con ataques por defecto
    const nuevoPersonaje = {
      nombre,
      especie,
      ataqueBase: atk,
      defensaBase: def,
      vidaBase: hp,
      ataques: {
        basico:   { nombre: 'Ataque Básico',   pp: 10, daño:  50 },
        cargado:  { nombre: 'Ataque Cargado',  pp:  5, daño:  75 },
        especial: { nombre: 'Ataque Especial', pp:  3, daño:  90 },
        ultimate: { nombre: 'Ataque Ultimate', pp:  1, daño: 150 }
      }
    };

    // 5️⃣ Agregar y guardar
    personajes.push(nuevoPersonaje);
    try {
      fs.writeFileSync(PERSONAJES_FILE, JSON.stringify(personajes, null, 2));
    } catch (err) {
      console.error('Error guardando personajes.json:', err);
      return interaction.reply('❌ Error al guardar el personaje.');
    }

    // 6️⃣ Confirmar
    return interaction.reply(
      `📜 **¡Personaje registrado exitosamente!**\n` +
      `🔹 Nombre: ${nombre}\n` +
      `🔹 Especie: ${especie}\n` +
      `⚔️ Ataque Base: ${atk} | 🛡️ Defensa Base: ${def} | ❤️ Vida Base: ${hp}\n\n` +
      `📑 **Ataques iniciales:**\n` +
      `• **Ataque Básico** (PP 10 ● Daño 50)\n` +
      `• **Ataque Cargado** (PP 5 ● Daño 75)\n` +
      `• **Ataque Especial** (PP 3 ● Daño 90)\n` +
      `• **Ataque Ultimate** (PP 1 ● Daño 150)`
    );
  }
};


