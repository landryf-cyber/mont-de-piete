import type { Tool } from './content';

/** Où en est la visite d'un client. */
export type VisitStatus = 'en_cours' | 'contre' | 'achete' | 'parti';

export interface Visit {
  clientId: string;
  itemId: string;
  /** Index de la réplique d'entrée choisie dans `repliques.entree`. */
  entryLine: number;
  /** Estimation à l'œil (valeur apparente). */
  estimation: number;
  /** Prix annoncé par le client. */
  asking: number;
  /** Prix plancher caché (jamais affiché). */
  floor: number;
  /** Outils déjà utilisés sur cet objet. */
  revealed: Tool[];
  status: VisitStatus;
  /** Prix de la contre-proposition, si le client en a fait une. */
  counterPrice?: number;
  /** Prix payé, si l'objet a été acheté. */
  pricePaid?: number;
}

/** État d'une journée : pur et sérialisable. */
export interface DayState {
  seed: number;
  money: number;
  toolUsesLeft: number;
  visits: Visit[];
  /** Index du client en cours dans `visits`. */
  current: number;
  phase: 'clients' | 'fin';
}
