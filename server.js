import { createServer } from 'node:http';
import { app } from './src/app.js';
import { env } from './src/config/env.js';

const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`Pulse Social running on http://localhost:${env.PORT}`);
});
