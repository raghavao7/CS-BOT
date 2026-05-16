// formatCaseMemory.js  (ESM)

export function cleanTranscript(text = "") {
  return String(text)
    .replace(/\b(Agent|User|Support Bot)\s*:\s*/gi, "")
    .replace(/\|\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function pickResolutionSummary(text = "") {
  const m = text.match(/Resolution Summary\s*:\s*([\s\S]+)/i);
  if (m && m[1]) return m[1].trim();
  const parts = text.split(/(?<=[.?!])\s+/).slice(0, 2);
  return parts.join(" ").trim();
}

// Used for LOWER confidence matches — suggests rather than auto-acts
export function buildMemoryReply(rawMessage = "", { orderId, productName } = {}) {
  const cleaned = cleanTranscript(rawMessage);
  const summary = pickResolutionSummary(cleaned) || cleaned;

  const action = /refund/i.test(summary)
    ? "issue a refund"
    : /replace|replacement/i.test(summary)
    ? "send a replacement"
    : "resolve this for you";

  const productPart = productName ? `the ${productName}` : "the item";
  const orderPart = orderId ? ` for order ${orderId}` : "";

  return `We've handled a similar case before: ${summary}. For your case${orderPart}, I can ${action} for ${productPart} right away, or connect you with a specialist. Would you like me to proceed?`;
}

// Used for HIGH confidence matches with a known resolution — acts immediately
export function buildAutoResolutionReply(memoryHit = {}, { orderId, productName } = {}) {
  const { resolutionAction, resolutionSummary, problemSummary } = memoryHit;
  const productPart = productName ? ` for your ${productName}` : "";
  const orderPart = orderId ? ` (order ${orderId})` : "";

  const actionMessages = {
    refund:
      `We've resolved a similar issue before by issuing a refund. ` +
      `I've gone ahead and initiated a refund${productPart}${orderPart}. ` +
      `You should receive it within 5–7 business days. If you need anything else, let us know!`,
    replacement:
      `We've resolved a similar issue before by sending a replacement. ` +
      `I've arranged a replacement${productPart}${orderPart} and our team will dispatch it shortly. ` +
      `You'll receive a tracking update soon!`,
    resend:
      `We've resolved a similar issue before by re-sending the item. ` +
      `I've requested a re-send${productPart}${orderPart}. ` +
      `It should arrive within the standard delivery window.`,
    explanation:
      `We've encountered this before. ${resolutionSummary || problemSummary || ""} ` +
      `If this doesn't answer your question, I can connect you with a specialist.`,
  };

  return (
    actionMessages[resolutionAction] ||
    `We've handled a similar case before and resolved it. ${resolutionSummary || ""} ` +
    `If you need further help${orderPart}, a specialist can assist you.`
  );
}
