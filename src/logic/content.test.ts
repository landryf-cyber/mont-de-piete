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

  it('chaque client apporte un objet qui existe', () => {
    const ids = new Set(allItems.map((i) => i.id));
    for (const c of allClients) expect(ids, `${c.id} → ${c.objet}`).toContain(c.objet);
  });

  it('chaque intention existe dans balance.json', () => {
    for (const c of allClients) expect(Object.keys(balance.intentions)).toContain(c.intention);
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
      for (const [k, line] of Object.entries(c.repliques)) {
        expect(line.length, `${c.id}.${k}`).toBeLessThanOrEqual(90);
      }
    }
  });
});
