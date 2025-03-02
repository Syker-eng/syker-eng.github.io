const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set up your Discord bot client
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

bot.once('ready', () => {
  console.log('Bot is online!');
});

// Listening to messages from users on Discord
bot.on('messageCreate', message => {
  if (message.author.bot) return; // Don't respond to bot messages
  console.log(`Message from ${message.author.tag}: ${message.content}`);

  // Send the message to all connected users (for now, simulate with "bot response")
  io.emit('botResponse', `Bot: ${message.content}`);
});

// Log in to Discord using your bot's token
bot.login('MTMzODI1NDIyNzMxMDUxNDI4Nw.Gy7lg9.1_97DUoO6PsmeRFLYBXzr4NsnyaiNNmqcqpUK4');

// Set up the server to serve HTML file
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Sending messages from one user to another
  socket.on('sendMessage', (msg) => {
    // Broadcast the message to all connected clients
    io.emit('newMessage', msg);
  });

  // Handle bot response (if Discord bot sends a message)
  socket.on('sendMessageToBot', (msg) => {
    const channel = bot.channels.cache.get('1333257664678989917');
    if (channel) {
      channel.send(msg).then(() => {
        socket.emit('botResponse', 'Message sent to bot!');
      }).catch(err => {
        console.error('Error sending message:', err);
        socket.emit('botResponse', 'Error sending message to bot.');
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
