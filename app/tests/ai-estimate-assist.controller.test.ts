const mockStructuredEstimator = {
  generateDraft: jest.fn(),
  applyReviewedDraft: jest.fn(),
};

const mockLegacyService = {
  generateSuggestions: jest.fn(),
  applySuggestions: jest.fn(),
};

jest.mock("../modules/ai-estimate-assist/structuredEstimator", () => ({
  StructuredAIEstimatorService: jest.fn().mockImplementation(() => mockStructuredEstimator),
}));
jest.mock("../modules/ai-estimate-assist/service", () => ({
  AIEstimateAssistService: jest.fn().mockImplementation(() => mockLegacyService),
}));

import { aiEstimateAssistController } from "../backend/controllers/aiEstimateAssist.controller";

function response() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
}

function authedRequest(body: unknown, params = { id: "10000000-0000-0000-0000-000000000001" }, role = "admin") {
  return {
    body,
    params,
    orgId: "org-from-auth",
    auth: {
      userId: "user-1",
      orgId: "org-from-auth",
      role,
    },
  } as never;
}

describe("aiEstimateAssistController structured estimator endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStructuredEstimator.generateDraft.mockResolvedValue({ estimateId: "estimate-1" });
    mockStructuredEstimator.applyReviewedDraft.mockResolvedValue({ applied: [], skipped: [] });
  });

  it("passes only authenticated org context into draft generation", async () => {
    const res = response();

    await aiEstimateAssistController.draftStructuredEstimate(
      authedRequest({
        scopeOfWork: "Replace 250 sq ft concrete.",
        limit: 3,
      }),
      res as never
    );

    expect(mockStructuredEstimator.generateDraft).toHaveBeenCalledWith({
      estimateId: "10000000-0000-0000-0000-000000000001",
      orgId: "org-from-auth",
      actorUserId: "user-1",
      scopeOfWork: "Replace 250 sq ft concrete.",
      limit: 3,
    });
  });

  it("rejects body org IDs and unknown generated price fields on apply", async () => {
    const res = response();

    await expect(
      aiEstimateAssistController.applyStructuredEstimate(
        authedRequest({
          orgId: "attacker-org",
          lineItems: [
            {
              draftLineItemId: "line-1",
              status: "accepted",
              targetId: "10000000-0000-0000-0000-000000000002",
              targetKind: "costItem",
              quantity: 1,
              unitCost: 0,
            },
          ],
        }),
        res as never
      )
    ).rejects.toThrow();
    expect(mockStructuredEstimator.applyReviewedDraft).not.toHaveBeenCalled();
  });

  it("rejects non-finite and oversized quantities before service apply", async () => {
    const res = response();

    await expect(
      aiEstimateAssistController.applyStructuredEstimate(
        authedRequest({
          lineItems: [
            {
              draftLineItemId: "line-1",
              status: "accepted",
              targetId: "10000000-0000-0000-0000-000000000002",
              targetKind: "costItem",
              quantity: "Infinity",
            },
          ],
        }),
        res as never
      )
    ).rejects.toThrow();
    expect(mockStructuredEstimator.applyReviewedDraft).not.toHaveBeenCalled();
  });

  it("requires write permission for structured apply", async () => {
    const res = response();

    await expect(
      aiEstimateAssistController.applyStructuredEstimate(
        authedRequest(
          {
            lineItems: [
              {
                draftLineItemId: "line-1",
                status: "accepted",
                targetId: "10000000-0000-0000-0000-000000000002",
                targetKind: "costItem",
                quantity: 1,
              },
            ],
          },
          { id: "10000000-0000-0000-0000-000000000001" },
          "technician"
        ),
        res as never
      )
    ).rejects.toThrow("You do not have permission");
    expect(mockStructuredEstimator.applyReviewedDraft).not.toHaveBeenCalled();
  });

  it("rejects out-of-bounds draft limits and malformed estimate IDs", async () => {
    const res = response();

    await expect(
      aiEstimateAssistController.draftStructuredEstimate(
        authedRequest({ scopeOfWork: "Replace panel", limit: 11 }, { id: "not-a-uuid" }),
        res as never
      )
    ).rejects.toThrow();
    expect(mockStructuredEstimator.generateDraft).not.toHaveBeenCalled();
  });
});
