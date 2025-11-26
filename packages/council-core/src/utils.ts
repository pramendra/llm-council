/**
 * Anonymizes responses by replacing provider/model info with generic labels
 */
export function anonymizeResponses<T extends { content: string }>(
  responses: T[]
): Array<{ id: string; content: string; _original: T }> {
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  
  return responses.map((response, index) => ({
    id: `Response ${labels[index] || index + 1}`,
    content: response.content,
    _original: response,
  }));
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * Used to randomize response order before anonymization
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Formats anonymized responses for the critique prompt
 */
export function formatResponsesForCritique(
  responses: Array<{ id: string; content: string }>
): string {
  return responses
    .map((r) => `=== ${r.id} ===\n${r.content}\n`)
    .join("\n---\n\n");
}

/**
 * Formats all data for the chairman synthesis prompt
 */
export function formatForSynthesis(
  originalPrompt: string,
  anonymizedResponses: Array<{ id: string; content: string }>,
  critiques: Array<{ criticId: string; evaluations: string }>
): string {
  const responsesSection = anonymizedResponses
    .map((r) => `### ${r.id}\n${r.content}`)
    .join("\n\n");

  const critiquesSection = critiques
    .map((c) => `### Critic ${c.criticId}\n${c.evaluations}`)
    .join("\n\n");

  return `## Original Question
${originalPrompt}

## AI Responses
${responsesSection}

## Peer Critiques
${critiquesSection}

## Your Task
Synthesize the best possible answer by combining the strongest reasoning from above and correcting any identified errors.`;
}

/**
 * Generates a unique request ID
 */
export function generateRequestId(): string {
  return `council_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculates statistics from critique data
 */
export function calculateCritiqueStats(
  critiques: Array<{ rank: number; overallScore: number }>
): { averageRank: number; averageScore: number } {
  if (critiques.length === 0) {
    return { averageRank: 0, averageScore: 0 };
  }

  const totalRank = critiques.reduce((sum, c) => sum + c.rank, 0);
  const totalScore = critiques.reduce((sum, c) => sum + c.overallScore, 0);

  return {
    averageRank: totalRank / critiques.length,
    averageScore: totalScore / critiques.length,
  };
}
