import { InternalError } from '@src/utils/errors/internal-error';
import config, { IConfig } from 'config';
import * as HTTPUtil from '@src/utils/request';
import { AxiosError, AxiosResponse } from 'axios';
import CacheUtil from '@src/utils/cache';
import {
  Price,
  BrapiQuotesResponse,
  BrapiCryptoResponse,
  BrapiQuote,
  BrapiCrypto,
} from './types/BrapiTypes';

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected error when trying to communicate to Brapi`;
    super(`${internalMessage}: ${message}`);
  }
}

export class BrapiRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = 'Unexpected error returned by Brapi service';
    super(`${internalMessage}: ${message}`);
  }
}

const brapiResourceConfig: IConfig = config.get('App.resources.Brapi');

export class Brapi {
  private baseURL = brapiResourceConfig.get<string>('apiUrl');

  constructor(
    protected http = new HTTPUtil.Request(),
    protected cacheUtil = CacheUtil,
    private requestLimit = brapiResourceConfig.get<number>(
      'apiSimultaneousRequestLimit'
    )
  ) {}

  /** Try to get prices from cache,
   * if doesn't exist entries on cache, fetch from Brapi API */
  public async fetchPrices({
    stocks,
    cryptos,
  }: {
    stocks?: string[];
    cryptos?: string[];
  }): Promise<Price[]> {
    let prices = await this.getPricesFromCache({ stocks, cryptos });

    if (!prices.length) {
      prices = await this.getPricesFromApi({ stocks, cryptos });
      await this.setPricesInCache(prices);
      return prices;
    }

    return prices;
  }

  private async getPricesFromApi(tickers: {
    stocks?: string[];
    cryptos?: string[];
  }) {
    const stocks = tickers.stocks ? await this.fetchStocks(tickers.stocks) : [];
    const cryptos = tickers.cryptos
      ? await this.fetchCryptos(tickers.cryptos)
      : [];

    return [...stocks, ...cryptos];
  }

  private async getPricesFromCache(tickers: {
    stocks?: string[];
    cryptos?: string[];
  }) {
    const stocks = tickers.stocks?.length ? tickers.stocks : [];
    const cryptos = tickers.cryptos?.length ? tickers.cryptos : [];
    const allTickers = [...stocks, ...cryptos];
    const prices = [];

    for (const entry of allTickers) {
      const cached = await this.cacheUtil.get(entry);

      if (cached) {
        prices.push(cached);
      }
    }

    return prices;
  }

  private async setPricesInCache(prices: Price[]) {
    for (const price of prices) {
      await this.cacheUtil.set(price.ticker, price);
    }
  }

  /** Creates a list of Promises to fetch Brapi API based on the request limit
   * and the list of stocks
   */
  private async fetchStocks(tickers: string[]): Promise<Price[]> {
    try {
      const stockPromises = this.createPromisesBasedLimit<
        AxiosResponse<BrapiQuotesResponse>
      >(tickers, (tickers) =>
        this.http.get(`/quote/${tickers.join(',')}`, {
          baseURL: this.baseURL,
          headers: {
            Authorization: `Bearer ${brapiResourceConfig.get('apiToken')}`,
          },
        })
      );

      const response =
        await Promise.all<AxiosResponse<BrapiQuotesResponse>>(stockPromises);

      return this.normalizeStocksResponse(
        response.map(({ data }) => data.results).flat()
      );
    } catch (err) {
      const axiosError = err as AxiosError;

      if (HTTPUtil.Request.isRequestError(axiosError)) {
        throw new BrapiRequestError(
          `Error: ${JSON.stringify(axiosError?.response?.data)} Code: ${axiosError?.response?.status}`
        );
      }

      throw new ClientRequestError((err as Error).message);
    }
  }

  /** Creates a list of Promises to fetch Brapi API based on the request limit
   * and the list of cryptos
   */
  private async fetchCryptos(cryptos: string[]) {
    try {
      const cryptoPromises = this.createPromisesBasedLimit(cryptos, (coins) =>
        this.http.get<BrapiCryptoResponse>(
          `/v2/crypto?coin=${coins.join(',')}`,
          {
            baseURL: this.baseURL,
            headers: {
              Authorization: `Bearer ${brapiResourceConfig.get('apiToken')}`,
            },
          }
        )
      );

      const response =
        await Promise.all<AxiosResponse<BrapiCryptoResponse>>(cryptoPromises);

      return this.normalizeCryptosResponse(
        response.map(({ data }) => data.coins).flat()
      );
    } catch (err) {
      const axiosError = err as AxiosError;

      if (HTTPUtil.Request.isRequestError(axiosError)) {
        throw new BrapiRequestError(
          `Error: ${JSON.stringify(axiosError?.response?.data)} Code: ${axiosError?.response?.status}`
        );
      }

      throw new ClientRequestError((err as Error).message);
    }
  }

  //** Removes invalid or incomplete stocks and returns the data normalized */
  private normalizeStocksResponse(quotes: BrapiQuote[]): Price[] {
    return quotes.filter(this.isValidQuote.bind(this)).map((quote) => ({
      logoUrl: quote.logourl,
      currentPrice: quote.regularMarketPrice,
      ticker: quote.symbol,
    }));
  }

  //** Removes invalid or incomplete cryptos and returns the data normalized */
  private normalizeCryptosResponse(coins: BrapiCrypto[]): Price[] {
    return coins.filter(this.isValidCrypto.bind(this)).map((coin) => ({
      logoUrl: coin.coinImageUrl,
      currentPrice: coin.regularMarketPrice,
      ticker: coin.coin,
    }));
  }

  private isValidQuote(quote: Partial<BrapiQuote>): boolean {
    return !!(quote.logourl && quote.regularMarketPrice && quote.symbol);
  }

  private isValidCrypto(crypto: Partial<BrapiCrypto>): boolean {
    return !!(crypto.coinImageUrl && crypto.regularMarketPrice && crypto.coin);
  }

  private createPromisesBasedLimit<T>(
    tickers: string[],
    callback: (tickers: string[]) => Promise<T>
  ): Promise<T>[] {
    const tickersCopy = [...tickers];
    const promises = [];

    while (tickersCopy.length) {
      promises.push(callback(tickersCopy.splice(0, this.requestLimit)));
    }

    return promises;
  }
}
