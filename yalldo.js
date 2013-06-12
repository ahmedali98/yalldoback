// YALLDO FLYING MOBILE
// Copyright 2013 Yalldo
// Developed By Lauri K.

var cid = 0;				// content id
var user = 0;				// logged user
var email = "";				// logged user's email
var past = 2;				// past flights
var device = false;			// is mobile
var appgyver = true;		// is appgyver
var menuopen = false;		// is menu open
var notiopen = false;		// is notification open
var testpage = "";			// start page for test account
var testmode = 0;			// test mode for testing purposes
var menupage = true;		// if current page is on left menu
var currentpage = "start";	// current page
var currentmenu = "news";	// current page from menu
var menuview;				// menuview for appgyver
var notiview;				// notification view for appgyver
var authkey;				// authentication for logged user
var point;					// point object for google maps
var sitemap;				// google map for sites
var eventmap;				// google map for events
var createmap;				// google map for create
var exploremap;				// google map for explore
var sitesearchmap;			// google map for sitesearch
var prevpages = [];			// previous page array
var target = "";			// where to attach photo
var photodata = "";			// register photo base64
var speedname = "km/h";		// speed unit
var distancename = "m";		// distance unit
var temperaturename = "c";	// temperature unit
var userevents = [];		// user events array
var userclubs = [];			// user clubs array
var notitypes = [];			// notification types
var notipages = [];			// notification pages

// base url for backend methods
var baseurl = "http://staging.followmeflying.com/newmobile/";

// check if mobile use and if appgyver is in use
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) device = true;
if(typeof steroids === "undefined") appgyver = false;

// clear markers from google maps
google.maps.Map.prototype.clear = function() {
    for(var i=0;i<this.markers.length;i++){
        this.markers[i].setMap(null);
    } this.markers = new Array();
};

