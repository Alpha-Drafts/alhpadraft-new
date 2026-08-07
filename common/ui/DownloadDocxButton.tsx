import React from "react";
import { Button } from "@/common/ui/Button";
import { Download } from "lucide-react";
import { ProjectProps } from "@/types";
import { toast } from "react-toastify";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

export type DownloadDocxButtonProps = {
  project?: Partial<ProjectProps>;
  latestHtml?: string;
  isLoadingContent?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "plain" | "danger" | "link";
  text?: string;
  iconPosition?: "left" | "right";
};

const DownloadDocxButton: React.FC<DownloadDocxButtonProps> = ({
  project,
  latestHtml,
  isLoadingContent = false,
  className,
  size = "md",
  variant = "primary",
  text,
  iconPosition = "left",
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadDoc = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const title = project?.name || "Project";

      const headerHtml = `<h1 style="font-size:20pt;margin:0 0 6pt 0;">${title}</h1>`;

      const contentHtml =
        latestHtml ||
        (project?.description ? `<p>${project.description}</p>` : "") ||
        `<p>No content available for this project.</p>`;

      if (!contentHtml.trim() || contentHtml.trim() === "<p></p>") {
        throw new Error("No content available to download");
      }

      const fullHtml = `<div>${headerHtml}${contentHtml}</div>`;

      // Convert HTML to DOCX using a more robust approach
      const parseHtmlToDocx = (html: string): (Paragraph | Table)[] => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return processElement(tempDiv);
      };

      const processElement = (element: Element): (Paragraph | Table)[] => {
        const results: (Paragraph | Table)[] = [];
        const tag = element.tagName.toLowerCase();

        // Process child nodes recursively
        const processChildren = (el: Element): (Paragraph | Table)[] => {
          const childrenResults: (Paragraph | Table)[] = [];

          Array.from(el.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent?.trim();
              if (text) {
                if (
                  childrenResults.length > 0 &&
                  childrenResults[childrenResults.length - 1] instanceof
                    Paragraph
                ) {
                  const lastParagraph = childrenResults[
                    childrenResults.length - 1
                  ] as Paragraph;
                  lastParagraph.addChildElement(new TextRun(text));
                } else {
                  childrenResults.push(
                    new Paragraph({
                      children: [new TextRun(text)],
                      spacing: { after: 100 },
                    }),
                  );
                }
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              childrenResults.push(...processElement(node as Element));
            }
          });

          return childrenResults;
        };

        switch (tag) {
          case "div":
            results.push(...processChildren(element));
            break;

          case "h1":
            results.push(
              new Paragraph({
                children: [new TextRun(element.textContent || "")],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
              }),
            );
            break;

          case "h2":
            results.push(
              new Paragraph({
                children: [new TextRun(element.textContent || "")],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
            );
            break;

          case "h3":
            results.push(
              new Paragraph({
                children: [new TextRun(element.textContent || "")],
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 200 },
              }),
            );
            break;

          case "p":
            if (element.textContent?.trim()) {
              results.push(
                new Paragraph({
                  children: [new TextRun(element.textContent.trim())],
                  spacing: { before: 100, after: 200 },
                }),
              );
            }
            break;

          case "ul":
            element.querySelectorAll("li").forEach(li => {
              if (li.textContent?.trim()) {
                results.push(
                  new Paragraph({
                    children: [new TextRun(li.textContent.trim())],
                    bullet: { level: 0 },
                    spacing: { after: 100 },
                  }),
                );
              }
            });
            break;

          case "ol":
            element.querySelectorAll("li").forEach(li => {
              if (li.textContent?.trim()) {
                results.push(
                  new Paragraph({
                    children: [new TextRun(li.textContent.trim())],
                    numbering: {
                      reference: "default-numbering",
                      level: 0,
                    },
                    spacing: { after: 100 },
                  }),
                );
              }
            });
            break;

          case "table":
            const rows: TableRow[] = [];
            element.querySelectorAll("tr").forEach(tr => {
              const cells: TableCell[] = [];
              tr.querySelectorAll("td, th").forEach(cell => {
                const isHeader = cell.tagName.toLowerCase() === "th";
                cells.push(
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: cell.textContent?.trim() || "",
                            bold: isHeader,
                          }),
                        ],
                      }),
                    ],
                  }),
                );
              });
              rows.push(new TableRow({ children: cells }));
            });
            if (rows.length > 0) {
              results.push(new Table({ rows }));
            }
            break;

          case "strong":
          case "b":
            if (element.textContent?.trim()) {
              results.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: element.textContent.trim(),
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              );
            }
            break;

          case "em":
          case "i":
            if (element.textContent?.trim()) {
              results.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: element.textContent.trim(),
                      italics: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              );
            }
            break;

          case "br":
            results.push(
              new Paragraph({
                children: [new TextRun({ break: 1 })],
              }),
            );
            break;

          default:
            // For unknown tags, process children
            results.push(...processChildren(element));
        }

        return results;
      };

      // Parse the HTML
      const docxContent = parseHtmlToDocx(fullHtml);

      const doc = new Document({
        sections: [
          {
            properties: {},
            children:
              docxContent.length > 0
                ? docxContent
                : [
                    new Paragraph({
                      children: [new TextRun("No content available.")],
                    }),
                  ],
          },
        ],
        numbering: {
          config: [
            {
              reference: "default-numbering",
              levels: [
                {
                  level: 0,
                  format: "decimal",
                  text: "%1.",
                  alignment: AlignmentType.START,
                },
              ],
            },
          ],
        },
        styles: {
          paragraphStyles: [
            {
              id: "Normal",
              name: "Normal",
              basedOn: "Normal",
              next: "Normal",
              run: {
                font: "Times New Roman",
                size: 24, // 12pt in half-points
              },
              paragraph: {
                spacing: { line: 360 }, // 1.5 line spacing
              },
            },
            {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              run: {
                font: "Times New Roman",
                size: 32, // 16pt
                bold: true,
              },
              paragraph: {
                spacing: { before: 400, after: 200 },
              },
            },
            {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              run: {
                font: "Times New Roman",
                size: 24, // 12pt
                bold: true,
              },
              paragraph: {
                spacing: { before: 300, after: 200 },
              },
            },
          ],
        },
      });

      const blob = await Packer.toBlob(doc);
      const safeName = (project?.name || "project")
        .replace(/[<>:"/\\|?*\x00-\x1F]+/g, "-")
        .slice(0, 100);

      saveAs(blob, `${safeName}.docx`);
    } catch (e) {
      console.error("Document download failed:", e);
      toast.error(
        e instanceof Error
          ? e.message
          : "Failed to generate document. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const label =
    isDownloading || isLoadingContent
      ? "Preparing..."
      : (text ?? "Download DOC");
  const disabled = isDownloading || !!isLoadingContent;

  return (
    <Button
      text={label}
      size={size}
      icon={<Download className="size-4" />}
      iconPosition={iconPosition}
      variant={variant}
      className={className}
      onClick={handleDownloadDoc}
      disabled={disabled}
    />
  );
};

export default DownloadDocxButton;
