const DEFAULT_BASE = "http://202.179.6.77:4000/api/v2";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // In browser, use the proxy
    return "/api/proxy/api/v2";
  }
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }
  return DEFAULT_BASE;
}

export type ApiEnvelope<T> = { version: string; data: T };

export function parseEnvelope<T>(json: unknown): T {
  if (!json || typeof json !== "object") {
    throw new Error("Invalid API response");
  }
  const o = json as Record<string, unknown>;
  if (!("data" in o)) {
    // If there's no data envelope but it's successful, return as is (fallback)
    return o as T;
  }
  return o.data as T;
}

export type LoginResult = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user?: { email: string; role: string };
};

export type MeResult = {
  success: boolean;
  user: {
    email: string;
    role: string;
    projects: Array<{ projectName: string; roles: string[] }>;
  };
};

export type RefreshResult = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
};

export type ProjectSummary = {
  name: string;
  port?: number;
  status?: string;
  [key: string]: unknown;
};

export type ComponentRecord = {
  instanceId: string;
  projectName: string;
  pageRoute: string;
  componentType: string;
  parentId: string | null;
  slot: string | null;
  order: number;
  props: Record<string, unknown>;
  updatedAt?: string;
};

export type TreeNode = ComponentRecord & {
  children?: Array<{ slot: string | null; components: TreeNode[] }>;
};

export type DesignRecord = {
  projectName: string;
  domain?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    darkMode: boolean;
    pageBackground?: string;
    customTokens?: Record<string, string>;
  };
  pages: Array<{ route: string; title?: string; description?: string }>;
  updatedAt?: string;
};

export const CANVAS_PROPS_KEY = "_canvas" as const;

type RequestOpts = RequestInit & {
  projectId?: string | null;
  accessToken?: string | null;
  skipAuth?: boolean;
};

