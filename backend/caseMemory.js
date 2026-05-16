// caseMemory.js
import mongoose from "mongoose";
import { getEmbedding } from "./faqService.js";

const caseMemorySchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true, unique: true },
  orderId: String,
  productIndex: Number,
  domain: { type: String, enum: ["E-commerce", "Travel", "Telecommunications", "Banking Services"] },

  // Problem side — embedded for similarity search
  problemSummary: String,
  embedding: [Number],

  // Resolution side — filled when case is marked resolved
  resolutionSummary: String,
  resolutionAction: {
    type: String,
    enum: ["refund", "replacement", "resend", "explanation", "escalate", "other"],
    default: "other",
  },
  isResolved: { type: Boolean, default: false },

  // Legacy field kept for backward compat
  summary: String,

  createdAt: { type: Date, default: Date.now },
});

const CaseMemory = mongoose.models.CaseMemory || mongoose.model("CaseMemory", caseMemorySchema);

function cosine(a = [], b = []) {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const ai = a[i] || 0, bi = b[i] || 0;
    dot += ai * bi; na += ai * ai; nb += bi * bi;
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Called when a case is first created / updated (open/in-progress)
export async function indexCase(caseDoc) {
  if (!caseDoc || !caseDoc._id) return;
  try {
    const text = (caseDoc.description || "").slice(0, 512) || `Case ${caseDoc._id}`;
    const embedding = await getEmbedding(text);
    await CaseMemory.findOneAndUpdate(
      { caseId: caseDoc._id },
      {
        $set: {
          caseId: caseDoc._id,
          orderId: caseDoc.orderId,
          productIndex: caseDoc.productIndex,
          problemSummary: text,
          domain: caseDoc.domain || "E-commerce",
          embedding,
          summary: text, // legacy
        },
        $setOnInsert: { isResolved: false, createdAt: new Date() },
      },
      { upsert: true, new: true }
    );
    console.log(`Indexed case description memory for case ${caseDoc._id}`);
  } catch (err) {
    console.error("Case memory indexing error:", err?.message || err);
  }
}

// Called when a case is marked RESOLVED — stores the resolution and re-embeds on the PROBLEM
export async function indexResolutionSummary(caseDoc, resolutionSummary, resolutionAction = "other") {
  if (!caseDoc || !caseDoc._id || !resolutionSummary) return;
  try {
    // Embed on the PROBLEM description so future similar problems match this resolved case
    const problemText = (caseDoc.description || resolutionSummary).slice(0, 512);
    const embedding = await getEmbedding(problemText);

    await CaseMemory.findOneAndUpdate(
      { caseId: caseDoc._id },
      {
        $set: {
          problemSummary: problemText,
          resolutionSummary: resolutionSummary.slice(0, 512),
          resolutionAction,
          isResolved: true,
          embedding,
          summary: resolutionSummary, // legacy
        },
      },
      { upsert: true, new: true }
    );
    console.log(`Indexed resolution memory for case ${caseDoc._id} — action: ${resolutionAction}`);
  } catch (err) {
    console.error("Resolution memory indexing error:", err?.message || err);
  }
}

// Search ONLY resolved cases (they have known resolutions to apply)
export async function searchSimilarCases(text, domain = null, topK = 3) {
  try {
    const queryEmbedding = await getEmbedding((text || "").slice(0, 512));
    const filter = { isResolved: true };
    if (domain) filter.domain = domain;
    const candidates = await CaseMemory.find(filter).lean().limit(200);
    const scored = candidates
      .map((c) => ({ ...c, score: cosine(queryEmbedding, c.embedding || []) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    return scored;
  } catch (err) {
    console.error("Case memory search error:", err?.message || err);
    return [];
  }
}

export default CaseMemory;
