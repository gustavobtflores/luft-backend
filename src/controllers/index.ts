import { ZodError } from 'zod';
import { Response } from 'express';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: ZodError | Error
  ) {
    if (error instanceof ZodError) {
      //TODO: implementar uma classe de erro (talvez ValidationError()) para tratar melhor os erros de validação
      // retornar para o front-end algo no formato {fields: {date: 'Invalid date', price: 'Price must be a number'}}
      //SOLUTION: no fim das contas o zod tem um método pra isso :P
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
