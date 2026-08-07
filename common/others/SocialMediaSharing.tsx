import React, { useState } from "react";
import { Copy, Link } from "lucide-react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import {
  TwitterShareButton,
  FacebookShareButton,
  InstapaperShareButton,
} from "next-share";
import { toast } from "react-toastify";
import { SocialMediaSharingProps } from "@/types";

/**
 * A component that provides social media sharing functionality
 * @param {string} link - The URL to be shared
 * @param {string} title - The title of the content being shared
 */

export const SocialMediaSharing = ({
  link,
  title,
}: SocialMediaSharingProps) => {
  // State to manage copy feedback
  const [isCopied, setIsCopied] = useState(false);

  // Common styling for social media icons
  const icon = "h-6 w-6 text-primary-600 group-hover:text-white";
  const iconCon =
    "p-2.5 border border-primary-600 rounded-full hover:bg-primary-500 transition-colors group";

  // Handle copy to clipboard functionality
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link. Please try again.");
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <section className="relative w-full overflow-auto rounded-[20px] bg-white px-7 py-8">
      {/* Title */}
      <h2 className="text-body-bold-20">{title}</h2>

      <hr className="mt-4 mb-6 border-neutral-200" />

      <div className="mb-7 flex overflow-hidden rounded-[10px] border border-neutral-100">
        <div
          className="flex flex-1 items-center justify-start gap-2 p-2.5 py-3"
          style={{
            maxWidth: "calc(100% - 100px)",
          }}
        >
          <Link size={16} className="min-w-4" />
          <span className="text-body-semibold-14 truncate" title={link}>
            {link}
          </span>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex w-[100px] items-center justify-center gap-2 bg-neutral-100 p-2.5 py-3 transition hover:bg-neutral-200"
          disabled={isCopied}
        >
          <Copy size={16} />
          <span className="text-body-semibold-14 text-black">
            {isCopied ? "Copied!" : "Copy"}
          </span>
        </button>
      </div>

      {/* Social icons */}
      <div className="flex justify-center gap-4">
        <FacebookShareButton url={link} quote={title}>
          <div className={iconCon}>
            <Facebook className={icon} />
          </div>
        </FacebookShareButton>

        <TwitterShareButton url={link} title={title}>
          <div className={iconCon}>
            <Twitter className={icon} />
          </div>
        </TwitterShareButton>

        <InstapaperShareButton url={link}>
          <div className={iconCon}>
            <Instagram className={icon} />
          </div>
        </InstapaperShareButton>
      </div>
    </section>
  );
};