// init actions
$(document).ready(function() {
	
	// click events
	click("backbutton",back);
	click("barbutton",function() { barbutton(); });
	click("barsearch",function() { barsearch(); });
	click("barsync",function() { barsync(); });
	click("checkinbutton",function() { page('checkin'); });
	click("checkinphotobutton",function() { page('photo'); });
	click("closepopup",function() { popup(); });
	click("clubcommentbutton",function() { comment(); });
	click("clubfollowbutton",function() { clubfollow(); });
	click("clubunfollowbutton",function() { clubunfollow(); });
	click("clubphotobutton",function() { target = "club"; page('photo'); });
	click("createbutton",function() { page('create'); planFlight(); });					//Added the createFlight function that prefill Name field(set Flight ID)--->
	click("createnext",function() { page('notify');  createFlight("save"); });				//Added createFlight("save") that insert flight info to database--->
	click("createsubmit",function() { createsubmit(); });
	click("eventsmenu0",function() { eventsmenu(0); });
	click("eventsmenu1",function() { eventsmenu(1); });
	click("eventsmenu2",function() { eventsmenu(2); });
	click("eventphotobutton",function() { target = "event"; page('photo'); });
	click("eventcommentbutton",function() { comment(); });
	click("eventjoinbutton",function() { eventjoin(); });
	click("eventunjoinbutton",function() { eventunjoin(); });
	click("infobutton",function() { infoclose(); });
	click("infocancel",function() { infoclose(); });
	click("loginbutton",login);
	click("loginbuttonforgot",loginforgot);
	click("logincancel",function() { show("start"); page(); });
	click("menubutton",openmenu);
	click("menunews",function() { menu("news"); openmenu(); });
	click("menuexplore",function() { menu("explore"); openmenu(); });
	click("menuclubs",function() { menu("clubs"); openmenu(); });
	click("menusites",function() { menu("sites"); openmenu(); });
	click("menubuddies",function() { menu("buddies"); openmenu(); });
	click("menuevents",function() { menu("events"); openmenu(); });
	click("menusettings",function() { menu("settings"); openmenu(); });
	click("menusync",function() { menu("sync"); openmenu(); });
	click("menutest",function() { menu("test"); openmenu(); });
	click("notibutton",opennoti);
	click("photobutton",function() { page('photo'); });
	click("photocamera",function() { photocamera(); });
	click("popupclose",function() { hide("popup"); });
	click("photoupload",function() {  });
	click("plus",function() { toggle('plusmenu'); hide("plus"); show("minus"); });
	click("minus",function() { toggle('plusmenu'); hide("minus"); show("plus"); });
	//click("plusmenucancel",function() { hide("plusmenu"); });
	click("startlogin",function() { page('login'); });
	click("startregister",function() { page('register'); });
	click("startfacebook",function() { facebook(); });
	click("starttutorial",function() { page("tutorial"); });
	click("settingssave",function() { savesettings(); });
	//click("settingssync",function() { page("sync"); });
	click("settingsterms",function() { page("terms"); });
	click("settingstutorial",function() { page("tutorial"); });
	click("sitephotobutton",function() { target = "site"; page('photo'); });
	click("recordbutton",function() { page('record'); });
	click("refreshnews",function() { html("mainnews",""); getnews(); });
	click("registerbutton",register);
	click("registercancel",function() { show("start"); page(); });
	click("registerterms",function() { popup("terms"); });
	click("registerphoto",function() { openphoto(); });
	click("siteaddcommentbutton",function() { toggle("sitecomment"); });
	click("sitephotobutton",function() { page("photo"); startCamera("picOfSite");});
	click("sitefollowbutton",function() { info("You successfully started following this site"); hide("sitefollowbutton"); show("siteunfollowbutton"); });
	click("siteunfollowbutton",function() { info("You are not following this site"); show("sitefollowbutton"); hide("siteunfollowbutton"); });
	click("sitecommentbutton",function() { comment(); });
	click("testbutton",function() { testbackend(); });
	click("welcome",welcome);
	// event listeners
	window.addEventListener("message",menuMessage,false);
	// create flight - zebra date picker
	$('#createdate').Zebra_DatePicker();
	var d = new Date();
	var t = d.getFullYear();
	if(d.getMonth()+1>9) t += "-"+(d.getMonth()+1); else t += "-0"+(d.getMonth()+1);
	if(d.getDate()+1>9) t += "-"+d.getDate(); else t += "-0"+d.getDate();
	$('#createdate').val(t);
	
	testmode = 0;
	testpage = "";
	
	// fade out splash
	if(!testmode) $("#splash").delay(1000).fadeOut("slow"); // comment this, uncomment from below and set testpage above
	else if(testmode==1) $("#splash").delay(0).fadeOut("slow",function(){testaccount("test@yalldo.com","testit");});
	else $("#splash").delay(0).fadeOut("slow",function(){testaccount("friend@yalldo.com","friendit");});
	
	$('#slideshow').cycle({prev:'#prev',next:'#next',timeout:0,before:function(d){ if($(this).data("id")!="1") show("tutorialprev"); }});
	
	$('#syncingButton').click(sync);
	$('#cameraRButton').click(photocamera);
	$('#recordAndPauseB').toggle(
		function() {
			$('#play_icon').attr('src','images/pause.png');
			if( newRecord ) startRecording("newRecord"); else startRecording();
			newRecord = false;
		}, function() {
			$('#play_icon').attr('src','images/play.png');
			pauseRecording();
			showStopButton();
		}
	);
		
	optionsHandlers();
		
	if(appgyver) {
		menuview = new steroids.views.WebView("menu.html"); menuview.preload();
		notiview = new steroids.views.WebView("notifications.html"); notiview.preload();
	}
	
	notitypes["friend_request"] = "[User] sent you a friend request";
	notitypes["friend_accepted"] = "[User] accepted your friend request";
	notipages["friend_request"] = "buddies";
	notipages["friend_accepted"] = "buddies";

	//exploremapinit();
	
});

// bar button pressed
function barbutton() {

	// set page related actions
	if(currentpage=="sites") page("sitesearch");
	else if(currentpage=="events") page("create");
	return false;

}

