import { describe, expect, it } from 'vitest';
import { createRng, seedFromString } from './rng';

describe('createRng', () => {
  it('donne la même suite pour la même graine', () => {
    const a = createRng(42);
    const b = createRng(42);
    const suiteA = Array.from({ length: 20 }, () => a.next());
    const suiteB = Array.from({ length: 20 }, () => b.next());
    expect(suiteA).toEqual(suiteB);
  });

  it('donne des suites différentes pour des graines différentes', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it('reste dans [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const n = rng.next();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it('int() respecte les bornes et les atteint', () => {
    const rng = createRng(3);
    const vus = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const n = rng.int(1, 6);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
      vus.add(n);
    }
    expect(vus.size).toBe(6);
  });

  it('int() refuse des bornes inversées', () => {
    expect(() => createRng(1).int(5, 1)).toThrow();
  });

  it('pick() refuse une liste vide', () => {
    expect(() => createRng(1).pick([])).toThrow();
  });

  it('shuffle() garde les mêmes éléments sans modifier la liste', () => {
    const liste = [1, 2, 3, 4, 5, 6, 7, 8];
    const melange = createRng(9).shuffle(liste);
    expect(liste).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...melange].sort((x, y) => x - y)).toEqual(liste);
  });

  it('chance() respecte à peu près la probabilité', () => {
    const rng = createRng(11);
    let oui = 0;
    for (let i = 0; i < 10000; i++) if (rng.chance(0.3)) oui++;
    expect(oui / 10000).toBeGreaterThan(0.27);
    expect(oui / 10000).toBeLessThan(0.33);
  });
});

describe('seedFromString', () => {
  it('est stable et sensible au texte', () => {
    expect(seedFromString('boutique')).toBe(seedFromString('boutique'));
    expect(seedFromString('boutique')).not.toBe(seedFromString('boutiquf'));
  });
});
