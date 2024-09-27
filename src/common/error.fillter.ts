import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        errors: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      if (process.env.NODE_ENV === 'development') {
        // Detailed error in development mode
        const zodErrors = exception.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        response.status(400).json({
          errors: zodErrors,
        });
      } else {
        // Generic error message in production mode
        response.status(400).json({
          errors: 'Validation error',
        });
      }
    } else {
      response.status(500).json({
        errors: exception.message,
      });
    }
  }
}
