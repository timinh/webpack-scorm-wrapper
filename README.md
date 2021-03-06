
# webpack-scorm-wrapper

Permet d'encapsuler un module scorm 2004 et 'traduire' en scorm 1.2

## Création d'un module
~~~

git clone https://github.com/timinh/webpack-scorm-wrapper.git nom_du_module

cd nom_du_module
npm install

~~~
Placer ensuite le contenu original du module dans le dossier 'dist/content'.

Afin de générer correctement le package scorm et le fichier descriptif (imsmanifest.xml), nous allons créer un fichier imsmanifest.json pour créer la structure souhaitée pour notre nouveau module.
Le fichier 'imsmanifest.json' peut être généré automatiquement à l'aide de la commande :
~~~
npm run create
~~~
L'utilitaire vous posera les questions qui lui permettront de générer automatiquement le fichier.
Si le imsmanifest.json existe déja, Vous pourrez y ajouter des séquences.

Il est également possible de modifer directement le manifest dans un éditeur de texte.

Le fichier se compose comme suit : 
~~~
{
  "organization": {
    "title": "Module de test",
    "scos": [
      {
        "title": "Vidéo",
        "src": "video.html",
        "content": "./content/VIDEOS/video_m1_itw.html"
      },
      {
        "title": "Formation",
        "src": "formation.html",
        "content": "./content/FORMATION/module1/m1-u1/module1/index.html"
      },
      {
        "title": "Evaluation",
        "src": "evaluation.html",
        "content": "./content/EVALUATIONS/module1/m1-u1/index.html"
      }
    ]
  }
}
~~~
Ce qui génèrera dans le LMS un module nommé 'Module de test' composé de 3 séquences (SCOs), 'Vidéo', 'Formation' et 'Evaluation'.

Dans le dossier 'dist', 3 fichiers (video.html, formation.html et evaluation.html) seront générés.
Ces fichiers vont embarquer un mini RTE SCORM et charger dans une iframe les SCOs originaux qui doivent être adpatés.

Un fois cette structure créée dans le imsmanifest.json (et le fichiers correspondants placés dans le répertoire 'content', il suffit de taper la commande suivante pour générer le module scorm zippé :
~~~
npm run package
~~~
Puis d'envoyer le zip généré au LMS.

Sous windows, si la commande pour zipper n'est pas disponible, il faudra utiliser la commande suivante : 
~~~
npm run build
~~~
puis zipper le contenu du dossier 'dist' (pas de dossier lui-même)

**Attention : Bien vérifier que le fichier imsmanifest.xml soit à la racine du fichier zip, car c'est lui qui va être lu par le LMS pour générer la structure du module.**

En phase de développement, il est possible de tester directement les modules grace à l'intégration de la librairie https://github.com/skfriese/simple-scorm-api, en utilisant la commande : 

~~~
npm run dev
~~~

## Structure des dossier
~~~
 - dist
    - content
 - src
    - js
        - main.js
        - Scorm2004to12Wrapper.js
    - rte
        - scorm12rte.html
    - index.html
 - imsmanifest.json
 - package.json
 - webpack.config.js
~~~
 
 Le dossier 'dist' contient les fichiers publiés.
 Le dossier 'dist/content' sert à placer le module original (qui doit être adapté)
Le dossier 'src' contient les sources html et javascript.
Pour adapter les informations qui transitent en SCORM (ajouter des éléments, en modifier ou en ignorer), il suffit de modifier le fichier 'js/Scorm2004to12Wrapper.js'.
Pour activer le mode débuggage, il faut ouvrir le fichier 'js/main.js' et changer : 
~~~
window.API_1484_11 = new  Scorm2004to12Wrapper(false)
~~~
en
~~~
window.API_1484_11 = new  Scorm2004to12Wrapper(true)
~~~
il est aussi possible de le modifier au runtime en ouvrant la console et en tapant : 
~~~
API_1484_11.setDebug(true)
~~~

## Adaptation de la communication SCORM

Les méthodes obligatoires pour le RTE SCORM 2004 sont (très basiquement) implémentées dans le fichier 'src/js/Scorm2004to12Wrapper.js' et 'traduites' en SCORM 1.2 : 

|Scorm 2004 (API_1484_11) | Scorm 1.2 (API) |
|--|--|
| Initialize() | LMSInitialize() |
| Terminate() | LMSFinish() |
| GetValue() | LMSGetValue() |
| SetValue() | LMSSetValue() |
| Commit() | LMSCommit() |
| GetLastError() | LMSGetLastError() |
| GetErrorString() | LMSGetErrorString() |
| GetDiagnostic() | LMSGetDiagnostic() |

Le wrapper va simplement convertir les données reçues en SCORM 2004 vers SCORM 1.2 en prenant la place de l'API Scorm 2004 et en recherchant l'API Scorm 1.2 fournie par le LMS et en 'traduisant' les informations reçues et envoyées.

L'essentiel de la traduction se fait via les méthodes GetValue() pour la récupération des données depuis le LMS et SetValue() pour l'envoi des informations au LMS.
