import type { Task } from "@/lib/exercises";
import { TASKS_TRAFFIC } from "./traffic";
import { TASKS_PERFORMANCE } from "./performance";
import { TASKS_RESILIENCE } from "./resilience";
import { TASKS_ASYNC } from "./async";
import { TASKS_DATABASE } from "./database";
import { TASKS_PROTOCOLS } from "./protocols";
import { TASKS_OBSERVABILITY } from "./observability";
import { TASKS_SRE } from "./sre";
import { TASKS_MISSIONS } from "./missions";
import { TASKS_DEVOPS } from "./devops";
import { TASKS_STREAMING } from "./streaming";
import { TASKS_DISTRIBUTED } from "./distributed";
import { TASKS_SCALING } from "./scaling";
import { TASKS_RELIABILITY } from "./reliability";
import { TASKS_SECURITY } from "./security";
import { TASKS_NETWORKING } from "./networking";

/** Registro único de tarefas de prática (PRD project2 D8/D16). */
export const TASKS: Task[] = [
  ...TASKS_TRAFFIC,
  ...TASKS_PERFORMANCE,
  ...TASKS_RESILIENCE,
  ...TASKS_ASYNC,
  ...TASKS_DATABASE,
  ...TASKS_PROTOCOLS,
  ...TASKS_OBSERVABILITY,
  ...TASKS_SRE,
  ...TASKS_MISSIONS,
  ...TASKS_DEVOPS,
  ...TASKS_STREAMING,
  ...TASKS_DISTRIBUTED,
  ...TASKS_SCALING,
  ...TASKS_RELIABILITY,
  ...TASKS_SECURITY,
  ...TASKS_NETWORKING,
];

export function getTask(id: string): Task | undefined {
  return TASKS.find((t) => t.id === id);
}
