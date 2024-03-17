import * as UserModel from '@src/models/user';
import { AuthService } from '@src/services/auth';

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
        error: 'Unprocessable Entity',
        message: 'Error validating request',
        params: {
          password: ['password is required'],
        },
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

  describe('When getting user profile info', () => {
    it("should return the token's owner information", async () => {
      const newUser = {
        email: 'john@email.com',
        name: 'John Doe',
        password: 'password',
      };

      const user = await UserModel.create(newUser);

      const token = AuthService.generateToken(user);

      const response = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user: { email: user.email, id: user.id, name: user.name },
      });
    });

    it("should return Not Found when the user doesn't exist", async () => {
      const newUser = {
        email: 'john@email.com',
        name: 'John Doe',
        password: 'password',
      };

      const token = AuthService.generateToken(newUser);

      const { body, status } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(404);
      expect(body.message).toBe('User not found');
    });
  });
});
