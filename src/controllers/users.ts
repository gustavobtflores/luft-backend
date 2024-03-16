import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import * as UserModel from '@src/models/user';
import { ZodError, z } from 'zod';
import { BaseController } from '.';
import { AuthService } from '@src/services/auth';

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
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return;
    }

    if (
      !(await AuthService.comparePasswords(req.body.password, user.password))
    ) {
      return;
    }

    const token = AuthService.generateToken(user);
    res.status(200).send({ token });
  }
}
