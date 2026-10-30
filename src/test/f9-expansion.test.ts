import { describe, expect, it } from "vitest";
import { hasLesson, getLesson, LESSONS } from "@/lib/lessons";
import { getTask } from "@/lib/exercises-data";
import { LABS } from "@/lib/labs";
import { SYMPTOMS } from "@/lib/symptoms";

// F9 expansão contínua (PRD project3 D15, planejamento §12.2): a primeira
// lição editorial de cada categoria sem aula, começando pelo elo decisivo
// Security (sintoma SQL injection + lab sqli). Cobertura nominal não é meta:
// cada lição nova traz tarefas próprias no motor de prática.

const NEW_LESSON_IDS = [6, 22, 34, 45, 56, 78, 79, 97];

describe("f9x — expansão contínua do acervo editorial", () => {
  it("cada categoria aberta nesta rodada tem lição estruturada", () => {
    for (const id of NEW_LESSON_IDS) {
      expect(hasLesson(id), `conceito ${id} segue sem aula estruturada`).toBe(true);
    }
  });

  it("cada lição nova tem tarefas próprias registradas no motor", () => {
    for (const id of NEW_LESSON_IDS) {
      const lesson = getLesson(id);
      expect(lesson, `lição ${id} ausente`).toBeDefined();
      for (const pid of lesson!.practiceIds) {
        expect(getTask(pid), `tarefa ${pid} inexistente para lição ${id}`).toBeDefined();
      }
      expect(lesson!.practiceIds.length, `lição ${id} sem prática própria`).toBeGreaterThan(0);
    }
  });

  it("o elo decisivo Security (sintoma SQL injection, lab sqli) aponta para aulas", () => {
    const symptom = SYMPTOMS.find((s) => s.conceptIds.includes(78));
    expect(symptom, "sintoma SQL injection sumiu do catálogo").toBeDefined();
    expect("sqli" in LABS, "lab sqli sumiu do catálogo").toBe(true);
    expect(hasLesson(78), "sintoma decisivo 78 segue sem aula").toBe(true);
    expect(hasLesson(79), "sintoma decisivo 79 segue sem aula").toBe(true);
  });

  it("nenhum id de lição duplicado após a expansão", () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