async function requestJson<T>(
  path: string,
  init: RequestOpts = {},
): Promise<T> {
  const { projectId, accessToken, skipAuth, headers: h, ...rest } = init;
  const headers = new Headers(h);
  if (
    !headers.has("Content-Type") &&
    rest.body &&
    typeof rest.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (!skipAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (projectId) {
    headers.set("x-project-id", projectId);
  }
  
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  
  console.log(`[API] ${rest.method || 'GET'} ${url}`);

  const res = await fetch(url, { ...rest, headers });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response (${res.status})`);
  }
  
  if (!res.ok) {
    const err = json as {
      success?: boolean;
      error?: string;
      details?: unknown;
      message?: string;
    };
    throw new Error(err.error || err.message || `Request failed (${res.status})`);
  }
  
  return parseEnvelope<T>(json);
}

export const api = {
  login(email: string, password: string) {
    return requestJson<LoginResult>("/core/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  },

  me(accessToken: string) {
    return requestJson<MeResult>("/core/auth/me", {
      method: "GET",
      accessToken,
      skipAuth: false,
    });
  },

  refresh(refreshToken: string) {
    return requestJson<RefreshResult>("/core/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    });
  },

  logout(accessToken: string, refreshToken: string | null) {
    return requestJson<{ success: boolean }>("/core/auth/logout", {
      method: "POST",
      accessToken,
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });
  },

  listProjects(accessToken: string) {
    return requestJson<{ success: boolean; projects: ProjectSummary[] }>(
      "/core/projects",
      {
        method: "GET",
        accessToken,
      },
    );
  },

  generateProject(accessToken: string, projectName: string) {
    return requestJson<{ success: boolean; project: ProjectSummary }>(
      "/core/projects/generate",
      {
        method: "POST",
        accessToken,
        body: JSON.stringify({ projectName }),
      },
    );
  },

  deleteProject(accessToken: string, name: string) {
    return requestJson<{ success: boolean; message?: string }>(
      `/core/projects/${encodeURIComponent(name)}`,
      {
        method: "DELETE",
        accessToken,
      },
    );
  },

  contentAdminBlocks(
    accessToken: string,
    projectId: string,
    pageRoute?: string,
  ) {
    const q = pageRoute ? `?pageRoute=${encodeURIComponent(pageRoute)}` : "";
    return requestJson<{ success: boolean; components: ComponentRecord[] }>(
      `/content-admin/blocks${q}`,
      { method: "GET", accessToken, projectId },
    );
  },

  contentAdminBlocksTree(
    accessToken: string,
    projectId: string,
    pageRoute: string,
  ) {
    const q = `?pageRoute=${encodeURIComponent(pageRoute)}`;
    return requestJson<{ success: boolean; components: TreeNode[] }>(
      `/content-admin/blocks/tree${q}`,
      { method: "GET", accessToken, projectId },
    );
  },

  contentAdminComponentTypes(accessToken: string, projectId: string) {
    return requestJson<{ success: boolean; components: unknown[] }>(
      "/content-admin/component-types",
      {
        method: "GET",
        accessToken,
        projectId,
      },
    );
  },

  postContentAdminText(
    accessToken: string,
    projectId: string,
    instanceId: string,
    fields: Record<string, string | number>,
  ) {
    return requestJson<{ success: boolean; component: ComponentRecord }>(
      `/content-admin/blocks/${encodeURIComponent(instanceId)}/text`,
      {
        method: "POST",
        accessToken,
        projectId,
        body: JSON.stringify({ fields }),
      },
    );
  },

  listComponents(accessToken: string, projectId: string, pageRoute?: string) {
    const q = pageRoute ? `?pageRoute=${encodeURIComponent(pageRoute)}` : "";
    return requestJson<{ success: boolean; components: ComponentRecord[] }>(
      `/core/components${q}`,
      { method: "GET", accessToken, projectId },
    );
  },

  treeComponents(accessToken: string, projectId: string, pageRoute: string) {
    const q = `?pageRoute=${encodeURIComponent(pageRoute)}`;
    return requestJson<{ success: boolean; components: TreeNode[] }>(
      `/core/components/tree${q}`,
      { method: "GET", accessToken, projectId },
    );
  },

  createComponent(
    accessToken: string,
    projectId: string,
    body: Partial<ComponentRecord> & {
      componentType: string;
      pageRoute: string;
    },
  ) {
    return requestJson<{ success: boolean; component: ComponentRecord }>(
      "/core/components",
      {
        method: "POST",
        accessToken,
        projectId,
        body: JSON.stringify(body),
      },
    );
  },

  patchComponent(
    accessToken: string,
    projectId: string,
    instanceId: string,
    body: Record<string, unknown>,
  ) {
    return requestJson<{ success: boolean; component: ComponentRecord }>(
      `/core/components/${encodeURIComponent(instanceId)}`,
      { method: "PATCH", accessToken, projectId, body: JSON.stringify(body) },
    );
  },

  /** Server merges into `props._canvas` only (safe with concurrent prop edits). */
  patchComponentCanvasLayout(
    accessToken: string,
    projectId: string,
    instanceId: string,
    layout: {
      x?: number;
      y?: number;
      w?: number;
      h?: number;
      z?: number | null;
    },
  ) {
    return requestJson<{ success: boolean; component: ComponentRecord }>(
      `/core/components/${encodeURIComponent(instanceId)}/canvas-layout`,
      { method: "PATCH", accessToken, projectId, body: JSON.stringify(layout) },
    );
  },

  deleteComponent(accessToken: string, projectId: string, instanceId: string) {
    return requestJson<{ success: boolean; message?: string }>(
      `/core/components/${encodeURIComponent(instanceId)}`,
      { method: "DELETE", accessToken, projectId },
    );
  },

  reorderComponents(
    accessToken: string,
    projectId: string,
    instances: Array<{ instanceId: string; order: number }>,
  ) {
    return requestJson<{ success: boolean }>("/core/components/reorder", {
      method: "POST",
      accessToken,
      projectId,
      body: JSON.stringify({ instances }),
    });
  },

  getDesign(_accessToken: string, name: string) {
    return requestJson<{ success: boolean; design: DesignRecord }>(
      `/core/designs/${encodeURIComponent(name)}`,
      { method: "GET", skipAuth: true },
    );
  },

  patchDesign(
    accessToken: string,
    projectId: string,
    name: string,
    body: Record<string, unknown>,
  ) {
    return requestJson<{ success: boolean; design: DesignRecord }>(
      `/core/designs/${encodeURIComponent(name)}`,
      { method: "PATCH", accessToken, projectId, body: JSON.stringify(body) },
    );
  },

  listUsers(accessToken: string) {
    return requestJson<{
      success: boolean;
      users: Array<{ email?: string; role?: string; status?: string }>;
    }>("/core/users", { method: "GET", accessToken });
  },

  getBindings(accessToken: string, email: string) {
    return requestJson<{
      success: boolean;
      bindings: Array<{ projectName: string; roles: string[] }>;
    }>(`/core/users/${encodeURIComponent(email)}/bindings`, {
      method: "GET",
      accessToken,
    });
  },

  buildProject(accessToken: string, name: string) {
    return requestJson<{ success: boolean }>(`/core/projects/${encodeURIComponent(name)}/build`, {
      method: "POST",
      accessToken,
    });
  },

  stopProject(accessToken: string, name: string) {
    return requestJson<{ success: boolean }>(`/core/projects/${encodeURIComponent(name)}/stop`, {
      method: "POST",
      accessToken,
    });
  },
};
