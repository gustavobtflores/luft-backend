describe('Investments data functional tests', () => {
  it('should return investments data', async () => {
    const { body, status } = await global.testRequest.get('/investments');

    expect(status).toBe(200);
    expect(body).toEqual([
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
  });
});
