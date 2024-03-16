import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import * as TransactionModel from '@src/models/transaction';
import { Investments } from '@src/services/investments';
import { authMiddleware } from '@src/middlewares/auth';

const investment = new Investments();

@Controller('investments')
@ClassMiddleware(authMiddleware)
export class InvestmentsController {
  @Get('')
  public async getInvestmentsForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const transactions = await TransactionModel.find({
        userId: req.decoded?.id,
      });
      const investmentsData =
        await investment.processInvestmentsForTransactions(transactions);

      res.status(200).send(investmentsData);
    } catch (err) {
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
