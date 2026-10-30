import { describe, expect, it } from "vitest";
import { hasLesson, getLesson, LESSONS } from "@/lib/lessons";
import { PREREQ_MOTIVES } from "@/lib/lessons/prereq-motives";
import { getTask } from "@/lib/exercises-data";
import { getConcept } from "@/lib/concepts";

// Remix 6 — F9 expansão contínua, terceira onda (PRD project3 D17): a terceira
// lição editorial nas categorias com mais conceitos sem aula, mais a primeira
// leva de revisão técnica independente (s38). Cobertura nominal não é meta:
// cada lição nova traz tarefas próprias, motivos de pré-req e proveniência honesta.

const NEW_LESSON_IDS = [28, 39, 52, 65, 67];

// Categorias que precisavam de terceira lição estruturada nesta rodada.
const CATS_WITH_THIRD = ["DevOps", "Security", "Distributed", "Database", "Observability"];

// Lições de expansão (remixes 4–5) alvo da revisão s38 desta rodada.
const REVIEW_TARGETS = [6, 7, 22, 23, 34, 35, 45, 46, 56, 57, 78, 79, 92, 94, 97, 98];

describe("f9x3 — terceira lição por categoria + revisão independente", () => {
  it("cada conceito da fila desta rodada tem lição estruturada", () => {
    for (const id of NEW_LESSON_IDS) {
      expect(hasLesson(id), `conceito ${id} segue sem aula estruturada`).toBe(true);
    }
  });

  it("cada categoria alvo tem ao menos três lições estruturadas", () => {
    for (const cat of CATS_WITH_THIRD) {
      const count = LESSONS.filter((l) => getConcept(l.id)?.cat === cat).length;
      expect(count, `categoria ${cat} ainda sem terceira lição`).toBeGreaterThanOrEqual(3);
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

  it("proveniência honesta: lições novas não alegam revisão independente", () => {
    for (const id of NEW_LESSON_IDS) {
      const lesson = getLesson(id);
      expect(lesson!.provenance.reviewed, `lição ${id} alegando revisão sem registro`).toBe(false);
    }
  });

  it("revisão s38: lições da leva de expansão têm proveniência decidida (true exige registro efetivo)", () => {
    for (const id of REVIEW_TARGETS) {
      const lesson = getLesson(id);
      expect(lesson, `lição ${id} ausente`).toBeDefined();
      if (lesson!.provenance.reviewed) {
        expect(
          lesson!.provenance.notes.includes("revisão efetiva registrada"),
          `lição ${id}: reviewed sem registro de revisão efetiva`,
        ).toBe(true);
      }
    }
  });

  it("nenhum id de lição duplicado após a expansão", () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
