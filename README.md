# VoiceScope AI

Plateforme locale d'analyse d'enregistrements de classe : un **serveur FastAPI** (Python) et une **application mobile React Native (Expo)**. Aucun résultat de démonstration n'est injecté dans l'application. Les mesures, graphiques et exports proviennent du même résultat serveur.

## Installation Windows

Les commandes sont données pour **PowerShell** et pour l'**invite de commandes (CMD)** quand elles diffèrent. Le prompt `PS C:\...>` indique PowerShell ; `C:\...>` sans `PS` indique CMD.

### 1. Serveur (Python)

Utiliser **Python 3.12 64 bits** (3.11 possible : remplacer `py -3.12` par `py -3.11` ; Python 3.13 et 3.14 ne sont pas la cible de cette configuration ML). `py -0` liste les versions installées. Depuis le dossier du projet :

```
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements-ai.txt
.\.venv\Scripts\python.exe -m pip install resemblyzer==0.1.4 --no-deps
.\.venv\Scripts\python.exe -m pip install -r requirements-yamnet.txt
.\.venv\Scripts\python.exe -m pip install imageio-ffmpeg
```

Ajouter la ligne `imageio-ffmpeg` à la fin de `requirements-ai.txt` pour qu'elle soit installée automatiquement la prochaine fois.

**Pourquoi `imageio-ffmpeg` ?** Le micro de l'application mobile enregistre en m4a/AAC, que libsndfile (utilisé par `soundfile`) ne lit pas. `services/acoustics.py` essaie d'abord libsndfile (WAV, FLAC, OGG...) puis bascule sur ffmpeg pour le reste. `imageio-ffmpeg` fournit un binaire ffmpeg dans le venv, sans installation système. Un ffmpeg déjà présent dans le `PATH` est utilisé en priorité.

**Pourquoi deux étapes pour Resemblyzer ?** Sa dépendance historique `webrtcvad` tente de compiler du C++ sous Windows. `requirements-ai.txt` installe explicitement ses dépendances et la distribution compatible `webrtcvad-wheels`, puis `--no-deps` évite de réinstaller l'ancienne distribution. Ne pas exécuter simplement `pip install resemblyzer` sur une machine sans compilateur.

Pour un fonctionnement acoustique sans modèles IA : `pip install -r requirements.txt`. Désactiver transcription et classification dans les Réglages ; l'absence de VAD ou de modèle vocal sera indiquée sans inventer de résultat. La présence d'un module signifie « installé », pas « poids chargés ».

Les poids Whisper et YAMNet sont téléchargés à la première utilisation. Préparer une analyse en ligne avant la soutenance ; le cache permet ensuite le fonctionnement hors ligne. Resemblyzer inclut ses poids. Les téléchargements nécessitent du réseau et plusieurs Go libres. CPU natif Windows, aucun GPU requis.

`constraints-tested.txt` enregistre les versions effectivement utilisées lors des vérifications. Pour les reproduire, ajouter `-c constraints-tested.txt` aux commandes `pip install -r ...`. TensorFlow Hub 0.16 utilise encore `pkg_resources` : `requirements-yamnet.txt` impose donc `setuptools<81`. Les avertissements de dépréciation TensorFlow Hub n'empêchent pas l'inférence testée.

