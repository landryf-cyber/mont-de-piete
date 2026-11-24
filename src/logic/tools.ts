import type { ItemDef, Tool } from '../state/content';

export interface ToolResult {
  texte: string;
  /** Vrai si le résultat concerne l'étrange (affiché en turquoise). */
  etrange: boolean;
}

const ETATS: Record<ItemDef['etat'], string> = {
  authentique: 'Authentique.',
  contrefacon: 'Contrefaçon !',
  abime: 'Abîmé.',
};

/** Ce que révèle un outil d'inspection sur un objet. */
export function toolResult(item: ItemDef, tool: Tool): ToolResult {
  switch (tool) {
    case 'loupe':
      return { texte: ETATS[item.etat], etrange: false };
    case 'registre':
      return { texte: item.vole ? 'Déclaré volé !' : 'Rien au registre.', etrange: false };
    case 'ecouter':
      return item.propriete_etrange
        ? { texte: `${item.propriete_etrange.nom} : ${item.propriete_etrange.description}`, etrange: true }
        : { texte: 'Rien. Un objet ordinaire.', etrange: false };
  }
}
