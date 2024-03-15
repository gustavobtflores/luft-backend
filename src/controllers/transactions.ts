import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import * as TransactionModel from '@src/models/transaction';
import { ZodError } from 'zod';
import { BaseController } from '.';

@Controller('transactions')
export class TransactionsController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      await TransactionModel.transactionSchema.parseAsync(req.body);
      const transaction = await TransactionModel.create(req.body);

      res.status(201).send({ ...transaction[0] });
    } catch (err) {
      this.sendCreatedUpdateErrorResponse(res, err as ZodError | Error);
    }
  }
}