**Vérifier que les bibliothèques se chargent** (voir « Windows bloque une DLL » plus bas en cas d'échec) :

```
.\.venv\Scripts\python.exe -c "import ctranslate2; print('ctranslate2 ok')"
.\.venv\Scripts\python.exe -c "import onnxruntime; print('onnxruntime ok')"
.\.venv\Scripts\python.exe -c "import torch; print('torch ok')"
.\.venv\Scripts\python.exe -c "import tensorflow as tf; print('tensorflow ok')"
```

### 2. Application mobile (React Native / Expo)

Prérequis : **Node.js 20 LTS ou plus récent** et l'application **Expo Go** sur le téléphone (Android ou iOS). Depuis le dossier du projet mobile :

```
npm install
npx expo install expo-audio expo-document-picker expo-file-system expo-haptics expo-linear-gradient react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens @react-native-async-storage/async-storage react-native-svg
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs zustand axios lucide-react-native react-native-toast-message react-native-gifted-charts
```

`npx expo install` choisit les versions compatibles avec le SDK Expo du projet : l'utiliser pour les paquets Expo et React Native plutôt que `npm install`.

Vérifier `babel.config.js` (le plugin Reanimated doit rester en dernier) :

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

Vérifier `app.json` pour la permission du microphone :

```json
"plugins": [
  ["expo-audio", { "microphonePermission": "Autoriser VoiceScope à utiliser le micro." }]
]
```

## Connecter le téléphone au serveur

Le téléphone et le PC doivent être sur **le même réseau Wi-Fi**. `localhost` et `127.0.0.1` ne fonctionnent pas depuis le téléphone : il faut l'adresse IP du **PC** sur ce Wi-Fi. La même adresse sert à trois endroits : l'application, le serveur et le test dans le navigateur.

1. **Trouver l'IP du PC.** Ouvrir un terminal et lancer :

   ```
   ipconfig
   ```

   Dans la section **« Carte réseau sans fil Wi-Fi »**, relever **Adresse IPv4**, par exemple `192.168.1.117`. Elle change d'un réseau Wi-Fi à l'autre et peut changer sur un même réseau : la vérifier à chaque nouvelle session.

2. **Mettre cette IP dans l'application mobile**, de l'une de ces deux façons :
   - **Dans l'application** (le plus simple) : onglet **Réglages**, champ **Connexion API**, saisir `http://VOTRE_IP:8000` (exemple : `http://192.168.1.117:8000`), puis **Enregistrer l'URL**.
   - **Dans le code** : fichier `src/store/useAppStore.ts`, ligne `apiBaseUrl: 'http://192.168.1.117:8000'`. Attention : l'URL est mémorisée sur le téléphone. Si elle a déjà été enregistrée, le changement dans le code est ignoré ; utiliser alors l'écran Réglages, ou effacer les données d'Expo Go.

3. **Autoriser cette IP côté serveur.** Par sécurité, `server.py` n'accepte que `localhost` et `127.0.0.1`. Toute autre adresse reçoit **400 Bad Request** (« Invalid host header »). L'IP du PC se déclare avec la variable d'environnement `VOICESCOPE_ALLOWED_HOSTS` (plusieurs IP séparées par des virgules). Elle ne vaut que pour la fenêtre où elle est définie : à refaire à chaque nouvelle fenêtre.

   **CMD** (sans guillemets ni espaces autour du `=`) :

   ```
   set VOICESCOPE_ALLOWED_HOSTS=192.168.1.117
   echo %VOICESCOPE_ALLOWED_HOSTS%
   ```

   **PowerShell** :

   ```powershell
   $env:VOICESCOPE_ALLOWED_HOSTS = "192.168.1.117"
   $env:VOICESCOPE_ALLOWED_HOSTS
   ```

   La syntaxe `$env:...` ne fonctionne pas dans CMD, et `set ...` ne fonctionne pas dans PowerShell.

4. **Démarrer le serveur** en l'écoutant sur le réseau local (obligatoire pour que le téléphone l'atteigne), **dans la même fenêtre** que l'étape 3 :

   ```
   .\.venv\Scripts\python.exe -m uvicorn server:app --host 0.0.0.0 --port 8000
   ```

5. **Autoriser le port 8000** dans le pare-feu Windows (réseau **privé**) si la connexion échoue.

6. **Tester** depuis le navigateur du téléphone : `http://VOTRE_IP:8000/api/etat` doit afficher du JSON.

7. **Lancer l'application** dans un second terminal et scanner le QR code avec Expo Go :

   ```
   npx expo start -c
   ```

Dans les logs du serveur, l'adresse devant chaque requête (par exemple `192.168.1.170`) est celle du **téléphone**, pas celle du PC. Des lignes `200 OK` confirment que la connexion fonctionne.

### Développement

Ajouter `--reload` à la commande uvicorn pour relancer le serveur à chaque modification de fichier Python. Après toute modification de `babel.config.js` ou installation d'un paquet natif, relancer Expo avec `-c` pour vider le cache de Metro. Le premier bundle est long (plus d'une minute) ; les suivants sont rapides. Documentation interactive de l'API : `http://VOTRE_IP:8000/docs`. Pour voir davantage de détails dans les logs du serveur, ajouter `--log-level debug`.

