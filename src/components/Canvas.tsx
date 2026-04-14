"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Trash2, Plus, Zap, GripVertical, Settings2,
  Layers, Package, ChevronRight, ChevronDown,
  Layout, Eye, Save, Rocket, RefreshCw, X, Search
} from "lucide-react";

import { api, type TreeNode, type ComponentRecord } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import { collectTreeNodes, flattenTree, type ComponentInstance } from "@/lib/tree";
import { layoutWithDagre } from "@/lib/dagreLayout";

import { toast } from "react-hot-toast";

const nodeTypes = {
  component: ComponentFlowNode,
};

function ConfirmModal({ show, onClose, onConfirm, title, message, isDark }: {
  show: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; isDark: boolean
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full max-w-sm rounded-[24px] p-8 shadow-2xl animate-scale-in ${isDark ? "bg-[#0f172a] border border-white/5" : "bg-white border border-slate-200"
          }`}
      >
        <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
        <p className={`text-sm mb-8 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 h-12 rounded-2xl text-sm font-bold transition-all ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            Болих
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-sm font-bold text-white transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            Устгах
          </button>
        </div>
      </div>
    </div>
  );
}

/** HTML5 drag types */
const MIME_PALETTE = "application/x-cms-superadmin-type";
const MIME_MOVE = "application/x-cms-superadmin-move";
const PREVIEW_SCALE = 1;

function clientToPreviewCanvasCoords(
  clientX: number,
  clientY: number,
  scrollEl: HTMLElement,
  scale: number,
): { x: number; y: number } {
  const rect = scrollEl.getBoundingClientRect();
  const x = (clientX - rect.left + scrollEl.scrollLeft) / scale;
  const y = (clientY - rect.top + scrollEl.scrollTop) / scale;
  return { x, y };
}

function previewDropKind(dt: DataTransfer): "palette" | "move" | null {
  const types = Array.from(dt.types || []);
  if (types.includes(MIME_PALETTE)) return "palette";
  if (types.includes(MIME_MOVE)) return "move";
  return null;
}

