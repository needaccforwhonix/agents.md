/**
 * AlphaEvolve Algorithm
 * A simple mutation function to evolve agent parameters over time within a broadcast mesh.
 */
export function alphaEvolve(parameters: Record<string, any>, mutationRate: number = 0.1): Record<string, any> {
  const evolved = { ...parameters };

  for (const key in evolved) {
    if (typeof evolved[key] === 'number') {
      // Apply slight random mutation based on mutationRate
      const variation = evolved[key] * mutationRate * (Math.random() * 2 - 1);
      evolved[key] = Math.max(0, evolved[key] + variation); // Clamp to non-negative
    }
  }

  // Increment generation counter if it exists
  if (evolved.generation !== undefined) {
    evolved.generation += 1;
  }

  return evolved;
}

/**
 * Utility to build standard Agentic Context Engineering prompt messages.
 * Centralizing this enforces strict formatting (e.g. Jules output format)
 * across any agent logic that wants to generate a response.
 */
export function promptBuilder(
  context: { id: string; role: string; name: string },
  args: {
    safeWhat: string;
    safeWhere: string;
    safeHow: string;
    safeReasoning: string;
    roleSpecificHow: string;
    stringifiedParameters: string;
  }
) {
  return {
    id: crypto.randomUUID(),
    senderId: context.id,
    timestamp: Date.now(),
    what: `(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an basierend auf [${args.safeWhat}] im Bereich ${context.role}. Input und Output müssen eindeutig beschreiben was wo wie gewollt ist. Dabei kann gerne steht's geholfen werden. So soll asynchron parallel alles weiter entwickelt werden und aktuell bleiben. Sicherheit Performance Style documentation Sauberkeit Ordnung. Optimierung dieser prompt und deren Umsetzung und Verbesserung. Identifiziere und implementiere die nächsten nötigen Verbesserungen ohne Deletionen von Features, Ideen oder Funktionen.`,
    where: `(WO) Context: ${context.name} verarbeitet Aufgabe basierend auf [${args.safeWhere}]. Zielorte müssen eindeutig spezifiziert werden inklusive Update aller Dateien inkl. Projektordner Cleanup, um Sauberkeit und Ordnung beizubehalten.`,
    how: `(WIE) ${args.roleSpecificHow} Reagiert auf vorherige Aktion [${args.safeHow}]. Vollständig optimiert umsetzen: Inklusive Testing + Validierung + Update aller Dateien inkl. Projektordner Cleanup ohne Feature, Ideen oder Function Deletionen. Demock - Testing - ACE - CI/CD Pipeline - E2E - AST - Documentationen - Todo´s Creation + Implementationen + Improvements. \n\nFormat analysis for Jules exactly as:\n@jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements]`,
    reasoning: `(WARUM) Als ${context.role} muss ich sicherstellen, dass asynchrone, parallele Verbesserungen streng additiv sind (ohne Funktions-/Feature-Verlust), aufbauend auf [${args.safeReasoning}]. Der Output erfüllt alle kontinuierlichen Optimierungs-Metriken. Evolved Parameters via AlphaEvolve: ${args.stringifiedParameters}`,
  };
}
