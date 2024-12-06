import { SetupServer } from '@src/server';
import path from 'path';
import supertest from 'supertest';
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from 'testcontainers';

const composeFilePath = path.resolve(__dirname, '..');
const composeFile = 'docker-compose.yml';

let environment: StartedDockerComposeEnvironment;

let server: SetupServer;

jest.setTimeout(60000);

beforeAll(async () => {
  environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
    .withWaitStrategy('app-db', Wait.forHealthCheck())
    .withWaitStrategy(
      'app-redis',
      Wait.forLogMessage('Ready to accept connections')
    )
    .up();

  server = new SetupServer();
  await server.init();
  global.testRequest = supertest(server.getApp());
});

afterAll(async () => {
  await server.close();
  await environment.down();
});
