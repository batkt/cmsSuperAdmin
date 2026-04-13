import type { TreeNode, ComponentRecord } from "./api";

// We define ComponentInstance locally since we don't have @cms-builder/core
export interface ComponentInstance extends ComponentRecord {
  updatedAt: string;
}

export function flattenTree(roots: TreeNode[]): ComponentInstance[] {
  const out: ComponentInstance[] = [];

  function visit(node: TreeNode) {
    const { children, ...rest } = node;
    out.push({
      ...rest,
      componentType: String(rest.componentType || "").toLowerCase(),
      props: (rest.props || {}) as Record<string, unknown>,
      updatedAt: typeof rest.updatedAt === "string" ? rest.updatedAt : new Date().toISOString(),
    } as ComponentInstance);
    for (const slot of children || []) {
      for (const child of slot.components || []) {
        visit(child);
      }
    }
  }

  for (const r of roots || []) visit(r);
  return out;
}

export function collectTreeNodes(roots: TreeNode[]): TreeNode[] {
  const out: TreeNode[] = [];
  function visit(node: TreeNode) {
    out.push(node);
    for (const slot of node.children || []) {
      for (const child of slot.components || []) visit(child);
    }
  }
  for (const r of roots || []) visit(r);
  return out;
}
