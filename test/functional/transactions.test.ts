import * as TransactionsModel from '@src/models/transaction';

describe('Transactions functional tests', () => {
  beforeAll(async () => await TransactionsModel.remove());
  describe('When creating a transaction', () => {
    it('should create a transaction with success', async () => {
      const newTransaction = {
        ticker: 'ROXO34',
        price: 25.69,
        quantity: 8,
        tickerType: 'bdr',
        type: 'buy',
        date: '01/02/2024',
      };

      const expectedResponse = {
        date: '2024-01-02',
        price: '25.69000000',
        quantity: '8.00000000',
        ticker: 'ROXO34',
        tickerType: 'bdr',
        type: 'buy',
      };

      const response = await global.testRequest
        .post('/transactions')
        .send(newTransaction);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(expectedResponse));
    });

    it('should return 422 when there is a validation error', async () => {
      const newTransaction = {
        ticker: 'ROXO34',
        price: 25.69,
        quantity: 8,
        tickerType: 'bdr',
        type: 'buy',
        date: 'wrong-date',
      };

      const { status, body } = await global.testRequest
        .post('/transactions')
        .send(newTransaction);
      expect(status).toBe(422);
      expect(body).toEqual({
        error: 'Transaction validation error: Invalid date',
      });
    });
  });
});
