import { Brapi, Price } from '@src/clients/brapi';
import { InternalError } from '@src/utils/errors/internal-error';

export enum TickerType {
  bdr = 'bdr',
  stock = 'stock',
  crypto = 'crypto',
  reit = 'reit',
}

export interface Transaction {
  ticker: string;
  avgPrice: number;
  quantity: number;
  user: string;
  tickerType: TickerType;
}

export interface Investment extends Omit<Transaction, 'user'>, Price {}

export class InvestmentsProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the investments processing: ${message}`);
  }
}

export class Investments {
  constructor(protected brapi = new Brapi()) {}

  public async processInvestmentsForTransactions(
    transactions: Transaction[]
  ): Promise<Price[]> {
    try {
      const pricesWithCorrectSources: Investment[] = [];
      //TODO: agrupar transações por tipo (crypto, stock) e alterar o service da Brapi pra lidar com isso e também com o limite de 10 tickers por requisição
      const tickers = transactions.map((transaction) => transaction.ticker);
      const prices = await this.brapi.fetchPrices(tickers);

      for (const transaction of transactions) {
        const relatedPrice = prices.find(
          (price) => price.ticker === transaction.ticker
        );

        const enrichedTransactionData = this.enrichTransactionData(
          relatedPrice!,
          transaction
        );
        pricesWithCorrectSources.push(enrichedTransactionData);
      }

      return pricesWithCorrectSources;
    } catch (err) {
      throw new InvestmentsProcessingInternalError((err as Error).message);
    }
  }

  private enrichTransactionData(
    price: Price,
    transaction: Transaction
  ): Investment {
    return {
      ...price,
      avgPrice: transaction.avgPrice,
      quantity: transaction.quantity,
      tickerType: transaction.tickerType,
      ticker: transaction.ticker,
    };
  }
}
