import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';

@Controller('investments')
export class InvestmentsController {
  @Get('')
  public getInvestmentsForLoggedUser(_: Request, res: Response): void {
    res.status(200).send([
      {
        ticker: 'ROXO34',
        appreciation: 200.53,
        appreciationPercent: 10.13,
        currentPrice: 9.42,
        quantity: 8,
        avgPrice: 7.25,
        logoUrl: 'https://s3-symbol-logo.tradingview.com/nu-holdings--big.svg',
      },
    ]);
  }
}
