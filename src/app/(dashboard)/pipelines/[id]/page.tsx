'use client';

import { useParams } from 'next/navigation';
import { PipelineWorkspace } from '@/features/pipelines/components/pipeline-workspace';

// A rota operacional do funil agora usa o MESMO workspace premium (board claro,
// drawer, modal, drag-and-drop). O board antigo (KanbanBoard dark) saiu de cena.
export default function PipelineBoardPage() {
  const params = useParams<{ id: string }>();
  return <PipelineWorkspace initialPipelineId={params?.id} />;
}
