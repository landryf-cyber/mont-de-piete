import balance from '../data/balance.json';

/**
 * État du jeu : données pures et sérialisables (aucune logique d'affichage).
 * Il grandira à chaque étape (clients, objets achetés, outils…).
 */
export interface GameState {
  /** Graine de la partie : permet de rejouer exactement la même journée. */
  seed: number;
  /** Jour en cours (une seule journée dans la v0.1). */
  day: number;
  money: number;
}

export function createGameState(seed: number): GameState {
  return { seed, day: 1, money: balance.argent_depart };
}
