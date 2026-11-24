import { describe, expect, it } from 'vitest';
import { findItem } from './day';
import { testContent } from './testFixtures';
import { toolResult } from './tools';

const montre = findItem(testContent, 'montre');
const bague = findItem(testContent, 'bague');
const stylo = findItem(testContent, 'stylo');

describe('toolResult', () => {
  it('la loupe révèle l’état', () => {
    expect(toolResult(montre, 'loupe').texte).toBe('Authentique.');
    expect(toolResult(stylo, 'loupe').texte).toBe('Contrefaçon !');
  });

  it('le registre révèle les objets volés', () => {
    expect(toolResult(bague, 'registre').texte).toBe('Déclaré volé !');
    expect(toolResult(montre, 'registre').texte).toBe('Rien au registre.');
  });

  it('écouter révèle la propriété étrange, en turquoise', () => {
    expect(toolResult(montre, 'ecouter')).toEqual({ texte: 'En avance : 5 min', etrange: true });
    expect(toolResult(bague, 'ecouter').etrange).toBe(false);
  });
});
