# SecOps Academy — App SPA (SOC/EDR/SOAR)

Application web unique (HTML/CSS/JS) pour réviser efficacement: scénarios SOC (40+), méthode STAR avec sauvegarde locale, EDR, SOAR, Splunk SPL, Windows Events, Linux/Apache.

## Démarrage

- Ouvrir: `app.html` (double-clic ou via navigateur)
- Option PowerShell:

```powershell
Start-Process -FilePath "$PWD/app.html"
```

## Structure
- `app.html` — application principale (sidebar, pages, modals, scenarios)
- `README.md` — instructions rapides

## Notes
- Aucune dépendance à installer (CDN fonts + icons). Tout est côté client.
- Les notes STAR sont stockées en localStorage (navigateur courant).
- Utilisez un environnement de test pour exécuter des commandes/requêtes proposées.
