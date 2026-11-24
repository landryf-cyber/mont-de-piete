import realBalance from '../data/balance.json';
import type { Balance, ClientDef, ItemDef } from '../state/content';
import type { Content } from './day';

/**
 * Valeurs fixes pour les tests : ils ne cassent pas quand on équilibre balance.json.
 * (Même forme que balance.json, valeurs figées.)
 */
export const testBalance: Balance = {
  ...realBalance,
  argent_depart: 300,
  clients_par_jour: 6,
  utilisations_outils_par_jour: 3,
  arrondi_prix: 5,
  offres: { basse: 0.4, juste: 0.7, haute: 1.0 },
  intentions: {
    desespere: { plancher: 0.35, demande: 0.8 },
    voleur: { plancher: 0.45, demande: 0.9 },
    honnete: { plancher: 0.65, demande: 1.0 },
    menteur: { plancher: 0.75, demande: 1.4 },
    collectionneur: { plancher: 0.9, demande: 1.2 },
    enqueteur: { plancher: 0.7, demande: 1.0 },
  },
  variation_plancher: 0.1,
  seuil_contre_offre: 0.75,
  part_vers_demande_contre_offre: 0.5,
};

const item = (id: string, over: Partial<ItemDef> = {}): ItemDef => ({
  id,
  nom: id,
  description: '',
  valeur_apparente: 100,
  valeur_reelle: 100,
  etat: 'authentique',
  vole: false,
  ...over,
});

const client = (id: string, objet: string, intention: ClientDef['intention']): ClientDef => ({
  id,
  nom: id,
  apparence: '',
  intention,
  objet,
  repliques: { entree: '', accepte: '', contre: '{prix}', part: '' },
});

export const testContent: Content = {
  items: [
    item('montre', { valeur_reelle: 180, propriete_etrange: { nom: 'En avance', description: '5 min' } }),
    item('bague', { vole: true }),
    item('stylo', { valeur_apparente: 200, valeur_reelle: 20, etat: 'contrefacon' }),
  ],
  clients: [
    client('a', 'montre', 'honnete'),
    client('b', 'bague', 'desespere'),
    client('c', 'stylo', 'collectionneur'),
  ],
};