// bar search pressed
function barsearch() {
	
	// set page related actions
	if(currentpage=="explore") exploremapinit();
	else if(currentpage=="sitesearch") sitesearchmapinit();
	else if(currentpage=="sites") getsites();
	else if(currentpage=="clubs") getclubs();
	else if(currentpage=="events") getevents();
	else if(currentpage=="buddies") getbuddies();
	return false;

}

// bar sync pressed
function barsync() {

	// set page related actions
	if(currentpage=="sites") page("sitesearch");
	else if(currentpage=="events") syncit();
	return false;

}

// comment news
function comment() {
	// add comment, get news and update content
	if(photodata) ajax("addcomment",{content_id:cid,content_type:currentpage,message:$("#"+currentpage+"commentinput").val(),photo:photodata},function(d) { ajax("get"+currentpage+"news",{id:cid,site_type:"site_sites"},function(d) { createnews(currentpage+"comments",d); info("") }); });
	else ajax("addcomment",{content_id:cid,content_type:currentpage,message:$("#"+currentpage+"commentinput").val()},function(d) { ajax("get"+currentpage+"news",{id:cid,site_type:"site_sites"},function(d) { createnews(currentpage+"comments",d); info("") }); });
	$("#"+currentpage+"commentinput").val("");
	$("#"+currentpage+"photo").attr('width','1');
	inf("sending comment...");
	return false;
}

// change menu item
function menu(name) {
	// set menu element
	if(currentmenu) bg("menu"+currentmenu,0);
	page(name);
	bg("menu"+name,90);
	currentmenu = name;
}

function menuMessage(event) {
	// get message from menu
	draweropen = drawer2open = false;
	if(appgyver) {
		steroids.drawers.hide();
		menuopen = !menuopen;
	}
	page(event.data);
}

function notifications(d) {
	// build notifications
	var t = "";
	for(var i=0;i<d.length;i++) {
		//[[{"users_id":"1534","type":"friend_request","view":"users:1534"},{"users_id":"1534","type":"friend_request","view":"users:1534"},{"users_id":"1534","type":"friend_request","view":"users:1534"}]]
		//[[{"users_id":"2","type":"friend_request","view":"users:2"},{"users_id":"2","type":"friend_request","view":"users:2"},{"users_id":"3004","type":"friend_request","view":"users:3004"},{"users_id":"3004","type":"friend_request","view":"users:3004"},{"users_id":"1","type":"friend_accepted","view":"users:1"}]]
		var o = d[i];
		if(o.user==null) o.user = "";
		if(o.users_id!=null) o.user = "http://followmeflying.com/data/users/"+o.users_id+".jpg";
		if(o.action==null) o.action = "";
		if(o.type==null) o.type = "unknown";
		if(notitypes[o.type]!=null) o.action = notitypes[o.type]; else o.action = o.type;
		if(o.user_id!=user) t += '<div class="menu2" style="overflow:hidden" onclick="notilink(\''+o.type+'\')"><table><tr><td>&nbsp;&nbsp;&nbsp;<img src="'+o.user+'" width="32" height="32"/></td><td class="notitd" style="color:#cccccc">&nbsp;&nbsp;&nbsp;'+o.action+'</td></tr></table></div>';
	}
	return t;
}

function notilink(type) {
	if(type=="friend_request") {
		info("Do you want to accept this friend request?"); show("infocancel")
	} else {
		if(notipages[type]!=null) page(notipages[type]);
		opennoti();
	}
}

function openmenu() {
	// open hamburger menu
	if(!appgyver) {
		if(menuopen) { style("page","left","0px"); style("pagebg","left","0px"); style("banner","left","0px"); $('html,body').css('overflow','auto'); show("plus"); hide("minus"); }
		else { style("page","left","540px"); style("pagebg","left","540px"); style("banner","left","540px"); $('html,body').css('overflow','hidden'); hide("plus"); hide("plusmenu"); show("minus"); } hide("menu2");	
	} else {
		if(!menuopen) steroids.drawers.show({view: menuview, edge: steroids.screen.edges.LEFT, widthOfDrawerInPixels: 270 });
		else steroids.drawers.hide();
	} menuopen = !menuopen;
}