Arrêter un serveur qui ne répond pas à Ctrl+C : cliquer dans la fenêtre puis réessayer, fermer le terminal, ou tuer le port :

```
netstat -ano | findstr :8000
taskkill /F /PID <numéro_PID>
```

## Parcours de démonstration

1. **Profils** : enregistrer les trois personnes, idéalement 3 échantillons distincts de 10 à 15 secondes par personne. Le minimum est 3 secondes de parole détectée par Silero par ajout (faster-whisper requis pour le VAD). Limite de 30 échantillons par profil. Même nom = nouvel échantillon ; noms comparés sans tenir compte de la casse.
2. **Réglages** : adresse du serveur, langue `fr`, `en`, `ar`, `es` ou `auto`, Whisper `tiny`, `base` ou `small`, similarité/marge et seuils numériques. Ces paramètres sont mémorisés sur le téléphone et ne changent pas rétroactivement les analyses.
3. **Analyser** : enregistrer avec le micro ou importer un fichier (maximum 5 minutes et 32 Mio). Le serveur décode WAV, FLAC, OGG et assimilés avec libsndfile, et m4a, AAC, MP3, MP4 avec ffmpeg.
4. Lancer l'analyse après l'enregistrement. Les modèles ne sont pas utilisés en temps réel. Le vumètre pendant la capture est uniquement un indicateur de signal micro.
5. **Accueil** : niveau moyen, fréquence dominante, profils, voix dominante, durée, alertes et historique récent. Un dépassement durable est compté lorsque plusieurs fenêtres de 250 ms dépassent consécutivement le seuil rouge pendant la durée configurée.
6. **Analytics** : niveau sonore, temps de parole, détails par locuteur et événements sonores. Un appui sur une séance de l'historique ouvre son détail.
7. **Exports** : les exports TXT, CSV, JSON et PDF sont disponibles via l'API (`/api/sessions/{id}/export/{format}`) et la méthode `exportSession` de `src/services/api.ts`. Exporter avant d'arrêter le serveur : l'historique conserve uniquement les dix dernières analyses en mémoire. Les profils restent sur disque.

## Architecture et compatibilité

### Serveur

- `server.py` : routes historiques pour profils/import/export/analyse, validation, hôtes autorisés (`VOICESCOPE_ALLOWED_HOSTS`), historique borné. Il ne sert plus d'interface web.
- `schemas.py` : modèles Pydantic, paramètres et réponse d'analyse détaillée ; documentation interactive `/docs` et OpenAPI `/openapi.json`.
- `services/acoustics.py` : décodage borné (libsndfile puis ffmpeg en secours), conversion mono, rééchantillonnage polyphase, FFT, centroïde, RMS, dBFS, Welch, STFT, waveform, alertes.
- `services/speakers.py` : Resemblyzer, plusieurs empreintes par profil, score combinant les meilleurs échantillons et leur centroïde, contrôle des sous-fenêtres, persistance atomique.
- `services/privacy.py` : chiffrement DPAPI des profils sous Windows.
- `services/body_limit.py` : limite de taille des requêtes avant l'analyse multipart.
- `services/transcription.py` : faster-whisper CPU int8 avec VAD et horodatages ; un seul modèle Whisper en cache.
- `services/vad.py` : Silero ONNX livré avec faster-whisper, sans deuxième framework VAD.
- `services/sound_classifier.py` : YAMNet et libellés AudioSet réels, seuil pour `Inconnu`.
- `services/pipeline.py` : orchestration, statistiques à partir d'intervalles VAD disjoints, attribution prudente des phrases.
- `services/reports.py` : exports et PDF Unicode avec graphiques, limites et avertissements.
- `scripts/evaluate.py` : évaluation sur corpus annoté ; `scripts/smoke_models.py` et `scripts/smoke_e2e.py` : essais des modèles sur fichiers réels dans `tmp/audio`.

### Application mobile (`src/`)

