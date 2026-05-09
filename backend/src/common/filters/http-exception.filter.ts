import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exceptionResponse;
    } else if (exception.name === 'MulterError') {
      // Handle Multer specific errors
      status =
        exception.code === 'LIMIT_FILE_SIZE'
          ? HttpStatus.PAYLOAD_TOO_LARGE
          : HttpStatus.BAD_REQUEST;

      message =
        exception.code === 'LIMIT_FILE_SIZE'
          ? 'File is too large. Maximum size allowed is 10MB'
          : `File upload error: ${exception.message}`;
    } else {
      message = 'An unexpected error occurred. Please try again later.';
    }

    // Log the error for internal auditing
    // We log everything that isn't a standard HttpException to catch hidden bugs
    if (!(exception instanceof HttpException)) {
      console.error('--- NON-HTTP EXCEPTION ---');
      console.error(exception);
      console.error('--------------------------');
    } else if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('--- INTERNAL SERVER ERROR ---');
      console.error(exception);
      console.error('-----------------------------');
    }

    // The standard output structure
    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message[0] : message, // Standardized message
      data: null,
      error: {
        statusCode: status,
        type: exception.name || 'Error',
        details: exception.message || (Array.isArray(message) ? message : message),
        path: request.url,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
