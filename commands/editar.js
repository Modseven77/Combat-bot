const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Rutas a los archivos JSON en la carpeta /data
const PERSONAJES_FILE = path.join(__dirname, '../data/personajes.json');
const ESTADO_BATALLA_FILE = path.join(__dirname, '../data/estado_batalla.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('editar')
    .setDescription('Edita un personaje ya registrado')
    .addStringOption(option =>
      option.setName('nombre')
        .setDescription('Nombre del personaje a editar')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('especie')
        .setDescription('Nueva especie del personaje'))
    .addIntegerOption(option =>
      option.setName('ataque')
        .setDescription('Nuevo valor de ataque'))
    .addIntegerOption(option =>
      option.setName('defensa')
        .setDescription('Nuevo valor de defensa'))
    .addIntegerOption(option =>
      option.setName('vida')
        .setDescription('Nuevo valor de vida')),

  async execute(interaction) {
    console.log("🛠️ Ejecutando comando /editar...");

    const nombre = interaction.options.getString('nombre');
    const nuevaEspecie = interaction.options.getString('especie');
    const nuevoAtaque = interaction.options.getInteger('ataque');
    const nuevaDefensa = interaction.options.getInteger('defensa');
    const nuevaVida = interaction.options.getInteger('vida');

    // Cargar estado de batalla
    let estadoBatalla;
    try {
      estadoBatalla = JSON.parse(fs.readFileSync(ESTADO_BATALLA_FILE, 'utf8'));
    } catch (err) {
      console.error('❌ Error al leer el archivo estado_batalla.json:', err);
      return interaction.reply('⚠️ Error al leer el estado de la batalla.');
    }

    if (estadoBatalla.enCurso || estadoBatalla.pausada) {
      return interaction.reply('⛔ No puedes editar personajes mientras una batalla está en curso o pausada.');
    }

    // Cargar personajes
    let personajes;
    try {
      personajes = JSON.parse(fs.readFileSync(PERSONAJES_FILE, 'utf8'));
    } catch (err) {
      console.error('❌ Error al leer el archivo personajes.json:', err);
      return interaction.reply('⚠️ Error al leer los personajes.');
    }

    // Buscar personaje (ignora mayúsculas/minúsculas)
    const personajeExistente = personajes.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());

    if (!personajeExistente) {
      return interaction.reply(`❌ No se encontró un personaje con el nombre "${nombre}".`);
    }

    // Mostrar valores actuales
    let mensaje = `🔎 Personaje encontrado:\n`;
    mensaje += `Nombre: ${personajeExistente.nombre}\n`;
    mensaje += `Especie: ${personajeExistente.especie}\n`;
    mensaje += `Ataque: ${personajeExistente.ataque}\n`;
    mensaje += `Defensa: ${personajeExistente.defensa}\n`;
    mensaje += `Vida: ${personajeExistente.vida}\n`;

    // Aplicar cambios
    let cambiosRealizados = false;

    if (nuevaEspecie) {
      personajeExistente.especie = nuevaEspecie;
      cambiosRealizados = true;
    }

    if (nuevoAtaque !== null) {
      if (nuevoAtaque > 0) {
        personajeExistente.ataque = nuevoAtaque;
        cambiosRealizados = true;
      } else {
        return interaction.reply('❌ El valor de ataque debe ser un número entero positivo.');
      }
    }

    if (nuevaDefensa !== null) {
      if (nuevaDefensa > 0) {
        personajeExistente.defensa = nuevaDefensa;
        cambiosRealizados = true;
      } else {
        return interaction.reply('❌ El valor de defensa debe ser un número entero positivo.');
      }
    }

    if (nuevaVida !== null) {
      if (nuevaVida > 0) {
        personajeExistente.vida = nuevaVida;
        cambiosRealizados = true;
      } else {
        return interaction.reply('❌ El valor de vida debe ser un número entero positivo.');
      }
    }

    if (!cambiosRealizados) {
      return interaction.reply('⚠️ No se realizaron cambios. Asegúrate de proporcionar al menos un valor para editar.');
    }

    // Guardar cambios
    try {
      fs.writeFileSync(PERSONAJES_FILE, JSON.stringify(personajes, null, 2));
    } catch (err) {
      console.error('❌ Error al guardar el archivo personajes.json:', err);
      return interaction.reply('❌ Error al guardar los cambios.');
    }

    // Confirmar cambios
    mensaje += `\n✅ Personaje editado con éxito. Nuevos valores:\n`;
    mensaje += `Especie: ${personajeExistente.especie}\n`;
    mensaje += `Ataque: ${personajeExistente.ataque}\n`;
    mensaje += `Defensa: ${personajeExistente.defensa}\n`;
    mensaje += `Vida: ${personajeExistente.vida}`;

    return interaction.reply(mensaje);
  }
};

