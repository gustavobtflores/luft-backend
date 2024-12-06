import { Brapi, Price } from '@src/clients/brapi';
import logger from '@src/logger';
import { Transaction } from '@src/models/transaction';
import { InternalError } from '@src/utils/errors/internal-error';

interface ConsolidatedTransaction
  extends Omit<Transaction, 'price' | 'type' | 'userId'> {
  totalPurchased: number;
  totalCost: number;
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
  ): Promise<Investment[]> {
    logger.info(
      `Preparing an user investments for ${transactions.length} transactions`
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
        transaction.quantity * price.currentPrice -
        transaction.avgPrice * transaction.quantity,
      appreciationPercent:
        (price.currentPrice - transaction.avgPrice) / transaction.avgPrice,
      total: price.currentPrice * transaction.quantity,
    };
  }

  //TODO: a lógica desse método precisa ser melhorada, talvez extraindo partes do código para funções
  private transformTransactionsToConsolidated(
    transactions: Transaction[]
  ): Record<string, ConsolidatedTransaction> {
    const consolidated = transactions.reduce(
      (acc, curr: Transaction) => {
        const { price, quantity, ticker, tickerType, type } = curr;

        acc[ticker] = acc[ticker] || {
          ticker,
          tickerType,
          avgPrice: price,
          total: 0,
          totalPurchased: 0,
          totalCost: 0,
          quantity: 0,
        };

        if (type === 'buy') {
          acc[ticker].quantity += quantity;
          acc[ticker].totalCost += price * quantity;
          acc[ticker].totalPurchased += quantity;
          acc[ticker].avgPrice =
            acc[ticker].totalCost / acc[ticker].totalPurchased;
        } else {
          acc[ticker].quantity -= quantity;
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
