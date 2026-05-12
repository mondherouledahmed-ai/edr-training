/* =====================================================================
 *  SecOps Academy — Banque de questions / flashcards / matching
 *  Format QCM : { q, choices:[], answer:index, topic, level, explain }
 *  Format Flash: { term, def, topic }
 *  Format Match: { topic, pairs:[[term,def], ...] }
 * ===================================================================== */
(function(){
  const QCM = [
    // ---------------- SOC fondamentaux ----------------
    { topic:"SOC", level:"L1", q:"Que signifie 'triage' d'une alerte SOC ?", choices:["Trier par couleur","Évaluer rapidement criticité, vraisemblance et impact pour décider de l'action","Supprimer les alertes anciennes","Envoyer toutes les alertes au L3"], answer:1, explain:"Le triage = qualifier vite (TP/FP, sévérité, périmètre) avant escalade." },
    { topic:"SOC", level:"L1", q:"Quel est l'ordre canonique d'un cycle d'incident ?", choices:["Détection → Confinement → Analyse → Éradication → Récupération → Leçons","Préparation → Détection → Confinement → Éradication → Récupération → Post-mortem","Préparation → Confinement → Détection → Éradication → Récupération","Détection → Éradication → Confinement → Récupération"], answer:1, explain:"Modèle NIST SP 800-61 : Préparation → Détection/Analyse → Containment/Eradication/Recovery → Post-incident." },
    { topic:"SOC", level:"L1", q:"True Positive vs False Positive : que faire d'un FP récurrent ?", choices:["Ignorer","Tuner la règle / créer une exception documentée","Désactiver le SIEM","Ouvrir un ticket à chaque fois"], answer:1, explain:"Un FP récurrent doit être tuné (whitelist/contexte) sinon il génère de la fatigue d'alerte." },
    { topic:"SOC", level:"L2", q:"Quelle métrique mesure le temps entre détection et endiguement ?", choices:["MTTD","MTTR","MTTC","SLA"], answer:2, explain:"MTTC = Mean Time To Contain. MTTD=Detect, MTTR=Respond/Recover." },
    { topic:"SOC", level:"L1", q:"IoC vs IoA : quelle est la différence ?", choices:["IoC = comportement, IoA = artefact","IoC = artefact post-compromission, IoA = comportement d'attaque en cours","Aucune différence","IoA est uniquement réseau"], answer:1, explain:"IoC : hash, IP, domaine. IoA : séquence d'actions (ex: lsass dump + cmd encodé)." },

    // ---------------- MITRE ATT&CK ----------------
    { topic:"MITRE", level:"L1", q:"À quoi sert MITRE ATT&CK ?", choices:["Cataloguer les CVE","Cataloguer Tactiques, Techniques et Procédures (TTP) des attaquants","Scanner les vulnérabilités","Chiffrer les logs"], answer:1, explain:"Framework TTP utilisé pour mapper détections, gaps et threat hunting." },
    { topic:"MITRE", level:"L1", q:"T1059 correspond à quelle technique ?", choices:["Phishing","Command and Scripting Interpreter (PowerShell, cmd, bash)","Persistence via Run key","Pass the Hash"], answer:1, explain:"T1059 = Command and Scripting Interpreter." },
    { topic:"MITRE", level:"L2", q:"T1078 désigne…", choices:["Valid Accounts","Scheduled Task","Mimikatz","Process Injection"], answer:0, explain:"T1078 Valid Accounts (default, domain, local, cloud)." },
    { topic:"MITRE", level:"L2", q:"Quelle tactique vient juste après Initial Access ?", choices:["Persistence","Execution","Discovery","Exfiltration"], answer:1, explain:"Ordre type : Initial Access → Execution → Persistence → Privilege Escalation…" },
    { topic:"MITRE", level:"L1", q:"Lateral Movement appartient à quelle catégorie ?", choices:["CVE","Tactique ATT&CK","Norme ISO","Type de pare-feu"], answer:1, explain:"Lateral Movement = tactique TA0008." },

    // ---------------- EDR / HarfangLab ----------------
    { topic:"EDR", level:"L1", q:"Quelle est la fonction principale d'un EDR ?", choices:["Antivirus signature uniquement","Détection comportementale + télémétrie endpoint + réponse","Sauvegarder les fichiers","Filtrer les emails"], answer:1, explain:"EDR = télémétrie process/registre/réseau + détection + actions de réponse." },
    { topic:"EDR", level:"L1", q:"À quoi sert l'isolation réseau d'un endpoint dans un EDR ?", choices:["Couper internet de l'utilisateur en télétravail","Empêcher la propagation tout en gardant la communication avec la console EDR","Désinstaller l'agent","Mettre à jour Windows"], answer:1, explain:"Network isolation = quarantaine logique : seul le canal EDR reste ouvert." },
    { topic:"EDR", level:"L2", q:"HarfangLab utilise quel langage pour les règles de chasse personnalisées ?", choices:["Snort","YARA + Sigma","KQL uniquement","Bash"], answer:1, explain:"HarfangLab supporte YARA (mémoire/disque) et règles Sigma converties." },
    { topic:"EDR", level:"L2", q:"Que contient typiquement un fichier YARA ?", choices:["Signatures réseau","meta + strings + condition","Règles Suricata","Politiques GPO"], answer:1, explain:"Une règle YARA : meta, strings ($s1=...), condition (any/all of them)." },
    { topic:"EDR", level:"L1", q:"Que veut dire 'PUP' dans la console EDR ?", choices:["Process Update Package","Potentially Unwanted Program","Privileged User Process","Persistent Unsigned Process"], answer:1, explain:"PUP = logiciel indésirable (toolbar, adware…)." },
    { topic:"EDR", level:"L2", q:"LSASS dump (T1003.001) : quelle réponse EDR immédiate ?", choices:["Redémarrer le serveur","Tuer le process suspect, isoler l'hôte, collecter mémoire/handle","Supprimer LSASS","Désactiver l'EDR"], answer:1, explain:"Kill + isolate + forensic. Ne jamais tuer LSASS lui-même." },

    // ---------------- SOAR / Playbooks ----------------
    { topic:"SOAR", level:"L1", q:"SOAR signifie…", choices:["Security Orchestration, Automation, Response","Security Operations And Reporting","System Of Automatic Response","Secure Online Audit Report"], answer:0, explain:"SOAR = orchestration + automatisation + réponse." },
    { topic:"SOAR", level:"L1", q:"Quel élément n'est PAS typiquement un step de playbook phishing ?", choices:["Extraction des IoC (URL, hash, expéditeur)","Recherche dans le SIEM des autres destinataires","Recompiler le noyau Linux","Quarantaine du mail Exchange/Defender"], answer:2, explain:"Recompiler un kernel n'est pas un step de réponse phishing 🙂" },
    { topic:"SOAR", level:"L2", q:"Quel risque principal en automatisant les réponses ?", choices:["Trop de logs","Faux positifs propagés en actions destructrices (block, désactivation)","Surcharger le SIEM","Casser le chiffrement"], answer:1, explain:"D'où human-in-the-loop pour actions à fort impact." },
    { topic:"SOAR", level:"L2", q:"Que fait l'enrichissement (enrichment) dans un playbook ?", choices:["Ajouter du contexte (VT, GeoIP, AD, threat intel) à l'alerte","Compresser les logs","Effacer les IoC","Renommer l'alerte"], answer:0, explain:"Enrichissement = contextualiser pour décider plus vite et mieux." },

    // ---------------- PAM ----------------
    { topic:"PAM", level:"L1", q:"PAM = ?", choices:["Privileged Access Management","Public Access Module","Process Audit Manager","Patch Automation Manager"], answer:0, explain:"PAM gère comptes/sessions à privilèges (CyberArk, BeyondTrust, Wallix…)." },
    { topic:"PAM", level:"L1", q:"Quelle pratique réduit le risque sur les comptes admin ?", choices:["Mot de passe partagé entre admins","Just-In-Time access + rotation auto + enregistrement session","Désactiver MFA","Utiliser le compte domain admin partout"], answer:1, explain:"JIT + vault + session recording = piliers PAM." },
    { topic:"PAM", level:"L2", q:"Que permet le 'session recording' ?", choices:["Rejouer une session admin pour audit/forensic","Sauvegarder les fichiers utilisateurs","Déchiffrer TLS","Cloner les VMs"], answer:0, explain:"Preuve d'audit + investigation post-incident." },

    // ---------------- Splunk SPL ----------------
    { topic:"Splunk", level:"L1", q:"Quel mot-clé SPL filtre les résultats après une recherche ?", choices:["where","sort","table","head"], answer:0, explain:"`where` filtre sur des expressions évaluées. `search` filtre tôt sur les events bruts." },
    { topic:"Splunk", level:"L1", q:"Quel `stats` calcule le nombre par utilisateur ?", choices:["stats sum(user)","stats count by user","table user","dedup user"], answer:1, explain:"`stats count by user`." },
    { topic:"Splunk", level:"L2", q:"Quelle commande ajoute un champ calculé ?", choices:["eval","fields","rename","mvexpand"], answer:0, explain:"`eval new=expr` crée/modifie un champ." },
    { topic:"Splunk", level:"L2", q:"Détection brute force SSH minimale ?", choices:["index=linux 'Failed password' | stats count by src_ip | where count>10","index=* | head 10","sort _time","| metadata type=hosts"], answer:0, explain:"Compter les Failed password par IP source au-dessus d'un seuil." },
    { topic:"Splunk", level:"L2", q:"Que fait `| transaction user maxspan=10m` ?", choices:["Regroupe events par user dans une fenêtre de 10 min","Supprime les doublons","Crée un index","Lance une alerte"], answer:0, explain:"Construit des transactions liées par user en <10 minutes." },
    { topic:"Splunk", level:"L1", q:"Quel sourcetype typique pour Sysmon ?", choices:["WinEventLog:Sysmon","XmlWinEventLog:Microsoft-Windows-Sysmon/Operational","linux_secure","syslog"], answer:1, explain:"`XmlWinEventLog:Microsoft-Windows-Sysmon/Operational`." },

    // ---------------- Windows Event IDs ----------------
    { topic:"Events", level:"L1", q:"Event ID 4624 =", choices:["Logon échoué","Logon réussi","Création de compte","Changement de mot de passe"], answer:1, explain:"4624 = An account was successfully logged on." },
    { topic:"Events", level:"L1", q:"Event ID 4625 =", choices:["Logon échoué","Logoff","Account locked","Privilege use"], answer:0, explain:"4625 = An account failed to log on." },
    { topic:"Events", level:"L1", q:"Event ID 4688 =", choices:["Process creation","File created","Service installed","Logon"], answer:0, explain:"4688 = A new process has been created (avec CommandLine si activé)." },
    { topic:"Events", level:"L2", q:"Event ID 4720 =", choices:["User account created","Group changed","Logon type 10","Kerberos TGT"], answer:0, explain:"4720 = A user account was created." },
    { topic:"Events", level:"L2", q:"Event ID 4768 =", choices:["TGT Kerberos demandé","TGS Kerberos demandé","NTLM logon","Account lockout"], answer:0, explain:"4768 = TGT request (auth Kerberos)." },
    { topic:"Events", level:"L2", q:"Event ID 4769 =", choices:["TGT","TGS (service ticket) — pertinent Kerberoasting","Logon failure","Process creation"], answer:1, explain:"4769 = TGS request, surveillé pour Kerberoasting (encryption type 0x17)." },
    { topic:"Events", level:"L2", q:"Logon Type 3 =", choices:["Console interactive","Network (SMB, etc.)","Batch","Service"], answer:1, explain:"Type 3 = Network. Type 10 = RemoteInteractive (RDP)." },
    { topic:"Events", level:"L2", q:"Event ID 7045 =", choices:["Service installé (utilisé par PsExec/Cobalt Strike)","Logon","Process","File"], answer:0, explain:"7045 = New service installed (souvent associé à pivoting)." },
    { topic:"Events", level:"L1", q:"Event ID 4672 =", choices:["Privileges spéciaux assignés au logon (souvent admin)","Logoff","Failed logon","Account locked"], answer:0, explain:"4672 = Special privileges assigned (suivre les admin sessions)." },

    // ---------------- Linux hardening ----------------
    { topic:"Linux", level:"L1", q:"Pour interdire le login SSH root, on modifie…", choices:["/etc/passwd","/etc/ssh/sshd_config (PermitRootLogin no)","/etc/hosts","~/.bashrc"], answer:1, explain:"PermitRootLogin no + reload sshd." },
    { topic:"Linux", level:"L1", q:"Quel fichier liste les tâches planifiées système ?", choices:["/etc/crontab","/var/log/auth.log","/etc/passwd","/proc/cpuinfo"], answer:0, explain:"/etc/crontab + /etc/cron.d/* + crontabs utilisateurs." },
    { topic:"Linux", level:"L2", q:"Quelle commande montre les ports en écoute ?", choices:["ps aux","ss -tulnp","ls -la","cat /etc/hosts"], answer:1, explain:"`ss -tulnp` (ou netstat -tulnp)." },
    { topic:"Linux", level:"L2", q:"Quelle log Linux pour échecs de login SSH ?", choices:["/var/log/auth.log (Debian) ou /var/log/secure (RHEL)","/var/log/dmesg","/var/log/syslog uniquement","/etc/login.defs"], answer:0, explain:"auth.log / secure selon distro." },
    { topic:"Linux", level:"L1", q:"Quelle commande change les droits en 640 ?", choices:["chown 640 file","chmod 640 file","chattr 640 file","umask 640 file"], answer:1, explain:"chmod 640 = rw- r-- ---" },
    { topic:"Linux", level:"L2", q:"Pour bannir IP après brute force SSH on utilise…", choices:["fail2ban","logrotate","apt","systemd-timer"], answer:0, explain:"fail2ban lit auth.log et bannit via iptables/nftables." },

    // ---------------- Apache / Web ----------------
    { topic:"Apache", level:"L1", q:"Quel header empêche le rendering iframe (clickjacking) ?", choices:["X-Frame-Options DENY/SAMEORIGIN","Cache-Control","Content-Length","Server"], answer:0, explain:"X-Frame-Options ou CSP frame-ancestors." },
    { topic:"Apache", level:"L1", q:"Quel header impose HTTPS (HSTS) ?", choices:["Strict-Transport-Security","X-Content-Type-Options","Referrer-Policy","Server"], answer:0, explain:"HSTS : Strict-Transport-Security: max-age=63072000; includeSubDomains; preload." },
    { topic:"Apache", level:"L2", q:"Comment masquer la version Apache ?", choices:["ServerTokens Prod + ServerSignature Off","mod_rewrite","AllowOverride All","KeepAlive Off"], answer:0, explain:"ServerTokens Prod cache la version dans Server header." },
    { topic:"Apache", level:"L2", q:"Quel module pour WAF de base ?", choices:["mod_security","mod_php","mod_status","mod_userdir"], answer:0, explain:"ModSecurity + OWASP CRS." },

    // ---------------- Phishing / IR ----------------
    { topic:"Phishing", level:"L1", q:"Quel artefact email à analyser EN PRIORITÉ ?", choices:["Couleur du logo","Headers (SPF/DKIM/DMARC, Received)","Police d'écriture","Taille du fichier"], answer:1, explain:"Headers + URLs/attachments + payload sandbox." },
    { topic:"Phishing", level:"L1", q:"DMARC = ?", choices:["Domain-based Message Auth, Reporting & Conformance","Direct Mail Routing","Domain Mail Anti Ransom","Dual Mailing Auth"], answer:0, explain:"DMARC s'appuie sur SPF + DKIM + politique (none/quarantine/reject)." },
    { topic:"Phishing", level:"L2", q:"Action immédiate si user a cliqué sur lien et entré creds ?", choices:["Reset password + invalider sessions + MFA enforce + chasse logs","Ignorer","Réinstaller Windows","Bloquer internet du site"], answer:0, explain:"Reset + révocation tokens + recherche de logon anormaux post-clic." },

    // ---------------- Sigma / Threat hunting ----------------
    { topic:"Sigma", level:"L2", q:"Sigma sert à…", choices:["Décrire une règle de détection portable convertie vers SIEM (Splunk/Elastic/Sentinel)","Chiffrer les logs","Compresser PCAP","Faire du fuzzing"], answer:0, explain:"Sigma = format YAML générique pour règles de détection." },
    { topic:"Sigma", level:"L2", q:"Champ obligatoire d'une règle Sigma ?", choices:["title + logsource + detection","port","interface","timezone"], answer:0, explain:"title, logsource, detection (selection + condition) sont la base." },

    // ---------------- Réseau / Forensic ----------------
    { topic:"Réseau", level:"L1", q:"Quel outil capture le trafic réseau ?", choices:["Wireshark / tcpdump","Excel","nmap","Metasploit"], answer:0, explain:"Capture & analyse PCAP." },
    { topic:"Réseau", level:"L2", q:"Beaconing C2 se reconnaît via…", choices:["Pic CPU","Connexions périodiques (jitter faible) vers même domaine/IP","Logs vides","DNS désactivé"], answer:1, explain:"Périodicité + faible volume + destination rare = signal C2." },

    // ---------------- STAR ----------------
    { topic:"STAR", level:"L1", q:"STAR signifie…", choices:["Situation, Tâche, Action, Résultat","Security, Threat, Action, Response","Status, Time, Asset, Risk","Standard, Test, Audit, Review"], answer:0, explain:"Situation → Tâche → Action → Résultat (réponses structurées en entretien)." },

    // ---------------- QCM type ENTRETIEN SOC ----------------
    { topic:"Entretien", level:"L1", q:"Différence L1 vs L2 SOC ?", choices:["L1 = code, L2 = manage","L1 qualifie/triage les alertes ; L2 investigue, corrèle, répond et améliore les règles","L1 ferme les tickets ; L2 fait du café","Aucune différence"], answer:1, explain:"L1 = première ligne (triage, FP/TP, escalade). L2 = analyse approfondie, IR, hunting, tuning." },
    { topic:"Entretien", level:"L1", q:"Une alerte SIEM tombe — quel est ton premier réflexe ?", choices:["Bloquer l'IP immédiatement","Qualifier : source, contexte, asset, user, corréler avant action","Appeler le RSSI","Fermer en FP"], answer:1, explain:"Toujours qualifier (qui/quoi/où/quand) AVANT toute action de réponse." },
    { topic:"Entretien", level:"L2", q:"Connexion VPN réussie à 03h12 d'un user qui ne travaille jamais la nuit. Action ?", choices:["Fermer en FP","Vérifier géoloc, MFA utilisé, asset accédé, comparer baseline user, contacter user/manager","Bloquer le compte direct","Ignorer, c'est juste un VPN"], answer:1, explain:"Triage UEBA : géo, MFA, asset, baseline. Si doute → reset+session kill+contact." },
    { topic:"Entretien", level:"L2", q:"Multiples 4625 puis un 4624 sur le même compte. Que conclure ?", choices:["Brute force réussi probable — investiguer post-logon (process, lateral)","Tout va bien","FP automatique","Patch nécessaire"], answer:0, explain:"Pattern brute force success → analyser ce que le compte a fait après le logon réussi." },
    { topic:"Entretien", level:"L2", q:"Compte admin créé hors procédure (sans ticket). Réflexe ?", choices:["Le supprimer en silence","Geler le compte, identifier qui l'a créé (4720+4732), confronter au change mgmt, IR si non légitime","Le laisser","Changer son mdp"], answer:1, explain:"Persistence potentielle. Freeze + audit + corrélation 4720/4728/4732 + change mgmt." },
    { topic:"Entretien", level:"L2", q:"Plusieurs agents EDR offline en même temps : que penser en priorité ?", choices:["Coïncidence","Possible action attaquant pour cacher activité (defense evasion T1562) — escalade IR","Mise à jour réussie","Problème réseau uniquement"], answer:1, explain:"T1562 Impair Defenses. Hypothèse haute : attaquant. Vérifier réseau ET hôte simultanément." },
    { topic:"Entretien", level:"L2", q:"Impossible travel détecté (Paris→Tokyo en 30min). Premier check ?", choices:["Bloquer le user","Vérifier sources d'auth (VPN/proxy), MFA, sessions actives, géoloc IP réelle","Réinstaller le poste","Reset mdp tout de suite"], answer:1, explain:"Souvent FP via VPN d'entreprise. Si vraiment 2 IPs réelles → token theft : reset+revoke." },
    { topic:"Entretien", level:"L2", q:"Compte de service utilisé en logon interactif (Type 2 ou 10). Verdict ?", choices:["Normal","Anormal — un compte de service ne doit jamais se logger interactivement → suspicion abuse","Ça dépend du jour","Toujours FP"], answer:1, explain:"Service account = batch (Type 5) ou network (Type 3). Interactive = abus probable." },
    { topic:"Entretien", level:"L2", q:"SIEM saturé de FP, comment réagir ?", choices:["Désactiver les règles","Tuning ciblé : enrichir contexte, baseline, exceptions documentées, ajuster seuils, retours boucle","Ignorer","Acheter un autre SIEM"], answer:1, explain:"Tuning continu basé sur la donnée + UEBA. Jamais désactiver sans documentation." },
    { topic:"Entretien", level:"L1", q:"Quel modèle décrit les phases d'une attaque ?", choices:["OWASP Top 10","Cyber Kill Chain (Lockheed Martin) / MITRE ATT&CK","ISO 27005","ITIL"], answer:1, explain:"Kill Chain : Recon → Weaponize → Deliver → Exploit → Install → C2 → Actions. ATT&CK = TTP détaillés." },
    { topic:"Entretien", level:"L2", q:"Triade CIA = ?", choices:["Confidentialité, Intégrité, Disponibilité","Cyber, Intel, Audit","Cryptography, IDS, Antivirus","Compliance, Incident, Audit"], answer:0, explain:"CIA = piliers de la sécurité : Confidentiality, Integrity, Availability." },
    { topic:"Entretien", level:"L2", q:"Que mets-tu en premier dans un rapport d'incident ?", choices:["Détails techniques","Executive summary (impact business, statut, actions, prochaines étapes)","Logs bruts","Photos"], answer:1, explain:"Executive summary lisible par non-techniques en haut, détails techniques après." },
    { topic:"Entretien", level:"L1", q:"Que veut dire 'Defense in Depth' ?", choices:["Un seul firewall très fort","Empiler plusieurs couches de sécurité (réseau, host, app, data, humain) — pas de SPOF","Chiffrer tout","Bloquer internet"], answer:1, explain:"Couches multiples : si une tombe, les autres tiennent." },
    { topic:"Entretien", level:"L2", q:"Tu trouves un IoC en chasse — que fais-tu ?", choices:["Rien","Sweep tout l'environnement (SIEM/EDR), partager TI, créer règle de détection, post-mortem","Le supprimer seul","Attendre une alerte"], answer:1, explain:"1 IoC trouvé = chercher partout, pivoter, créer la détection durable." },
    { topic:"Entretien", level:"L2", q:"Ransomware confirmé sur un poste. Premier geste ?", choices:["Reboot","ISOLATION réseau immédiate (EDR), préserver mémoire, identifier patient zéro et propagation","Déchiffrer","Payer la rançon"], answer:1, explain:"Containment first. Pas de reboot (perte mémoire forensique)." },
    { topic:"Entretien", level:"L2", q:"DLP : email avec PII vers Gmail externe. Action ?", choices:["Laisser passer","Quarantaine du mail, alerter user/manager, vérifier intent (erreur vs malveillant), audit historique","Supprimer Gmail","Bloquer tous les emails"], answer:1, explain:"Bloquer + investiguer intent. Distinguer maladresse vs exfil." },
    { topic:"Entretien", level:"L1", q:"Différence vulnérabilité / menace / risque ?", choices:["Synonymes","Vuln = faille, Menace = acteur/moyen exploitant, Risque = vraisemblance × impact","Risque = vuln","Aucune"], answer:1, explain:"Vuln (faille) × Menace (qui/comment) → Risque (probabilité×impact)." },
    { topic:"Entretien", level:"L2", q:"Que ferais-tu pour réduire le bruit du SIEM en 1 sprint ?", choices:["Désactiver les règles bruyantes","Top 10 règles bruyantes → enrichissement, exceptions docs, seuils adaptatifs, suppression des doublons","Acheter un autre SIEM","Mute tout"], answer:1, explain:"Approche data-driven : Pareto des FP, tuning ciblé, mesurer." }
  ];

  const FLASH = [
    { topic:"SOC", term:"MTTD", def:"Mean Time To Detect — délai moyen entre l'incident réel et sa détection." },
    { topic:"SOC", term:"MTTR", def:"Mean Time To Respond/Recover — délai moyen entre détection et résolution." },
    { topic:"SOC", term:"MTTC", def:"Mean Time To Contain — délai moyen pour endiguer un incident." },
    { topic:"SOC", term:"Triage", def:"Qualification rapide d'une alerte : sévérité, vraisemblance, impact, périmètre." },
    { topic:"SOC", term:"TP/FP/BP", def:"True Positive / False Positive / Benign Positive — verdicts d'analyse." },
    { topic:"MITRE", term:"TA0001", def:"Tactique Initial Access (phishing, exploit public-facing, valid accounts…)." },
    { topic:"MITRE", term:"T1059", def:"Command and Scripting Interpreter (PowerShell, cmd, bash, wscript)." },
    { topic:"MITRE", term:"T1003.001", def:"OS Credential Dumping — LSASS Memory (Mimikatz, comsvcs.dll)." },
    { topic:"MITRE", term:"T1078", def:"Valid Accounts (default, domain, local, cloud)." },
    { topic:"MITRE", term:"T1055", def:"Process Injection (DLL, hollowing, APC, reflective)." },
    { topic:"EDR", term:"Network isolation", def:"Quarantaine logique : tout le trafic bloqué sauf canal vers la console EDR." },
    { topic:"EDR", term:"YARA", def:"Langage de règles pour pattern matching disque/mémoire (meta/strings/condition)." },
    { topic:"EDR", term:"HarfangLab", def:"EDR souverain français — détection comportementale + YARA + Sigma + IOC + chasse." },
    { topic:"SOAR", term:"Playbook", def:"Workflow d'orchestration/automatisation pour traiter un type d'alerte." },
    { topic:"SOAR", term:"Enrichment", def:"Ajout de contexte (VT, AD, GeoIP, TI) à une alerte avant décision." },
    { topic:"PAM", term:"JIT access", def:"Just-In-Time : élévation temporaire approuvée + auditée." },
    { topic:"PAM", term:"Vault", def:"Coffre chiffré stockant secrets/comptes priv. avec rotation automatique." },
    { topic:"Splunk", term:"index", def:"Conteneur logique de stockage d'events (ex: index=wineventlog)." },
    { topic:"Splunk", term:"sourcetype", def:"Type de format des events utilisé par Splunk pour parser." },
    { topic:"Splunk", term:"stats", def:"Commande de transformation : stats count by user, sum(bytes)…" },
    { topic:"Splunk", term:"tstats", def:"Stats accélérée sur datamodels indexés (CIM)." },
    { topic:"Events", term:"4624", def:"Logon réussi (regarder LogonType : 2=interactif,3=network,10=RDP)." },
    { topic:"Events", term:"4625", def:"Logon échoué (Status/SubStatus indique la cause)." },
    { topic:"Events", term:"4688", def:"Process creation (CommandLine si politique activée)." },
    { topic:"Events", term:"4720", def:"User account created." },
    { topic:"Events", term:"4768", def:"Kerberos TGT requested." },
    { topic:"Events", term:"4769", def:"Kerberos TGS — surveiller chiffrement RC4 (0x17) → Kerberoasting." },
    { topic:"Events", term:"7045", def:"Service installed — IoC PsExec / Cobalt Strike." },
    { topic:"Events", term:"4672", def:"Privilèges spéciaux assignés (admin logon)." },
    { topic:"Linux", term:"sshd_config", def:"Config SSH : PermitRootLogin no, PasswordAuthentication no, AllowUsers…" },
    { topic:"Linux", term:"auditd", def:"Daemon d'audit Linux : règles via /etc/audit/rules.d/." },
    { topic:"Linux", term:"fail2ban", def:"Banissement IP après échecs (lit auth.log → iptables/nftables)." },
    { topic:"Apache", term:"HSTS", def:"Strict-Transport-Security — force HTTPS côté navigateur." },
    { topic:"Apache", term:"CSP", def:"Content-Security-Policy — restreint sources JS/CSS/images." },
    { topic:"Apache", term:"ServerTokens Prod", def:"Cache la version Apache dans Server header." },
    { topic:"Phishing", term:"SPF", def:"Sender Policy Framework — enregistre DNS des IP autorisées." },
    { topic:"Phishing", term:"DKIM", def:"Signature cryptographique du mail (clé publique en DNS)." },
    { topic:"Phishing", term:"DMARC", def:"Politique alignée SPF/DKIM + reporting (rua/ruf)." },
    { topic:"Sigma", term:"Sigma", def:"Format YAML générique de règles de détection convertissable en SPL/KQL/Lucene." },
    { topic:"Réseau", term:"Beaconing", def:"Communication C2 périodique caractéristique d'un implant." }
  ];

  const MATCH = [
    { topic:"Events Windows", pairs:[
      ["4624","Logon réussi"],
      ["4625","Logon échoué"],
      ["4688","Création de process"],
      ["4720","Création de compte"],
      ["4768","TGT Kerberos"],
      ["4769","TGS Kerberos"],
      ["7045","Service installé"]
    ]},
    { topic:"MITRE techniques", pairs:[
      ["T1059","Command/Scripting Interpreter"],
      ["T1003","Credential Dumping"],
      ["T1078","Valid Accounts"],
      ["T1055","Process Injection"],
      ["T1486","Data Encrypted for Impact"],
      ["T1021","Remote Services"]
    ]},
    { topic:"Sécurité Web", pairs:[
      ["HSTS","Force HTTPS"],
      ["CSP","Restreint sources JS/img"],
      ["X-Frame-Options","Anti clickjacking"],
      ["XSS","Injection script côté client"],
      ["CSRF","Forge requête authentifiée"],
      ["SQLi","Injection SQL"]
    ]},
    { topic:"Métriques SOC", pairs:[
      ["MTTD","Time To Detect"],
      ["MTTR","Time To Respond"],
      ["MTTC","Time To Contain"],
      ["SLA","Engagement de service"],
      ["TP","True Positive"],
      ["FP","False Positive"]
    ]}
  ];

  // ---------------- Q&A ouvertes type ENTRETIEN SOC ----------------
  // Format: { topic, level, q (question d'entretien), a (réponse modèle markdown-like), keywords:[mots-clés à mentionner] }
  const QA = [
    { topic:"Entretien", level:"L1", q:"Présente-toi en 2 minutes et explique pourquoi le SOC.",
      a:"<b>Pitch STAR perso :</b> nom, formation/expérience pertinente (cyber, sysadmin, dev). Mentionne 1-2 réalisations concrètes (ex : analyse de logs WAF, mise en place de règles SIEM, traitement d'incidents). Termine par <b>pourquoi le SOC</b> : passion détection, méthodologie rigoureuse, envie d'apprendre L1→L2, soif d'analyser des incidents réels et contribuer à la posture sécurité.",
      keywords:["méthodologie","passion","analyse","rigueur","apprentissage","incidents"] },
    { topic:"Entretien", level:"L1", q:"Décris une journée type de SOC L1.",
      a:"1) <b>Hand-over</b> avec l'équipe précédente (incidents en cours).<br>2) <b>Triage</b> de la file d'alertes SIEM/EDR : qualifier (TP/FP/BP), prioriser par criticité.<br>3) <b>Investigation rapide</b> : corréler logs, enrichir (VT, AD, GeoIP).<br>4) <b>Escalade L2</b> si vrai positif complexe.<br>5) <b>Documentation</b> tickets, contribution à la KB et au tuning.<br>6) <b>Veille</b> threat intel & nouvelles règles.",
      keywords:["triage","corrélation","tickets","escalade","documentation","veille"] },
    { topic:"Entretien", level:"L2", q:"Décris ta méthodologie d'analyse d'une alerte.",
      a:"<b>1) Comprendre</b> l'alerte (règle, source, sévérité).<br><b>2) Contextualiser</b> : asset (criticité, OS, owner), user (rôle, baseline, horaires), réseau.<br><b>3) Corréler</b> : autres alertes, logs voisins, timeline ±1h.<br><b>4) Enrichir</b> : VT, threat intel, EDR.<br><b>5) Décider</b> : TP/FP/BP — si TP → containment + IR.<br><b>6) Documenter</b> : ticket clair, IoC, recommandation tuning.",
      keywords:["contexte","corrélation","enrichissement","timeline","tuning","documentation"] },
    { topic:"Entretien", level:"L2", q:"Comment qualifier un faux positif ?",
      a:"FP = règle déclenchée techniquement mais activité <b>légitime/attendue</b>. Vérifier : action habituelle de l'asset/user (baseline), processus business connu, fenêtre maintenance, scan autorisé. Ensuite : documenter le pattern, créer une <b>exception ciblée</b> (pas trop large !), mesurer impact, ajouter au backlog tuning.",
      keywords:["baseline","exception","tuning","documentation","légitime"] },
    { topic:"Entretien", level:"L1", q:"Différence entre SIEM, EDR et SOAR ?",
      a:"<b>SIEM</b> = collecte/corrélation logs multi-sources (Splunk, Sentinel) → détection.<br><b>EDR</b> = télémétrie endpoint + détection comportementale + actions de réponse (HarfangLab, CrowdStrike).<br><b>SOAR</b> = orchestration/automatisation (playbooks) — appelle SIEM/EDR/TI, automatise réponse (Cortex XSOAR, Splunk SOAR).",
      keywords:["SIEM","EDR","SOAR","corrélation","télémétrie","playbook"] },
    { topic:"Entretien", level:"L2", q:"Connexion VPN à 03h12 d'un user qui ne travaille pas la nuit. Que fais-tu ?",
      a:"<b>Triage UEBA :</b> baseline horaire user + géoloc IP source + MFA utilisé (push/oui-prompt) ? Asset accédé ? Comparer avec changement récent (mission/voyage). <b>Si suspect</b> : contacter le user et son manager hors canal compromis, vérifier les actions post-logon (4624 type 10, RDP, accès fichiers), kill session + reset mdp + révocation tokens si compromission. Documenter.",
      keywords:["baseline","MFA","géoloc","kill session","reset","révocation"] },
    { topic:"Entretien", level:"L2", q:"Brute force SSH détecté : quelles étapes ?",
      a:"<b>1) Confirmer</b> : pic de Failed password (auth.log/4625) sur même IP/user.<br><b>2) Vérifier succès</b> : un 4624/Accepted password après les échecs ?<br><b>3) Containment</b> : bloquer IP (FW/fail2ban), si compte compromis → reset+disable.<br><b>4) Forensic post-logon</b> : .bash_history, fichiers modifiés, services nouveaux, persistence (cron, systemd), connexions sortantes.<br><b>5) Hardening</b> : MFA, clé SSH only, port non-default, fail2ban tuning.",
      keywords:["fail2ban","reset","forensic","persistence","hardening","MFA"] },
    { topic:"Entretien", level:"L2", q:"Tu détectes un ransomware sur 3 postes. Plan d'action ?",
      a:"<b>Containment IMMÉDIAT</b> : isolation réseau via EDR (pas reboot — préserver mémoire). Couper accès partages SMB. <b>Identifier patient zéro</b> et vecteur (phishing ? RDP ? exploit ?). Stopper la propagation : bloquer hash/IoC sur tout le parc. Préserver preuves (image disque, mémoire). Communiquer (CSIRT, dirigeant, juridique). <b>Éradication</b> : nettoyer, vérifier persistence. <b>Recovery</b> : restore sur backups vérifiés saines, hardening (MFA, backups offline, EDR partout). <b>Post-mortem</b>.",
      keywords:["isolation","containment","patient zéro","backups","post-mortem","CSIRT"] },
    { topic:"Entretien", level:"L2", q:"Comment fonctionne MITRE ATT&CK et pourquoi l'utiliser ?",
      a:"Framework cataloguant les <b>tactiques</b> (objectifs : Initial Access, Execution, Persistence, Lateral Movement, Exfiltration…) et <b>techniques</b> (comment : T1059 PowerShell, T1003 Mimikatz). Permet de : (1) parler le même langage entre équipes, (2) <b>mapper la couverture</b> de détection (gap analysis), (3) faire du <b>threat hunting</b> structuré, (4) prioriser tuning, (5) reporter en termes business.",
      keywords:["tactiques","techniques","gap analysis","hunting","couverture","langage commun"] },
    { topic:"Entretien", level:"L2", q:"Ton SIEM est saturé de faux positifs. Stratégie ?",
      a:"<b>Pareto</b> : top 10 règles bruyantes = 80% du bruit. Pour chacune : analyse cause racine, <b>enrichissement</b> (asset criticality, user role, threat intel), <b>seuils adaptatifs</b> (baseline), exceptions <b>documentées et étroites</b>, agrégation (mêmes events → 1 alerte). Mesurer : taux FP avant/après, MTTD, satisfaction analystes. Boucle continue avec le L2/Eng détection.",
      keywords:["Pareto","enrichissement","baseline","tuning","exception","mesure"] },
    { topic:"Entretien", level:"L2", q:"Décris un incident dont tu es fier (méthode STAR).",
      a:"<b>S</b>ituation : contexte (ex : alerte SIEM lateral movement nuit).<br><b>T</b>âche : ton rôle (analyste de garde, qualifier et contenir).<br><b>A</b>ction : étapes concrètes (corrélation, isolation EDR, recherche IoC parc, communication CSIRT).<br><b>R</b>ésultat : chiffré (3 hôtes contenus en 12 min, 0 propagation, post-mortem produit, 2 règles ajoutées).",
      keywords:["STAR","résultat chiffré","containment","post-mortem"] },
    { topic:"Entretien", level:"L1", q:"Que regardes-tu en priorité dans un email de phishing ?",
      a:"<b>Headers</b> : Received chain, Return-Path, SPF/DKIM/DMARC, mismatch From/Reply-To. <b>URLs</b> : domaine, typosquatting, redirections, sandbox. <b>Pièces jointes</b> : type, hash → VT, sandbox. <b>Contenu</b> : urgence/peur, demande inhabituelle. <b>Périmètre</b> : combien d'autres destinataires, qui a cliqué (proxy logs).",
      keywords:["headers","SPF","DKIM","DMARC","sandbox","périmètre"] },
    { topic:"Entretien", level:"L2", q:"Comment chasse-t-on (threat hunting) sans alerte préalable ?",
      a:"<b>Hypothèse-driven</b> à partir d'une TTP (ex : T1059.001 PowerShell encodé). Construire requêtes ciblées (Sysmon 1, 4688 + CommandLine), analyser anomalies, baselines (process rares, utilisateurs atypiques). Documenter l'hypothèse, les requêtes, les findings. Convertir trouvailles en règles de détection durables. Boucle.",
      keywords:["hypothèse","TTP","baseline","Sysmon","règles","durable"] },
    { topic:"Entretien", level:"L2", q:"Que ferais-tu en arrivant dans un nouveau SOC les 30 premiers jours ?",
      a:"<b>S1-2</b> : observer, lire la doc/runbooks, comprendre stack (SIEM/EDR/SOAR/tickets), périmètre clients/assets critiques, top alertes.<br><b>S3</b> : prendre la garde L1 supervisé, traiter alertes, demander feedback.<br><b>S4</b> : proposer 2-3 améliorations concrètes (1 règle tuning, 1 playbook simplifié, 1 KB enrichie). Restituer apprentissages au manager.",
      keywords:["observer","runbooks","supervision","feedback","amélioration","KB"] },
    { topic:"Entretien", level:"L2", q:"PsExec exécuté depuis un poste utilisateur. Verdict ?",
      a:"<b>Très suspect</b> hors contexte IT/admin. PsExec (T1021.002) = <b>lateral movement</b> classique post-compromission. Vérifier : qui est l'utilisateur (admin ?), source/destination, services 7045 créés sur la cible, processus enfants, credential utilisé. Si non légitime → isolation source+cible, hunt parc, IR.",
      keywords:["lateral movement","T1021.002","7045","isolation","hunt"] },
    { topic:"Entretien", level:"L2", q:"DNS vers un domaine créé il y a 2 jours (newly registered). Action ?",
      a:"NRD = forte présomption de <b>C2/phishing</b>. Vérifier : combien d'hôtes ont résolu, processus à l'origine (Sysmon 22), réputation domaine (TI, WHOIS), pattern <b>beaconing</b> (périodicité). Si confirmé : bloquer domaine (DNS/proxy/FW), isoler hôtes infectés, hunt IoC sur parc, créer règle de détection NRD.",
      keywords:["NRD","C2","beaconing","Sysmon 22","blocage DNS","hunt"] },
    { topic:"Entretien", level:"L2", q:"Compte de service utilisé en logon interactif. Pourquoi est-ce un problème ?",
      a:"Compte de service doit être <b>non-interactif</b> (Type 5 batch ou Type 3 network). Logon Type 2 (console) ou 10 (RDP) = <b>abus</b> : un humain (admin ou attaquant) utilise le compte. Risques : pas de MFA, mdp souvent statique, privilèges élevés, traçabilité brouillée. Action : alerter, identifier qui, geler/rotater le secret, enforcer politique 'service accounts deny interactive logon' (GPO).",
      keywords:["Type 2","Type 10","interactive","GPO","rotation","traçabilité"] },
    { topic:"Entretien", level:"L2", q:"Plusieurs agents EDR offline simultanément : que fais-tu ?",
      a:"Hypothèse haute : <b>action attaquant</b> (T1562 Impair Defenses) pour cacher activité. Vérifier en parallèle : (1) <b>réseau</b> (incident infra ?), (2) <b>console EDR</b> (dernier heartbeat, version), (3) <b>logs hôtes</b> via canal alternatif (SIEM/Sysmon/AD), (4) <b>corrélation</b> avec autres alertes mêmes assets. Si suspect → escalade IR, isolation par autre moyen (FW, switch, AD disable).",
      keywords:["T1562","heartbeat","corrélation","isolation alternative","IR"] },
    { topic:"Entretien", level:"L2", q:"Comment réduirais-tu le MTTD (Mean Time To Detect) ?",
      a:"(1) <b>Couvrir les gaps</b> ATT&CK avec règles ciblées sur TTP critiques.<br>(2) <b>Sources</b> : enrichir télémétrie (Sysmon, EDR, DNS, proxy, identity).<br>(3) <b>Qualité</b> : baselines, UEBA, contexte d'asset/user.<br>(4) <b>Tuning</b> : moins de FP = analystes plus rapides sur le vrai signal.<br>(5) <b>Threat hunting</b> régulier pour découvrir avant l'alerte.<br>(6) <b>Mesure</b> : MTTD par catégorie, post-mortems pour remonter la cause.",
      keywords:["gaps","télémétrie","UEBA","tuning","hunting","mesure"] },
    { topic:"Entretien", level:"L2", q:"Quelle est la différence entre IoC et IoA ?",
      a:"<b>IoC (Indicator of Compromise)</b> : artefact <b>post-compromission</b> (hash, IP, domaine, mutex, clé registre). Statique, périme vite.<br><b>IoA (Indicator of Attack)</b> : <b>comportement</b> en cours d'attaque (séquence : Word→PowerShell→outbound). Plus durable, basé TTP. Les EDR modernes combinent les deux : IoC pour blocage rapide, IoA pour détection comportementale résistante.",
      keywords:["artefact","comportement","TTP","statique","durable","EDR"] },
    { topic:"Entretien", level:"L1", q:"Comment expliques-tu une alerte technique à un dirigeant non-IT ?",
      a:"<b>Vocabulaire business</b> : pas de jargon. Structure : (1) <b>Quoi</b> en 1 phrase (ex : 'tentative d'accès non autorisé sur serveur de paie'). (2) <b>Impact</b> potentiel (données, service, réglementaire). (3) <b>Statut actuel</b> (contenu / en cours / résolu). (4) <b>Actions</b> prises et à venir. (5) <b>Décision attendue</b> du dirigeant. Court, clair, factuel, sans alarmisme inutile.",
      keywords:["business","impact","statut","factuel","décision"] }
  ];

  window.QUIZ_BANK = { QCM, FLASH, MATCH, QA };
})();
