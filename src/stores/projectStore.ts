import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectState {
  selectedProjectName: string | null;
  setSelectedProjectName: (name: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProjectName: null,
      setSelectedProjectName: (name) => set({ selectedProjectName: name }),
    }),
    {
      name: "project-storage",
      skipHydration: true,
    },
  ),
);
