/***********************************************************************/
/*                                                                     */
/*    NEWS.JS - News related functionalities                           */
/*    Copyright (c) 2013 Yalldo - Developed by lauri@koutaniemi.com    */
/*                                                                     */
/***********************************************************************/

// get news 
function getnews() {
	
	// disable
	disable();

	// get latest news for the user
	ajax("getnews",{},function(d) {
		
		// [{"name":"Sumo Club","desc":"","user":"\/home\/yalldo\/public_apps\/yalldo.com\/mobile\/application\/..\/..\/data\/users\/1574","user_id":"1574","action":"Lauri Koutaniemi created Sumo Club","time":"2013-05-28 14:27:15","object":"clubs:10","dynamic":true,"comments":[],"likes":[],"thumb":"http:\/\/staging.followmeflying.com\/data\/clubimage\/small_120_clubimage__1369751230.jpg"},{"name":"Sumo Club","desc":"","user":"\/home\/yalldo\/public_apps\/yalldo.com\/mobile\/application\/..\/..\/data\/users\/1574","user_id":"1574","action":"Lauri Koutaniemi is following a Sumo Club","time":"2013-05-28 14:27:15","object":"clubs:10","dynamic":true,"comments":[],"likes":[],"thumb":"http:\/\/staging.followmeflying.com\/data\/clubimage\/small_120_clubimage__1369751230.jpg"},{"name":"PLANFAIT","desc":"","user":"\/home\/yalldo\/public_apps\/yalldo.com\/mobile\/application\/..\/..\/data\/users\/1574","user_id":"1574","action":"Lauri Koutaniemi followed PLANFAIT","time":"2013-05-28 14:25:11","object":"sites:508","thumb":"\/images\/sites\/takeooff_icon.png"}]
		
		var o = JSON.parse(d);
		
		//if(user==1574) o = eventnews;
		
		if(o.error) alert(o.error);
		else {
			html("mainnews",news(o));
			newsclicks("news");
			info("");
			/*clickit(".newsitem",function() {
				if($(this).data("type")=="site") getsite($(this).data("id"));
				else if($(this).data("type")=="club") getclub($(this).data("id"));
				else if($(this).data("type")=="join_club") getclub($(this).data("id"));
				else if($(this).data("type")=="create_flight") getevent($(this).data("id"));
			});*/
		}

		// enable
		enable();
		
	});
	
}

// list engine
function list(data,type) {
	
	// list engine
	var t = '';
	type = type||"event";
	if(!userclubs.length&&type=="clubscontent") { for(var i=0;i<data.length;i++) { userclubs[data[i].id] = true; } }
	if(currentpage=="explore") { exploremap.clear(); }
	else if(currentpage=="buddies") t += '<br><a class="button button-green" style="margin-left:20px;margin-right:15px">Invite via Facebook</a> <a class="button button-green">Invite via E-mail</a>';
	
	// loop elements from object
	for(var i=0;i<data.length;i++) {
		
		// get element
		var o = data[i];
		
		// if listing buddies
		if(o.friends_id!=null) {
			o.id = o.friends_id;
			o.image = "http://followmeflying.com/data/users/"+o.id+".jpg";
			if(type=="notifybuddies") o.description = "Click here to select";
		}
		
		// set default values
		if(o.id==null) o.id = 1;
		if(o.name==null) o.name = "";
		if(o.image==null) o.image = "";
		if(o.description==null) o.description = "";
		if(o.icon_file_name!=null) o.image = o.icon_file_name;
		if(o.description=="default_club_description") o.description = "This is the page of the YALLDO club.";
		else if(o.description=="") o.description = "No description.";
		if(currentpage=="events") o.name = date(o.start)+": "+o.name;
		else if(currentpage=="explore") exploremap.markers.push(new google.maps.Marker({position:new google.maps.LatLng(o.latitude,o.longitude),map:exploremap}));
		if(!i) t += '<table><tr><td height="10"><td></tr></table>'; t += '<div class="'+type+'item" data-id="'+o.id+'"><table>';
		t += '<tr><td class="bg-top-left"></td><td class="bg-top-mid"></td><td class="bg-top-right"></td></tr>';
		if(currentpage=="buddies") {
			if(o.status==2) t += '<tr><td class="bg-mid-left"></td><td class="bg-mid-mid"><img src="'+o.image+'" width="60" height="60" style="float:left;margin:10px"/><div style="width:480px;float:left;padding-top:8px;padding-left:6px;overflow:hidden">'+o.name+'<br><font color="#aaaaaa"><font color="#44AA44">You are connected!</font></font><a class="button button-orange" style="float:right">Chat</a></div></td><td class="bg-mid-right"></td></tr>';
			else t += '<tr><td class="bg-mid-left"></td><td class="bg-mid-mid"><img src="'+o.image+'" width="60" height="60" style="float:left;margin:10px"/><div style="width:480px;float:left;padding-top:8px;padding-left:6px;overflow:hidden">'+o.name+'<br><font color="#aaaaaa">Waiting your input</font><div class="'+type+'chatitem" data-id="'+o.id+'"><a class="button button-orange" style="float:right">Chat</a></div></td><td class="bg-mid-right"></td></tr>';
		}	
		else if(o.image) t += '<tr><td class="bg-mid-left"></td><td class="bg-mid-mid"><img src="'+o.image+'" width="60" height="60" style="float:left;margin:10px"/><div style="width:480px;float:left;padding-top:8px;padding-left:6px;overflow:hidden">'+o.name+'<br><font color="#aaaaaa">'+o.description+'</font></div></td><td class="bg-mid-right"></td></tr>';
		else t += '<tr><td class="bg-mid-left"></td><td class="bg-mid-mid"><div style="width:560px;height:36px;float:left;padding-top:8px;padding-left:6px;overflow:hidden">'+o.name+'</div><div style="width:560px;height:36px;float:left;padding-top:8px;padding-left:6px;overflow:hidden"><font color="#aaaaaa">'+o.description+'</font></div></td><td class="bg-mid-right"></td></tr>';
		t += '<tr><td class="bg-bot-left"></td><td class="bg-bot-mid"></td><td class="bg-bot-right"></td></tr>';
		t += '</table></div>';
		
	}
	
	return t;

}

