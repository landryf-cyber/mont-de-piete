# Mont-de-Piété (titre provisoire)

## Pitch
Tu tiens un prêteur sur gages dans une ville où les objets ont des propriétés étranges.
Chaque jour, des clients entrent pour vendre, mettre en gage ou acheter. Tu achètes bas, tu revends haut,
et tu paies ton loyer. Mais certains objets sont liés entre eux : en les rassemblant, tu reconstitues
peu à peu une disparition mystérieuse qui touche toute la ville… et toi.

## Piliers (chaque décision de design doit servir au moins l'un d'eux)
1. **Chaque choix compte** : aucune décision n'est neutre, elle a toujours un coût (argent, réputation, temps, risque).
2. **Information incomplète** : le joueur ne connaît jamais la vraie valeur. Il déduit à partir d'indices.
3. **Le monde se souvient** : les clients, les objets et les conséquences reviennent les jours suivants.
4. **Jouable à un pouce** : écran vertical, une main, uniquement des taps sur de gros boutons. Aucun geste complexe.
5. **« Encore un jour »** : une journée dure 2-3 minutes et se termine toujours sur une accroche (un client qui reviendra, un indice, une menace).

## Ce que le jeu N'EST PAS
- Pas de minuterie stressante ni de réflexes. On a le temps de réfléchir.
- Pas de gestion de stock tentaculaire : au maximum 6 objets en vitrine.
- Pas de murs de texte : chaque réplique de client fait 2 lignes maximum.
- Pas de monétisation, pas de pubs, pas de récompenses quotidiennes artificielles.
- Pas de fantasy générique (pas d'épées magiques, d'elfes ni de potions de soin). L'étrange est **quotidien et discret** :
  une montre qui avance de 5 minutes dans le futur, une photo où les gens changent de place, une clé qui ouvre une porte qui n'existe plus.

## Boucle de jeu

### Une journée
1. **Matin** : un journal d'une ligne (rumeur, événement en ville, indice sur le mystère).
2. **Clients (environ 6 à 8 par jour)**, un à la fois :
   - Le client présente un objet et une phrase (son histoire, peut-être fausse).
   - Le joueur peut **inspecter** avec un outil (voir plus bas), puis choisir :
     `Faire une offre basse` / `Offre juste` / `Offre haute` / `Refuser`.
   - Le client accepte, refuse ou contre-propose **une fois**. Le joueur accepte ou laisse partir.
   - Certains clients veulent **acheter** un objet de la vitrine : même logique, dans l'autre sens.
   - Certains clients veulent un **prêt sur gage** : tu prêtes de l'argent, il laisse l'objet, il a X jours pour revenir le racheter avec intérêt. S'il ne revient pas, l'objet est à toi.
3. **Soir** : bilan (argent, réputation, objets), conséquences éventuelles, avancée du mystère.
4. **Tous les 7 jours** : le loyer tombe. Si tu ne peux pas payer, la run est perdue.

### Une run
- Une run dure **4 semaines (28 jours)**, environ 1 h de jeu.
- Le loyer **augmente chaque semaine** (valeurs dans `balance.json`) : la pression monte jusqu'à la fin.
- Deux façons de finir une run :
  - **Survivre** aux 4 semaines sans résoudre le mystère : fin modeste, peu de souvenirs.
  - **Résoudre le mystère** : vraie fin, le loyer est annulé, beaucoup de souvenirs. On peut gagner avant la semaine 4.
- La faillite (loyer impayé) termine la run. On garde quand même une partie des souvenirs et tout le carnet.

### Ressources
- **Argent** : sert à acheter et à payer le loyer.
- **Réputation** (de -5 à +5) : honnête, tu attires de meilleurs clients mais tu gagnes moins. Requin, tu gagnes plus mais attires des clients louches et la police.
- **Soupçons de la police** (de 0 à 5) : augmentent quand tu achètes des objets volés. À 5, c'est une descente (confiscation et amende).
- **Outils d'inspection** : 3 utilisations par jour à répartir.
  - `Loupe` : révèle l'état réel (vrai, faux, abîmé).
  - `Registre` : indique si l'objet a été déclaré volé.
  - `Écouter` : révèle la propriété étrange de l'objet (bonne ou mauvaise).

