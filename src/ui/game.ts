import type { Balance, OfferLevel, Tool } from '../state/content';
import type { DayState } from '../state/dayState';
import {
  acceptCounter,
  canAcceptCounter,
  canUseTool,
  currentVisit,
  daySummary,
  findClient,
  findItem,
  letGo,
  makeOffer,
  nextClient,
  offersFor,
  useTool,
  type Content,
} from '../logic/day';
import { toolResult } from '../logic/tools';
import { esc } from './html';

const TOOL_LABELS: Record<Tool, string> = { loupe: 'Loupe', registre: 'Registre', ecouter: 'Écouter' };
const OFFER_LABELS: Record<OfferLevel, string> = { basse: 'Offre basse', juste: 'Offre juste', haute: 'Offre haute' };

export interface GameCallbacks {
  onReplaySame: () => void;
  onNewDay: () => void;
}

/**
 * Interface brute de la journée (étape 2) : texte et boutons, sans illustrations.
 * L'état vit dans `state` ; chaque action le remplace par un nouvel état, puis on redessine.
 */
export function runDay(
  root: HTMLElement,
  initial: DayState,
  content: Content,
  balance: Balance,
  callbacks: GameCallbacks,
): void {
  let state = initial;
  /** Dernière réplique du client (affichage seulement, pas dans l'état du jeu). */
  let line = '';

  const fill = (text: string, prix?: number) => text.replace('{prix}', String(prix ?? ''));

  function render(): void {
    if (state.phase === 'fin') return renderEnd();

    const visit = currentVisit(state);
    const client = findClient(content, visit.clientId);
    const item = findItem(content, visit.itemId);
    if (!line) line = client.repliques.entree[visit.entryLine] ?? '';

    const toolDots = '●'.repeat(state.toolUsesLeft) + '○'.repeat(balance.utilisations_outils_par_jour - state.toolUsesLeft);
    const results = visit.revealed
      .map((tool) => {
        const r = toolResult(item, tool);
        return `<li class="${r.etrange ? 'strange' : ''}"><b>${TOOL_LABELS[tool]}</b> — ${esc(r.texte)}</li>`;
      })
      .join('');

    let actions = '';
    if (visit.status === 'en_cours') {
      const offers = offersFor(visit, balance);
      const tools = (Object.keys(TOOL_LABELS) as Tool[])
        .map(
          (t) =>
            `<button class="btn btn-tool" type="button" data-tool="${t}" ${canUseTool(state, t) ? '' : 'disabled'}>${TOOL_LABELS[t]}</button>`,
        )
        .join('');
      const offerButtons = (Object.keys(OFFER_LABELS) as OfferLevel[])
        .map(
          (lvl) =>
            `<button class="btn btn-offer" type="button" data-offer="${lvl}" ${offers[lvl] > state.money ? 'disabled' : ''}>
              <span>${OFFER_LABELS[lvl]}</span><span>${offers[lvl]} ¤</span>
            </button>`,
        )
        .join('');
      actions = `
        <div class="tools">${tools}</div>
        <div class="offers">${offerButtons}
          <button class="btn btn-ghost" type="button" data-action="refuse">Refuser</button>
        </div>`;
    } else if (visit.status === 'contre') {
      actions = `
        <div class="offers">
          <button class="btn btn-primary" type="button" data-action="accept-counter" ${canAcceptCounter(state) ? '' : 'disabled'}>
            Accepter ${visit.counterPrice} ¤
          </button>
          <button class="btn btn-ghost" type="button" data-action="let-go">Laisser partir</button>
        </div>`;
    } else {
      const last = state.current === state.visits.length - 1;
      const outcome =
        visit.status === 'achete'
          ? `<p class="outcome">Acheté pour <b>${visit.pricePaid} ¤</b>.</p>`
          : `<p class="outcome">Le client est reparti avec son objet.</p>`;
      actions = `${outcome}
        <div class="offers">
          <button class="btn btn-primary" type="button" data-action="next">${last ? 'Fermer la boutique' : 'Client suivant'}</button>
        </div>`;
    }

    root.innerHTML = `
      <section class="screen client-screen">
        <header class="hud">
          <span>Client ${state.current + 1}/${state.visits.length}</span>
          <span class="tool-dots" aria-label="${state.toolUsesLeft} outils restants">${toolDots}</span>
          <span class="money">${state.money} ¤</span>
        </header>
        <div class="client">
          <p class="client-name">${esc(client.nom)}</p>
          <p class="client-look">${esc(client.apparence)}</p>
          <p class="client-line">« ${esc(line)} »</p>
        </div>
        <article class="item-card">
          <h2 class="item-name">${esc(item.nom)}</h2>
          <p class="item-desc">${esc(item.description)}</p>
          <p class="item-prices">
            <span>Estimation à l'œil : <b>${visit.estimation} ¤</b></span>
            <span>Il demande : <b>${visit.asking} ¤</b></span>
          </p>
          ${results ? `<ul class="tool-results">${results}</ul>` : ''}
        </article>
        <div class="actions">${actions}</div>
      </section>
    `;
  }

  function renderEnd(): void {
    const sum = daySummary(state, content);
    const rows = sum.lines
      .map(
        (l) => `<li><span>${esc(l.item.nom)}</span>
          <span>payé ${l.pricePaid} ¤ · vaut ${l.realValue} ¤ ·
          <b class="${l.gain >= 0 ? 'gain' : 'loss'}">${l.gain >= 0 ? '+' : ''}${l.gain} ¤</b></span></li>`,
      )
      .join('');
    root.innerHTML = `
      <section class="screen end-screen">
        <h1 class="title">Fermeture</h1>
        <p class="subtitle">L'expert passe et estime tes achats.</p>
        <article class="item-card">
          ${rows ? `<ul class="summary">${rows}</ul>` : '<p>Tu n’as rien acheté aujourd’hui.</p>'}
          <p class="summary-total">Dépensé : <b>${sum.spent} ¤</b> · Valeur réelle : <b>${sum.realValue} ¤</b></p>
          <p class="summary-total big">Bilan : <b class="${sum.gain >= 0 ? 'gain' : 'loss'}">${sum.gain >= 0 ? '+' : ''}${sum.gain} ¤</b></p>
          <p class="summary-total">En caisse : ${sum.money} ¤</p>
        </article>
        <div class="offers">
          <button class="btn btn-primary" type="button" data-action="new-day">Nouvelle journée</button>
          <button class="btn btn-ghost" type="button" data-action="replay">Rejouer la même journée</button>
        </div>
      </section>
    `;
  }

  root.addEventListener('click', function onClick(event) {
    const button = (event.target as HTMLElement).closest('button');
    if (!button || button.disabled) return;
    const { tool, offer, action } = button.dataset;

    if (tool) {
      state = useTool(state, tool as Tool);
    } else if (offer) {
      const visit = currentVisit(state);
      const client = findClient(content, visit.clientId);
      const r = makeOffer(state, offer as OfferLevel, balance);
      state = r.state;
      line =
        r.result.type === 'accepte'
          ? client.repliques.accepte
          : r.result.type === 'contre'
            ? fill(client.repliques.contre, r.result.prix)
            : client.repliques.part;
    } else if (action === 'accept-counter') {
      state = acceptCounter(state);
      line = findClient(content, currentVisit(state).clientId).repliques.accepte;
    } else if (action === 'let-go' || action === 'refuse') {
      state = letGo(state);
      line = findClient(content, currentVisit(state).clientId).repliques.part;
    } else if (action === 'next') {
      state = nextClient(state);
      line = '';
    } else if (action === 'replay' || action === 'new-day') {
      root.removeEventListener('click', onClick);
      if (action === 'replay') callbacks.onReplaySame();
      else callbacks.onNewDay();
      return;
    } else {
      return;
    }
    render();
  });

  render();
}