function news(data,type) {
	
	// build news
	var t = "";
	type = type||"news";
	
	// loop all news from object
	for(var i=0;i<data.length;i++) {
		// [{"user_id":"3004","action":"Lauri Koutaniemi is following a club","type":"join_club","time":"2013-05-13"}
		var o = data[i];
		if(o.id==null) o.id = 1;
		if(o.type==null) o.type = "site";
		if(o.user==null) o.user = "";
		if(o.user_id!=null) o.user = "http://followmeflying.com/data/users/"+o.user_id+".jpg";
		if(o.time==null) o.time = "";
		if(o.desc==null) o.desc = "";
		if(o.image==null) o.image = "";
		if(o.thumb==null) o.thumb = "";
		if(o.action==null) o.action = "";
		if(o.dynamic==null) o.dynamic = false;
		if(o.messages==null) o.messages = 5;
		if(o.comments==null) o.comments = [];
		if(o.thumb) o.thumb = '<img src="'+o.thumb+'" width="100" height="100" style="float:left;margin-right:18px"/>';
		if(!i) t += '<table><tr><td height="10"><td></tr></table>'; t += '<div class="'+type+'item" data-id="'+o.id+'" data-type="'+o.type+'"><table>';
		t += '<tr><td class="bg-top-left"></td><td class="bg-top-mid"></td><td class="bg-top-right"></td></tr>';
		t += '<tr><td class="bg-mid-left"></td><td class="bg-mid-mid"><img src="'+o.user+'" width="60" height="60" style="float:left;margin:10px"/><div style="padding-top:8px;padding-left:6px;width:500px">'+o.action+'</div><div style="padding-left:6px;width:500px"><font color="#aaaaaa">'+ago(o.time)+'</font></div></td><td class="bg-mid-right"></td></tr>';
		if(o.comment) t += '<tr><td class="bg-mid-left"></td><td class="bg-mid-mid"><div style="padding-top:8px;padding-left:6px;width:560px">"'+o.comment+'"</div></div></td><td class="bg-mid-right"></td></tr>';
		if(o.image) {
			t += '<tr><td class="bg-photo-top-left"></td><td class="bg-photo-top-mid"></td><td class="bg-photo-top-right"></td></tr>';
			t += '</table><table>';
			t += '<tr><td class="bg-photo-mid-left"></td><td class="bg-photo-mid-mid"><img src="'+o.image+'" width="600"/></td><td class="bg-photo-mid-right"></td></tr>';
			t += '</table><table>';
			t += '<tr><td class="bg-photo-bot-left"></td><td class="bg-photo-bot-mid"></td><td class="bg-photo-bot-right"></td></tr>';
		} t += '</table>';
		if(o.desc&&currentpage=="news") {
			t += '<table>';
			t += '<tr><td class="bg-share-top-left"></td><td class="bg-share-top-mid"></td><td class="bg-share-top-right"></td></tr>';
			t += '<tr><td class="bg-share-mid-left"></td><td class="bg-share-mid-mid" style="padding:10px">'+o.thumb+o.desc+'</td><td class="bg-share-mid-right"></td></tr>';
			t += '<tr><td class="bg-share-bot-left"></td><td class="bg-share-bot-mid"></td><td class="bg-share-bot-right"></td></tr>';
			t += '</table>';
		} t += '<table>';
		if(o.comments.length&&o.messages) {
			for(var c=0;c<o.comments.length;c++) {
				if(o.comments[c].user==null) o.comments[c].user = "";
				if(o.comments[c].time==null) o.comments[c].time = "";
				if(o.comments[c].image==null) o.comments[c].image = "";
				if(o.comments[c].comment==null) o.comments[c].comment = "";
				if(o.comments[c].user.substr(0,4)!="http") o.comments[c].user = "http://followmeflying.com/data/users/1.jpg";
				if(!o.comments[c].comment) o.comments[c].comment = "[image link]";
				t += '<tr><td class="bg-mid-left"></td><td class="bg-act-mid-mid"><img src="'+o.comments[c].user+'" width="60" height="60" style="float:left;margin:10px"/><div style="padding-top:8px;padding-left:6px;width:460px;height:32px;overflow:hidden">'+o.comments[c].comment+'</div><div style="padding-left:6px;width:460px;height:32px;overflow:hidden"><font color="#aaaaaa">'+ago(o.comments[c].time)+'</font></div></td><td class="bg-mid-right"></td></tr>';
				if(o.messages==c+1) break;
			}			
			t += '</table><table>';
		}
		if(o.dynamic) {
			t += '<tr><td class="bg-act-top-left"></td><td class="bg-act-top-mid"></td><td class="bg-act-top-right"></td></tr>';
			//t += '<tr><td class="bg-act-mid-left"></td><td class="bg-act-mid-mid"><div class="'+type+'like" data-id="'+o.id+'" style="float:left;margin-left:10px">Like</div><div class="'+type+'comment" data-id="'+o.id+'" style="float:left;margin-left:20px">Comment</div></td><td class="bg-act-mid-right"></td></tr>';
			t += '<tr><td class="bg-act-mid-left"></td><td class="bg-act-mid-mid"><table style="margin-top:15px"><tr><td style="padding-left:15px;padding-right:20px"><img width="50" height="50" src="http://followmeflying.com/data/users/'+user+'.jpg"/></td><td><input id="newscommentinput'+o.id+'" type="text" placeholder="Add a new comment..." style="width:300px"/></td><td style="padding-left:20px"><div class="commentbutton" data-id="'+o.id+'"><a id="newscommentbutton'+o.id+'" class="button button-green" data-id="'+o.id+'">Send</a></div></td></tr></table></td><td class="bg-act-mid-right"></td></tr>';
			t += '<tr><td class="bg-act-bot-left"></td><td class="bg-act-bot-mid"></td><td class="bg-act-bot-right"></td></tr>';
		} else t += '<tr><td class="bg-bot-left"></td><td class="bg-bot-mid"></td><td class="bg-bot-right"></td></tr>';
		t += '</table></div><table><tr><td height="10"><td></tr></table>';
	}
	
	return t;

}