function opennoti() {
	// open notifications
	if(!appgyver) {
		if(menuopen) { style("page","left","0px"); style("pagebg","left","0px"); style("banner","left","0px"); $('html,body').css('overflow','auto'); show("plus"); hide("minus"); }
		else { style("page","left","-540px"); style("pagebg","left","-540px"); style("banner","left","-540px"); $('html,body').css('overflow','hidden'); hide("plus"); hide("plusmenu"); show("minus"); } show("menu2");
	} else {
		if(!notiopen) steroids.drawers.show({ view: notiview, edge: steroids.screen.edges.RIGHT, widthOfDrawerInPixels: 270, widthOfLayerInPixels: 295 });
		else steroids.drawers.hide();
	} menuopen = !menuopen; notiopen = !notiopen;
}

function page(name,skip) {
	// open page if not visible
	if(currentpage!=name) {
		$("#barinput").val("");
		skip = skip||"";
		menupage = false;
		if(!currentpage) hide("start");
		$('body,html').animate({scrollTop:0},0);
		if(name=="news") {
			getnews();
			menupage = true;
			hide("bar");
		} else if(name=="buddies") {
			getbuddies();
			setbar("Invite","Search friends...");
			menupage = true;
		} else if(name=="notify") {
			getbuddiestonotify();
			getclubstonotify();
		} else if(name=="clubs") {
			getclubs();
			setbar("","Search clubs...")
			menupage = true;
		} else if(name=="events") {
			getevents();
			setbar("New","Search flights...")
			menupage = true;
		} else if(name=="settings") {
			hide("bar");
			menupage = true;
		} else if(name=="test") {
			hide("bar");
			menupage = true;
		} else if(name=="sites") {
			getsites();
			setbar("Map","Search sites...")
			menupage = true;
		} else if(name=="explore") {
			exploremapinit();
			setbar("","Search using place or address...")
			menupage = true;
		} else if(name=="sitesearch") {
			getsitesearch();
			sitesearchmapinit();
			setbar("","Search using place or address...")
		} else hide("bar");
		//if(name=="sync") sync();
		if(menupage) {
			hide("backbutton");
			show("notibutton");
		} else {
			if(!skip) prevpages.push(currentpage);
			show("backbutton");
			hide("notibutton");
		}
		if(currentpage) hide(currentpage);
		currentpage = name;
		if(name) show(currentpage);
		if(name=="event") title("flight");
		else if(name=="sitesearch") title("Site Search");
		else if(name=="events") title("flights");
		else if(name) title(name);
		if(menupage) show("plus"); else hide("plus");
		if(!menupage) show("minus"); else hide("minus");
		hide("plusmenu");
	}
}

function popup(name) {
	// open popup
	name = name||"";
	if(!appgyver) {
		html("popupcontent","");
		if(name) { show("popup");
			$.ajax({ url: "pages/"+name+".html", success: function(data) { html("popupcontent",data); } });
		} else hide("popup");
	} else {
		if(name) steroids.modal.show(new steroids.views.WebView("pages/"+name+".html"));
		else steroids.modal.hide();
	}
}

function setbar(button,input,search) {
	if(!button) {
		hide("barsync");
		hide("barbutton");
		style("barinput","width","436px");
	} else {
		if(button=="Map") $("#barsync").text("Map"); else $("#barsync").text("Sync");
		show("barsync");
		show("barbutton");
		style("barinput","width","200px");
	}
	$("#barinput").attr("placeholder",input);
	show("bar");
}

function testbackend() {
	// execute testmethod with selected params and show result
	ajax($("#testmethod :selected").text(),JSON.parse($("#testparams").val()),function(d) {
		var o = JSON.parse(d);
		if(o.error) html("testresults","<font color='#990000'>"+o.error+"</font>");
		else html("testresults","<font color='#009900'>"+o+"<br><br><textarea style='width:580px;height:200px'>"+d+"</textarea></font>");
	});
}

