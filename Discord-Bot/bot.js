const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();
const port = 3000;

// Set up the bot with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Bot Token (replace with your bot's token)
const token = 'YOUR_DISCORD_BOT_TOKEN';

client.once('ready', () => {
    console.log('Bot is online!');
});

// Command handling
client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.channel.send('Pong!');
    }
});

// Login to Discord
client.login(token);

// Set up a basic Express server
app.get('/', (req, res) => {
    res.send('Bot is online and working!');
});

app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
});
