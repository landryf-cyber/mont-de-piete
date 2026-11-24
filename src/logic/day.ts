import type { Balance, ClientDef, ItemDef, OfferLevel, Tool } from '../state/content';
import type { DayState, Visit } from '../state/dayState';
import { askingPrice, evaluateOffer, floorPrice, offerPrice, type OfferResult } from './negotiation';
import { createRng } from './rng';

/**
 * Déroulé d'une journée, en fonctions pures :
 * chaque action prend un état et renvoie un NOUVEL état (l'ancien n'est jamais modifié).
 * Une action impossible (pas assez d'argent, plus d'outils…) lève une erreur :
 * l'interface doit empêcher ces cas en grisant les boutons.
 */

export interface Content {
  items: readonly ItemDef[];
  clients: readonly ClientDef[];
}

export function findItem(content: Content, id: string): ItemDef {
  const item = content.items.find((i) => i.id === id);
  if (!item) throw new Error(`Objet inconnu : ${id}`);
  return item;
}

export function findClient(content: Content, id: string): ClientDef {
  const client = content.clients.find((c) => c.id === id);
  if (!client) throw new Error(`Client inconnu : ${id}`);
  return client;
}

/** Prépare la journée : ordre des clients, prix demandés et planchers cachés (tirés avec la graine). */
export function startDay(seed: number, content: Content, balance: Balance): DayState {
  const rng = createRng(seed);
  const clients = rng.shuffle(content.clients).slice(0, balance.clients_par_jour);
  const visits: Visit[] = clients.map((client) => {
    const item = findItem(content, client.objet);
    const estimation = item.valeur_apparente;
    return {
      clientId: client.id,
      itemId: item.id,
      estimation,
      asking: askingPrice(estimation, client.intention, balance),
      floor: floorPrice(estimation, client.intention, balance, rng),
      revealed: [],
      status: 'en_cours',
    };
  });
  return {
    seed,
    money: balance.argent_depart,
    toolUsesLeft: balance.utilisations_outils_par_jour,
    visits,
    current: 0,
    phase: visits.length > 0 ? 'clients' : 'fin',
  };
}

export function currentVisit(state: DayState): Visit {
  const visit = state.visits[state.current];
  if (state.phase !== 'clients' || !visit) throw new Error('Aucun client en cours');
  return visit;
}

function updateCurrent(state: DayState, changes: Partial<Visit>, money = state.money): DayState {
  const visits = state.visits.map((v, i) => (i === state.current ? { ...v, ...changes } : v));
  return { ...state, visits, money };
}

/** Prix des trois offres pour ce client (jamais plus que ce qu'il demande). */
export function offersFor(visit: Visit, balance: Balance): Record<OfferLevel, number> {
  const price = (level: OfferLevel) => Math.min(offerPrice(visit.estimation, level, balance), visit.asking);
  return { basse: price('basse'), juste: price('juste'), haute: price('haute') };
}

export function canUseTool(state: DayState, tool: Tool): boolean {
  if (state.phase !== 'clients' || state.toolUsesLeft <= 0) return false;
  const visit = currentVisit(state);
  return visit.status === 'en_cours' && !visit.revealed.includes(tool);
}

export function useTool(state: DayState, tool: Tool): DayState {
  if (!canUseTool(state, tool)) throw new Error(`Outil indisponible : ${tool}`);
  const visit = currentVisit(state);
  return {
    ...updateCurrent(state, { revealed: [...visit.revealed, tool] }),
    toolUsesLeft: state.toolUsesLeft - 1,
  };
}

export function makeOffer(
  state: DayState,
  level: OfferLevel,
  balance: Balance,
): { state: DayState; result: OfferResult } {
  const visit = currentVisit(state);
  if (visit.status !== 'en_cours') throw new Error('Offre impossible maintenant');
  const offer = offersFor(visit, balance)[level];
  if (offer > state.money) throw new Error("Pas assez d'argent");

  const result = evaluateOffer(offer, visit.floor, visit.asking, balance);
  switch (result.type) {
    case 'accepte':
      return { state: updateCurrent(state, { status: 'achete', pricePaid: offer }, state.money - offer), result };
    case 'contre':
      return { state: updateCurrent(state, { status: 'contre', counterPrice: result.prix }), result };
    case 'part':
      return { state: updateCurrent(state, { status: 'parti' }), result };
  }
}

export function canAcceptCounter(state: DayState): boolean {
  const visit = currentVisit(state);
  return visit.status === 'contre' && (visit.counterPrice ?? Infinity) <= state.money;
}

export function acceptCounter(state: DayState): DayState {
  if (!canAcceptCounter(state)) throw new Error('Contre-offre impossible');
  const price = currentVisit(state).counterPrice as number;
  return updateCurrent(state, { status: 'achete', pricePaid: price }, state.money - price);
}

/** Le joueur refuse l'objet, ou laisse partir le client après sa contre-offre. */
export function letGo(state: DayState): DayState {
  const visit = currentVisit(state);
  if (visit.status !== 'en_cours' && visit.status !== 'contre') throw new Error('Le client est déjà parti');
  return updateCurrent(state, { status: 'parti' });
}

export function nextClient(state: DayState): DayState {
  const visit = currentVisit(state);
  if (visit.status !== 'achete' && visit.status !== 'parti') throw new Error('Le client est encore là');
  const current = state.current + 1;
  return { ...state, current, phase: current < state.visits.length ? 'clients' : 'fin' };
}

export interface SummaryLine {
  item: ItemDef;
  pricePaid: number;
  realValue: number;
  gain: number;
}

export interface DaySummary {
  lines: SummaryLine[];
  spent: number;
  realValue: number;
  gain: number;
  money: number;
}

/** Bilan : ce que valaient vraiment les objets achetés. */
export function daySummary(state: DayState, content: Content): DaySummary {
  const lines = state.visits
    .filter((v) => v.status === 'achete')
    .map((v) => {
      const item = findItem(content, v.itemId);
      const pricePaid = v.pricePaid ?? 0;
      return { item, pricePaid, realValue: item.valeur_reelle, gain: item.valeur_reelle - pricePaid };
    });
  const spent = lines.reduce((s, l) => s + l.pricePaid, 0);
  const realValue = lines.reduce((s, l) => s + l.realValue, 0);
  return { lines, spent, realValue, gain: realValue - spent, money: state.money };
}
