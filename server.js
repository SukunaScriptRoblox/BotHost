
const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const botName = req.body.botName || 'unnamed-bot';
    const botDir = path.join(__dirname, 'deployed-bots', botName);
    
    if (!fs.existsSync(botDir)) {
      fs.mkdirSync(botDir, { recursive: true });
    }
    
    cb(null, botDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Store running bot processes
const runningBots = new Map();

// API Routes
app.post('/api/deploy-bot', upload.array('files'), async (req, res) => {
  try {
    const { botName, botToken, language } = req.body;
    
    if (!botName || !botToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bot name and token are required!' 
      });
    }
    
    const botDir = path.join(__dirname, 'deployed-bots', botName);
    
    // Create environment file with bot token
    const envContent = `DISCORD_TOKEN=${botToken}\n`;
    fs.writeFileSync(path.join(botDir, '.env'), envContent);
    
    // Start the bot based on language
    let command, args;
    
    if (language === 'python') {
      // Find main.py or bot.py
      const mainFile = fs.existsSync(path.join(botDir, 'main.py')) ? 'main.py' : 
                      fs.existsSync(path.join(botDir, 'bot.py')) ? 'bot.py' : 
                      fs.existsSync(path.join(botDir, 'index.py')) ? 'index.py' : null;
      
      if (!mainFile) {
        return res.status(400).json({ 
          success: false, 
          message: 'No main Python file found (main.py, bot.py, or index.py)!' 
        });
      }
      
      command = 'python3';
      args = [mainFile];
    } else if (language === 'javascript') {
      // Find index.js or bot.js
      const mainFile = fs.existsSync(path.join(botDir, 'index.js')) ? 'index.js' : 
                      fs.existsSync(path.join(botDir, 'bot.js')) ? 'bot.js' : null;
      
      if (!mainFile) {
        return res.status(400).json({ 
          success: false, 
          message: 'No main JavaScript file found (index.js or bot.js)!' 
        });
      }
      
      command = 'node';
      args = [mainFile];
    }
    
    // Stop existing bot if running
    if (runningBots.has(botName)) {
      runningBots.get(botName).kill();
    }
    
    // Start new bot process
    const botProcess = spawn(command, args, {
      cwd: botDir,
      env: { ...process.env, DISCORD_TOKEN: botToken }
    });
    
    runningBots.set(botName, botProcess);
    
    // Handle bot process events
    botProcess.stdout.on('data', (data) => {
      console.log(`[${botName}] ${data.toString()}`);
    });
    
    botProcess.stderr.on('data', (data) => {
      console.error(`[${botName}] Error: ${data.toString()}`);
    });
    
    botProcess.on('close', (code) => {
      console.log(`[${botName}] Process exited with code ${code}`);
      runningBots.delete(botName);
    });
    
    res.json({ 
      success: true, 
      message: `Bot "${botName}" deployed successfully!`,
      botName: botName,
      status: 'running'
    });
    
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Deployment failed: ' + error.message 
    });
  }
});

// Get bot status
app.get('/api/bot-status/:botName', (req, res) => {
  const { botName } = req.params;
  const isRunning = runningBots.has(botName);
  
  res.json({
    botName,
    status: isRunning ? 'running' : 'stopped',
    uptime: isRunning ? process.uptime() : 0
  });
});

// Stop bot
app.post('/api/stop-bot/:botName', (req, res) => {
  const { botName } = req.params;
  
  if (runningBots.has(botName)) {
    runningBots.get(botName).kill();
    runningBots.delete(botName);
    
    res.json({
      success: true,
      message: `Bot "${botName}" stopped successfully!`
    });
  } else {
    res.status(404).json({
      success: false,
      message: `Bot "${botName}" is not running!`
    });
  }
});

// Get all running bots
app.get('/api/bots', (req, res) => {
  const bots = Array.from(runningBots.keys()).map(botName => ({
    name: botName,
    status: 'running',
    uptime: process.uptime()
  }));
  
  res.json({ bots });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 BotHost Server running on port ${PORT}`);
  console.log(`📡 Ready to deploy Discord bots!`);
  
  // Create deployed-bots directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'deployed-bots'))) {
    fs.mkdirSync(path.join(__dirname, 'deployed-bots'), { recursive: true });
  }
});
