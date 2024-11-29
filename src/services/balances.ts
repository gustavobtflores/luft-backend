import * as UserModel from '@src/models/user';
import * as TransactionModel from '@src/models/transaction';
import * as BalanceModel from '@src/models/balance';
import { Investments } from './investments';
import logger from '@src/logger';
import cache from '@src/utils/cache';

export class Balances {
  constructor(protected investments = new Investments()) {}

  public async refreshUsersBalance() {
    try {
      await cache.clear();
      const usersIds = await UserModel.findAll();

      for (const { id } of usersIds) {
        const userTransactions = await TransactionModel.find({ userId: id });
        const investments =
          await this.investments.processInvestmentsForTransactions(
            userTransactions
          );

        const { total, appreciation } = investments.reduce(
          (acc, curr) => {
            acc.total += curr.quantity * curr.currentPrice;
            acc.appreciation += curr.appreciation;

            return acc;
          },
          {
            total: 0,
            appreciation: 0,
          }
        );

        await BalanceModel.create({
          appreciation,
          total,
          userId: id,
        });

        logger.info(
          `Successfully updated balances for ${usersIds.length} users`
        );
      }
    } catch (err) {
      logger.error(`Unexpected error when updating users balance: ${err}`);
    }
  }
}