// set news clicks
function newsclicks(type) {
	
	// event listener for like
	clickit("."+type+"like",function() {
		if($(this).html()=="Unlike") $(this).html("Like");
		else $(this).html("Unlike");
		ajax("addlike",{content_id:$(this).data("id")},function(d) {
			
		});
	});
	
	// event listener for comment
	//clickit("."+type+"comment",function() {
		//if($(this).html()=="Comment") $(this).html('<table style="margin-top:15px"><tr><td><input id="newscommentinput'+$(this).data("id")+'" type="text" placeholder="Add a new comment..." style="width:300px"/></td><td style="padding-left:20px"><a id="newscommentbutton'+$(this).data("id")+'" class="button button-green" data-id="'+$(this).data("id")+'">Send</a></td></tr></table>');
		clickit(".commentbutton",function() {
			disable();
			ajax("addcomment",{content_id:$(this).data("id"),message:$("#newscommentinput"+$(this).data("id")).val(),content_type:"club"},function(d) { getnews(); });
			//inf("sending comment...");
			//getevent($(this).data("id"));
		});
	//});
	
}

// show news and init
function shownews(o) {
	
	// show news
	user = o.id;
	email = o.email;
	$('#userimage').attr('src','http://followmeflying.com/data/users/'+o.id+'.jpg');
	html("username",o.username);
	authkey = o.auth_key;
	page("news");
	show("welcome");
	show("menubutton");
	show("notibutton");
	getnotifications();
	info();
	
}