function ComponentFlowNode({ data, selected }: NodeProps) {
  const isDarkMode = !!data.isDarkMode;
  return (
    <div
      className={`min-w-[200px] rounded-xl border-2 px-4 py-3 shadow-xl transition-all duration-300 ${selected
          ? "border-indigo-500 bg-indigo-500/10 shadow-indigo-500/20 " + (isDarkMode ? "bg-[#111622]" : "bg-white")
          : (isDarkMode
            ? "border-slate-800 bg-[#111622] hover:border-slate-700"
            : "border-slate-200 bg-white hover:border-slate-300")
        }`}
    >
      <Handle type="target" position={Position.Top} className={`!w-3 !h-3 !bg-indigo-500 !border-2 ${isDarkMode ? "!border-[#070a14]" : "!border-white"}`} />
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${isDarkMode ? "bg-indigo-500/20" : "bg-indigo-50"}`}>
          <Package className={`w-3.5 h-3.5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
        </div>
        <div className={`text-[11px] font-bold uppercase tracking-wider truncate ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}>
          {String(data.componentType ?? "")}
        </div>
      </div>
      <div className={`font-mono text-[9px] break-all opacity-60 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
        {String(data.instanceId ?? "")}
      </div>
      <Handle type="source" position={Position.Bottom} className={`!w-3 !h-3 !bg-indigo-500 !border-2 ${isDarkMode ? "!border-[#070a14]" : "!border-white"}`} />
    </div>
  );
}

function snapValue(v: number, grid: number) {
  return Math.round(v / grid) * grid;
}

function treeToGraph(roots: TreeNode[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let i = 0;
  function visit(node: TreeNode, parentId: string | null, edgeSlot: string | null = null) {
    const props = (node.props || {}) as Record<string, unknown>;
    const c = props._canvas as { x?: number; y?: number; w?: number; h?: number } | undefined;
    const x = typeof c?.x === "number" ? c.x : (i % 4) * 240;
    const y = typeof c?.y === "number" ? c.y : Math.floor(i / 4) * 120;
    i += 1;
    nodes.push({
      id: node.instanceId,
      type: "component",
      position: { x, y },
      data: {
        instanceId: node.instanceId,
        componentType: node.componentType,
        pageRoute: node.pageRoute,
        props,
        raw: node,
      },
    });
    if (parentId) {
      edges.push({
        id: `${parentId}->${node.instanceId}`,
        source: parentId,
        target: node.instanceId,
        label: edgeSlot || "default",
        labelStyle: { fill: "#6366f1", fontSize: 10, fontWeight: 600 },
        animated: true,
      });
    }
    for (const slot of node.children || []) {
      const slotName = slot.slot || "default";
      for (const child of slot.components || []) {
        visit(child, node.instanceId, slotName);
      }
    }
  }
  for (const r of roots || []) visit(r, null);
  return { nodes, edges };
}

function incomingParent(edges: Edge[], id: string): string | null {
  const e = edges.find((x) => x.target === id);
  return e ? e.source : null;
}

function CanvasInner({ isDarkMode }: { isDarkMode: boolean }) {
  const accessToken = useAuthStore((s) => s.accessToken)!;
  const selectedProject = useProjectStore((s) => s.selectedProjectName);
  const setSelectedProject = useProjectStore((s) => s.setSelectedProjectName);
  const qc = useQueryClient();
  const { fitView } = useReactFlow();

  const [pageRoute, setPageRoute] = useState("/");
  const [showGrid, setShowGrid] = useState(true);
  const [snap, setSnap] = useState(true);
  const [reparentSlot, setReparentSlot] = useState("default");

  // Design states
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");
  const [pageBackground, setPageBackground] = useState("#070b1a");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [siteDarkMode, setSiteDarkMode] = useState(true);

  // Inspector states
  const [inspectOrder, setInspectOrder] = useState("");
  const [inspectTitle, setInspectTitle] = useState("");
  const [inspectSubtitle, setInspectSubtitle] = useState("");

  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const grid = 24;

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.listProjects(accessToken),
    enabled: !!accessToken,
  });

  const treeQuery = useQuery({
    queryKey: ["blocks-tree", selectedProject, pageRoute],
    queryFn: () => api.contentAdminBlocksTree(accessToken, selectedProject!, pageRoute),
    enabled: !!accessToken && !!selectedProject && !!pageRoute,
  });

  const typesQuery = useQuery({
    queryKey: ["component-types", selectedProject],
    queryFn: () => api.contentAdminComponentTypes(accessToken, selectedProject!),
    enabled: !!accessToken && !!selectedProject,
  });

  const designQuery = useQuery({
    queryKey: ["design", selectedProject],
    queryFn: () => api.getDesign(accessToken, selectedProject!),
    enabled: !!selectedProject,
  });

  // Sync design from query
  useEffect(() => {
    const theme = designQuery.data?.design?.theme;
    if (!theme) return;
    if (theme.primaryColor) setPrimaryColor(theme.primaryColor);
    if (theme.secondaryColor) setSecondaryColor(theme.secondaryColor);
    if (theme.fontFamily) setFontFamily(theme.fontFamily);
    if (typeof theme.darkMode === "boolean") setSiteDarkMode(theme.darkMode);
  }, [designQuery.data?.design?.updatedAt, selectedProject]);

  const designPatchMut = useMutation({
    mutationFn: () =>
      api.patchDesign(accessToken, selectedProject!, selectedProject!, {
        "theme.primaryColor": primaryColor,
        "theme.secondaryColor": secondaryColor,
        "theme.fontFamily": fontFamily,
        "theme.darkMode": siteDarkMode,
        "theme.pageBackground": pageBackground,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["design", selectedProject] });
      toast.success("Сайтын загвар хадгалагдлаа");
    },
    onError: () => toast.error("Загвар хадгалахад алдаа гарлаа"),
  });

  const initial = useMemo(() => treeToGraph(treeQuery.data?.components ?? []), [treeQuery.data?.components]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  useEffect(() => {
    const g = treeToGraph(treeQuery.data?.components ?? []);
    setNodes(g.nodes);
    setEdges(g.edges);
    // requestAnimationFrame(() => fitView({ padding: 0.2 }));
  }, [treeQuery.data?.components]);

  const createMut = useMutation({
    mutationFn: (body: any) => api.createComponent(accessToken, selectedProject!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocks-tree", selectedProject, pageRoute] });
      toast.success("Компонент нэмэгдлээ");
    },
    onError: () => toast.error("Компонент нэмэхэд алдаа гарлаа"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteComponent(accessToken, selectedProject!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocks-tree", selectedProject, pageRoute] });
      toast.success("Компонент устгагдлаа");
    },
    onError: () => toast.error("Устгахад алдаа гарлаа"),
  });

  const patchComponentMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      api.patchComponent(accessToken, selectedProject!, id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocks-tree", selectedProject, pageRoute] });
      toast.success("Өөрчлөлт хадгалагдлаа");
    },
    onError: () => toast.error("Хадгалахад алдаа гарлаа"),
  });

  const onConnect = useCallback(
    async (c: Connection) => {
      if (!c.source || !c.target || !selectedProject) return;
      if (c.source === c.target) return;
      try {
        await api.patchComponent(accessToken, selectedProject, c.target, {
          parentId: c.source,
          slot: reparentSlot || "default",
        });
        await qc.invalidateQueries({ queryKey: ["blocks-tree", selectedProject, pageRoute] });
        toast.success("Холболт амжилттай");
      } catch (err) {
        console.error("Connect failed", err);
        toast.error("Холбоход алдаа гарлаа");
      }
    },
    [accessToken, selectedProject, pageRoute, qc, reparentSlot],
  );

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      let x = node.position.x;
      let y = node.position.y;
      if (snap) {
        x = snapValue(x, grid);
        y = snapValue(y, grid);
      }
      void api.patchComponentCanvasLayout(accessToken, selectedProject!, String(node.id), { x, y })
        .then(() => qc.invalidateQueries({ queryKey: ["blocks-tree", selectedProject, pageRoute] }));
    },
    [accessToken, pageRoute, qc, selectedProject, snap],
  );

  const autoLayout = useCallback(() => {
    setNodes((nds) => layoutWithDagre(nds, edges, "TB"));
    requestAnimationFrame(() => {
      fitView({ padding: 0.2 });
      toast.success("Байршил цэгцэллээ");
    });
  }, [edges, fitView, setNodes]);

  const selectedForInspector = useMemo(() => {
    if (!selectedInstanceId) return null;
    const roots = treeQuery.data?.components ?? [];
    return collectTreeNodes(roots).find((n) => n.instanceId === selectedInstanceId) ?? null;
  }, [treeQuery.data?.components, selectedInstanceId]);

  useEffect(() => {
    if (!selectedForInspector) {
      setInspectOrder("");
      setInspectTitle("");
      setInspectSubtitle("");
      return;
    }
    setInspectOrder(String(selectedForInspector.order ?? 0));
    const p = (selectedForInspector.props || {}) as Record<string, unknown>;
    setInspectTitle(String(p.title || ""));
    setInspectSubtitle(String(p.subtitle || ""));
  }, [selectedForInspector?.instanceId]);

  const typeEntries = (typesQuery.data?.components ?? []) as Array<{ type?: string; name?: string }>;

  return (
    <div className={`flex h-full overflow-hidden animate-fade-in ${isDarkMode ? 'bg-background' : 'bg-slate-50'}`}>
      <ConfirmModal
        show={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          if (selectedInstanceId) {
            deleteMut.mutate(selectedInstanceId);
            setSelectedInstanceId(null);
          }
        }}
        title="Устгах уу?"
        message="Та энэ компонентийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй."
        isDark={isDarkMode}
      />
      {/* Left Sidebar: Palette & Project */}
      <aside className={`w-80 shrink-0 flex flex-col border-r shadow-2xl z-20 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-card border-slate-800' : 'bg-white border-slate-200'
        }`}>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Төсөл</label>
            <div className="relative group">
              <select
                className={`w-full h-11 rounded-xl border px-4 text-sm outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer ${isDarkMode ? 'bg-background border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                value={selectedProject ?? ""}
                onChange={(e) => setSelectedProject(e.target.value || null)}
              >
                <option value="">Төсөл сонгох</option>
                {(projectsQuery.data?.projects ?? []).map((p) => (
                  <option key={String(p.name)} value={String(p.name)}>{String(p.name)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Хуудасны зам</label>
            <div className="flex gap-2">
              <input
                className={`flex-1 h-11 rounded-xl border px-4 font-mono text-xs outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-background border-slate-700 text-indigo-400' : 'bg-slate-50 border-slate-200 text-indigo-600'
                  }`}
                value={pageRoute}
                onChange={(e) => setPageRoute(e.target.value)}
                placeholder="/ эсвэл /about"
              />
            </div>
          </div>

          <div className={`pt-6 border-t ${isDarkMode ? 'border-slate-800/50' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Компонент цуглуулга</h3>
              <Package className="w-4 h-4 text-slate-600" />
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {typeEntries.map((t, idx) => {
                const id = String(t.type || t.name || idx);
                return (
                  <button
                    key={id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(MIME_PALETTE, id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left text-xs transition-all group active:scale-[0.98] ${isDarkMode
                        ? 'bg-background border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    onClick={() => {
                      createMut.mutate({
                        componentType: id,
                        pageRoute,
                        parentId: selectedInstanceId,
                        slot: selectedInstanceId ? "default" : null,
                        props: { _canvas: { x: 100, y: 100 } }
                      });
                    }}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 group-hover:bg-indigo-500/20' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
                      <Package className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                    </div>
                    <span className={`font-medium transition-colors ${isDarkMode ? 'group-hover:text-white' : 'group-hover:text-indigo-900'}`}>{id}</span>
                  </button>
                );
              })}
              {typesQuery.isLoading && <div className="text-[10px] text-slate-600 animate-pulse">Loading components...</div>}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Top toolbar */}
        <header className={`h-16 shrink-0 flex items-center justify-between px-6 border-b z-10 shadow-lg ${isDarkMode ? 'bg-card border-slate-800' : 'bg-white border-slate-200'
          }`}>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-background border-slate-800' : 'bg-slate-50 border-slate-100'
              }`}>
              <Layout className="w-4 h-4 text-indigo-400" />
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedProject || "Төсөл сонгоогүй"}</span>
            </div>
            <div className={`h-4 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <button
              onClick={autoLayout}
              className={`flex items-center gap-2 text-[11px] font-bold transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'}`}
              title="Байршил цэгцлэх"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Байршил цэгцлэх
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
              }`}>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-all ${showGrid ? 'bg-indigo-500 text-white shadow-lg' : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}
                title="Тор харуулах"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSnap(!snap)}
                className={`p-2 rounded-lg transition-all ${snap ? 'bg-indigo-500 text-white shadow-lg' : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}
                title="Торонд барих"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => {
                if (!selectedProject) return toast.error("Төсөл сонгоно уу");
                const project = projectsQuery.data?.projects?.find(p => p.name === selectedProject);
                if (project?.port) {
                  window.open(`http://202.179.6.77:${project.port}`, "_blank");
                } else {
                  toast.error("Төсөл ажиллаагүй байна (Порт олдсонгүй)");
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              Урьдчилан харах
            </button>
            <div className={`h-4 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <button 
              onClick={() => {
                if (!selectedProject) return toast.error("Төсөл сонгоно уу");
                const toastId = toast.loading("Нийтлэж байна...");
                api.buildProject(accessToken, selectedProject)
                  .then(() => {
                    toast.success("Амжилттай нийтлэгдлээ", { id: toastId });
                    qc.invalidateQueries({ queryKey: ["projects"] });
                  })
                  .catch(err => toast.error("Нийтлэхэд алдаа гарлаа: " + err.message, { id: toastId }));
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Rocket className="w-3.5 h-3.5" />
              Нийтлэх
            </button>
          </div>
        </header>

        <div className="flex-1 relative bg-grid">
          <ReactFlow
            nodes={nodes.map(n => ({ ...n, data: { ...n.data, isDarkMode } }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedInstanceId(node.id)}
            onPaneClick={() => setSelectedInstanceId(null)}
            fitView
            snapToGrid={snap}
            snapGrid={[grid, grid]}
            style={{ background: isDarkMode ? "hsl(var(--background))" : "#f8fafc" }}
          >
            <Background color={isDarkMode ? "#1e293b" : "#cbd5e1"} gap={grid} size={1} />
            <Controls className={`!shadow-2xl ${isDarkMode ? '!bg-card !border-slate-800' : '!bg-white !border-slate-200'}`} />
            <MiniMap
              style={{ background: isDarkMode ? "hsl(var(--surface))" : "#ffffff" }}
              maskColor={isDarkMode ? "rgba(99, 102, 241, 0.05)" : "rgba(0, 0, 0, 0.05)"}
              nodeColor={isDarkMode ? "#1e293b" : "#e2e8f0"}
              className={`!shadow-2xl ${isDarkMode ? '!border-slate-800' : '!border-slate-200'}`}
            />
          </ReactFlow>
        </div>
      </main>

      {/* Right Sidebar: Designer & Inspector */}
      <aside className={`w-80 shrink-0 flex flex-col border-l shadow-2xl z-20 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-card border-slate-800' : 'bg-white border-slate-200'
        }`}>
        <div className="p-6 space-y-8">
          {/* Theme / Designer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Сайтын загвар</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between group">
                <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Үндсэн өнгө</label>
                <input
                  type="color"
                  className="w-10 h-6 rounded bg-transparent border-none cursor-pointer"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Фонт</label>
              <input
                className={`w-full h-10 rounded-xl border px-4 text-xs outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-background border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              />
            </div>

            <button
              onClick={() => designPatchMut.mutate()}
              disabled={designPatchMut.isPending}
              className={`w-full h-11 rounded-xl transition-all flex items-center justify-center gap-2 border text-xs font-bold ${isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                }`}
            >
              {designPatchMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Загвар хадгалах
            </button>
          </div>

          {/* Inspector */}
          <div className={`pt-8 border-t space-y-4 ${isDarkMode ? 'border-slate-800/50' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Үзүүлэлт</h3>
            </div>

            {!selectedForInspector ? (
              <div className={`py-12 flex flex-col items-center justify-center text-center px-6 border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-800' : 'border-slate-100 bg-slate-50/50'
                }`}>
                <Eye className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
                <p className={`text-[10px] font-bold uppercase leading-relaxed tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Блокийг сонгож<br />үзүүлэлтийг засна уу
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-scale-in">
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
                  <span className={`text-[10px] font-bold block mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>ID</span>
                  <span className={`font-mono text-[9px] break-all ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{selectedInstanceId}</span>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Дараалал</label>
                  <input
                    type="number"
                    className={`w-full h-10 rounded-xl border px-4 text-xs outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-background border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    value={inspectOrder}
                    onChange={(e) => setInspectOrder(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Гарчиг</label>
                  <input
                    className={`w-full h-10 rounded-xl border px-4 text-xs outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-background border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    value={inspectTitle}
                    onChange={(e) => setInspectTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Дэд гарчиг</label>
                  <input
                    className={`w-full h-10 rounded-xl border px-4 text-xs outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-background border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    value={inspectSubtitle}
                    onChange={(e) => setInspectSubtitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (!selectedInstanceId) return;
                      patchComponentMut.mutate({
                        id: selectedInstanceId,
                        body: {
                          order: parseInt(inspectOrder, 10),
                          props: {
                            ...selectedForInspector.props,
                            title: inspectTitle,
                            subtitle: inspectSubtitle
                          }
                        }
                      });
                    }}
                    className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Хадгалах
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all border ${isDarkMode
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                        : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                      }`}
                  >
                    Устгах
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#1e293b' : '#cbd5e1'};
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#312e81' : '#6366f1'};
        }
        .xyflow__handle {
           width: 8px;
           height: 8px;
           background: #6366f1;
        }
      `}</style>
    </div>
  );
}

export default function Canvas({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <ReactFlowProvider>
      <CanvasInner isDarkMode={isDarkMode} />
    </ReactFlowProvider>
  );
}
