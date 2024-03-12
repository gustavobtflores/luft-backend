import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';

@Controller('investments')
export class InvestmentsController {
  @Get('')
  public getInvestmentsForLoggedUser(_: Request, res: Response): void {
    res.status(200).send([
      {
        symbol: 'ROXO34',
        regularMarketChange: -0.34000015,
        regularMarketChangePercent: -3.5827205,
        regularMarketTime: '2024-03-08T21:13:00.000Z',
        logourl: 'https://s3-symbol-logo.tradingview.com/nu-holdings--big.svg',
      },
    ]);
  }
}
