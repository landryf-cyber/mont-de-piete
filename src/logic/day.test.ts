import { describe, expect, it } from 'vitest';
import type { DayState } from '../state/dayState';
import {
  acceptCounter,
  canAcceptCounter,
  canUseTool,
  currentVisit,
  daySummary,
  letGo,
  makeOffer,
  nextClient,
  offersFor,
  pickItem,
  startDay,
  useTool,
} from './day';
import { createRng } from './rng';
import { testBalance as b, testContent as content } from './testFixtures';

/** Force un plancher connu sur le client en cours (le vrai est tiré au hasard). */
function withFloor(state: DayState, floor: number): DayState {
  return {
    ...state,
    visits: state.visits.map((v, i) => (i === state.current ? { ...v, floor } : v)),
  };
}

describe('startDay', () => {
  it('prépare tous les clients avec argent et outils de départ', () => {
    const s = startDay(1, content, b);
    expect(s.visits).toHaveLength(3);
    expect(s.money).toBe(300);
    expect(s.toolUsesLeft).toBe(3);
    expect(s.phase).toBe('clients');
  });

  it('est identique pour la même graine', () => {
    expect(startDay(42, content, b)).toEqual(startDay(42, content, b));
  });

  it('change d’ordre selon la graine', () => {
    const orders = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map((seed) => startDay(seed, content, b).visits.map((v) => v.clientId).join()),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  it('ne donne jamais deux fois le même objet dans la journée', () => {
    for (let seed = 1; seed < 50; seed++) {
      const ids = startDay(seed, content, b).visits.map((v) => v.itemId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('choisit une réplique d’entrée qui existe', () => {
    for (let seed = 1; seed < 20; seed++) {
      for (const v of startDay(seed, content, b).visits) expect([0, 1]).toContain(v.entryLine);
    }
  });

  it('limite le nombre de clients à clients_par_jour', () => {
    const s = startDay(1, content, { ...b, clients_par_jour: 2 });
    expect(s.visits).toHaveLength(2);
  });
});

describe('pickItem', () => {
  const items = content.items; // montre (normale), bague (volée), stylo (contrefaçon)
  const count = (intention: 'voleur' | 'menteur' | 'honnete') => {
    const rng = createRng(123);
    const tally: Record<string, number> = { montre: 0, bague: 0, stylo: 0 };
    for (let i = 0; i < 2000; i++) tally[pickItem(items, intention, b, rng).id]++;
    return tally;
  };

  it('un voleur apporte surtout des objets volés, mais pas toujours', () => {
    const t = count('voleur');
    expect(t.bague / 2000).toBeGreaterThan(0.6);
    expect(t.montre).toBeGreaterThan(0);
  });

  it('un menteur apporte surtout des contrefaçons, mais pas toujours', () => {
    const t = count('menteur');
    expect(t.stylo / 2000).toBeGreaterThan(0.6);
    expect(t.montre).toBeGreaterThan(0);
  });

  it('un client honnête apporte surtout des objets ordinaires, parfois volés sans le savoir', () => {
    const t = count('honnete');
    expect(t.montre / 2000).toBeGreaterThan(0.7);
    expect(t.bague).toBeGreaterThan(0);
  });

  it('se rabat sur ce qui reste quand une catégorie est vide', () => {
    const onlyStolen = items.filter((i) => i.vole);
    expect(pickItem(onlyStolen, 'menteur', b, createRng(1)).id).toBe('bague');
  });

  it('refuse une liste vide', () => {
    expect(() => pickItem([], 'voleur', b, createRng(1))).toThrow();
  });
});

describe('outils', () => {
  it('consomme une utilisation et note l’outil utilisé', () => {
    const s = useTool(startDay(1, content, b), 'loupe');
    expect(s.toolUsesLeft).toBe(2);
    expect(currentVisit(s).revealed).toEqual(['loupe']);
  });

  it('interdit le même outil deux fois sur le même objet', () => {
    const s = useTool(startDay(1, content, b), 'loupe');
    expect(canUseTool(s, 'loupe')).toBe(false);
    expect(() => useTool(s, 'loupe')).toThrow();
  });

  it('interdit les outils quand il n’en reste plus', () => {
    const s = { ...startDay(1, content, b), toolUsesLeft: 0 };
    expect(canUseTool(s, 'registre')).toBe(false);
  });

  it('ne modifie pas l’état d’origine', () => {
    const s = startDay(1, content, b);
    useTool(s, 'ecouter');
    expect(s.toolUsesLeft).toBe(3);
    expect(currentVisit(s).revealed).toEqual([]);
  });
});

describe('offres', () => {
  it('ne propose jamais plus que le prix demandé', () => {
    const s = startDay(1, content, b);
    const v = { ...currentVisit(s), estimation: 100, asking: 80 };
    expect(offersFor(v, b)).toEqual({ basse: 40, juste: 70, haute: 80 });
  });

  it('achat accepté : l’argent baisse et l’objet est acheté', () => {
    const s = withFloor(startDay(1, content, b), 1);
    const price = offersFor(currentVisit(s), b).basse;
    const r = makeOffer(s, 'basse', b);
    expect(r.result.type).toBe('accepte');
    expect(r.state.money).toBe(300 - price);
    expect(currentVisit(r.state)).toMatchObject({ status: 'achete', pricePaid: price });
  });

  it('contre-offre puis acceptation', () => {
    const s0 = startDay(1, content, b);
    const juste = offersFor(currentVisit(s0), b).juste;
    const s = withFloor(s0, juste + 5);
    const r = makeOffer(s, 'juste', b);
    expect(r.result.type).toBe('contre');
    expect(canAcceptCounter(r.state)).toBe(true);
    const after = acceptCounter(r.state);
    const paid = currentVisit(r.state).counterPrice as number;
    expect(after.money).toBe(300 - paid);
    expect(currentVisit(after).status).toBe('achete');
  });

  it('contre-offre refusée : le client part sans rien payer', () => {
    const s0 = startDay(1, content, b);
    const juste = offersFor(currentVisit(s0), b).juste;
    const r = makeOffer(withFloor(s0, juste + 5), 'juste', b);
    const after = letGo(r.state);
    expect(after.money).toBe(300);
    expect(currentVisit(after).status).toBe('parti');
  });

  it('offre trop basse : le client part', () => {
    const r = makeOffer(withFloor(startDay(1, content, b), 10_000), 'basse', b);
    expect(r.result.type).toBe('part');
    expect(currentVisit(r.state).status).toBe('parti');
  });

  it('impossible d’offrir plus que l’argent en caisse', () => {
    const s = { ...startDay(1, content, b), money: 1 };
    expect(() => makeOffer(s, 'haute', b)).toThrow();
  });

  it('contre-offre trop chère pour la caisse : impossible de l’accepter', () => {
    const s0 = startDay(1, content, b);
    const juste = offersFor(currentVisit(s0), b).juste;
    const r = makeOffer(withFloor(s0, juste + 5), 'juste', b);
    const poor = { ...r.state, money: 1 };
    expect(canAcceptCounter(poor)).toBe(false);
    expect(() => acceptCounter(poor)).toThrow();
  });

  it('pas de deuxième offre au même client', () => {
    const r = makeOffer(withFloor(startDay(1, content, b), 1), 'basse', b);
    expect(() => makeOffer(r.state, 'basse', b)).toThrow();
  });
});

describe('déroulé de la journée', () => {
  it('on ne passe au suivant qu’une fois le client parti ou servi', () => {
    const s = startDay(1, content, b);
    expect(() => nextClient(s)).toThrow();
    expect(nextClient(letGo(s)).current).toBe(1);
  });

  it('la journée se termine après le dernier client', () => {
    let s = startDay(1, content, b);
    for (let i = 0; i < 3; i++) s = nextClient(letGo(s));
    expect(s.phase).toBe('fin');
    expect(() => currentVisit(s)).toThrow();
  });
});

describe('daySummary', () => {
  it('révèle la vraie valeur et le gain de chaque achat', () => {
    let s = startDay(1, content, b);
    // achète tout le monde au prix bas
    for (let i = 0; i < 3; i++) {
      s = nextClient(makeOffer(withFloor(s, 1), 'basse', b).state);
    }
    const sum = daySummary(s, content);
    expect(sum.lines).toHaveLength(3);
    expect(sum.spent).toBe(300 - s.money);
    expect(sum.realValue).toBe(180 + 100 + 20);
    expect(sum.gain).toBe(sum.realValue - sum.spent);
  });

  it('journée sans achat : bilan à zéro', () => {
    let s = startDay(1, content, b);
    for (let i = 0; i < 3; i++) s = nextClient(letGo(s));
    expect(daySummary(s, content)).toMatchObject({ lines: [], spent: 0, gain: 0, money: 300 });
  });
});
