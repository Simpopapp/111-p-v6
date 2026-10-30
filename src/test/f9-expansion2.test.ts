import { describe, expect, it } from "vitest";
import { hasLesson, getLesson, LESSONS } from "@/lib/lessons";
import { PREREQ_MOTIVES } from "@/lib/lessons/prereq-motives";
import { getTask } from "@/lib/exercises-data";
import { getConcept } from "@/lib/concepts";

// Remix 5 — F9 expansão contínua, segunda onda (PRD project3 D16): a segunda
// lição editorial das categorias abertas na rodada anterior + os dois últimos
// conceitos da fila da auditoria marcados "criar lição antes de percurso
// decisivo" (92 Throughput, 94 Tail Latency). Cobertura nominal não é meta:
// cada lição nova traz tarefas próprias, motivos de pré-req e proveniência honesta.

const NEW_LESSON_IDS = [7, 23, 35, 46, 57, 92, 94, 98];

// Categorias que precisavam de segunda lição estruturada (Security já tinha 2).
const CATS_WITH_SECOND = ["DevOps", "Streaming", "Distributed", "Scaling", "Reliability", "Performance", "Networking"];

describe("f9x2 — segunda lição por categoria + fila da auditoria", () => {
  it("cada conceito da fila desta rodada tem lição estruturada", () => {
    for (const id of NEW_LESSON_IDS) {
      expect(hasLesson(id), `conceito ${id} segue sem aula estruturada`).toBe(true);
    }
  });

  it("cada categoria alvo tem ao menos duas lições estruturadas", () => {
    for (const cat of CATS_WITH_SECOND) {
      const count = LESSONS.filter((l) => getConcept(l.id)?.cat === cat).length;
      expect(count, `categoria ${cat} ainda sem segunda lição`).toBeGreaterThanOrEqual(2);
    }
  });

  it("cada lição nova tem tarefas próprias registradas no motor", () => {
    for (const id of NEW_LESSON_IDS) {
      const lesson = getLesson(id);
      expect(lesson, `lição ${id} ausente`).toBeDefined();
      expect(lesson!.practiceIds.length, `lição ${id} sem prática própria`).toBeGreaterThan(0);
      for (const pid of lesson!.practiceIds) {
        const task = getTask(pid);
        expect(task, `tarefa ${pid} inexistente para lição ${id}`).toBeDefined();
        expect(task!.conceptId, `tarefa ${pid} aponta para conceito errado`).toBe(id);
      }
    }
  });

  it("todo pré-requisito das lições novas tem motivo editorial registrado", () => {
    for (const id of NEW_LESSON_IDS) {
      const lesson = getLesson(id);
      expect(lesson, `lição ${id} ausente`).toBeDefined();
      for (const prereq of lesson!.prereqIds) {
        expect(
          PREREQ_MOTIVES[`${id}:${prereq}`],
          `par ${id}:${prereq} sem motivo em pt-BR`,
        ).toBeTruthy();
      }
    }
  });

  it("proveniência honesta: lições novas só alegam revisão independente com registro efetivo", () => {
    // Remix 6: a revisão técnica independente (s38) passou a autorizar
    // `reviewed: true`; a regra honesta passa a ser a guarda f9-audit —
    // alegar revisão exige o registro efetivo nas notes.
    for (const id of NEW_LESSON_IDS) {
      const lesson = getLesson(id);
      if (!lesson!.provenance.reviewed) continue;
      expect(
        lesson!.provenance.notes.includes("revisão efetiva registrada"),
        `lição ${id}: reviewed sem registro de revisão efetiva`,
      ).toBe(true);
    }
  });

  it("nenhum id de lição duplicado após a expansão", () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
