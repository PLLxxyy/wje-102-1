import { BadRequestException, ValidationPipe } from '@nestjs/common';

export const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors) => {
    const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
    return new BadRequestException(messages.length > 0 ? messages : '参数校验失败');
  },
});
