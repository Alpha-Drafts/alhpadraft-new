/**
 * This middleware function takes an array of validation rules and returns a new function that runs all the rules on the incoming request.
 * If there are any validation errors, it returns a 400 status code with the error messages.
 * Otherwise, it calls the next function in the middleware chain.
 */

import { send400ValidationError } from "@/utils";
import { validationResult, ValidationChain } from "express-validator";
import { NextApiRequest, NextApiResponse } from "next"; // No need for AuthenticatedRequest

export const validateRequest = (rules: ValidationChain[]) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>,
  ) => {
    // Run all validation rules on the incoming request
    await Promise.all(rules.map(rule => rule.run(req)));

    // Gather validation errors, if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, return a 400 response with error details
      return send400ValidationError({
        res,
        message: "Validation failed",
        error: errors.array(),
      });
    }

    // If validation passes, proceed to the next middleware or handler
    await next();
  };
};
