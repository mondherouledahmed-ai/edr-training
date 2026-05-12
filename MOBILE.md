# 📱 Utiliser l'app sur ton smartphone

L'app est maintenant une **PWA installable** : icône sur l'écran d'accueil, plein écran, fonctionne hors-ligne, comme une vraie app native.

## Méthode rapide : 3 minutes

### 1. Démarre un serveur local sur ton PC

Ouvre PowerShell **dans le dossier `edr training`** et lance **une** de ces commandes :

```powershell
# Option A — Python (préinstallé sur Windows 11)
python -m http.server 8000

# Option B — Node.js
npx serve -l 8000

# Option C — PHP
php -S 0.0.0.0:8000
```

Tu verras `Serving HTTP on 0.0.0.0 port 8000`.

### 2. Trouve l'IP de ton PC

```powershell
ipconfig | findstr IPv4
```

Note l'IP (ex : `192.168.1.42`).

### 3. Sur ton smartphone (même Wi-Fi que le PC)

Ouvre **Chrome** (Android) ou **Safari** (iPhone) et tape :

```
http://192.168.1.42:8000/dashboard.html
```

### 4. Installe l'app

- **Android (Chrome)** : un bandeau "Ajouter à l'écran d'accueil" apparaît, OU le bouton vert **"Installer l'app"** en bas-gauche.
- **iPhone (Safari)** : appuie sur **Partager** → **"Sur l'écran d'accueil"** (le bouton vert te montre la procédure).

✅ L'icône **SecOps** apparaît sur ton écran d'accueil. Tu peux lancer l'app **en plein écran**, **même sans connexion** (offline).

---

## Bonus : raccourcis longue pression

Sur Android, fais un **appui long** sur l'icône → tu accèdes directement à :
- 🎯 Défi du jour
- ⚡ Speed Run 60s
- 🚨 Pop-up surprise

---

## Astuces mobile

- **Burger en haut à gauche** : ouvre/ferme la sidebar (swipe gauche pour fermer)
- **Bouton ⚡ rouge** en bas à droite : menu rapide de tous les jeux
- **Bouton vert** "Installer l'app" : disparaît après installation
- **Pop-ups surprises** s'activent automatiquement → tu DOIS répondre pour continuer (parfait pour réviser pendant les pauses transports/files d'attente)

---

## Si tu veux y accéder depuis n'importe où (4G/5G)

Utilise **Cloudflare Tunnel** (gratuit, 5 minutes) ou héberge sur :
- **GitHub Pages** (gratuit) — pousse le dossier sur un repo, active Pages, accès via `username.github.io/edr-training/`
- **Netlify Drop** — glisse-dépose le dossier sur https://app.netlify.com/drop → URL publique HTTPS instantanée (PWA marche partout)

> 💡 Pour la PWA, **HTTPS est obligatoire** sauf en `localhost` / réseau local. Netlify Drop est la solution la plus rapide pour avoir HTTPS gratuit.
