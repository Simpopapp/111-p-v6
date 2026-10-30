import { describe, expect, it } from "vitest";
import { hasLesson, LESSONS } from "@/lib/lessons";
import { ROUTES } from "@/lib/recommend";

// F9 (PRD project3 §3/F9, planejamento §12.1–12.2): percursos vendidos como
// profundos não podem apontar referência superficial no ponto decisivo, e
// proveniência é honesta — `reviewed` só com revisão efetiva registrada.

describe("f9 — percursos fechados e honestidade de proveniência", () => {
  it("todo conceito de percurso tem lição estruturada, não só referência rápida", () => {
    for (const route of ROUTES) {
      for (const id of route.conceptIds) {
        expect(
          hasLesson(id),
          `percurso "${route.title}" usa o conceito ${id} sem aula estruturada`,
        ).toBe(true);
      }
    }
  });

  it("proveniência honesta: reviewed:true exige revisão efetiva registrada nas notes", () => {
    for (const l of LESSONS) {
      if (!l.provenance.reviewed) continue;
      expect(
        l.provenance.notes.includes("revisão efetiva registrada"),
        `lição ${l.id}: reviewed sem registro de revisão efetiva`,
      ).toBe(true);
    }
  });
});
