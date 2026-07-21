/**
 * Direct-download PDF export (no browser print dialog).
 *
 * The document is already laid out and paginated in the DOM as fixed A4 `.page`
 * sheets, so we rasterise each sheet and place it, full-bleed, onto an A4 page
 * of a jsPDF document. Everything runs in the browser against the live pages, so
 * the PDF matches the on-screen quotation exactly.
 *
 * The heavy libraries (`jspdf`, `html2canvas-pro`) are imported on demand so they
 * never load during SSR or on first paint.
 */
export async function exportInvoicePdf(fileName: string): Promise<void> {
  const scaler = document.querySelector<HTMLElement>(".doc-scaler");
  const pages = scaler ? Array.from(scaler.querySelectorAll<HTMLElement>(".page")) : [];
  if (!scaler || pages.length === 0) {
    throw new Error("Open the document view and try again.");
  }

  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);

  // Reset the on-screen zoom, strip sheet chrome, and hide editor-only controls
  // for the duration of the capture.
  scaler.classList.add("pdf-exporting");
  try {
    // Wait for the web font and let the zoom-reset layout settle before capturing.
    await document.fonts?.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i += 1) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      if (i > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
    }

    pdf.save(fileName);
  } finally {
    scaler.classList.remove("pdf-exporting");
  }
}
