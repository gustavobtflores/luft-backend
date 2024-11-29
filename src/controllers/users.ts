import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import * as UserModel from '@src/models/user';
import { ZodError, z } from 'zod';
import { BaseController } from '.';
import { AuthService } from '@src/services/auth';
import { authMiddleware } from '@src/middlewares/auth';

const userSchema = z.object({
  name: z.string({
    required_error: 'name is required',
  }),
  email: z.string({
    required_error: 'email is required',
  }),
  password: z.string({
    required_error: 'password is required',
  }),
});

const { shape } = userSchema;
const userCredentialsSchema = z.object({
  email: shape.email,
  password: shape.password,
});

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response) {
    try {
      await userSchema.parseAsync(req.body);
      const newUser = await UserModel.create(req.body);

      res.status(201).send(newUser);
    } catch (err) {
      this.sendCreatedUpdateErrorResponse(res, err as Error | ZodError);
    }
  }

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<void> {
    await userCredentialsSchema.parseAsync(req.body);
    const user = await UserModel.findOne({
      filters: { email: req.body.email },
    });

    if (!user) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found!',
      });
    }

    if (
      !(await AuthService.comparePasswords(req.body.password, user.password))
    ) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Email or password are wrong',
      });
    }

    const token = AuthService.generateToken({
      email: user.email,
      name: user.name,
      id: user.id,
    });

    const sevenDaysInMilliseconds = 1000 * 60 * 60 * 24 * 7;

    res
      .status(200)
      .cookie('accessToken', token, {
        maxAge: sevenDaysInMilliseconds,
        httpOnly: true,
      })
      .send({ accessToken: token });
  }

  @Get('me')
  @Middleware(authMiddleware)
  public async me(req: Request, res: Response) {
    try {
      const user = await UserModel.findOne({
        filters: { id: req.decoded?.id },
        columns: ['email', 'id', 'name'],
      });

      if (!user) {
        return this.sendErrorResponse(res, {
          code: 404,
          message: 'User not found',
        });
      }

      return res.status(200).send({ user });
    } catch (err) {
      return this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
