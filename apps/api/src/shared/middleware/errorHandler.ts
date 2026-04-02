import { Request, Response, ErrorRequestHandler } from "express";

import { z } from "zod";

import AppError, { AppErrorCode } from "@/shared/utils/AppError";
import { deleteAuthCookie } from "@/shared/utils/cookies";

import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from "@/shared/constants/httpStatusCodes";

const handleZodError = (err: z.ZodError, req: Request, res: Response) => {
  console.error(
    `PATH: ${req.path} - ZodError:`,
    z.flattenError(err).fieldErrors,
  );
  const error = {
    ...z.flattenError(err).fieldErrors,
    ...z.flattenError(err).formErrors,
  };
  return res.status(BAD_REQUEST).json({ error });
};

const handleAppError = (err: AppError, req: Request, res: Response) => {
  if (err.statusCode === INTERNAL_SERVER_ERROR) {
    console.error(`PATH: ${req.path} - AppError:`, err);
  }

  if (err.errorCode == AppErrorCode.AuthError) {
    deleteAuthCookie(res);
  }

  return res
    .status(err.statusCode)
    .json({ error: err.message, errorCode: err.errorCode });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof z.ZodError) {
    return handleZodError(err, req, res);
  }

  if (err instanceof AppError) {
    return handleAppError(err, req, res);
  }

  console.error(`PATH: ${req.path} - Unhandled error:`, err);

  return res
    .status(INTERNAL_SERVER_ERROR)
    .json({ error: "Internal server error" });
};

export default errorHandler;
