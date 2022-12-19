var MM_SID="", MM_TURL="", MM_CMIDOC="", aicd = "aicc_data", co = "[core]", ls="Lesson_Status", cmnd="command", cmdArray;
var IE3 = ((navigator.appName.indexOf("Microsoft") != -1) && (parseFloat(navigator.appVersion) < 3));
if (window.cmdQueue == null)
  window.cmdQueue = new CmdQueue()
  
function goPage(loc){
	parent.location = loc;
}

function findcmiframe(sp) {
	if (sp==null) sp=window.parent;
	if (sp.frames.length && sp.cmiframe != null)
		return sp.cmiframe;
	else if (sp != window.top)
		return findcmiframe(sp.parent);
	else return null;
}

var aurl;
function setaurl(url) {
	tmpp=url.toUpperCase();
	if ((pos=tmpp.indexOf('AICC_URL'))>-1) {
		aurl=url.substring(pos+9,tmpp.length);
		if (aurl.indexOf('&')>0)
			aurl=aurl.substring(0,aurl.indexOf('&'));
		aurl=unescape(aurl);
		if (aurl.toUpperCase().indexOf("HTTP://") == -1)
			aurl	= "http://" + aurl;
		return true;
	}
	return false;
}

function fndUrl(win) {
	if (setaurl(win.document.location+'') == false) {
		if (win == window.top) return false;
		return (fndUrl(win.parent));
	}
	return true;
}

if (findcmiframe(null)==null) {
	var cmi;
	if (document.command == null) {
		if (fndUrl(window)) {
			document.write("<form action="+aurl+" method=\'POST\' target=\'cmiresults\' name=\'command\'><input type=\'hidden\' name=\'command\'><input type=\'hidden\' name=\'session_id\'><input type=\'hidden\' name=\'version\' value=\'2.0\'><input type=\'hidden\' name=\'aicc_data\'></form>");
		}
	}
}

//函数创建一个用于跟踪的新对象
function trackObject(name, score, weight, possible) {
	this.name = name;
	this.score = score;
	this.trackWeight = weight;
	this.possibleCorrect = possible;
	this.e = 0;
}

//创建名为 G01 的新对象
G01 = new trackObject("Flash Learning Object", 0, 1, 1);

//////////
function CmdQueue() {
  this.cmd = new Array();
  this.cmdData = new Array();
  this.sIDs = new Array();
  this.qLen = 0;  
  this.latency = (navigator.appName.indexOf('Microsoft') != -1)?1250:1000;
  this.addCmd = cmdQAddCmd;
  this.delCmd = cmdQDelCmd;  
}

function cmdQAddCmd(command, sid, cmddata) {
  this.cmd[this.qLen] = command;
  this.sIDs[this.qLen] = sid;
  this.cmdData[this.qLen] = cmddata;
  this.qLen++;
  if (this.qLen == 1) { 
    if (!IE3 && (window.CmdSubmit == null))
      window.CmdSubmit = CmdSubmit; 
    setTimeout("CmdSubmit()", this.latency); 
  }
}

function cmdQDelCmd() {
  var i, len;
  if (this.qLen == 0) return;
  else if (this.qLen == 1)
    this.cmd.length = this.sIDs.length = this.cmdData.length = 0;
  else {
    for (i=1, len=this.qLen; i<len; i++) {
      this.cmd[i-1] = this.cmd[i];
      this.sIDs[i-1] = this.sIDs[i];
      this.cmdData[i-1] = this.cmdData[i];
    }
    this.cmd.length = this.sIDs.length = this.cmdData.length = this.qLen - 1;
  }
  this.qLen--;
}

function CmdSubmit() {
    document.command.elements[cmnd].value = cmdQueue.cmd[0];
    document.command.elements[aicd].value = cmdQueue.cmdData[0];
    document.command.elements["session_id"].value = cmdQueue.sIDs[0];
    document.command.submit();
    cmdQueue.delCmd();
    if (cmdQueue.qLen >= 1) {
      if (!IE3) window.CmdSubmit = CmdSubmit;
      setTimeout("CmdSubmit()", cmdQueue.latency);
    }
}

function MM_SGet() {document.command.elements["command"].value = "getparam";}
function MM_SPut() {document.command.elements["command"].value = "putparam";}
function MM_SPInt() {document.command.elements["command"].value = "putinteractions";}

function MM_SVal(idx, val0, sub) {
  document.command.elements[idx].value=val0;
  if (sub) MM_Sub();
}
function MM_ApndVal(val0) {document.command.elements[aicd].value += '\r\n'+val0;}

function MM_Sub() {
  if (MM_SID.length > 0) {
    var frm = document.command;
    cmdQueue.addCmd(frm.elements[cmnd].value,MM_SID,frm.elements[aicd].value);
  }
}

