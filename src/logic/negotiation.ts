import type { Balance, Intention, OfferLevel } from '../state/content';
import type { Rng } from './rng';

/** Arrondit un prix au pas défini dans balance.json (ex. 5 ¤), jamais en dessous de 1. */
export function roundPrice(value: number, step: number): number {
  return Math.max(1, Math.round(value / step) * step);
}

/** Prix d'une offre (basse / juste / haute) à partir de l'estimation à l'œil. */
export function offerPrice(estimation: number, level: OfferLevel, balance: Balance): number {
  return roundPrice(estimation * balance.offres[level], balance.arrondi_prix);
}

/** Prix que le client annonce en entrant. */
export function askingPrice(estimation: number, intention: Intention, balance: Balance): number {
  return roundPrice(estimation * balance.intentions[intention].demande, balance.arrondi_prix);
}

/** Prix plancher caché : en dessous, le client n'accepte pas directement. */
export function floorPrice(
  estimation: number,
  intention: Intention,
  balance: Balance,
  rng: Rng,
): number {
  const v = balance.variation_plancher;
  const ratio = balance.intentions[intention].plancher + (rng.next() * 2 - 1) * v;
  return roundPrice(estimation * ratio, balance.arrondi_prix);
}

export type OfferResult =
  | { type: 'accepte' }
  | { type: 'contre'; prix: number }
  | { type: 'part' };

/**
 * Réaction du client à une offre.
 * - offre ≥ plancher : il accepte ;
 * - offre ≥ plancher × seuil : il contre-propose une fois, à mi-chemin vers sa demande
 *   (jamais sous son plancher) ;
 * - sinon : il part.
 */
export function evaluateOffer(
  offer: number,
  floor: number,
  asking: number,
  balance: Balance,
): OfferResult {
  if (offer >= floor) return { type: 'accepte' };
  if (offer >= floor * balance.seuil_contre_offre) {
    const towardAsking = offer + (asking - offer) * balance.part_vers_demande_contre_offre;
    const prix = Math.max(floor, roundPrice(towardAsking, balance.arrondi_prix));
    return { type: 'contre', prix };
  }
  return { type: 'part' };
}
