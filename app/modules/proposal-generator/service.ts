import PDFDocument from "pdfkit";
import { prisma } from "../../db/client";
import { ApiError } from "../../api/middleware/errorHandler";
import { GenerateProposalInput, ProposalDocument } from "./types";

const DEFAULT_TERMS =
  "This proposal is valid for 30 days from the date issued. A 50% deposit is due upon acceptance, " +
  "with the balance due upon completion. Any changes to the scope of work described above will be " +
  "documented and priced via a separate change order.";

// Proposal Generator module: converts a finalized estimate into a branded,
// customer-facing PDF proposal. Defaults to a lump-sum presentation with
// optional expandable line-item detail, per the Architecture doc's Closing
// recommendation that most contractors want a defensible price, not a
// 500-line breakdown.
export class ProposalGeneratorService {
  async generateProposal(input: GenerateProposalInput): Promise<ProposalDocument> {
    const estimate = await prisma.estimate.findFirst({
      where: { id: input.estimateId, orgId: input.orgId },
      include: {
        lineItems: { orderBy: { sortOrder: "asc" } },
        project: { include: { customer: true } },
      },
    });
    if (!estimate) throw new ApiError(404, `Estimate ${input.estimateId} not found`);

    const buffer = await renderProposalPdf(estimate, {
      companyName: input.companyName ?? "Your Company Name",
      showLineItemDetail: input.showLineItemDetail ?? false,
      termsAndConditions: input.termsAndConditions ?? DEFAULT_TERMS,
    });

    return {
      buffer,
      filename: `proposal-${estimate.project.name.replace(/\s+/g, "-").toLowerCase()}-v${estimate.version}.pdf`,
      contentType: "application/pdf",
    };
  }
}

interface EstimateWithRelations {
  id: string;
  version: number;
  subtotalCost: unknown;
  overheadPct: unknown;
  totalPrice: unknown;
  createdAt: Date;
  project: { name: string; siteAddress: string | null; customer: { name: string; email: string | null } | null };
  lineItems: { description: string; quantity: unknown; unitOfMeasure: string; unitCost: unknown; lineCost: unknown }[];
}

function renderProposalPdf(
  estimate: EstimateWithRelations,
  opts: { companyName: string; showLineItemDetail: boolean; termsAndConditions: string }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text(opts.companyName, { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#2E75B6").text("Project Proposal", { align: "left" });
    doc.fillColor("black");
    doc.moveDown(1);

    doc.fontSize(10).text(`Project: ${estimate.project.name}`);
    if (estimate.project.siteAddress) doc.text(`Site Address: ${estimate.project.siteAddress}`);
    if (estimate.project.customer) {
      doc.text(`Customer: ${estimate.project.customer.name}`);
      if (estimate.project.customer.email) doc.text(`Email: ${estimate.project.customer.email}`);
    }
    doc.text(`Proposal Date: ${estimate.createdAt.toLocaleDateString()}`);
    doc.text(`Estimate Version: ${estimate.version}`);
    doc.moveDown(1);

    if (opts.showLineItemDetail) {
      doc.fontSize(12).text("Scope of Work", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      for (const li of estimate.lineItems) {
        const qty = Number(li.quantity);
        const lineCost = Number(li.lineCost);
        doc.text(`${li.description}  —  ${qty} ${li.unitOfMeasure}  —  $${lineCost.toFixed(2)}`);
      }
      doc.moveDown(1);
    } else {
      doc.fontSize(12).text("Scope of Work", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      for (const li of estimate.lineItems) {
        doc.text(`• ${li.description}`);
      }
      doc.moveDown(1);
    }

    doc.fontSize(12).text("Investment Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Project Price: $${Number(estimate.totalPrice).toFixed(2)}`, { align: "right" });
    doc.moveDown(1.5);

    doc.fontSize(10).fillColor("#666666").text("Terms & Conditions", { underline: true });
    doc.fontSize(9).text(opts.termsAndConditions);
    doc.fillColor("black");

    doc.end();
  });
}
