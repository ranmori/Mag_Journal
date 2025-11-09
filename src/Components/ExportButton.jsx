// components/ExportButton.jsx
import { useState } from "react";

const ExportButton = ({ issue, pages, className = "" }) => {
  const [exporting, setExporting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Add title and metadata
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("MY MAGAZINE JOURNAL", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

      doc.setFontSize(16);
      doc.text(
        `Volume ${issue.volume} - Issue ${issue.issueNumber}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 10;

      doc.setFontSize(14);
      doc.text(issue.title, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 20;

      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Add content for each page
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      pages.forEach((page, pageIndex) => {
        if (pageIndex > 0) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(page.title.toUpperCase(), pageWidth / 2, yPosition, {
          align: "center",
        });
        yPosition += 10;

        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        const lines = doc.splitTextToSize(page.content, pageWidth - 2 * margin);

        lines.forEach((line) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }

          const boldRegex = /\*\*(.*?)\*\*/g;
          let match;
          let lastIndex = 0;
          let hasBold = false;

          while ((match = boldRegex.exec(line)) !== null) {
            hasBold = true;
            if (match.index > lastIndex) {
              doc.setFont("helvetica", "normal");
              doc.text(
                line.substring(lastIndex, match.index),
                margin,
                yPosition
              );
            }
            doc.setFont("helvetica", "bold");
            doc.text(
              match[1],
              margin + doc.getTextWidth(line.substring(lastIndex, match.index)),
              yPosition
            );
            lastIndex = match.index + match[0].length;
          }

          if (!hasBold) {
            doc.setFont("helvetica", "normal");
            doc.text(line, margin, yPosition);
          } else if (lastIndex < line.length) {
            doc.setFont("helvetica", "normal");
            doc.text(
              line.substring(lastIndex),
              margin + doc.getTextWidth(line.substring(0, lastIndex)),
              yPosition
            );
          }

          yPosition += 6;
        });

        yPosition += 10;
      });

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
        doc.text(
          `Exported on ${new Date().toLocaleDateString()}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        );
        doc.text("My Magazine Journal", margin, pageHeight - 10);
      }

      doc.save(`magazine-issue-${issue.volume}-${issue.issueNumber}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportToText = async () => {
    setExporting(true);
    try {
      const content = `
MY MAGAZINE JOURNAL

Volume ${issue.volume} - Issue ${issue.issueNumber}
${issue.title}
${"=".repeat(50)}

${pages
  .map(
    (page, index) => `
${page.title.toUpperCase()}
${"-".repeat(40)}

${page.content.replace(/\*\*(.*?)\*\*/g, "$1")}

${index < pages.length - 1 ? "\n" + "=".repeat(50) + "\n" : ""}
`
  )
  .join("")}

Exported on: ${new Date().toLocaleDateString()}
      `.trim();

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `magazine-issue-${issue.volume}-${issue.issueNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Text export failed:", err);
      alert("Text export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={exporting}
        className={`px-3 py-1 border-2 border-black bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-300 dark:hover:bg-gray-700 dark:disabled:bg-gray-600 ${className}`}
        style={{
          boxShadow: exporting ? "none" : "2px 2px 0px black",
          fontSize: "0.8rem",
        }}
      >
        {exporting ? "Exporting..." : "Export ▼"}
      </button>

      {menuOpen && !exporting && (
        <div
          className="absolute top-full left-0 mt-1 border-2 border-black bg-white dark:bg-gray-800 dark:border-gray-300"
          style={{ boxShadow: "2px 2px 0px black", zIndex: 50 }}
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              exportToPDF();
            }}
            className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ fontSize: "0.8rem" }}
          >
            Export as PDF
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              exportToText();
            }}
            className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ fontSize: "0.8rem" }}
          >
            Export as Text
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
