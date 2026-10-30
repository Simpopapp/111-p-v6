import { describe, expect, it } from "vitest";
import { TASKS } from "@/lib/exercises-data";
import { evaluate } from "@/lib/exercises";
import type { Task } from "@/lib/exercises";

// Remendo s38a (recomendação da rodada 6, executada no remix 7): rubricas
// podiam referenciar chaves de opções inexistentes (t-7-variant image-pkg→
// package) sem que nenhum teste detectasse. Duas garantias estáticas:
// 1. todo critério é satisfatível por alguma resposta construída apenas com
//    as opções reais da tarefa;
// 2. toda tarefa de escolha é solucionável ("met") por alguma combinação e
//    NÃO é satisfeita pela resposta vazia (critério indiscriminado é lacuna).

function subsetsOf(keys: string[], maxSize: number): string[][] {
  const out: string[][] = [[]];
  const walk = (start: number, acc: string[]) => {
    if (acc.length >= maxSize) return;
    for (let i = start; i < keys.length; i++) {
      const key = keys[i]!;
      const next = [...acc, key];
      out.push(next);
      walk(i + 1, next);
    }
  };
  walk(0, []);
  return out;
}

function permutations(keys: string[]): string[][] {
  if (keys.length <= 1) return [keys];
  const out: string[][] = [];
  const walk = (acc: string[], rest: string[]) => {
    if (rest.length === 0) {
      out.push(acc);
      return;
    }
    for (let i = 0; i < rest.length; i++) {
      walk([...acc, rest[i]!], [...rest.slice(0, i), ...rest.slice(i + 1)]);
    }
  };
  walk([], keys);
  return out;
}

describe("rubric-integrity — rubricas não referenciam opções inexistentes", () => {
  const PICKED_TASKS = TASKS.filter((t) => t.options && t.type !== "order");
  const ORDER_TASKS = TASKS.filter((t) => t.options && t.type === "order");

  it("cada critério é satisfatível por alguma resposta das opções reais", () => {
    for (const task of PICKED_TASKS) {
      const keys = task.options!.map((o) => o.key);
      const answers: string[][] = subsetsOf(keys, 3);
      for (const criterion of task.rubric.criteria) {
        const satisfiable = answers.some((picked) => {
          try {
            return criterion.check({ picked }) === true;
          } catch {
            return false;
          }
        });
        expect(
          satisfiable,
          `tarefa ${task.id}: critério "${criterion.key}" não é satisfeito por nenhuma combinação de até 2 opções reais (chave fantasma?)`,
        ).toBe(true);
      }
    }
  });

  it("toda tarefa de escolha é solucionável por alguma combinação real", () => {
    for (const task of PICKED_TASKS) {
      const keys = task.options!.map((o) => o.key);
      const solvable = subsetsOf(keys, 3).some((picked) => {
        try {
          return evaluate(task, { picked }, 0).outcome === "met";
        } catch {
          return false;
        }
      });
      expect(
        solvable,
        `tarefa ${task.id}: nenhuma combinação de opções reais atinge "met"`,
      ).toBe(true);
    }
  });

  it("resposta vazia não atinge met (critério indiscriminado é lacuna)", () => {
    for (const task of PICKED_TASKS) {
      expect(
        evaluate(task, { picked: [] }, 0).outcome,
        `tarefa ${task.id}: resposta vazia atinge met`,
      ).not.toBe("met");
    }
  });

  it("validAlternatives só referencia opções existentes", () => {
    for (const task of TASKS) {
      if (!task.options || !task.rubric.validAlternatives) continue;
      const keys = new Set(task.options!.map((o) => o.key));
      for (const alt of task.rubric.validAlternatives) {
        for (const pick of alt.picks) {
          expect(
            keys.has(pick),
            `tarefa ${task.id}: alternativa válida referencia opção inexistente "${pick}"`,
          ).toBe(true);
        }
      }
    }
  });

  it("toda tarefa de ordenação é solucionável por alguma ordem das opções", () => {
    for (const task of ORDER_TASKS as Task[]) {
      const keys = task.options!.map((o) => o.key);
      const solvable = permutations(keys).some((order) => {
        try {
          return evaluate(task, { order }, 0).outcome === "met";
        } catch {
          return false;
        }
      });
      expect(
        solvable,
        `tarefa ${task.id}: nenhuma ordem das opções atinge "met"`,
      ).toBe(true);
    }
  });
});