- `App.js` : point d'entrée (gestes, zones sûres, notifications Toast, navigation).
- `src/navigation/RootNavigator.tsx` : cinq onglets (Accueil, Profils, Analyser, Analytics, Réglages) et l'écran modal de détail de séance.
- `src/screens/` : `OverviewScreen`, `ProfilesScreen`, `AnalysisScreen`, `AnalyticsScreen`, `SettingsScreen`, `SessionDetailScreen`.
- `src/components/` : `AudioRecorder` (enregistrement `expo-audio` ou import de fichier), `Button`, `Icon`.
- `src/services/api.ts` : tous les appels au serveur (axios, envoi multipart de l'audio, téléchargement des exports).
- `src/store/useAppStore.ts` : état global (zustand) ; options, emploi du temps et URL du serveur sont persistés sur le téléphone, profils, historique et résultat courant ne le sont pas.
- `src/theme/index.ts` : couleurs, espacements, typographie, ombres.
- `src/utils/permissions.ts` : demande d'autorisation du microphone.

Les champs `duree`, `langue`, `stt`, `avertissement`, `segments`, `niveaux` restent présents. `segments` décrit la timeline vocale VAD ; les phrases sont dans `transcriptions`. Les clients qui lisaient les phrases dans `segments[].texte` doivent migrer.

### Limites de l'application mobile

- Le détail de séance affiche un résumé ; les transcriptions horodatées ne sont pas encore présentées dans l'application.
- Les boutons d'export ne sont pas encore dans l'interface : utiliser l'API.
- La police Inter du thème n'est pas chargée par défaut ; sans elle, la police système est utilisée (pas d'erreur).
- L'application ne fonctionne qu'avec le serveur joignable : pas de mode hors connexion.

### API

| Route | Usage |
|---|---|
| GET `/api/etat` | Présence des dépendances |
| GET/POST `/api/personnes` | Profils ; ajout multipart `nom`, `audio` |
| DELETE `/api/personnes/{nom}` | Suppression d'un profil |
| GET `/api/voix/export` | Sauvegarde des empreintes JSON |
| POST `/api/voix/import` | Fusion validée, multipart `fichier` |
| POST `/api/analyse` | Audio + options multipart, résultat structuré |
| GET `/api/sessions` | Historique en mémoire |
| GET/DELETE `/api/sessions/{id}` | Lecture / suppression |
| GET `/api/sessions/{id}/export/{format}` | `txt`, `csv`, `json`, `pdf` |

Les réponses 400/413 signalent un audio invalide/trop gros (ou un hôte non autorisé) ; 422 des paramètres incorrects ; 409 une analyse déjà en cours ; 503 un modèle d'enrôlement ou l'export PDF indisponible. L'analyse peut retourner 200 avec `warnings` lorsque seules certaines capacités IA échouent : les mesures acoustiques restent disponibles.

## Interprétation scientifique

- **dBFS** = `20 log10(RMS)`, avec plancher d'affichage à -120. Un sinus d'amplitude 0,5 vaut environ -9,03 dBFS. Ce n'est pas le dB SPL et aucune exposition acoustique réelle n'est déduite.
- FFT Hann sur l'ensemble du signal, maximum spectral et centroïde pondéré en amplitude. Fréquence dominante et centroïde valent `null` sur le silence. Les fréquences sont celles du signal ramené à 16 kHz, donc limitées à 8 kHz.
- Distribution calculée côté serveur : densité spectrale de puissance Welch, en dB/Hz. STFT Hann de 512 échantillons, pas 256. Affichage borné à 240 colonnes en conservant les pics de chaque groupe ; enveloppe waveform limitée à 800 points.
- La similarité cosinus n'est **pas une probabilité calibrée**. Le score combine la meilleure correspondance parmi les empreintes du profil et son centroïde ; chaque capture de profil fournit une empreinte par fenêtre complète de trois secondes. Quand des profils sont disponibles, l'application attribue toujours le profil au score le plus élevé, même si le score est faible ou si plusieurs scores sont proches ; les seuils configurables servent à signaler les cas moins fiables, pas à bloquer l'attribution. Sans profil, ou lorsque le modèle ne peut pas calculer de similarité, aucun nom ne peut être déterminé.
- Les extraits vocaux ne sont jamais étendus dans les phrases voisines. Les sous-fenêtres servent à repérer des scores variables seulement lorsqu'au moins deux fenêtres complètes de 1,5 seconde sont disponibles. Les phrases qui traversent plusieurs segments sont attribuées au profil dont le score moyen pondéré par la durée est le plus élevé. Ce choix fournit un nom, pas une certitude.
- Pas de séparation de sources ni de détecteur spécialisé de chevauchement : un mélange peut recevoir le nom du profil le plus proche sans qu'il s'agisse forcément de l'unique personne qui parle. L'application ne garantit donc pas une diarisation parfaite en conversations simultanées.
- Temps de parole = estimation VAD ; les prises successives du même locuteur sans pause supérieure à 300 ms sont regroupées. Participation calculée parmi les régions vocales, y compris inconnues/indéterminées, sans compter deux fois les phrases.
- YAMNet : catégories du CSV embarqué dans le modèle, sans traduction inventée ni attribution causale à un meuble. `Knock`/`Thump`/`Scrape` ne prouvent pas un coup sur table ou une chaise. Scores non calibrés, catégorie `Inconnu` sous le seuil. Le modèle observe environ 0,96 s par fenêtre espacée de 0,48 s ; les intervalles de décision affichés ne se recouvrent pas. La dernière décision est prolongée jusqu'à la fin du fichier.
- Whisper peut produire des erreurs/hallucinations et sa qualité varie selon la langue et l'acoustique. Silero et l'exclusion des silences réduisent ces risques sans les supprimer.
- Un enregistrement m4a/AAC est compressé avec perte : l'empreinte vocale et la transcription peuvent légèrement différer d'un WAV non compressé.

