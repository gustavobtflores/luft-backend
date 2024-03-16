import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import * as TransactionModel from '@src/models/transaction';
import { ZodError } from 'zod';
import { BaseController } from '.';
import { authMiddleware } from '@src/middlewares/auth';

@Controller('transactions')
@ClassMiddleware(authMiddleware)
export class TransactionsController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      await TransactionModel.transactionSchema.parseAsync({ ...req.body });
      const transaction = await TransactionModel.create({
        ...req.body,
        userId: req.decoded?.id,
      });

      res.status(201).send({ ...transaction[0] });
    } catch (err) {
      this.sendCreatedUpdateErrorResponse(res, err as ZodError | Error);
    }
  }
}
