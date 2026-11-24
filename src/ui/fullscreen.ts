/** Vrai si le jeu a été lancé depuis l'écran d'accueil (déjà sans barre d'adresse). */
function isInstalledApp(): boolean {
  return (
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Passe en plein écran, si le navigateur le permet (Android, desktop).
 * Doit être appelé pendant un tap. Sur iPhone, Safari ne le permet pas :
 * il faut « Ajouter à l'écran d'accueil ». Ne plante jamais.
 */
export function enterFullscreen(): void {
  if (isInstalledApp() || document.fullscreenElement) return;
  const el = document.documentElement;
  if (typeof el.requestFullscreen !== 'function') return;
  el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {
    /* refusé par le navigateur : on reste en mode normal */
  });
}
