describe('Holdings data functional tests', () => {
  it('should return assets prices and info', async () => {
    const { body, status } = await global.testRequest.get('/assets');

    expect(status).toBe(200);
    expect(body).toEqual([
      {
        symbol: 'ROXO34',
        regularMarketChange: -0.34000015,
        regularMarketChangePercent: -3.5827205,
        regularMarketTime: '2024-03-08T21:13:00.000Z',
        logourl: 'https://s3-symbol-logo.tradingview.com/nu-holdings--big.svg',
      },
    ]);
  });
});
