import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import * as TransactionModel from '@src/models/transaction';
import { Investments } from '@src/services/investments';

const investment = new Investments();

@Controller('investments')
export class InvestmentsController {
  @Get('')
  public async getInvestmentsForLoggedUser(
    _: Request,
    res: Response
  ): Promise<void> {
    try {
      const transactions = await TransactionModel.find();
      const investmentsData =
        await investment.processInvestmentsForTransactions(transactions);

      res.status(200).send(investmentsData);
    } catch (err) {
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
