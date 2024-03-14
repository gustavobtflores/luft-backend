import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import * as TransactionModel from '@src/models/transaction';
import { ZodError } from 'zod';

@Controller('transactions')
export class TransactionsController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      await TransactionModel.transactionSchema.parseAsync(req.body);
      const transaction = await TransactionModel.create(req.body);

      res.status(201).send({ ...transaction[0] });
    } catch (err) {
      if (err instanceof ZodError) {
        //TODO: implementar uma classe de erro (talvez ValidationError()) para tratar melhor os erros de validação
        // retornar para o front-end algo no formato {fields: {date: 'Invalid date', price: 'Price must be a number'}}
        res.status(422).send({
          error: `Transaction validation error: ${(err as ZodError).errors[0].message}`,
        });
      } else {
        res.status(500).send({
          error: 'Internal Server Error',
        });
      }
    }
  }
}
