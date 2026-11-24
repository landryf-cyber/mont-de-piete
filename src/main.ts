import './ui/style.css';
import { createRng } from './logic/rng';
import { createGameState } from './state/gameState';
import { renderTitle, renderShopOpen } from './ui/screens';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('#app introuvable');

/**
 * Graine de la partie : `?graine=123` dans l'adresse pour rejouer une partie précise,
 * sinon une graine au hasard (seul endroit où l'on ne passe pas par le RNG à graine).
 */
function readSeed(): number {
  const fromUrl = Number(new URLSearchParams(location.search).get('graine'));
  if (Number.isInteger(fromUrl) && fromUrl > 0) return fromUrl;
  return Math.floor(Math.random() * 1_000_000) + 1;
}

const state = createGameState(readSeed());
const rng = createRng(state.seed);

renderTitle(app, () => renderShopOpen(app, state, rng));
