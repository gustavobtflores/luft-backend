import * as UserModel from '@src/models/user';
import * as TransactionsModel from '@src/models/transaction';
import { AuthService } from '@src/services/auth';

describe('Transactions functional tests', () => {
  const defaultUser = {
    email: 'john@email.com',
    name: 'John Doe',
    password: 'password',
  };
  let token: string;
  beforeEach(async () => {
    await TransactionsModel.remove();
    await UserModel.remove();
    const user = await UserModel.create(defaultUser);
    token = AuthService.generateToken(user);
  });
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
        price: 25.69,
        quantity: 8,
        ticker: 'ROXO34',
        tickerType: 'bdr',
        type: 'buy',
      };

      const response = await global.testRequest
        .post('/transactions')
        .set({ 'x-access-token': token })
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
        .set({ 'x-access-token': token })
        .send(newTransaction);
      expect(status).toBe(422);
      expect(body).toEqual({
        code: 422,
        error: { date: ['Invalid date'] },
      });
    });
  });
});
