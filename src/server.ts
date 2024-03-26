import './utils/module-alias';

import { Server } from '@overnightjs/core';
import { Application } from 'express';
import bodyParser from 'body-parser';
import { InvestmentsController } from './controllers/investments';
import * as database from '@src/database/db';
import { TransactionsController } from './controllers/transactions';
import { UsersController } from './controllers/users';
import logger from './logger';
import cors from 'cors';
import httpPino from 'pino-http';
import cache from './utils/cache';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
    await this.cacheSetup();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(httpPino({ logger }));
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupControllers(): void {
    const investmentsController = new InvestmentsController();
    const transactionsController = new TransactionsController();
    const usersController = new UsersController();
    this.addControllers([
      investmentsController,
      transactionsController,
      usersController,
    ]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  private async cacheSetup(): Promise<void> {
    await cache.connect();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port ${this.port}`);
    });
  }

  public async close(): Promise<void> {
    await database.close();
    await cache.close();
  }

  public getApp(): Application {
    return this.app;
  }
}
