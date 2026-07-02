import PDFDocument from "pdfkit";

interface InvoiceForPdf {
  invoiceNumber: number;
  type: string;
  status: string;
  amount: number;
  dueDate: Date | null;
  createdAt: Date;
  percentComplete: number | null;
  project: { name: string; siteAddress: string | null; customer: { name: string; email: string | null } | null };
  lineItems: { description: string; quantity: number; unitOfMeasure: string; unitCost: number; lineCost: number }[];
}

export function renderInvoicePdf(invoice: InvoiceForPdf, opts: { companyName: string }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text(opts.companyName, { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#2E75B6").text(`Invoice #${invoice.invoiceNumber}`, { align: "left" });
    doc.fillColor("black");
    doc.moveDown(1);

    doc.fontSize(10).text(`Project: ${invoice.project.name}`);
    if (invoice.project.siteAddress) doc.text(`Site Address: ${invoice.project.siteAddress}`);
    if (invoice.project.customer) {
      doc.text(`Customer: ${invoice.project.customer.name}`);
      if (invoice.project.customer.email) doc.text(`Email: ${invoice.project.customer.email}`);
    }
    doc.text(`Invoice Date: ${invoice.createdAt.toLocaleDateString()}`);
    if (invoice.dueDate) doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`);
    if (invoice.type === "progress" && invoice.percentComplete != null) {
      doc.text(`Progress Billing: ${Number(invoice.percentComplete).toFixed(1)}% complete`);
    }
    doc.moveDown(1);

    doc.fontSize(12).text("Line Items", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    for (const li of invoice.lineItems) {
      doc.text(`${li.description}  —  ${li.quantity} ${li.unitOfMeasure}  —  $${li.lineCost.toFixed(2)}`);
    }
    doc.moveDown(1.5);

    doc.fontSize(12).text("Amount Due", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`$${invoice.amount.toFixed(2)}`, { align: "right" });

    doc.end();
  });
}
