require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Ruta de los archivos de comandos
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Conjunto para rastrear los nombres de comandos y evitar duplicados
const commandNames = new Set();

// Leer y cargar todos los archivos de comandos
for (const file of commandFiles) {
  try {
    const command = require(`./commands/${file}`);
    
    // Verificar que el comando tenga la propiedad 'data' antes de intentar acceder
    if (command.data) {
      // Verificar si ya existe un comando con el mismo nombre
      if (commandNames.has(command.data.name)) {
        console.error(`❌ El comando ${command.data.name} ya existe. Cambia el nombre en ${file}.`);
      } else {
        // Añadir el nombre del comando al conjunto y agregar el comando a la lista
        commandNames.add(command.data.name);
        commands.push(command.data.toJSON());
      }
    } else {
      console.error(`❌ El comando ${file} no tiene la propiedad 'data' correctamente definida.`);
    }
  } catch (error) {
    console.error(`Error al cargar el comando ${file}:`, error);
  }
}

// Configurar el cliente de la API de Discord
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('⏳ Registrando comandos...');

    // Registrar comandos en un servidor específico (guild)
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log('✅ Comandos registrados con éxito.');
  } catch (error) {
    console.error('❌ Error al registrar comandos:', error);
  }
})();