function MM_CMISetParms(url) {
  var prms="", tmpp;  
  pos=url.indexOf("#")
  if (pos==-1) pos=url.indexOf("?")
  if (pos>-1) prms=url.substring(pos+1,url.length)
  tmpp=prms.toUpperCase()
  if (tmpp.indexOf("AICC-SID")>-1) {
    alert("New version wanted!");
    return false;
  }
  if ((pos=tmpp.indexOf("AICC_SID="))>-1) {
    MM_SID=prms.substring(pos+8,prms.length)
    if (MM_SID.indexOf("&")>0)
      MM_SID=unescape(MM_SID.substring(1,MM_SID.indexOf("&")))
  }
  if ((pos=tmpp.indexOf("AICC_URL"))>-1) {
    MM_TURL=prms.substring(pos+9,prms.length)
    if (MM_TURL.indexOf("&")>0)
      MM_TURL=MM_TURL.substring(1,MM_TURL.indexOf("&"))
    MM_TURL=unescape(MM_TURL)
  }
  return (MM_TURL=="" || MM_SID=="")?false:true;  
}

function findcmidocument(win) { 
  if (MM_CMISetParms(win.document.location+"") == false) {
    if (win == window.top) return null
    return findcmidocument(win.parent)
  } else {
    MM_CMIDOC = win.document;
    return win.document;
  }
} 

function cmiinit(win) {
  frm=findcmiframe(null);
  if (frm!=null)
   frm.installcmi(win);
  findcmidocument(win);
  window.CMITURL = MM_TURL;
  return CMIIsPresent();
}

function CMIInitialize() {
  if ((MM_CMIDOC!=null) && (MM_CMIDOC.length!=0)){  
    MM_SVal("session_id",MM_SID);
    retVal = true;
  } else retVal = false;
  return retVal;
}

function CMIIsPresent() {
  return MM_SID.length != 0;
}

function CMIAddInteraction(date, time, intid, objid, intrtype, correct, student, result, weight, latency) {
  MM_SVal("command","putinteractions")
  MM_SVal(aicd,'"date", "time", "interaction_id", "objective_id", "type_interaction", "correct_response", "student_response", "result", "weighting", "latency"\r\n' +
    '"' + date + '", ' +
    '"' + time + '", ' +
    '"' + intid + '", ' +
    '"' + objid + '", ' +
    '"' + intrtype + '", ' +
    '"' + correct + '", ' +
    '"' + student + '", ' +
    '"' + result + '", ' +
    '"' + weight + '", ' +
    '"' + latency+ '"',1);
}

function CMISetCompleted() { CMISetStatus("C"); }

var gStatus	= "n";
var gScore	= "";
var gLocation = "";
var gTime = "0:00:00";
var gTimeSet = false;
var gD		= new Date();
var gStartSeconds	= Math.round(gD.getTime() / 1000);
function getCore()
	{
	var	core	= "[core]\r\n";
	core	+= "lesson_status=" + gStatus + "\r\n";
	core	+= "score=" + gScore + "\r\n";
	core	+= "lesson_location=" + gLocation + "\r\n";
	if (gTimeSet == false)
		{
		d	= new Date();
		formatTime( Math.round(d.getTime() / 1000) - gStartSeconds );
		gStartSeconds	= Math.round(d.getTime() / 1000);
		}
	core	+= "time=" + gTime + "\r\n";
	return core;
	}


function CMISetData(data) {
  MM_SPut()
  MM_SVal(aicd,getCore() + "[Core_Lesson]\r\n"+data,1)
}

function CMISetFailed() { CMISetStatus("F"); }

function CMISetLocation(loc) {
  MM_SPut();
  gLocation	= loc;
  MM_SVal(aicd,getCore(),1)
}

function CMISetObj(index, id, score, status, started, completed, passed, failed) {
  MM_SPut()
  MM_SVal(aicd,getCore() + "[Objectives_Status]\r\nJ_ID."+index+"="+id)
  // if objective info isn't there already need to write a not-started flag
  if (status=="")
    MM_ApndVal("J_STATUS."+index+"="+started?'I':completed?'C':passed?'P':'F');
  else 
    MM_ApndVal("J_STATUS."+index+"="+status); 
  MM_ApndVal("J_SCORE."+index+"="+score);
  MM_Sub();
}

function CMISetPassed() { CMISetStatus("P"); }

function CMISetScore(score) { 
  MM_SPut()
  gScore	= score;
  MM_SVal(aicd,getCore(),1)
}

function CMISetStarted() { CMISetStatus("I"); }

function CMISetStatus(stat) {
  MM_SPut();
  gStatus	= stat;
  MM_SVal(aicd,getCore(),1)
}

function formatTime(t) {
	var x=3600;
	var y=60;
	var h=Math.round(t/x - t%x/x)+'';
	var m=Math.round((t-h*x)/y-(t-h*x)%y/y)+'';
	var s=Math.round(t-h*x-m*y)+'';
	if (h.toString().length == 1) h='0'+h;
	if (m.toString().length == 1) m='0'+m;
	if (s.toString().length == 1) s='0'+s;
	gTime	= h+":"+m+":"+s;
}

function CMISetTime(t) {
	formatTime(t);
  MM_SPut()
  MM_SVal(aicd,getCore(),1)
  gTimeSet	= true;
}

