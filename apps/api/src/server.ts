import { createServer } from 'http';

import { createApp } from './app';
import { buildSocketServer } from './services/socket.service';
import { validateApiEnv } from './utils/env';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT ?? 4000);
validateApiEnv();
const app = createApp();
const httpServer = createServer(app);

buildSocketServer(httpServer);

httpServer.listen(PORT, () => {
  logger.info({ port: PORT }, 'SkillArena API is running');
});
