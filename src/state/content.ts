import balance from '../data/balance.json';

/** Types du contenu JSON (src/data/). Ajouter du contenu ne demande pas de toucher au code. */

export type Etat = 'authentique' | 'contrefacon' | 'abime';
export type Intention = keyof typeof balance.intentions;
export type OfferLevel = keyof typeof balance.offres;
export type Tool = 'loupe' | 'registre' | 'ecouter';

export interface StrangeProperty {
  nom: string;
  description: string;
}

export interface ItemDef {
  id: string;
  nom: string;
  description: string;
  /** Ce que l'objet a l'air de valoir : c'est l'« estimation à l'œil » montrée au joueur. */
  valeur_apparente: number;
  /** Ce qu'il vaut vraiment : caché jusqu'au bilan. */
  valeur_reelle: number;
  etat: Etat;
  vole: boolean;
  propriete_etrange?: StrangeProperty;
  fragment_mystere?: string;
}

export interface ClientLines {
  /** Ce que le client peut dire en entrant (une est tirée au hasard, 2 lignes max). */
  entree: string[];
  /** Quand il accepte ton offre. */
  accepte: string;
  /** Quand il contre-propose. « {prix} » est remplacé par son prix. */
  contre: string;
  /** Quand il part (offre trop basse, contre-offre refusée ou refus). */
  part: string;
}

export interface ClientDef {
  id: string;
  nom: string;
  /** Apparence en quelques mots (servira à dessiner la silhouette). */
  apparence: string;
  /** Intention cachée. Elle influence aussi l'objet apporté (voir balance.json). */
  intention: Intention;
  repliques: ClientLines;
}

export type Balance = typeof balance;
