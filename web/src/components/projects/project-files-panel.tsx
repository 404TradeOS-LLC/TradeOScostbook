import { ProjectPhotoPanel } from "@/components/projects/project-photo-panel";
import type { ProjectFile } from "@/lib/api";

interface ProjectFilesPanelProps {
  projectId: string;
  projectFiles: ProjectFile[];
  editable?: boolean;
}

export function ProjectFilesPanel({ projectId, projectFiles, editable = false }: ProjectFilesPanelProps) {
  return <ProjectPhotoPanel projectId={projectId} projectFiles={projectFiles} editable={editable} title="Project files" emptyMessage="No photos or files saved yet." />;
}