## Confidentialité et limites de déploiement

Application pensée pour un usage **local, mono-utilisateur, sur un réseau Wi-Fi privé de confiance** (domicile, salle de classe maîtrisée), avec un seul worker. Aucun service cloud ne reçoit les enregistrements. Les modèles peuvent télécharger leurs poids officiels.

Pour que le téléphone joigne le serveur, celui-ci écoute sur `0.0.0.0` : **toute personne présente sur le même réseau peut alors tenter d'atteindre l'API**, qui n'a **pas d'authentification**. Le filtrage des hôtes (`VOICESCOPE_ALLOWED_HOSTS`) limite les noms d'hôte acceptés mais n'est pas une authentification. Ne jamais utiliser un Wi-Fi public ou partagé, ne pas rediriger le port 8000 depuis la box vers Internet, ne pas ouvrir le pare-feu au réseau public, et arrêter le serveur après usage. Pour tout usage au-delà, ajouter authentification, HTTPS et protection des uploads (par exemple derrière un proxy). Les requêtes de l'application mobile circulent en HTTP non chiffré sur le réseau local.

Les fichiers audio ne sont pas archivés : ffmpeg lit l'audio par entrée standard et ne crée aucun fichier. FastAPI peut utiliser ses fichiers temporaires de téléversement, fermés à la fin de la requête. Les profils sont chiffrés au repos sous Windows avec **DPAPI, lié au compte Windows courant**, puis sauvegardés atomiquement. Le fichier `data/voices.json` conserve son nom historique mais contient une enveloppe chiffrée. Les anciens JSON restent lisibles et sont chiffrés à la prochaine sauvegarde. Un autre compte ne pourra pas les déchiffrer : utiliser l'export explicite pour les transférer. Sous POSIX, le stockage JSON reste non chiffré avec permissions privées. Conserver le dossier dans un emplacement privé, jamais partagé. Obtenir le consentement des participants et supprimer les profils après le projet. L'export JSON de profils est non chiffré et contient les empreintes, mais les rapports d'analyse n'en contiennent pas. JSON/CSV/PDF/TXT peuvent contenir les paroles : les conserver avec les mêmes précautions.

Sur le téléphone, l'application mémorise uniquement les réglages, l'emploi du temps et l'URL du serveur. Les profils, l'historique et le résultat courant sont rechargés depuis le serveur et ne sont pas persistés.

Tailles, durées, valeurs finies, modèles et imports sont validés. CSV protège les champs texte contre les formules. Les modifications de profils sont verrouillées et sauvegardées atomiquement. Une seule analyse est exécutée à la fois ; les inférences vocales et Whisper sont verrouillées.

`.env.example` documente les variables facultatives, **sans chargement automatique de `.env`** : les variables se définissent dans la fenêtre du terminal avant de lancer le serveur. Variables utilisées :

