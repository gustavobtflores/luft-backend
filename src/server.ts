import './utils/module-alias';
import CronScheduler from '@src/utils/cron';

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
import cookieParser from 'cookie-parser';
import { BalancesController } from './controllers/balances';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
    await this.cacheSetup();
    this.schedulerSetup();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    this.app.use(httpPino({ logger }));
    this.app.use(
      cors({
        credentials: true,
        origin: 'http://localhost:5173',
      })
    );
  }

  private setupControllers(): void {
    const investmentsController = new InvestmentsController();
    const transactionsController = new TransactionsController();
    const usersController = new UsersController();
    const balancesController = new BalancesController();
    this.addControllers([
      investmentsController,
      transactionsController,
      usersController,
      balancesController,
    ]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  private async cacheSetup(): Promise<void> {
    await cache.connect();
  }

  private schedulerSetup() {
    CronScheduler.start();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port ${this.port}`);
    });
  }

  public async close(): Promise<void> {
    CronScheduler.close();
    await database.close();
    await cache.close();
  }

  public getApp(): Application {
    return this.app;
  }
}
