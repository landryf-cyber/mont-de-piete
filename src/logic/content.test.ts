import { describe, expect, it } from 'vitest';
import balance from '../data/balance.json';
import clients from '../data/clients.json';
import items from '../data/items.json';
import type { ClientDef, ItemDef } from '../state/content';

/** Vérifie que le contenu JSON est cohérent : on peut en ajouter sans casser le jeu. */
const allItems = items as ItemDef[];
const allClients = clients as ClientDef[];

describe('contenu JSON', () => {
  it('les identifiants sont uniques', () => {
    expect(new Set(allItems.map((i) => i.id)).size).toBe(allItems.length);
    expect(new Set(allClients.map((c) => c.id)).size).toBe(allClients.length);
  });

  it('il y a assez d’objets pour une journée, sans doublon', () => {
    expect(allItems.length).toBeGreaterThanOrEqual(balance.clients_par_jour);
  });

  it('le prototype v0.1 a 15 objets (4 étranges, 3 volés) et 6 clients', () => {
    expect(allItems).toHaveLength(15);
    expect(allItems.filter((i) => i.propriete_etrange)).toHaveLength(4);
    expect(allItems.filter((i) => i.vole)).toHaveLength(3);
    expect(allClients).toHaveLength(6);
  });

  it('chaque client a au moins une réplique d’entrée', () => {
    for (const c of allClients) expect(c.repliques.entree.length, c.id).toBeGreaterThan(0);
  });

  it('chaque intention existe dans balance.json', () => {
    for (const c of allClients) expect(Object.keys(balance.intentions)).toContain(c.intention);
  });

  it('les descriptions d’objets restent courtes', () => {
    for (const i of allItems) expect(i.description.length, i.id).toBeLessThanOrEqual(90);
  });

  it('chaque objet a un état valide et des valeurs positives', () => {
    for (const i of allItems) {
      expect(['authentique', 'contrefacon', 'abime']).toContain(i.etat);
      expect(i.valeur_apparente, i.id).toBeGreaterThan(0);
      expect(i.valeur_reelle, i.id).toBeGreaterThan(0);
    }
  });

  it('les contre-offres affichent bien leur prix', () => {
    for (const c of allClients) expect(c.repliques.contre, c.id).toContain('{prix}');
  });

  it('les répliques restent courtes (2 lignes max ≈ 90 caractères)', () => {
    for (const c of allClients) {
      const { entree, ...autres } = c.repliques;
      const lines: [string, string][] = [
        ...entree.map((l, i): [string, string] => [`entree[${i}]`, l]),
        ...Object.entries(autres),
      ];
      for (const [k, line] of lines) expect(line.length, `${c.id}.${k}`).toBeLessThanOrEqual(90);
    }
  });
});
