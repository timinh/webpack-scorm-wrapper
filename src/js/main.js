import Scorm2004to12Wrapper from './Scorm2004to12Wrapper'

window.API_1484_11 = new Scorm2004to12Wrapper(false)

document.addEventListener('onbeforeunload', (evt) => {
  console.log('beforeunload')
  window.API_1484_11.Terminate()
})