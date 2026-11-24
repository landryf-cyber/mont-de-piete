import { esc } from './html';

/** Petites rumeurs provisoires, en attendant le vrai journal du matin. */
export const RUMEURS = [
  'On raconte qu’une horloge de la rue des Tanneurs sonne treize coups.',
  'Un parapluie a été retrouvé sec, au fond du canal.',
  'Le facteur jure qu’une lettre s’est livrée toute seule.',
  'Quelqu’un a vu deux fois le même chat, au même moment.',
];

export function renderTitle(root: HTMLElement, onOpen: () => void): void {
  root.innerHTML = `
    <section class="screen title-screen">
      <div class="lamp" aria-hidden="true"></div>
      <h1 class="title">Mont-de-Piété</h1>
      <p class="subtitle">Prêteur sur gages · Objets étranges</p>
      <button class="btn btn-primary" type="button" data-action="open">Ouvrir la boutique</button>
    </section>
  `;
  root.querySelector('[data-action="open"]')?.addEventListener('click', onOpen);
}

export function renderMorning(
  root: HTMLElement,
  info: { day: number; money: number; rumeur: string; seed: number },
  onStart: () => void,
): void {
  root.innerHTML = `
    <section class="screen shop-screen">
      <header class="hud">
        <span>Jour ${info.day}</span>
        <span class="money">${info.money} ¤</span>
      </header>
      <article class="newspaper">
        <p class="newspaper-label">Le journal du matin</p>
        <p class="newspaper-line">${esc(info.rumeur)}</p>
      </article>
      <p class="waiting">La boutique est ouverte.<br />On entend des pas sur le trottoir…</p>
      <button class="btn btn-primary" type="button" data-action="start">Faire entrer le premier client</button>
      <p class="seed">graine n° ${info.seed}</p>
    </section>
  `;
  root.querySelector('[data-action="start"]')?.addEventListener('click', onStart);
}
