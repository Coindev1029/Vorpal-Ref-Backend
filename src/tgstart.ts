import { TelegramBotServer } from './telegram';
import { StartWatchingTimer } from './blockchain/Stars/watcher';

const dEnv = require('dotenv');
dEnv.config();

// InitGameIoServer()
new TelegramBotServer().start();
StartWatchingTimer();
