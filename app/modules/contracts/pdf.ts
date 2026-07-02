import PDFDocument from "pdfkit";

interface ContractForPdf {
  status: string;
  termsText: string;
  signerName: string | null;
  signedAt: Date | null;
  createdAt: Date;
  project: { name: string; siteAddress: string | null; customer: { name: string } | null };
}

export function renderContractPdf(contract: ContractForPdf, opts: { companyName: string }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text(opts.companyName, { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#2E75B6").text("Contract", { align: "left" });
    doc.fillColor("black");
    doc.moveDown(1);

    doc.fontSize(10).text(`Project: ${contract.project.name}`);
    if (contract.project.siteAddress) doc.text(`Site Address: ${contract.project.siteAddress}`);
    if (contract.project.customer) doc.text(`Customer: ${contract.project.customer.name}`);
    doc.text(`Contract Date: ${contract.createdAt.toLocaleDateString()}`);
    doc.moveDown(1);

    doc.fontSize(12).text("Terms", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(contract.termsText);
    doc.moveDown(1.5);

    doc.fontSize(12).text("Signature", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    if (contract.status === "signed" && contract.signerName && contract.signedAt) {
      doc.text(`Signed by: ${contract.signerName}`);
      doc.text(`Signed on: ${contract.signedAt.toLocaleDateString()}`);
    } else {
      doc.text("Signature: ____________________________");
      doc.text("Date: ____________________________");
    }

    doc.end();
  });
}
