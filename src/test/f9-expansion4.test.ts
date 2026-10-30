import { describe, expect, it } from "vitest";
import { hasLesson, getLesson, LESSONS } from "@/lib/lessons";
import { PREREQ_MOTIVES } from "@/lib/lessons/prereq-motives";
import { getTask } from "@/lib/exercises-data";
import { getConcept } from "@/lib/concepts";

// Remix 7 — F9 expansão contínua, quarta onda (PRD project3 D18): quarta
// lição nas categorias com mais conceitos sem aula, revalidação das correções
// s38a/s38b antes de reviewed, revisão da fila 94/97/98 e guarda estática de
// rubricas (src/test/rubric-integrity.test.ts). Cobertura nominal não é meta:
// cada lição nova traz tarefas próprias, motivos de pré-req e proveniência honesta.

const NEW_LESSON_IDS = [29, 38, 41, 53, 71];

// Categorias que precisavam de quarta lição estruturada nesta rodada.
const CATS_WITH_FOURTH = ["DevOps", "Security", "Distributed", "Database", "Performance"];

// Lições revalidadas (s40) e revisadas (s39) nesta rodada: agora com revisão
// efetiva registrada.
const NOW_REVIEWED = [7, 35, 46, 57, 92, 94, 97, 98];

describe("f9x4 — quarta lição por categoria + revalidação e fila de revisão", () => {
  it("cada conceito da fila desta rodada tem lição estruturada", () => {
    for (const id of NEW_LESSON_IDS) {
      expect(hasLesson(id), `conceito ${id} segue sem aula estruturada`).toBe(true);
    }
  });

  it("cada categoria alvo tem ao menos quatro lições estruturadas", () => {
    for (const cat of CATS_WITH_FOURTH) {
      const count = LESSONS.filter((l) => getConcept(l.id)?.cat === cat).length;
      expect(count, `categoria ${cat} ainda sem quarta lição`).toBeGreaterThanOrEqual(4);
    }
  });

  it("cada lição nova tem tarefas próprias registradas no motor", () => {
    for (const id of NEW_LESSON_IDS) {
      const lesson = getLesson(id);
      expect(lesson, `lição ${id} ausente`).toBeDefined();
      expect(lesson!.practiceIds.length, `lição ${id} sem prática própria`).toBe(2);
      for (const pid of lesson!.practiceIds) {
        const task = getTask(pid);
        expect(task, `tarefa ${pid} inexistente para lição ${id}`).toBeDefined();
        expect(task!.conceptId, `tarefa ${pid} aponta para conceito errado`).toBe(id);
      }
    }
  });

  it("pré-requisito declarado (38:39) tem motivo editorial registrado", () => {
    for (const id of NEW_LESSON_IDS) {
      const lesson = getLesson(id)!;
      for (const prereq of lesson.prereqIds) {
        expect(
          PREREQ_MOTIVES[`${id}:${prereq}`],
          `par ${id}:${prereq} sem motivo em pt-BR`,
        ).toBeTruthy();
      }
    }
    expect(getLesson(38)!.prereqIds).toEqual([39]);
  });

  it("proveniência honesta: lições novas não alegam revisão independente", () => {
    for (const id of NEW_LESSON_IDS) {
      const lesson = getLesson(id)!;
      expect(lesson.provenance.reviewed, `lição ${id} alegando revisão sem registro`).toBe(false);
    }
  });

  it("revalidação s40 e revisão s39: a fila da rodada está com revisão efetiva registrada", () => {
    for (const id of NOW_REVIEWED) {
      const lesson = getLesson(id);
      expect(lesson, `lição ${id} ausente`).toBeDefined();
      expect(
        lesson!.provenance.reviewed,
        `lição ${id}: revalidada nesta rodada e ainda sem reviewed`,
      ).toBe(true);
      expect(
        lesson!.provenance.notes.includes("revisão efetiva registrada"),
        `lição ${id}: reviewed sem registro de revisão efetiva`,
      ).toBe(true);
    }
  });

  it("cobertura da rodada: 56 de 111 conceitos com aula", () => {
    expect(LESSONS.length, "total de lições").toBe(56);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
  });
});
