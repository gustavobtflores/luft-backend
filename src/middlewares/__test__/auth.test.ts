import { AuthService } from '@src/services/auth';
import { authMiddleware } from '../auth';

describe('AuthMiddleware', () => {
  it('should verify a JWT token and call the next middleware', () => {
    const jwtToken = AuthService.generateToken({ data: 'fake' });
    const reqFake = {
      cookies: {
        accessToken: jwtToken,
      },
    };

    const resFake = {};

    const nextFake = jest.fn();

    authMiddleware(reqFake, resFake, nextFake);
    expect(nextFake).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED if there is a problem on the token validation', () => {
    const reqFake = {
      cookies: {
        accessToken: 'invalid-token',
      },
    };

    const sendMock = jest.fn();

    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };

    const nextFake = jest.fn();

    authMiddleware(reqFake, resFake as object, nextFake);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });

  it('should return UNAUTHORIZED if there is no token', () => {
    const reqFake = {
      cookies: {
        accessToken: 'invalid-token',
      },
    };

    const sendMock = jest.fn();

    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };

    const nextFake = jest.fn();

    authMiddleware(reqFake, resFake as object, nextFake);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });
});