| Variable | Rôle |
|---|---|
| `VOICESCOPE_ALLOWED_HOSTS` | IP du PC acceptées par le serveur (séparées par des virgules) |
| `VOICESCOPE_DATA` | Dossier des profils, par exemple `C:\MonDossierPrive\VoiceScope` |
| `VOICESCOPE_PDF_FONT` | Police Unicode TTF pour le PDF (Arial détectée sous Windows ; DejaVu Sans sous Linux) |
| `YAMNET_MODEL` | Source du modèle YAMNet si différente de TensorFlow Hub |

L'arabe PDF utilise arabic-reshaper + python-bidi ; la mise en page de longs paragraphes arabes mérite une relecture humaine.

## Dépannage

### Réseau et connexion

| Symptôme | Cause et solution |
|---|---|
| Toutes les requêtes du téléphone donnent **400 Bad Request** dans les logs | L'IP du PC n'est pas dans `VOICESCOPE_ALLOWED_HOSTS`, ou la variable a été définie dans une autre fenêtre ou avec la mauvaise syntaxe (`set` dans CMD, `$env:` dans PowerShell). Revérifier avec `echo %VOICESCOPE_ALLOWED_HOSTS%` (CMD) ou `$env:VOICESCOPE_ALLOWED_HOSTS` (PowerShell), puis relancer le serveur |
| `The filename, directory name, or volume label syntax is incorrect` | La commande PowerShell `$env:...` a été tapée dans CMD : utiliser `set NOM=valeur` |
| « Network request failed » dans l'app | Mauvaise IP (refaire `ipconfig`), serveur lancé sans `--host 0.0.0.0`, pare-feu, ou PC et téléphone sur des Wi-Fi différents |
| `/api/etat` s'ouvre sur le PC mais pas sur le téléphone | Pare-feu Windows (port 8000) ou isolation des clients activée sur la box ou le routeur |
| 403 « Origine non autorisée » | Une requête de navigateur vient d'une origine non listée ; l'application mobile n'est pas concernée |
| URL modifiée dans le code sans effet | Elle est persistée : la changer dans Réglages ou effacer les données d'Expo Go |

### Audio et modèles

| Symptôme | Cause et solution |
|---|---|
| 400 « Format audio illisible ou incompatible » | Ni libsndfile ni ffmpeg n'ont pu lire le fichier : vérifier que `imageio-ffmpeg` est installé dans le venv, ou importer un WAV |
| 400 « Au moins 3 secondes de parole requises » | Pas assez de voix détectée : parler clairement 10 à 15 secondes, près du micro |
| 503 « Modèle vocal indisponible » à l'enrôlement | Une dépendance du VAD ou de Resemblyzer ne se charge pas ; lire le détail dans le terminal du serveur (voir ci-dessous) |
| `DLL load failed ... An Application Control policy has blocked this file` | Windows bloque une DLL (voir ci-dessous) |
| 409 « Une analyse est déjà en cours » | Une seule analyse à la fois : attendre la fin |

### Windows bloque une DLL

Le message `DLL load failed while importing _ext: An Application Control policy has blocked this file` (souvent sur `ctranslate2`, parfois `onnxruntime`, `torch` ou `tensorflow`) signifie qu'une stratégie de sécurité de Windows refuse de charger une DLL non signée. `faster-whisper` ne fonctionne pas sans `ctranslate2`, donc le VAD, la transcription et l'enrôlement échouent tant que le blocage persiste. Ce n'est pas un défaut du code.

1. **Smart App Control (Windows 11)** : Sécurité Windows, *Contrôle des applications et du navigateur*, *Paramètres de Smart App Control*. S'il est activé, le passer sur **Désactivé** lève le blocage. Cela réduit la protection du PC, et la réactivation demande souvent de réinstaller Windows : décision à prendre en connaissance de cause.
2. **Stratégie imposée (WDAC, AppLocker, PC d'école ou d'entreprise)** : elle ne peut pas être levée par l'utilisateur. Demander à l'administrateur d'autoriser le dossier du projet (`.venv`), ou utiliser un autre PC.
3. **Essayer une autre version de `ctranslate2`** : le blocage dépend de la réputation de chaque fichier, une autre version peut passer (résultat non garanti) :

   ```
   .\.venv\Scripts\python.exe -m pip install ctranslate2==4.5.0 --force-reinstall --no-deps
   .\.venv\Scripts\python.exe -c "import ctranslate2; print('ok', ctranslate2.__version__)"
   ```

   Essayer ensuite `4.4.0` puis `4.6.0` si besoin. Tant que l'import échoue, le serveur échoue aussi.
