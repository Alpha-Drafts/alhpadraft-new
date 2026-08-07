import type { NextApiRequest, NextApiResponse } from "next";
import { body } from "express-validator";

import { validateRequest } from "@/middleware";
import { verifyAccessCookie } from "@/utils/auth/serverSession";
import { send500Error, send200Success, send405MethodNotAllowed } from "@/utils";
import axios from "axios";
import { WINSTON_API_BASE_URL, WINSTON_API_ENDPOINTS } from "@/constants";
import {
  MOCK_PLAGIARISM_FAIL_RESPONSE,
  MOCK_PLAGIARISM_PASS_RESPONSE,
  USE_WINSTON_MOCK,
} from "@/constants/winstonMock";
import { getApiErrorMessage } from "@/utils";

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

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      text,
      language = "auto",
      country = "us",
      excluded_sources,
      mockPlagiarismFail = true,
    } = req.body as {
      text: string;
      language?: string;
      country?: string;
      excluded_sources?: string[];
      mockPlagiarismFail?: boolean;
    };

    if (USE_WINSTON_MOCK) {
      const mockData =
        mockPlagiarismFail === true
          ? MOCK_PLAGIARISM_FAIL_RESPONSE
          : MOCK_PLAGIARISM_PASS_RESPONSE;
      return send200Success({
        res,
        message: `Winston.ai plagiarism detection successful (mock${mockPlagiarismFail === true ? ", fail scenario" : ""})`,
        data: mockData,
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

    const requestBody: {
      text: string;
      language: string;
      country: string;
      excluded_sources?: string[];
    } = {
      text,
      language,
      country,
    };

    if (excluded_sources && Array.isArray(excluded_sources)) {
      requestBody.excluded_sources = excluded_sources;
    }

    const response = await axios.post(
      `${WINSTON_API_BASE_URL}${WINSTON_API_ENDPOINTS.PLAGIARISM}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return send200Success({
      res,
      message: "Winston.ai plagiarism detection successful",
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
    .isLength({ min: 100 })
    .withMessage("Text must be at least 100 characters"),
  body("language").optional().isString(),
  body("country").optional().isString(),
  body("excluded_sources").optional().isArray(),
  body("mockPlagiarismFail").optional().isBoolean(), // Only used when USE_WINSTON_MOCK=true
];
