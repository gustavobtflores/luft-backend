import * as UserModel from '@src/models/user';

describe('Users functional tests', () => {
  beforeEach(async () => {
    await UserModel.remove();
  });
  describe('When creating a user', () => {
    it('should create a new user with success', async () => {
      const newUser = {
        email: 'john@email.com',
        name: 'John Doe',
        password: 'password',
      };

      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({ ...newUser, password: expect.any(String) })
      );
    });

    it('should return 422 when there is a validation error', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'johndoe@email.com',
      };

      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: { password: ['password is required'] },
      });
    });
  });

  describe('When authenticating a user', () => {
    it('should generate a token for a valid user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: 'password',
      };

      await UserModel.create(newUser);
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });

      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });
  });
});
