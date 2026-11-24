import './ui/style.css';
import balance from './data/balance.json';
import clients from './data/clients.json';
import items from './data/items.json';
import { startDay, type Content } from './logic/day';
import { createRng } from './logic/rng';
import type { ClientDef, ItemDef } from './state/content';
import { enterFullscreen } from './ui/fullscreen';
import { runDay } from './ui/game';
import { RUMEURS, renderMorning, renderTitle } from './ui/screens';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('#app introuvable');
const root: HTMLElement = app;

const content: Content = { items: items as ItemDef[], clients: clients as ClientDef[] };

/**
 * Graine de la partie : `?graine=123` dans l'adresse pour rejouer une partie précise,
 * sinon une graine au hasard (seul endroit où l'on ne passe pas par le RNG à graine).
 */
function readSeed(): number {
  const fromUrl = Number(new URLSearchParams(location.search).get('graine'));
  if (Number.isInteger(fromUrl) && fromUrl > 0) return fromUrl;
  return randomSeed();
}

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000) + 1;
}

function playDay(seed: number): void {
  const rng = createRng(seed);
  renderMorning(
    root,
    { day: 1, money: balance.argent_depart, rumeur: rng.pick(RUMEURS), seed },
    () => {
      runDay(root, startDay(seed, content, balance), content, balance, {
        onReplaySame: () => playDay(seed),
        onNewDay: () => playDay(randomSeed()),
      });
    },
  );
}

renderTitle(root, () => {
  enterFullscreen();
  playDay(readSeed());
});
