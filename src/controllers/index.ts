import { ZodError } from 'zod';
import { Response } from 'express';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: ZodError | Error
  ) {
    if (error instanceof ZodError) {
      res.status(422).send({
        code: 422,
        error: (error as ZodError).formErrors.fieldErrors,
      });
    } else {
      res.status(500).send({
        code: 500,
        error: 'Something went wrong',
      });
    }
  }
}