function CMISetTimedOut() {
  MM_SPut()
  gStatus	= "incomplete,time-out";
  MM_SVal(aicd,getCore(),1)
}

function installcmi(win) {
  if ((win.CMIInitialize == null) && !IE3) {
    win.CMIInitialize = CMIInitialize;
    win.CMIIsPresent = CMIIsPresent;
    win.CMIAddInteraction =CMIAddInteraction
    win.CMISetCompleted =CMISetCompleted
    win.CMISetData =CMISetData
    win.CMISetFailed =CMISetFailed
    win.CMISetLocation =CMISetLocation
    win.CMISetObj =CMISetObj
    win.CMISetPassed =CMISetPassed
    win.CMISetScore =CMISetScore
    win.CMISetStarted =CMISetStarted
    win.CMISetStatus =CMISetStatus
    win.CMISetTime =CMISetTime
    win.CMISetTimedOut =CMISetTimedOut
    win.CMITURL = MM_TURL
  }
}

//函数映射
var IE = navigator.appName.indexOf("Microsoft") != -1;
// 处理 Flash 影片中的所有 FSCommand 消息
function loader_DoFSCommand(command, args) {
	var loaderObj = IE ? loader : document.loader;
	// CMI 检查
	if (!window.CMIIsPresent()) {
		if (findcmiframe != null) {
			var frm = findcmiframe(null);
			if (frm != null) frm.installcmi(window);
			else if (installcmi != null) {
				installcmi(window);
				cmiinit(window);
			}
		}
		if (window.CMIInitialize != null) window.CMIInitialize();
	}
	// 将各个函数的 CMI 映射放在此处
	args = String(args);
	command = String(command);
	var F_intData = args.split(";");
	switch (command){
		case "MM_StartSession":
			//如果没有会话 ID，将用户转到设置为活动并返回会话 ID 的登录页面
			//parameters(loginURL, activityID, activityName)
			//如果 loginURL 是空的或者是一个空字符串，则不进行重定向
			if (!MM_SID && F_intData[0] != ""){
				goPage(F_intData[0] + "?ActivityID=" + escape(F_intData[1]) + "&ActivityName=" + escape(F_intData[2]) + "&ReferringPage=" + escape(parent.location));
			}
			break
		case "MM_cmiSendInteractionInfo":
			//MM_cmiSendInteractionInfo(date, time, intid, objid, intrtype, correct, student, result, weight, latency)
				G01.score = 0;
			if (F_intData[7].toUpperCase() == "C") G01.score = 1;
			G01.trackWeight = F_intData[8];
			if (F_intData[4] == "F"){
				var sTmp = F_intData[5];
				F_intData[5] = sTmp.replace(/ /gi, "_");
				sTmp = F_intData[6];
				F_intData[6] = sTmp.replace(/ /gi, "_");
			}
			MM_cmiSendInteractionInfo(F_intData[0],F_intData[1],F_intData[2],F_intData[3],F_intData[4],F_intData[5],F_intData[6],F_intData[7],F_intData[8],F_intData[9]);
			break
		case "MM_cmiSendObjectiveInfo":
			//MM_cmiSendObjectiveInfo(theInt, index, objid, score, status)
				MM_cmiSendObjectiveInfo(F_intData[0],F_intData[1],F_intData[2],F_intData[3],F_intData[4]);
			break
		case "MM_cmiSendScore":
			//MM_cmiSendScore(theInt, theScore)
				MM_cmiSendScore(F_intData[0],F_intData[1]);
			break
		case "MM_cmiSetLessonStatus":
			//MM_cmiSetLessonStatus(theStatus)
				MM_cmiSetLessonStatus(F_intData[0]);
			break
		case "CMISetTime":
			//CMISetTime(t)
				CMISetTime(F_intData[0]);
			break
		case "CMISetCompleted":
			//CMISetCompleted()
				CMISetCompleted();
			break
		case "CMISetData":
			//CMISetData(data)
				CMISetData(F_intData[0]);
			break
		case "CMISetFailed":
			//CMISetFailed()
				CMISetFailed();
			break
		case "CMISetLocation":
			//CMISetLocation(loc)
				CMISetLocation(F_intData[0]);
			break
		case "CMISetPassed":
			//CMISetPassed()
				CMISetPassed();
			break
		case "CMISetScore":
			//CMISetScore(score)
				CMISetScore(F_intData[0]);
			break
		case "CMISetStarted":
			//CMISetStarted()
				CMISetStarted();
			break
		case "CMISetStatus":
			//CMISetStatus(stat)
				CMISetStatus(F_intData[0]);
			break
		case "CMISetTimedOut":
			//CMISetTimedOut()
				CMISetTimedOut();
			break
		case "CMIInitialize":
			//CMIInitialize()
			MM_SVal("command","getparam",1);
			CMIInitialize();
			break
		case "CMIFinish":
			//MM_SVal("command","lmsfinish",1);
			break
		case "CMIExitAU":
			MM_SVal("command","exitau",1);
			break
	}
	// CMI 函数映射结束
}