function testselect() {
	// set testparams from testmethod
	$("#testparams").val($("#testmethod").val());
	return false;
}

function unit(metric) {
	if(metric) {
		speedname = "km/h";
		distancename = "m";
		temperaturename = "c";
	} else {
		speedname = "mp/h";
		distancename = "ft";
		temperaturename = "f";
	}
}

function welcome() {
	// hide welcome screen
	$("#welcome").fadeOut("slow");
	$('html,body').css('overflow','auto');
}

// shortcut and helper functions 
function back() { if(prevpages.length) page(prevpages.pop(),"skip"); }
function html(e,v) { $("#"+e).html(v); }
function data(d) { return $(this).data(d); }
function style(e,p,v) { $("#"+e).css(p,v); }
function title(name) { $("#title").html(ucfirst(name)); }
function ucfirst(t) { return t[0].toUpperCase()+t.substring(1); }
function anim(e,p,v) { var o = {}; o[p] = v; $("#"+e).animate(o,"fast"); }
function show(name) { document.getElementById(name).style.display = "block"; }
function hide(name) { document.getElementById(name).style.display = "none"; }
function bg(e,y) { $("#"+e).css("background-position","0px -"+String(y)+"px"); }
function toggle(name) { if(document.getElementById(name).style.display=="none") show(name); else hide(name); return document.getElementById(name).style.display; }
function ajax(m,o,f) { o.auth_key = authkey; $.ajax({type:"POST",url:baseurl+m+'/',data:o,success:f,error:function(d) { alert(JSON.stringify(d)); }}); }
function createnews(e,d) { var o = JSON.parse(d); if(o.error) alert(o.error); else html(e,news(o,e)); }
function createlist(e,d) { var o = JSON.parse(d); if(o.error) alert(o.error); else html(e,list(o,e)); }
function inf(data) { $('html,body').css('overflow','hidden'); html("infocontent",data); show("info"); hide("infobutton"); hide("infocancel"); }
function info(data) { if(!data) { infoclose(); return false; } $('html,body').css('overflow','hidden'); html("infocontent",data); show("info"); show("infobutton"); hide("infocancel"); }
function infok(data) { $('html,body').css('overflow','hidden'); html("infocontent",data); show("info"); show("infobutton"); show("infocancel"); }
function infoclose() { $('html,body').css('overflow','auto'); hide("info"); }
function click(e,a) { if(e[0]!="."&&e[0]!="#") e = "#"+e; if(device) $(e).noClickDelay(); $(e).click(a); }
function clickit(e,a) { if(e[0]!="."&&e[0]!="#") e = "#"+e; $(e).click(a); }
function con(d) { if(!device) console.log(d); }
function enable() { hide("spinner") }
function disable() { show("spinner") }

// mobile click
if(device) {
	(function($) {
		$.fn.noClickDelay = function() {
			var $wrapper = this; var $target = this; var moved = false;
			$wrapper.bind('touchstart mousedown',function(e) {
				e.preventDefault();
				moved = false;
				$target = $(e.target);
				if($target.nodeType==3) $target = $($target.parent());
				$target.addClass('pressed');
				$wrapper.bind('touchmove mousemove',function(e) {
					moved = true;
					$target.removeClass('pressed');
				});
				$wrapper.bind('touchend mouseup',function(e) {
					$wrapper.unbind('mousemove touchmove');
					$wrapper.unbind('mouseup touchend');
					if(!moved&&$target.length) {
						$target.removeClass('pressed');
						$target.trigger('click');
						$target.focus();
					}
				});
			});
		};
	})(jQuery);
}

function ago(date) {
	var t = date.split(/[- :]/);
	var d = new Date(t[0],t[1]-1,t[2],t[3],t[4],t[5]);
    var seconds = Math.floor((new Date()-d)/1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

function date(date) {
	var t = date.split(/[- :]/);
	var d = new Date(t[0],t[1]-1,t[2],t[3],t[4],t[5]);
    return d.getDate()+"."+(d.getMonth()+1)+"."+d.getFullYear();
}
