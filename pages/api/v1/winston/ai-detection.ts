import type { NextApiRequest, NextApiResponse } from "next";
import { body } from "express-validator";

import { validateRequest } from "@/middleware";
import { verifyAccessCookie } from "@/utils/auth/serverSession";
import { send500Error, send200Success, send405MethodNotAllowed } from "@/utils";
import axios from "axios";
import { WINSTON_API_BASE_URL, WINSTON_API_ENDPOINTS } from "@/constants";
import {
  MOCK_AI_DETECTION_RESPONSE,
  USE_WINSTON_MOCK,
} from "@/constants/winstonMock";
import { getApiErrorMessage } from "@/utils";

/** 🔹 BACKEND-SESSION API ROUTE HANDLER */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Require a valid session (httpOnly access_token cookie)
  if (!verifyAccessCookie(req)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "POST":
      return validateRequest(postValidationRules)(req, res, async () =>
        handlePost(req, res),
      );
    default:
      return send405MethodNotAllowed({
        res,
        message: `${req.method} method not allowed`,
      });
  }
}

/** 🔹 WINSTON.AI AI DETECTION */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { text, sentences = true, version, language = "auto" } = req.body;

    if (USE_WINSTON_MOCK) {
      return send200Success({
        res,
        message: "Winston.ai AI detection successful (mock)",
        data: MOCK_AI_DETECTION_RESPONSE,
      });
    }

    const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
    const apiKey = isProduction
      ? process.env.WINSTON_API_KEY_PROD
      : process.env.WINSTON_API_KEY_DEV;

    if (!apiKey) {
      return send500Error({
        res,
        message: "Winston.ai API key not configured",
        error: new Error("Winston.ai API key not configured"),
      });
    }

    const response = await axios.post(
      `${WINSTON_API_BASE_URL}${WINSTON_API_ENDPOINTS.AI_DETECTION}`,
      {
        text,
        sentences,
        ...(version && { version }),
        language,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return send200Success({
      res,
      message: "Winston.ai AI detection successful",
      data: response.data,
    });
  } catch (err: unknown) {
    const { message, statusCode } = getApiErrorMessage(
      err,
      "An error occurred",
    );
    res.status(statusCode).json({ status: "error", message, code: statusCode });
  }
}

const postValidationRules = [
  body("text")
    .isString()
    .notEmpty()
    .withMessage("Text is required")
    .isLength({ min: 300 })
    .withMessage("Text must be at least 300 characters"),
  body("sentences").optional().isBoolean(),
  body("version").optional().isString(),
  body("language").optional().isString(),
];
