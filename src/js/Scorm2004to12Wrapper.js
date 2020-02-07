export default class Scorm2004to12Wrapper {

  constructor(debug=false) {
    this.codeName = 'ScormProxy';
    this.debug = debug;
    this.apiHandle = null;
    this.findAPITries = 0;
    this.noAPIFound = false;
    this.maxTries = 500;
    this.timeStart = null;
    this.terminated = false;
  }

  Initialize () {
    this.log('Initialize');
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      window.addEventListener('beforeunload', (event) => {
        this.Terminate();
      });
      let dateStart = new Date();
      this.timeStart = dateStart.getTime();
      return api.LMSInitialize("");
    }
    return false;
  }

  Terminate () {
    this.log('Terminate');
    if(this.terminated) {
      return false;
    }
    let api = this.getAPIHandle();
    if(!this.noAPIFound){
      let dateEnd = new Date();
      let timeEnd = dateEnd.getTime();
      let tps_passe = (Math.floor(timeEnd - this.timeStart)) / 1000;
      this.log(this.formatTime(tps_passe));
      api.LMSSetValue('cmi.core.session_time', this.formatTime(tps_passe));
      this.terminated = true;
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
        case 'cmi.progress_measure':
          return ''; //TODO
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
        case 'cmi.progress_measure':
          return '';
          break;
        case 'cmi.session_time':
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
    let sec = (ts % 60);
    ts -= sec;
    let tmp = (ts % 3600);  //# of seconds in the total # of minutes
    ts -= tmp;              //# of seconds in the total # of hours
  
    // convert seconds to conform to CMITimespan type (e.g. SS.00)
    sec = Math.round(sec*100)/100;
    
    let strSec = new String(sec);
    let strWholeSec = strSec;
    let strFractionSec = "";
    if (strSec.indexOf(".") != -1)
    {
      strWholeSec =  strSec.substring(0, strSec.indexOf("."));
      strFractionSec = strSec.substring(strSec.indexOf(".")+1, strSec.length);
    }
    
    if (strWholeSec.length < 2)
    {
      strWholeSec = "0" + strWholeSec;
    }
    strSec = strWholeSec;
    
    if (strFractionSec.length)
    {
      strSec = strSec+ "." + strFractionSec;
    }
  
    if ((ts % 3600) != 0 )
      hour = 0;
    else hour = (ts / 3600);
    if ( (tmp % 60) != 0 )
      min = 0;
    else min = (tmp / 60);
  
    if ((new String(hour)).length < 2)
      hour = "0"+hour;
    if ((new String(min)).length < 2)
      min = "0"+min;
  
    let rtnVal = hour+":"+min+":"+strSec;
  
    return rtnVal;
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