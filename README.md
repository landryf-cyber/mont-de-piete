# Mont-de-Piété

Un jeu de prêteur sur gages dans une ville où les objets ont des propriétés étranges.
Tu achètes, tu revends, tu paies ton loyer… et tu enquêtes sur la disparition d'une horlogère.

- **La vision du jeu et les règles pour Claude** : [`CLAUDE.md`](CLAUDE.md)
- **Ce fichier** : ton guide à toi pour travailler sur le projet.

---

## 1. Mise en place (une seule fois)

- [ ] Créer un compte sur [github.com](https://github.com)
- [ ] Créer le dépôt `mont-de-piete` (avec un README) et y envoyer `CLAUDE.md` et ce `README.md`
      (dans le dépôt : **Add file → Upload files → Commit changes**)
- [ ] Aller sur [claude.ai/code](https://claude.ai/code) et connecter GitHub (installer l'application Claude GitHub, accès au dépôt `mont-de-piete`)
- [ ] Lancer le prompt de départ (section 2)
- [ ] Après la première étape : mettre le jeu en ligne (section 4)

---

## 2. Prompt de départ

À coller dans claude.ai/code, après avoir choisi le dépôt `mont-de-piete` :

```
Lis le CLAUDE.md. On construit le prototype v0.1 décrit à la fin.

Propose-moi d'abord un plan en étapes courtes, chacune jouable. Je veux :
1. Le setup Vite + TypeScript + Vitest, avec un .gitignore adapté
2. Les données : 15 objets et 6 clients en JSON, avec des descriptions courtes,
   bizarres et pas génériques (respecte le ton du CLAUDE.md)
3. La logique de négociation en fonctions pures, avec des tests
4. L'écran d'un client : silhouette, objet, réplique, outils, boutons d'offre
5. Le bilan de fin de journée
6. Le juice : sons, vibrations, lueur turquoise sur les objets étranges

N'écris pas de code avant que j'aie validé le plan.
Je débute avec Git et GitHub : explique-moi simplement ce que je dois faire
quand tu me proposes une pull request.
```

---

## 3. La routine de travail

À répéter pour chaque étape :

1. **Demander** une étape précise à Claude (une seule à la fois).
2. **Lire le plan** qu'il propose. Corriger si besoin, puis valider.
3. Claude code, vérifie, puis ouvre une **pull request** sur GitHub.
4. **Merger** la pull request (bouton vert **Merge pull request** sur GitHub).
5. **Tester** le jeu en ligne sur ton téléphone, en suivant la section « Comment tester » de la pull request.
6. **Donner ton ressenti** à Claude : ce qui est fun, ce qui est chiant, ce qui bugue.

> Si le résultat ne te plaît pas, ne merge pas : ferme la pull request. Ta version principale reste intacte.

---

## 4. Tester le jeu

Le jeu tourne dans le cloud : pour y jouer, il faut le mettre en ligne. Une fois en place, il se met à jour tout seul à chaque merge.

**Option A : dépôt privé (recommandé).** Utiliser [Netlify](https://www.netlify.com) ou [Vercel](https://vercel.com), qui sont gratuits.
Dis à Claude :
```
Guide-moi pas à pas pour mettre le jeu en ligne sur Netlify,
avec une mise à jour automatique à chaque merge sur main.
```

**Option B : dépôt public.** Utiliser GitHub Pages (gratuit seulement pour les dépôts publics).
```
Mets en place GitHub Pages pour que le jeu soit en ligne à chaque merge sur main,
et dis-moi ce que je dois activer dans les réglages GitHub.
```

**L'adresse du jeu :** _(à noter ici une fois en ligne)_

### À chaque test, se poser ces questions
- Est-ce que ça marche ? (pas d'écran blanc, pas de bouton qui ne répond pas)
- Est-ce que c'est agréable sur téléphone, à une main ?
- Est-ce que j'ai envie de relancer une partie ? **C'est la question la plus importante.**

### Si l'écran est blanc ou que quelque chose bugue
Dis à Claude ce que tu as fait, ce qui s'est passé et ce que tu attendais. Exemple :
> « J'ai acheté la montre, puis j'ai cliqué sur Fin de journée : l'écran est devenu blanc. »

---

## 5. Phrases utiles à dire à Claude

| Situation | Ce que tu dis |
|---|---|
| Lancer l'étape suivante | « Passe à l'étape suivante du plan. » |
| Comprendre un changement | « Explique-moi simplement ce que tu as changé et pourquoi. » |
| Résultat trop banal | « C'est trop générique. Propose-moi 3 alternatives plus surprenantes. » |
| Ça bugue | « Quand je fais X, il se passe Y au lieu de Z. Corrige. » |
| Claude tourne en rond | Ferme la session et relance une nouvelle tâche avec une demande plus précise. |
| Changer un équilibrage | « Les objets sont trop chers, baisse les prix d'environ 20 % dans balance.json. » |
| Ajouter du contenu | « Ajoute 5 nouveaux objets étranges dans le même ton que les autres. » |
| Faire le point | « Où en est-on par rapport à la feuille de route du CLAUDE.md ? » |
| Revenir en arrière | « Annule la dernière pull request mergée. » |
| Version validée | « La v0.1 est validée, crée une release et propose le plan de la v0.2. » |

---

## 6. Mini-lexique Git

- **Dépôt (repo)** : ton projet sur GitHub, avec tout son historique.
- **Commit** : un point de sauvegarde.
- **Branche** : une copie d'essai du projet. Claude travaille toujours sur une branche, jamais directement sur la version principale.
- **`main`** : la version principale du jeu, celle qui est en ligne.
- **Pull request (PR)** : Claude qui te dit « voici mes changements, tu les acceptes ? ».
- **Merge** : accepter une pull request. Les changements rejoignent `main` et le jeu en ligne se met à jour.
- **Release** : un point de sauvegarde nommé (v0.1, v0.2…) pour retrouver facilement une version qui marchait.

---

## 7. Où on en est

Voir la **feuille de route** dans le [`CLAUDE.md`](CLAUDE.md).

- [ ] v0.1 : une journée, négociation. *Est-ce que négocier est amusant ?*
- [ ] v0.2 : une semaine, vente, loyer, réputation, police
- [ ] v0.3 : run de 4 semaines et mystère
- [ ] v0.4 : méta-progression
- [ ] v0.5 : contenu et équilibrage
