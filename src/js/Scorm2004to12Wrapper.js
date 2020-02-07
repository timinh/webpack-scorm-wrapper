export default class Scorm2004to12Wrapper {

  constructor(debug=false) {
    this.codeName = 'ScormProxy';
    this.debug = debug;
    this.apiHandle = null;
    this.findAPITries = 0;
    this.noAPIFound = false;
    this.maxTries = 500;
  }

  Initialize () {
    this.log('Initialize');
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      window.addEventListener('beforeunload', (event) => {
        this.Terminate();
      });
      return api.LMSInitialize("");
    }
    return false;
  }

  Terminate () {
    this.log('Terminate');
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      return api.LMSFinish("");
    }
    return false;
  }

  GetValue (key) {
    this.log('GetValue : ' + key);
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      switch(key) {
        case 'cmi.location':
          let status = api.LMSGetValue('cmi.core.lesson_status');
          if(status != 'incomplete') {
            return '';
          }
          return api.LMSGetValue('cmi.core.lesson_location');
          break;
        case 'cmi.progress_measure':
          let cpm = localStorage.getItem('cmi.progress_measure');
          return (cpm != null ) ? cpm : '';
          break;
        case 'cmi.completion_status'://TODO
          status = api.LMSGetValue('cmi.core.lesson_status');
          if (status == 'passed'|| status == 'failed') {
            return 'completed';
          } else {
            return 'incomplete';
          }
          break;
        case 'cmi.success_status':
          status = api.LMSGetValue('cmi.core.lesson_status');
          if (status == 'completed') {
            return 'passed';
          } else {
            return 'not attempted';
          }
          break;
        case 'cmi.learner_id':
          return api.LMSGetValue('cmi.core.student_id');
          break;
        case 'cmi.learner_name':
          return api.LMSGetValue('cmi.core.student_name');
          break;
        case 'cmi.score.raw':
          return api.LMSGetValue('cmi.core.score.raw');
          break;
        case 'cmi.score.min':
          return api.LMSGetValue('cmi.core.score.min');
          break;
        case 'cmi.score.max':
          return api.LMSGetValue('cmi.core.score.max');
          break;
        default :
          return api.LMSGetValue(key);
          break;
      }
    }
    return '';
  }

  SetValue (key, val) {
    this.log('SetValue : ' + key + ' / ' + val);
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      switch(key) {
        case 'cmi.score.min':
          return api.LMSSetValue('cmi.core.score.min', val);
          break;
        case 'cmi.score.max':
          return api.LMSSetValue('cmi.core.score.max', val);
          break;
        case 'cmi.score.raw':
          return api.LMSSetValue('cmi.core.score.raw', val);
          break;
        case 'cmi.score.scaled':
          return '';
          break;
        case 'cmi.exit':
          status = api.LMSGetValue('cmi.core.lesson_status');
          if(status == 'completed' || status == 'passed' ) {
            return api.LMSSetValue('cmi.core.exit', '');
          }
          return api.LMSSetValue('cmi.core.exit', val);
          break;
        case 'cmi.suspend_data':
          status = api.LMSGetValue('cmi.core.lesson_status');
          if(status == 'completed' || status == 'passed' ) {
            return api.LMSSetValue('cmi.suspend_data', '');
          }
          break;
        case 'cmi.location':
          return api.LMSSetValue('cmi.core.lesson_location', val);
          break;
        case 'cmi.session_time':
          return api.LMSSetValue('cmi.core.session_time', this.formatTime(val));
          break;
        case 'cmi.progress_measure':
          localStorage.setItem('cmi.progress_measure', val);
          return '';
          break;
        case 'cmi.completion_status':
        case 'cmi.success_status':
          if(val == 'passed' || val ==' completed') {
            api.LMSSetValue('cmi.suspend_data', "");
            api.LMSSetValue('cmi.core.lesson_location', '-');
            api.LMSSetValue('cmi.core.exit', "");
          }
          return api.LMSSetValue('cmi.core.lesson_status', val);
          break;
        default: 
          return api.LMSSetValue(key, val);
          break;
      }
    }
    return '';
  }

  Commit () {
    this.log('Commit');
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      return api.LMSCommit("");
    }
    return false;
  }

  GetLastError () {
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      this.log('GetLastError :' + api.LMSGetLastError());
      return api.LMSGetLastError();
    }
    return '301';
  }

  GetErrorString (errorCode) {
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      this.log('GetErrorString : ' + api.LMSGetErrorString(errorCode));
      return api.LMSGetErrorString(errorCode);
    }
    return 'Not initialized';
  }

  GetDiagnostic (errorCode) {
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      this.log('GetDiagnostic : ' + api.LMSGetDiagnostic(errorCode));
      return api.LMSGetDiagnostic(errorCode);
    }
    return 'Not initialized';
  }

  setDebug (value) {
    this.debug = value;
  }

  log (value) {
    if(this.debug) {
      console.log(value);
    }
  }

  formatTime (ts) {
    let formattedTime = ts.replace(/PT(\d+)H(\d+)M(\d+)S/, "$1:$2:$3");
    return formattedTime;
  }

  findAPI ( win ) {
    let theAPI=null;
    while ((win.API == null) &&(win.parent != null) &&(win.parent != win) ){
      this.findAPITries++;
      if ( this.findAPITries > 500 ){
        alert( "Error finding API -- too deeply nested." );
        return null;
      }
      win = win.parent;
    }
    if(win.API != null){
      theAPI=win.API;
    }
    return theAPI;
  }

  getAPI () {
    let theAPI = this.findAPI(window);
    if ( (theAPI == null) &&(window.opener != null) &&(typeof(window.opener) != "undefined") )
    {
      theAPI = this.findAPI( window.opener );
    }
    if (theAPI == null){
      alert( "Unable to locate the LMS's API Implementation.\n" + "Communication with the LMS will not occur." );
      this.noAPIFound = true;
    }
    return theAPI;
  }

  getAPIHandle () {
    if (this.apiHandle == null){
      if (this.noAPIFound == false){
        this.apiHandle = this.getAPI();
      }
    }
    return this.apiHandle;
  }

}