'use strict'
var inquirer = require('inquirer')
var fs = require('fs')

var organization = {
  title: '',
  scos: []
}
try {
var readFile = require('./imsmanifest.json')
}catch(e){}

if(readFile) {
  organization = readFile.organization
}

var questionModule = {
  type: 'input',
  name: 'moduleName',
  message: 'Entrez le titre du module : '
}

var questionsSequences = [
  {
    type: 'input',
    name: 'sequenceTitle',
    message: 'Entrez le titre de la séquence : '
  },
  {
    type: 'input',
    name: 'sequenceFile',
    message: 'Entrez le nom du fichier html à générer : '
  },
  {
    type: 'input',
    name: 'sequenceExistingFile',
    message: 'Entrez le nom complet (ex : ./content/monfichierScorm2004.html) du fichier scorm 2004 à convertir : '
  },
  {
    type: 'confirm',
    name: 'askAgain',
    message: 'Souhaitez-vous ajouter une autre séquence(ENTREE pour OUI)?',
    default: true,
  },
]

var questionResume = {
  type: 'confirm',
  name: 'resumeManifest',
  message: 'Un fichier imsmanifest.json existe déja, souhaitez-vous ajouter des séquences(ENTREE pour OUI) ?',
  default: true,
}

function startPackaging() {
  if(organization.title != '') {
    inquirer.prompt(questionResume).then( (answer) => {
      if(answer.resumeManifest) {
        addSequence()
      } else {
        organization.title = ''
        organization.scos = []
        startPackaging()
      }
    })
  } else {
    inquirer.prompt(questionModule).then( (answer) => {
      if(answer.moduleName != '') {
        organization.title = answer.moduleName
        addSequence()
      } else {
        startPackaging()
      }
    })
  }
}

function addSequence() {
  inquirer.prompt(questionsSequences).then((answers) => {
    if( (answers.sequenceTitle!='')&&(answers.sequenceFile!='')&&(answers.sequenceExistingFile!='') ) {
      organization.scos.push({
        title: answers.sequenceTitle,
        src: answers.sequenceFile,
        content: answers.sequenceExistingFile
      })
    }
    if (answers.askAgain) {
      addSequence();
    } else {
      var fileContent = {
        'organization': organization
      }
      fs.writeFile('./imsmanifest.json', JSON.stringify(fileContent, null, '  '), function(err) {
        if (err) return console.log(err)
        console.log('Le fichier imsmanifest.json a bien été généré, vous pouvez l\'éditer avant de générer votre module')
      })
    }
  });
}

startPackaging();