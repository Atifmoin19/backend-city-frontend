import type { DiagramKey } from "@/content/lessons/types";

import { GateTraffic } from "./diagrams/GateTraffic";
import { RequestPipeline } from "./diagrams/RequestPipeline";
import { StatusFamilies } from "./diagrams/StatusFamilies";

const DIAGRAMS: Record<DiagramKey, () => React.JSX.Element> = {
  "gate-traffic": GateTraffic,
  "request-pipeline": RequestPipeline,
  "status-families": StatusFamilies,
};

export function Diagram({ name }: { name: DiagramKey }) {
  const Component = DIAGRAMS[name];
  return (
    <figure className="rounded-lg border border-line bg-bg-2 p-4">
      <Component />
    </figure>
  );
}