### Objets
Chaque objet possède :
- `nom`, `description` courte, `valeur_reelle`, `valeur_apparente`
- `etat` : authentique / contrefaçon / abîmé
- `vole` : vrai / faux
- `propriete_etrange` (optionnelle) : un effet sur le jeu, positif ou négatif.
  Exemples : *Montre en avance* (montre le premier client de demain), *Miroir triste* (-1 réputation par jour en vitrine mais vaut très cher), *Boîte à musique* (attire un client spécial).
- `fragment_mystere` (optionnel) : l'identifiant d'un indice lié à l'intrigue.

### Le mystère
- Cadre fixe : **la disparition d'une horlogère de la ville**. Ses objets réapparaissent un par un chez toi.
- **Le propriétaire de la boutique est impliqué** : il fait grimper le loyer pour te pousser à la faillite, parce que ta boutique attire les objets de l'horlogère. Résoudre le mystère, c'est le battre.
- **La vérité change à chaque run (système à la Cluedo)** : au début de chaque run, on tire une combinaison
  `coupable` × `mobile` × `lieu` × `méthode` parmi un pool d'options (dans `src/data/mystery.json`).
  - Le propriétaire est toujours mêlé à l'affaire, mais pas forcément comme coupable principal (complice, commanditaire, témoin qui se tait…).
  - Environ 10-12 fragments sont générés pour pointer vers la combinaison de la run. Certains innocentent une piste, d'autres en confirment une.
- **Résolution** : depuis le carnet, le joueur peut **accuser** en choisissant une combinaison. Il n'a droit qu'à **une accusation par run**. Juste : victoire. Fausse : le propriétaire double le loyer de la semaine suivante.
- **Les fragments ont un coût** :
  - ils sont portés par des objets chers ;
  - ils occupent un emplacement de vitrine ;
  - ils ne peuvent pas être revendus sans perdre l'indice (le jeu prévient clairement le joueur).
- **Les objets de l'horlogère ont des pouvoirs liés au temps**, utilisables une fois par run :
  voir le premier client de demain, rejouer une négociation ratée, figer le loyer une semaine, etc.
  Ils aident à survivre : le joueur doit arbitrer entre les garder (pouvoir et indice) et les sacrifier.
- **Principe clé : survivre te garde en vie, enquêter te fait gagner, et les deux se disputent ton argent.**

### Méta-progression (entre les runs)
1. **Le carnet (savoir permanent)** : il est conservé entre les runs.
   - Les objets étranges déjà identifiés restent documentés (leur propriété est connue sans inspection).
   - Les clients récurrents déjà rencontrés gardent leurs notes (menteur, fiable, collectionneur…).
   - Les éléments de mystère déjà vus (suspects, mobiles, lieux) restent listés, mais la vérité de la run change.
   - Le joueur progresse surtout parce qu'il **sait** plus, pas grâce à des bonus chiffrés.
2. **Les souvenirs (monnaie de fin de run)** : ils servent à débloquer des améliorations de boutique :
   - de nouveaux outils d'inspection (ex. `Balance` : révèle le poids réel des métaux ; `Chat` : feule devant les objets maudits) ;
   - des emplacements de vitrine supplémentaires ;
   - de nouveaux **quartiers**, qui ajoutent des clients, des objets et des options de mystère au pool.
- Les déblocages élargissent les options sans rendre le jeu trivial. Ne jamais donner de bonus brut du type « +20 % d'argent ».

