import { describe, expect, it } from 'vitest';
import { askingPrice, evaluateOffer, floorPrice, offerPrice, roundPrice } from './negotiation';
import { createRng } from './rng';
import { testBalance as b } from './testFixtures';

describe('roundPrice', () => {
  it('arrondit au pas le plus proche', () => {
    expect(roundPrice(42, 5)).toBe(40);
    expect(roundPrice(43, 5)).toBe(45);
  });
  it('ne descend jamais sous 1', () => {
    expect(roundPrice(1, 5)).toBe(1);
  });
});

describe('offerPrice', () => {
  it('applique le pourcentage de chaque offre', () => {
    expect(offerPrice(100, 'basse', b)).toBe(40);
    expect(offerPrice(100, 'juste', b)).toBe(70);
    expect(offerPrice(100, 'haute', b)).toBe(100);
  });
});

describe('askingPrice', () => {
  it('un menteur demande plus, un désespéré moins', () => {
    expect(askingPrice(100, 'menteur', b)).toBe(140);
    expect(askingPrice(100, 'desespere', b)).toBe(80);
  });
});

describe('floorPrice', () => {
  it('reste dans la fourchette plancher ± variation', () => {
    const rng = createRng(1);
    for (let i = 0; i < 200; i++) {
      const f = floorPrice(100, 'honnete', b, rng);
      expect(f).toBeGreaterThanOrEqual(55);
      expect(f).toBeLessThanOrEqual(75);
    }
  });
  it('est reproductible avec la même graine', () => {
    expect(floorPrice(100, 'voleur', b, createRng(5))).toBe(floorPrice(100, 'voleur', b, createRng(5)));
  });
});

describe('evaluateOffer', () => {
  it('accepte une offre au plancher ou au-dessus', () => {
    expect(evaluateOffer(65, 65, 100, b)).toEqual({ type: 'accepte' });
    expect(evaluateOffer(80, 65, 100, b)).toEqual({ type: 'accepte' });
  });

  it('contre-propose à mi-chemin vers la demande quand on est un peu en dessous', () => {
    // plancher 80, seuil 75 % => contre-offre dès 60. Mi-chemin entre 70 et 120 = 95.
    expect(evaluateOffer(70, 80, 120, b)).toEqual({ type: 'contre', prix: 95 });
  });

  it('ne contre-propose jamais sous son plancher', () => {
    // mi-chemin entre 60 et 70 = 65, mais plancher 68 => 68.
    const r = evaluateOffer(60, 68, 70, b);
    expect(r).toEqual({ type: 'contre', prix: 68 });
  });

  it('part si l’offre est trop basse', () => {
    expect(evaluateOffer(40, 80, 120, b)).toEqual({ type: 'part' });
  });
});
