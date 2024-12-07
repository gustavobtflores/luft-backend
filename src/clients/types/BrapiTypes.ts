export interface BrapiQuote {
  readonly currency: string;
  readonly twoHundredDayAverage: number;
  readonly twoHundredDayAverageChange: number;
  readonly twoHundredDayAverageChangePercent: number;
  readonly marketCap: number;
  readonly shortName: string;
  readonly longName: string;
  readonly regularMarketChange: number;
  readonly regularMarketChangePercent: number;
  readonly regularMarketTime: string;
  readonly regularMarketPrice: number;
  readonly regularMarketDayHigh: number;
  readonly regularMarketDayRange: string;
  readonly regularMarketDayLow: number;
  readonly regularMarketVolume: number;
  readonly regularMarketPreviousClose: number;
  readonly regularMarketOpen: number;
  readonly averageDailyVolume3Month: number;
  readonly averageDailyVolume10Day: number;
  readonly fiftyTwoWeekLowChange: number;
  readonly fiftyTwoWeekLowChangePercent: number;
  readonly fiftyTwoWeekRange: string;
  readonly fiftyTwoWeekHighChange: number;
  readonly fiftyTwoWeekHighChangePercent: number;
  readonly fiftyTwoWeekLow: number;
  readonly fiftyTwoWeekHigh: number;
  readonly symbol: string;
  readonly priceEarnings: number;
  readonly earningsPerShare: number;
  readonly logourl: string;
}

export interface BrapiQuotesResponse {
  results: BrapiQuote[];
}

export interface BrapiCrypto {
  currency: string;
  currencyRateFromUSD: number;
  coinName: string;
  coin: string;
  regularMarketChange: number;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketDayLow: number;
  regularMarketDayHigh: number;
  regularMarketDayRange: string;
  regularMarketVolume: number;
  marketCap: number;
  regularMarketTime: string;
  coinImageUrl: string;
}

export interface BrapiCryptoResponse {
  coins: BrapiCrypto[];
}

export interface Price {
  currentPrice: number;
  ticker: string;
  logoUrl: string;
}
