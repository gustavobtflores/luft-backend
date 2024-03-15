import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import * as UserModel from '@src/models/user';
import { ZodError, z } from 'zod';
import { BaseController } from '.';

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

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response) {
    try {
      await userSchema.parseAsync(req.body);
      const newUser = await UserModel.create(req.body);

      res.status(201).send(newUser[0]);
    } catch (err) {
      this.sendCreatedUpdateErrorResponse(res, err as Error | ZodError);
    }
  }
}
