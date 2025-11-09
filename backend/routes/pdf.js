
import express from "express";
import pdfkit from "pdfkit";
import fs from "fs";
import path from "path";

const router = express.Router();

// POST /api/issues/export
router.post("/export", async (req, res) => {
  try {
    const { title, subtitle, volume, issueNumber, foreword, reflections, lessons, images } = req.body;

    // Create a new PDF document
    const doc = new pdfkit({ size: "A4", margin: 50 });

    // Define the path to save temporarily
    const fileName = `${title || "Issue"}_${Date.now()}.pdf`;
    const filePath = path.join("uploads", fileName);

    // Pipe to file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Title
    doc.fontSize(22).text(title || "Untitled Issue", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text(subtitle || "", { align: "center" });
    doc.moveDown();

    // Volume / Issue number
    doc.fontSize(12).text(`Volume: ${volume || "-"}`, { align: "left" });
    doc.text(`Issue Number: ${issueNumber || "-"}`, { align: "left" });
    doc.moveDown();

    // Sections
    doc.fontSize(14).text("Foreword", { underline: true });
    doc.fontSize(12).text(foreword || "N/A");
    doc.moveDown();

    doc.fontSize(14).text("Reflections", { underline: true });
    doc.fontSize(12).text(reflections || "N/A");
    doc.moveDown();

    doc.fontSize(14).text("Lessons", { underline: true });
    doc.fontSize(12).text(lessons || "N/A");
    doc.moveDown();

    // Images
    if (images && images.length > 0) {
      doc.addPage();
      doc.fontSize(14).text("Images", { underline: true });
      for (const img of images) {
        if (img.url) {
          try {
            doc.image(img.url, { width: 300 });
          } catch {
            doc.text(`(Could not load image: ${img.url})`);
          }
          doc.moveDown();
        }
      }
    }

    // Finish PDF
    doc.end();

    // Wait for the file to be written
    writeStream.on("finish", () => {
      res.download(filePath, fileName, (err) => {
        if (err) console.error("Error downloading:", err);
        // Delete the file after sending
        fs.unlink(filePath, () => {});
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

export default router;



