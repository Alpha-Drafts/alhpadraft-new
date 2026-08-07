import type { NextApiRequest, NextApiResponse } from "next";
import { body } from "express-validator";

import { validateRequest } from "@/middleware";
import { verifyAccessCookie } from "@/utils/auth/serverSession";
import { send500Error, send200Success, send405MethodNotAllowed } from "@/utils";
import axios from "axios";

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

/** 🔹 CREATE NEW ITEM */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // const loggedInUserId = req.user!.uid;

    const {
      text,
      // sent_scores = true,
      score_string = true,
      // version = "20240606",
    } = req.body;

    const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

    const apiKey = isProduction
      ? process.env.SAPLING_API_KEY_PROD
      : process.env.SAPLING_API_KEY_DEV;

    if (!apiKey) {
      return send500Error({
        res,
        message: "Sapling API key not configured",
        error: new Error("Sapling API key not configured"),
      });
    }

    const response = await axios.post(
      "https://api.sapling.ai/api/v1/aidetect",
      {
        key: apiKey,
        text,
        // sent_scores,  this isn't necessary in our use case since the default is true and we are also using true
        score_string,
        // version, adding this specific version (20240606) gives us this error: Unexpected error running classification: Expecting value: line 1 column 1 (char 0). Since we are not adding it, it uses the default version (20251027) which works fine.
      },
    );

    return send200Success({
      res,
      message: "Sapling AI detection successful",
      data: response.data,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const statusCode = err?.response?.status ?? 500;
    const msg = err?.response?.data?.msg ?? err?.message ?? "An error occurred";
    res
      .status(statusCode)
      .json({ status: "error", message: msg, code: statusCode });
  }
}

const postValidationRules = [
  body("text").isString().notEmpty().withMessage("Text is required"),
  // body("sent_scores").optional().isBoolean(),
  body("score_string").optional().isBoolean(),
  // body("version").optional().isString(),
];
