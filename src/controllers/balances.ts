import * as BalanceModel from '@src/models/balance';
import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { authMiddleware } from '@src/middlewares/auth';
import logger from '@src/logger';
import { BaseController } from '.';

@Controller('balances')
@ClassMiddleware(authMiddleware)
export class BalancesController extends BaseController {
  @Get('')
  public async getBalanceForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const balanceHistory = await BalanceModel.find({
        userId: req.decoded?.id,
      });

      res.send({ data: balanceHistory });
    } catch (err) {
      logger.error(err);
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
