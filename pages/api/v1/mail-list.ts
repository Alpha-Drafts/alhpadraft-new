import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";

type ResponseData = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { name, email } = req.body;

    const apiToken = process.env.SENDER_API_TOKEN;

    if (!apiToken) {
      console.error("SENDER_API_TOKEN is not configured.");
      return res.status(500).json({
        success: false,
        message: "SENDER_API_TOKEN is not configured.",
      });
    }

    const senderGroupId = process.env.SENDER_NEW_USERS_GROUP;

    if (!senderGroupId) {
      console.error("SENDER_NEW_USERS_GROUP is not configured.");
      return res.status(500).json({
        success: false,
        message: "SENDER_NEW_USERS_GROUP is not configured.",
      });
    }

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const splittedName = name.split(" ");

    const formBody = {
      email,
      firstname: splittedName[0],
      lastname: splittedName[1],
      groups: [senderGroupId],
    };

    const response = await axios.post(
      "https://api.sender.net/v2/subscribers",
      formBody,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return res.status(response.status).json({ success: true });
  } catch (error: unknown) {
    console.error("Error in /api/v1/mail-list handler:", error);
    const status = (error as AxiosError).response?.status ?? 500;
    return res
      .status(status)
      .json({ success: false, message: "Internal server error" });
  }
}
