import './utils/module-alias';

import { Server } from '@overnightjs/core';
import { Application } from 'express';
import bodyParser from 'body-parser';
import { AssetsController } from './controllers/assets';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.setupControllers();
  }

  private setupControllers(): void {
    const assetsController = new AssetsController();
    this.addControllers([assetsController]);
  }

  public getApp(): Application {
    return this.app;
  }
}
