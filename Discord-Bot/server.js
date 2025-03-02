const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// In-memory storage for messages
let messages = [];  // This will store all messages

// Set up your Discord bot client
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

bot.once('ready', () => {
  console.log('Bot is online!');
});

// Listening to messages from users on Discord
bot.on('messageCreate', message => {
  if (message.author.bot) return; // Don't respond to bot messages
  console.log(`Message from ${message.author.tag}: ${message.content}`);

  // Send the message to all connected users
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

  // Detect user IP and device information
  const userIp = socket.handshake.address; // Get IP address
  const userAgent = socket.request.headers['user-agent']; // Get user agent (device info)

  // Store message with user info (IP + User-Agent)
  socket.on('sendMessage', (msg) => {
    // Save the message along with IP and device info
    const messageData = {
      sender: { ip: userIp, device: userAgent },
      message: msg,
      timestamp: new Date().toISOString()
    };

    messages.push(messageData);  // Store the message in memory

    // Broadcast the message to other users
    io.emit('newMessage', messageData);
  });

  // Send previously stored messages to the new user
  socket.emit('messageHistory', messages);

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
