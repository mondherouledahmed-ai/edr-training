// Scenario data + modal renderer
const scenarios = {};

function openScenario(key) {
  const scenario = scenarios[key];
  if (!scenario) return;
  const modal = document.getElementById('modal');
  document.querySelector('.modal-title').textContent = scenario.title;
  document.getElementById('modal-body').innerHTML = scenario.content;
  const footer = modal.querySelector('.modal-footer');
  footer.innerHTML = '<button class="btn btn-secondary" onclick="closeModal()">Fermer</button>';
  modal.style.display = 'flex';
}

// Centralized SOC Q&A scenarios
Object.assign(scenarios, {
  'soc-int-vpn-3am': { title: 'SOC — Connexion à 03h du matin (faux positif potentiel)', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Une alerte remonte une connexion VPN réussie à 03h12 du matin depuis un compte utilisateur. Comment réagissez-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je ne conclus jamais immédiatement à un incident sur la base de l’horaire seul. Je commence par vérifier le profil de l’utilisateur, son rôle et ses habitudes de connexion historiques afin de déterminer si ce comportement est inhabituel pour lui. Je corrèle ensuite avec l’adresse IP source, la géolocalisation et le type de terminal utilisé. Si l’IP est connue, déjà utilisée par l’utilisateur et qu’aucune autre activité suspecte n’est observée, je classe l’alerte comme faux positif documenté. En revanche, si la connexion est suivie d’actions sensibles ou provient d’un pays inhabituel, je déclenche une investigation approfondie.</p>
  ` },
  'soc-int-exfil': { title: 'SOC — Exfiltration de données suspecte', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Le SIEM détecte un volume important de données sortantes vers une IP externe inconnue. Quelle est votre démarche ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je commence par qualifier la nature du trafic afin de distinguer une exfiltration malveillante d’un flux métier légitime comme une sauvegarde ou un transfert applicatif. J’analyse ensuite l’hôte source, l’utilisateur associé et le protocole utilisé. Je m’intéresse particulièrement à l’horaire, au volume et à la répétitivité du transfert. Si le flux ne correspond à aucun usage connu, je bloque temporairement la communication, j’isole l’hôte si nécessaire et je poursuis l’analyse pour identifier la nature des données exfiltrées et l’origine de la compromission.</p>
  ` },
  'soc-int-auth-fail-then-success': { title: 'SOC — Multiples échecs suivis d’un succès (AD)', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Plusieurs échecs de connexion sont suivis d’un succès sur un compte AD. Que concluez-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Ce schéma est typique d’une tentative de brute force ou de password spraying. Je vérifie le nombre d’échecs, la rapidité des tentatives et les IP sources. Si les tentatives proviennent de plusieurs IP, je suspecte un password spraying ; si elles viennent d’une seule source, un brute force ciblé. Je bloque temporairement l’accès, force la réinitialisation du mot de passe et vérifie si le compte a été utilisé pour accéder à d’autres ressources après la connexion réussie.</p>
  ` },
  'soc-int-admin-account-created': { title: 'SOC — Création d’un compte admin hors procédure', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Un compte administrateur est créé sans ticket de changement. Comment traitez-vous l’alerte ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je considère ce type d’alerte comme critique. Je vérifie immédiatement qui a créé le compte, depuis quelle machine et à quel moment. Je corrèle ensuite avec les journaux de gestion des identités et les tickets de changement. En absence de justification, je désactive immédiatement le compte, j’investigue les actions réalisées avec ce compte et je considère la possibilité d’une compromission d’un compte à privilèges existant.</p>
  ` },
  'soc-int-server-mass-download': { title: 'SOC — Téléchargement massif depuis un serveur interne', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Un serveur télécharge un volume inhabituel de données depuis Internet. Quelle est votre analyse ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je commence par vérifier le rôle du serveur et ses flux habituels. Un serveur applicatif ou une base de données n’a généralement pas vocation à télécharger des données massivement. J’analyse ensuite les URLs, les types de fichiers et les horaires. Si le comportement est anormal, je bloque les flux sortants et je lance une investigation pour déterminer si le serveur a été utilisé comme relais ou s’il est compromis.</p>
  ` },
  'soc-int-offhours-sensitive-files': { title: 'SOC — Accès à des fichiers sensibles hors heures', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Un utilisateur accède à des fichiers RH sensibles à 02h du matin. Que faites-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je commence par analyser l’historique d’accès de cet utilisateur afin de déterminer si ce comportement est inhabituel. Je corrèle avec son rôle et ses missions. Si l’accès n’est pas justifié, je considère un risque de menace interne ou de compromission de compte et je déclenche une investigation plus poussée tout en informant les équipes concernées.</p>
  ` },
  'soc-int-dlp-email': { title: 'SOC — DLP : envoi de données par email externe', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Une alerte DLP signale l’envoi de données sensibles vers une adresse Gmail. Quelle est votre réaction ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je vérifie immédiatement la nature des données envoyées et le contexte utilisateur. Si l’envoi est non autorisé, je bloque la communication, je conserve les preuves et je notifie les responsables métiers et juridiques selon les procédures internes.</p>
  ` },
  'soc-int-psexec-user-host': { title: 'SOC — PsExec depuis un poste utilisateur', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>L’EDR détecte l’exécution de PsExec depuis un poste utilisateur. Comment réagissez-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je considère cette alerte comme hautement suspecte. PsExec est généralement utilisé depuis des serveurs d’administration. Je vérifie l’utilisateur, la cible et le contexte. En absence de justification claire, j’isole la machine et j’investigue une possible compromission.</p>
  ` },
  'soc-int-dns-new-domain': { title: 'SOC — DNS vers un domaine récemment créé', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Des requêtes DNS vers un domaine créé il y a 2 jours sont détectées. Que concluez-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Les domaines récents sont fréquemment utilisés pour le C2. Je vérifie le processus initiateur, la fréquence des requêtes et la réputation du domaine. En cas de doute, je bloque le domaine et je poursuis l’investigation sur l’hôte source.</p>
  ` },
  'soc-int-edr-agents-offline': { title: 'SOC — Déconnexion massive d’agents EDR', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Plusieurs agents EDR deviennent hors ligne simultanément. Quelle est votre hypothèse ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je vérifie immédiatement s’il s’agit d’un incident réseau ou d’une maintenance. En absence d’explication, je considère une tentative de neutralisation des contrôles de sécurité et je déclenche un incident majeur.</p>
  ` },
  'soc-int-firewall-rule-change': { title: 'SOC — Modification des règles firewall', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Une règle firewall autorisant un flux large est ajoutée sans validation. Que faites-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je vérifie l’auteur de la modification et le contexte. Sans ticket, je considère un risque de backdoor réseau et je demande la révocation immédiate de la règle en attendant clarification.</p>
  ` },
  'soc-int-cloud-upload': { title: 'SOC — Upload vers cloud public non approuvé', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Un poste utilisateur upload des fichiers vers un service cloud non approuvé. Quelle est votre analyse ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je corrèle avec les politiques de sécurité et le rôle utilisateur. En cas de non-conformité, je bloque le flux et j’analyse s’il s’agit d’une erreur utilisateur ou d’une tentative d’exfiltration.</p>
  ` },
  'soc-int-api-abnormal': { title: 'SOC — Accès API anormal', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Une API est appelée massivement depuis une IP interne. Que suspectez-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je considère un abus de jeton ou une compromission applicative. J’analyse les tokens utilisés et le comportement de l’appelant avant de restreindre l’accès.</p>
  ` },
  'soc-int-password-changes': { title: 'SOC — Changement de mot de passe à haute fréquence', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Un compte change de mot de passe plusieurs fois en peu de temps. Quelle est votre lecture ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je suspecte une tentative de verrouillage de compte ou une activité automatisée. Je vérifie les logs IAM et je sécurise le compte.</p>
  ` },
  'soc-int-logs-disabled': { title: 'SOC — Désactivation des logs', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Des logs systèmes cessent brutalement. Que faites-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>La perte de logs est critique. Je vérifie l’état des agents, suspecte une tentative d’effacement de traces et je déclenche une investigation immédiate.</p>
  ` },
  'soc-int-impossible-travel': { title: 'SOC — Connexion depuis deux pays distants', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Un utilisateur se connecte depuis deux pays distants en 30 minutes. Que concluez-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je considère une impossibilité de déplacement physique. Je bloque la session et je force la réinitialisation du compte.</p>
  ` },
  'soc-int-service-account-misuse': { title: 'SOC — Utilisation d’un compte de service hors périmètre', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Un compte de service est utilisé pour une connexion interactive. Quelle est votre réaction ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je considère cela comme anormal et potentiellement malveillant. Je bloque l’accès et j’investigue une compromission.</p>
  ` },
  'soc-int-internal-scan': { title: 'SOC — Scan réseau interne', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Un poste utilisateur scanne tout le réseau interne. Que faites-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je suspecte une phase de reconnaissance post-compromission. J’isole immédiatement le poste et j’analyse les autres signaux.</p>
  ` },
  'soc-int-exe-download': { title: 'SOC — Téléchargement d’un exécutable depuis site non référencé', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Un utilisateur télécharge un exécutable depuis un site inconnu. Quelle est votre démarche ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je mets le fichier en quarantaine, j’analyse son comportement et je vérifie si d’autres machines ont effectué la même action.</p>
  ` },
  'soc-int-low-signal-correlation': { title: 'SOC — Corrélation faible mais répétée sur un hôte', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Plusieurs alertes faibles concernent le même hôte. Comment réagissez-vous ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je ne traite pas les alertes isolément. La répétition d’alertes faibles sur un même hôte indique souvent une attaque progressive. Je regroupe ces signaux pour une investigation approfondie.</p>
  ` },
  'soc-int-l1-to-l2': { title: 'SOC — L1 → L2 : préparation et responsabilités', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Comment votre expérience en tant qu’analyste L1 vous a-t-elle préparé aux responsabilités d’un L2 ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Mon expérience en tant qu’analyste L1 m’a permis de comprendre les processus fondamentaux du SOC : le triage des alertes, la vérification des faux positifs, la collecte de contexte sur les événements et la priorisation des incidents. J’ai appris à identifier rapidement les comportements suspects dans les logs, à corréler des informations provenant de différentes sources et à escalader les incidents critiques vers L2 avec toutes les preuves nécessaires. Ces compétences constituent la base de l’investigation approfondie que je devrai effectuer en tant que L2, où il s’agit non seulement d’identifier l’incident, mais aussi d’en analyser la portée, de déterminer la cause racine et de proposer des actions correctives.</p>
  ` },
  'soc-int-l1-daily-prep': { title: 'SOC — Tâches L1 → préparation responsabilités L2', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Comment vos tâches quotidiennes en L1 vous ont-elles préparé pour les responsabilités L2 ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Au quotidien en L1, je gère un volume important d’alertes provenant du SIEM et de l’EDR. Cela m’a appris à prioriser efficacement, à suivre les procédures de triage et à documenter toutes mes actions dans le ticketing. Cette discipline est essentielle en L2, car elle permet d’avoir toutes les informations historiques pour mener une investigation plus approfondie. De plus, je me suis habitué à comprendre les schémas de menaces récurrents et à reconnaître les comportements anormaux, ce qui me permettra en L2 de détecter des incidents complexes, parfois subtils, qui nécessitent de la corrélation entre plusieurs sources de données.</p>
  ` },
  'soc-int-l2-role': { title: 'SOC — Rôle L2 et contribution à l’équipe', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Quel rôle pensez-vous jouer en tant qu’analyste L2, et comment contribuerez-vous à l’équipe ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>En tant que L2, je me vois comme un analyste d’investigation et un point d’escalade pour les incidents complexes. Mon rôle principal est de transformer les alertes initiales en incidents complets avec analyse de la cause racine et plan de remédiation. Je contribuerai également à améliorer les processus de détection en ajustant les règles SIEM/EDR et en documentant les faux positifs. Enfin, je participerai activement au partage de connaissances avec l’équipe L1 et L3 afin d’améliorer la réactivité globale du SOC et la maturité des opérations de sécurité.</p>
  ` },
  'soc-int-critical-incident': { title: 'SOC — Incident critique : étapes de gestion', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Décrivez un incident de sécurité critique et les étapes que vous avez suivies pour le gérer.</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Dans un incident récent, un malware a été détecté sur un poste utilisateur via l’EDR. J’ai d’abord isolé l’hôte pour éviter toute propagation. Ensuite, j’ai analysé l’arbre des processus et identifié le processus parent ayant déclenché le malware. J’ai collecté les logs et la télémétrie pour déterminer la chronologie des actions, les fichiers touchés et les connexions réseau externes. Après avoir identifié le vecteur initial, j’ai travaillé avec l’équipe IT pour nettoyer le poste et restaurer les fichiers depuis la sauvegarde. Enfin, j’ai documenté l’incident dans le ticket avec toutes les actions prises, la cause racine et les recommandations pour éviter que cela ne se reproduise.</p>
  ` },
  'soc-int-server-alert-steps': { title: 'SOC — Alerte critique serveur : actions immédiates', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Quelles actions immédiates prendriez-vous pour enquêter sur une alerte critique sur un serveur ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>La première étape consiste à isoler l’hôte pour limiter la propagation. Ensuite, j’examine les logs système, applicatifs et EDR pour identifier le processus et l’utilisateur à l’origine de l’alerte. Je corrèle ces données avec l’activité réseau pour détecter tout comportement anormal ou communication vers des IP suspectes. Je vérifie également si d’autres hôtes présentent des signes similaires. Enfin, je documente toutes mes actions et, selon le contexte, je contacte l’équipe L3 pour des mesures de remédiation plus avancées si nécessaire.</p>
  ` },
  'soc-int-siem-fp': { title: 'SOC — SIEM saturé de faux positifs : stratégie', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Comment géreriez-vous un SIEM saturé d’alertes faux positifs ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je commencerais par identifier les alertes les plus fréquentes et leur origine. Ensuite, je corrèle les logs pour déterminer les faux positifs et leurs causes, souvent des scripts métier légitimes ou des outils d’administration. Je propose alors des ajustements de règles ou des exceptions documentées afin de réduire le bruit sans compromettre la détection des véritables menaces. Enfin, je mets en place un suivi pour vérifier que les modifications ont réduit le nombre d’alertes inutiles et que les incidents réels restent détectables.</p>
  ` },
  'soc-int-brute-force-investigation': { title: 'SOC — Attaque brute force : investigation', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Comment enquêteriez-vous sur une attaque par force brute détectée par le SIEM ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je commence par identifier le compte cible, l’utilisateur légitime et l’origine des tentatives de connexion. J’analyse le pattern des tentatives, l’heure, les adresses IP et les pays d’origine. Je bloque immédiatement l’adresse IP si elle est externe et suspecte, et je vérifie si le compte a été compromis. Ensuite, je passe en revue les journaux pour détecter tout mouvement latéral ou accès non autorisé suite à la compromission. Enfin, je documente toutes les actions et recommande de renforcer les règles de verrouillage de compte et d’authentification multi-facteurs si nécessaire.</p>
  ` },
  'soc-int-ransomware-response': { title: 'SOC — Attaque ransomware : réaction et confinement', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Comment réagiriez-vous à une attaque ransomware chiffrant des fichiers sur l’environnement ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>La première étape est le confinement immédiat : isolation des postes infectés et blocage des flux réseau associés. Ensuite, j’identifie le processus responsable du chiffrement et les fichiers touchés. Je collecte les indicateurs de compromission pour déterminer l’étendue et prévenir toute propagation. Puis je collabore avec l’équipe IT pour restaurer les fichiers depuis les sauvegardes et pour s’assurer que le malware est complètement éliminé. Enfin, je documente l’incident avec la cause racine, les actions correctives et les recommandations de durcissement pour prévenir de futures infections.</p>
  ` },
  'soc-int-forensic-server': { title: 'SOC — Analyse forensic serveur compromis : étapes clés', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Quelles étapes suivriez-vous pour réaliser une analyse forensic d’un serveur compromis ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je commence par capturer une image mémoire et disque afin de conserver les preuves intactes. Ensuite, j’examine les processus actifs, les connexions réseau, les fichiers exécutables récents et les modifications dans les registres. Je corrèle ces données avec les alertes du SIEM et de l’EDR pour identifier la chronologie de l’attaque, le vecteur initial et la propagation éventuelle. Je documente chaque étape, en conservant les preuves pour un éventuel audit ou action juridique. Enfin, je propose un plan de remédiation et de nettoyage complet du serveur.</p>
  ` },
  'soc-int-ddos-response': { title: 'SOC — Attaque DDoS : actions immédiates', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Quelles actions immédiates prendriez-vous pour gérer une attaque DDoS inondant le SOC ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je commence par identifier le type de trafic et les hôtes impactés. Ensuite, je contacte l’équipe réseau pour appliquer des règles de filtrage ou limiter la bande passante sur les sources externes suspectes. Je vérifie que les services critiques restent disponibles et que le SOC continue de recevoir des logs essentiels. Je documente toutes les actions et je recommande des mesures préventives comme la mise en place de solutions anti-DDoS et de redondance réseau.</p>
  ` },
  'soc-int-complex-incident': { title: 'SOC — Incident complexe : gestion et résolution', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Décrivez un incident complexe que vous avez géré et comment vous avez assuré sa résolution.</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>J’ai géré un incident où un malware fileless avait infecté plusieurs postes via une campagne de phishing ciblée. J’ai commencé par isoler tous les postes affectés, analyser l’arbre des processus et collecter la télémétrie complète. J’ai ensuite identifié le vecteur initial et les machines compromises, bloqué les flux C2, et travaillé avec IT pour nettoyer et restaurer les postes. J’ai coordonné l’escalade vers L3 pour la mise en quarantaine des fichiers suspects et la réinitialisation des mots de passe. L’incident a été documenté en détail, avec le mapping MITRE ATT&CK et les recommandations pour durcir la sécurité contre des attaques similaires.</p>
  ` },
  'soc-int-insider-threat': { title: 'SOC — Menace interne : enquête et atténuation', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Quelles étapes suivriez-vous pour enquêter et atténuer une menace interne suspectée ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Je commence par identifier le compte et analyser toutes les actions récentes via les logs SIEM et EDR. Je corrèle les accès aux fichiers sensibles, les connexions réseau et l’activité système pour déterminer si les actions sont malveillantes ou métier. Je bloque les actions suspectes sans interrompre les opérations critiques. Ensuite, je collabore avec les équipes RH et juridiques selon le protocole interne pour sécuriser le compte et documenter les preuves. L’objectif est d’identifier le risque réel tout en respectant les procédures légales et métier.</p>
  ` },
  'soc-int-siem-challenges': { title: 'SOC — Défis SIEM & logs : solutions', content: `
    <h3 style="margin-bottom:12px;">❓ Question d’entretien</h3>
    <p>Quels défis avez-vous rencontrés dans l’analyse des logs ou l’utilisation du SIEM et comment les avez-vous résolus ?</p>
    <h3 style="margin:20px 0 12px;">✅ Réponse parfaite</h3>
    <p>Le principal défi est souvent le volume énorme de logs et le bruit généré par les faux positifs. Pour y remédier, j’ai appris à filtrer et à corréler les données pertinentes, à utiliser des dashboards et des alertes personnalisées, et à documenter les exceptions pour réduire le bruit. J’ai également créé des règles Sigma/EDR ajustées pour améliorer la détection des incidents réels sans saturer le SOC. Cette approche m’a permis de gagner en efficacité et de mieux prioriser les incidents critiques.</p>
  ` }
});
