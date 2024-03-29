import { Brapi, Price } from '@src/clients/brapi';
import logger from '@src/logger';
import { Transaction } from '@src/models/transaction';
import { InternalError } from '@src/utils/errors/internal-error';

interface ConsolidatedTransaction
  extends Omit<Transaction, 'price' | 'type' | 'userId'> {
  avgPrice: number;
  total: number;
}

export interface Investment extends ConsolidatedTransaction, Price {
  appreciation: number;
  appreciationPercent: number;
}

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
    logger.info(
      `Preparing a user investments for ${transactions.length} transactions`
    );

    if (transactions.length === 0) {
      return [];
    }

    try {
      const pricesWithCorrectSources: Investment[] = [];
      const prices = await this.processPricesData(transactions);
      const consolidatedTransactions =
        this.transformTransactionsToConsolidated(transactions);

      for (const ticker of Object.keys(consolidatedTransactions)) {
        const relatedPrice = prices.find((price) => price.ticker === ticker);

        const enrichedTransactionData = this.enrichTransactionData(
          relatedPrice!,
          consolidatedTransactions[ticker]
        );

        pricesWithCorrectSources.push(enrichedTransactionData);
      }

      return pricesWithCorrectSources;
    } catch (err) {
      logger.error(err);
      throw new InvestmentsProcessingInternalError((err as Error).message);
    }
  }

  private enrichTransactionData(
    price: Price,
    transaction: ConsolidatedTransaction
  ): Investment {
    return {
      ...price,
      ...transaction,
      appreciation:
        transaction.quantity * price.currentPrice - transaction.total,
      appreciationPercent:
        (price.currentPrice - transaction.avgPrice) / transaction.avgPrice,
    };
  }

  //TODO: a lógica desse método precisa ser melhorada, talvez extraindo partes do código para funções
  private transformTransactionsToConsolidated(
    transactions: Transaction[]
  ): Record<string, ConsolidatedTransaction> {
    const consolidated = transactions.reduce(
      (acc, curr: Transaction) => {
        if (acc[curr.ticker]) {
          if (curr.type === 'buy') {
            acc[curr.ticker].quantity += curr.quantity;
          } else {
            acc[curr.ticker].quantity -= curr.quantity;
          }

          acc[curr.ticker].total =
            acc[curr.ticker].avgPrice * acc[curr.ticker].quantity;
          acc[curr.ticker].avgPrice =
            acc[curr.ticker].total / acc[curr.ticker].quantity;
        } else {
          if (curr.type === 'buy') {
            acc[curr.ticker] = {
              quantity: curr.quantity,
              ticker: curr.ticker,
              tickerType: curr.tickerType,
              avgPrice: curr.price,
              total: curr.price * curr.quantity,
            };
          } else {
            acc[curr.ticker] = {
              quantity: -curr.quantity,
              ticker: curr.ticker,
              tickerType: curr.tickerType,
              avgPrice: 0,
              total: -curr.price * curr.quantity,
            };
          }
        }

        return acc;
      },
      {} as Record<string, ConsolidatedTransaction>
    );

    return consolidated;
  }

  private async processPricesData(
    transactions: Transaction[]
  ): Promise<Price[]> {
    const tickers = transactions
      .filter((transaction) =>
        ['reit', 'bdr', 'stock'].includes(transaction.tickerType)
      )
      .map((transaction) => transaction.ticker);

    const coins = transactions
      .filter((transaction) => transaction.tickerType === 'crypto')
      .map((transaction) => transaction.ticker);

    const prices = await this.brapi.fetchPrices({
      stocks: tickers,
      cryptos: coins,
    });

    return prices;
  }
}
