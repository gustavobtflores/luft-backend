import { Balances } from '../services/balances';
import { CronJob } from 'cron';

const balancesService = new Balances();

class CronScheduler {
  private jobs: CronJob[] = [];

  constructor() {
    this.add('*/5 * * * *', async () => {
      await balancesService.refreshUsersBalance();
    });
  }

  private add(cronTime: string, action: () => Promise<void>) {
    this.jobs.push(
      CronJob.from({
        cronTime: cronTime,
        onTick: action,
      })
    );
  }

  public start() {
    for (const job of this.jobs) {
      job.start();
    }
  }

  public close() {
    for (const job of this.jobs) {
      job.stop();
    }
  }
}

export default new CronScheduler();