4. **Vérifier les autres bibliothèques** avec les quatre commandes de la section « Installation ». Si seul `ctranslate2` est bloqué, le code peut être adapté pour s'en passer (VAD Silero directement via `onnxruntime`, transcription via une autre implémentation de Whisper), au prix de modifications dans `services/vad.py` et `services/transcription.py`.

### Application mobile

| Symptôme | Cause et solution |
|---|---|
| `Unable to resolve "<paquet>"` au bundling | `npx expo install <paquet>` puis `npx expo start -c` |
| Écran blanc / erreur Reanimated | Plugin `react-native-reanimated/plugin` en dernier dans `babel.config.js`, puis `npx expo start -c` |
| `Element type is invalid` | Import nommé/par défaut incorrect, souvent dans `App.js` : `RootNavigator` s'importe avec accolades |
| Micro refusé | Accepter la permission, ou réglages du téléphone, Expo Go, Autorisations |
| `py -3.12` introuvable | Installer Python 3.12 (`winget install -e --id Python.Python.3.12`) et rouvrir le terminal, ou utiliser `py -3.11` |

## Tests et évaluation

```
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q
```

Tests : WAV/stéréo/rééchantillonnage, formats invalides/vides/non finis, durée, FFT/STFT/centroïde/RMS/dBFS, silence, alertes consécutives, inconnus/marge/mélange, import atomique de trois profils, paramètres API, historique, erreurs de modèles simulées, exports JSON/TXT/CSV/PDF et protection CSV. Les mocks ne démontrent pas la précision réelle des modèles. Voir `VALIDATION.md` pour les vérifications effectivement effectuées. Le décodage ffmpeg de `read_wav` et l'application mobile n'ont pas de test automatisé : les vérifier manuellement avec un enregistrement m4a depuis le téléphone.

Pour mesurer la précision, préparer un corpus **indépendant des enregistrements d'enrôlement**, avec trois locuteurs connus et plusieurs inconnus, silences/bruits/chevauchements, langues et conditions de salle. Au moins plusieurs dizaines de clips par classe pour un premier bilan ; conserver un jeu distinct pour régler les seuils.

Créer un manifeste JSON (les chemins audio sont relatifs au manifeste) :

```json
[
  {"audio":"alice_test.wav", "speaker":"Alice", "text":"Bonjour à tous", "sound":"Speech"},
  {"audio":"applause.wav", "sound":"Clapping"}
]
```

Ces lignes sont un **exemple de format**, pas des mesures ni des fichiers livrés. Le nom de catégorie doit correspondre à la table réelle du modèle. Le script évalue les clips monolocuteurs et à catégorie dominante unique :

```
.\.venv\Scripts\python.exe scripts/evaluate.py corpus/manifest.json --profiles data/voices.json --model base --language fr --output evaluation.json
```

Mesures : accuracy par clip, WER micro (casse normalisée, ponctuation conservée), macro-F1 et F1 par classe, temps moyen incluant le premier chargement. Les échecs sont consignés et les métriques sans données valent `null`, jamais un score fictif. Ne pas utiliser ce protocole monolabel pour prétendre mesurer la diarisation ou la détection temporelle multi-événements : annoter les intervalles et ajouter un protocole adapté dans ce cas.

## Sources des modèles

- Resemblyzer : https://github.com/resemble-ai/Resemblyzer
- faster-whisper / Silero intégré : https://github.com/SYSTRAN/faster-whisper
- YAMNet : https://www.tensorflow.org/hub/tutorials/yamnet
- Fenêtres YAMNet : https://www.tensorflow.org/tutorials/audio/transfer_learning_audio
- Expo : https://docs.expo.dev

Aucune accuracy, WER ou F1 sur les trois participants n'est annoncée sans corpus annoté. Docker n'est pas ajouté : le lancement Windows local est la cible de cette livraison.