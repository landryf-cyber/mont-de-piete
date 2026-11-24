/**
 * Générateur de nombres aléatoires « à graine » (algorithme mulberry32).
 * Même graine => même suite de nombres => même partie, reproductible.
 * Toute la génération du jeu doit passer par ici, jamais par Math.random().
 */
export interface Rng {
  /** Nombre décimal dans [0, 1). */
  next(): number;
  /** Entier dans [min, max], bornes incluses. */
  int(min: number, max: number): number;
  /** Élément au hasard d'une liste non vide. */
  pick<T>(items: readonly T[]): T;
  /** Copie mélangée d'une liste (la liste d'origine n'est pas modifiée). */
  shuffle<T>(items: readonly T[]): T[];
  /** Vrai avec la probabilité donnée (entre 0 et 1). */
  chance(probability: number): boolean;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => {
    if (max < min) throw new Error(`int(): max (${max}) < min (${min})`);
    return min + Math.floor(next() * (max - min + 1));
  };

  return {
    next,
    int,
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error('pick(): liste vide');
      return items[int(0, items.length - 1)];
    },
    shuffle<T>(items: readonly T[]): T[] {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = int(0, i);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    chance(probability: number): boolean {
      return next() < probability;
    },
  };
}

/** Transforme un texte (ex. « boutique-42 ») en graine numérique. */
export function seedFromString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
