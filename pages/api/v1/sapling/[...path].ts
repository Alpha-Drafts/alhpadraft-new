import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const SAPLING_API_URL = "https://api.sapling.ai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the API key from server-side environment variable
    const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
    const apiKey = isProduction
      ? process.env.SAPLING_API_KEY_PROD
      : process.env.SAPLING_API_KEY_DEV;

    if (!apiKey) {
      console.error("Sapling API key not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Extract the path from the dynamic route
    const { path } = req.query;

    if (!path || !Array.isArray(path)) {
      return res.status(400).json({ error: "Invalid path" });
    }

    // Reconstruct the original Sapling API path
    const saplingPath = "/" + path.join("/");
    const requestUrl = `${SAPLING_API_URL}${saplingPath}`;

    // Add the API key to the request body
    const requestBody = {
      ...req.body,
      key: apiKey,
    };

    console.info(`Proxying request to: ${requestUrl}`);

    // Make the request to Sapling API
    const response = await axios({
      url: requestUrl,
      method: "POST",
      data: requestBody,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the response from Sapling
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Sapling proxy error:", error);

    if (axios.isAxiosError(error)) {
      // If it's an Axios error, we can get more specific information
      const status = error.response?.status || 500;
      const message =
        error.response?.data?.message || "Request to Sapling API failed";
      return res.status(status).json({ error: message });
    }

    // Generic error fallback
    res.status(500).json({ error: "Internal server error" });
  }
}
