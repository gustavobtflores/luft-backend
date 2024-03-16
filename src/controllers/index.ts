import { ZodError } from 'zod';
import { Response } from 'express';
import ApiError, { APIError } from '@src/utils/errors/api-error';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: ZodError | Error
  ) {
    if (error instanceof ZodError) {
      return res.status(422).send(
        ApiError.format({
          code: 422,
          message: 'Error validating request',
          params: (error as ZodError).formErrors.fieldErrors,
        })
      );
    }

    return res.status(422).send(
      ApiError.format({
        code: 422,
        message: error.message,
      })
    );
  }

  protected sendErrorResponse(res: Response, apiError: APIError) {
    res.status(apiError.code).send(ApiError.format(apiError));
  }
}
