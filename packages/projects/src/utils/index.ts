/**
 * Detect whether adding edge projectId → dependsOnProjectId would create a cycle.
 * Graph edges mean "depends on" (from → to).
 */
export function wouldCreateCycle(
  edges: readonly { from: string; to: string }[],
  from: string,
  to: string,
): boolean {
  if (from === to) return true;
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const list = adj.get(e.from) ?? [];
    list.push(e.to);
    adj.set(e.from, list);
  }
  // prospective edge
  const list = adj.get(from) ?? [];
  list.push(to);
  adj.set(from, list);

  // DFS from `to` — if we can reach `from`, cycle
  const visited = new Set<string>();
  const stack = [to];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node === from) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    for (const next of adj.get(node) ?? []) {
      stack.push(next);
    }
  }
  return false;
}