### Rejouabilité
- Le mystère est différent à chaque run (voir plus haut).
- Les objets et les clients de passage sont tirés au hasard dans un pool qui grandit avec les déblocages.
- **Modificateurs de run**, débloqués après une première victoire : `Marché noir` (beaucoup d'objets volés, police plus présente), `Ville en crise` (clients désespérés, prix bas), `Police corrompue` (on peut payer pour faire baisser les soupçons)…
- Les styles de jeu (honnête ou requin, collectionneur d'étrange ou marchand prudent) doivent donner des runs vraiment différentes.

## Clients
- Des personnages récurrents avec un nom, une apparence simple et une personnalité. Ils se souviennent de la façon dont tu les as traités.
- Des clients de passage générés à partir de modèles (type + objet + humeur).
- Chaque client a une **intention cachée** : honnête, menteur, désespéré, voleur, collectionneur, enquêteur.
- Ses répliques contiennent des **indices** sur cette intention : il est pressé, il évite ton regard, il connaît trop bien la valeur de l'objet…

## Direction artistique
- **Ambiance** : une petite boutique la nuit, éclairée par une lampe. Chaleureuse mais légèrement inquiétante.
- **Palette** (stricte, 5 couleurs) :
  - fond `#1b1a17` (brun presque noir)
  - bois `#5a3e2b`
  - lumière de lampe `#e8b04b`
  - papier `#efe6d2`
  - accent étrange `#6fd3c4` (turquoise, réservé aux propriétés étranges et au mystère)
- **Style** : illustrations plates et simples, comme des silhouettes de papier découpé. Les clients sont des silhouettes avec un ou deux détails distinctifs (chapeau, lunettes, objet).
- **Typo** : une serif pour les textes (dans l'esprit des étiquettes de brocante), une machine à écrire pour le carnet.
- **Juice** (obligatoire) : la clochette de la porte à chaque client, le bruit du tiroir-caisse, une légère vibration à chaque transaction, une lueur turquoise quand un objet est étrange, des pièces qui tombent au bilan.

## Technique
- **Stack** : Vite + TypeScript, sans framework. Canvas uniquement si nécessaire ; privilégier le DOM et le CSS.
- **Cible** : mobile en mode portrait d'abord (390×844 en référence), jouable aussi sur desktop.
- **Contenu en données** : objets, clients, dialogues et fragments dans des fichiers JSON séparés (`/src/data/`). Ajouter du contenu ne doit jamais demander de toucher au code.
- **Graine aléatoire** : toute la génération passe par un RNG à graine, pour pouvoir reproduire une partie.
- **Sauvegarde** : `localStorage`, enveloppé dans un try/catch.
- **Architecture** :
  - `src/state/` : état du jeu pur et sérialisable (aucune logique d'affichage)
  - `src/logic/` : règles (négociation, valeur, conséquences), en fonctions pures testables
  - `src/ui/` : écrans et composants
  - `src/data/` : contenu JSON
- **Tests** : Vitest sur toute la logique de `src/logic/`. Lancer les tests après chaque modification de règles.

## Commandes
- `npm run dev` : serveur de développement
- `npm run test` : tests
- `npm run build` : build de production

## Environnement de travail
- Le projet est développé avec **Claude Code dans le navigateur** (claude.ai/code), sur un dépôt GitHub.
- Le propriétaire du projet **débute en Git et en code**. Expliquer simplement, sans jargon, ce qu'il doit faire (relire, tester, merger). Ne jamais supposer qu'il sait utiliser un terminal.
- Il ne peut pas lancer `npm run dev` : il teste uniquement via la **version en ligne** du jeu (voir « Tester le jeu »).

## Tester le jeu
### Ce que Claude vérifie avant chaque pull request
1. `npm run test` passe.
2. `npm run build` passe sans erreur ni avertissement TypeScript.
3. Le jeu se lance (`npm run dev` ou `npm run preview`) et une journée complète se joue sans erreur dans la console.
4. L'affichage tient en 390×844 (portrait mobile) sans défilement horizontal.

### Déploiement
- Le jeu est publié automatiquement à chaque merge sur `main`, via **Netlify** ou **Vercel** (dépôt privé) ou **GitHub Pages** (dépôt public).
- La configuration doit rester compatible avec les trois : chemins relatifs (`base: './'` dans `vite.config.ts`), sortie dans `dist/`.
- Si le déploiement n'est pas encore en place, le proposer après la première étape jouable et guider l'utilisateur pas à pas.

### Ce que Claude donne à l'utilisateur dans chaque pull request
Une section **« Comment tester »** courte et concrète, par exemple :
> 1. Merge cette pull request.
> 2. Attends 1 à 2 minutes, puis ouvre le jeu sur ton téléphone.
> 3. Joue une journée et essaie d'acheter un objet volé : la police doit être mentionnée au bilan.
> 4. Ce que je veux savoir : est-ce que négocier te donne envie de recommencer ?

## Git
- Claude Code dans le navigateur travaille sur **une branche par tâche** et ouvre une **pull request** vers `main`. Ne jamais pousser directement sur `main`.
- **Une pull request = une étape jouable.** Pas de pull request géante qui mélange plusieurs fonctionnalités.
- **Avant d'ouvrir une pull request** : faire toutes les vérifications de « Tester le jeu ». Si quelque chose échoue, on corrige d'abord.
- **Description de pull request** en français simple : ce qui a changé (3 lignes max), puis « Comment tester ».
- **Messages de commit** en français, au format `type: description courte`
  - `feat:` nouvelle fonctionnalité (`feat: ajoute la loupe d'inspection`)
  - `fix:` correction de bug
  - `content:` ajout ou modification de données JSON (objets, clients, dialogues)
  - `balance:` changement de valeurs dans `balance.json`
  - `refactor:`, `test:`, `docs:`, `chore:`
- Pour une expérimentation risquée, l'indiquer clairement dans le titre de la pull request (`[EXPÉRIMENTAL]`), pour que l'utilisateur sache qu'il peut la refuser sans problème.
- Quand une version de la feuille de route est validée, proposer de créer une **release GitHub** (`v0.1`, `v0.2`…) pour garder un point de sauvegarde clair.
- Ne jamais commiter `node_modules/`, `dist/`, des fichiers `.env` ou des clés.
- Ne jamais réécrire l'historique (`push --force`, `reset --hard` sur des commits partagés) sans demander.

## Méthode de travail
- Avancer par petites étapes jouables. Après chaque étape, le jeu doit se lancer et rester jouable.
- Avant toute fonctionnalité importante, proposer un plan et attendre validation.
- Si une idée de design semble banale ou générique, le dire et proposer 3 alternatives plus surprenantes.
- Équilibrage : toutes les valeurs numériques (prix, loyer, probabilités) dans `src/data/balance.json`, jamais en dur.

## Portée du prototype (v0.1)
Objectif : valider que **négocier est amusant**, rien de plus.
- Une seule journée jouable avec 6 clients
- 15 objets, dont 4 étranges et 3 volés
- Acheter et refuser uniquement (pas de vente, pas de prêt sur gage)
- Les 3 outils d'inspection
- Un bilan de fin de journée
- Pas encore de mystère, de réputation ni de police

## Feuille de route
- **v0.1** : une journée, négociation à l'achat (voir plus haut). Question à valider : *est-ce que négocier est amusant ?*
- **v0.2** : la semaine complète avec vente, vitrine, loyer, réputation et police. *Est-ce que la gestion crée des dilemmes ?*
- **v0.3** : la run de 4 semaines avec le mystère généré, les fragments, l'accusation et les objets de l'horlogère. *Est-ce qu'on a envie d'enquêter ?*
- **v0.4** : méta-progression (carnet persistant, souvenirs, déblocages). *Est-ce qu'on a envie de relancer une run ?*
- **v0.5** : quartiers, modificateurs, équilibrage et contenu.

Ne jamais commencer une version tant que la question de la précédente n'a pas une réponse positive en jeu.
