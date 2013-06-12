/***********************************************************************/
/*                                                                     */
/*    EVENTS.JS - Event related functionalities                        */
/*    Copyright (c) 2013 Yalldo - Developed by lauri@koutaniemi.com    */
/*                                                                     */
/***********************************************************************/

// create events menu
function eventsmenu(mode) {

	// set past
	past = mode;

	// set links and styles
	if(mode!=0) html("eventsmenu0","Future Flights"); else html("eventsmenu0","<b style='color:#333333'>Future Flights</b>");
	if(mode!=1) html("eventsmenu1","Past Flights"); else html("eventsmenu1","<b style='color:#333333'>Past Flights</b>");
	if(mode!=2) html("eventsmenu2","All Flights"); else html("eventsmenu2","<b style='color:#333333'>All Flights</b>");
	
	// get events
	getevents();

}

// join event
function eventjoin() {
	
	// update events array
	userevents[cid] = true;
	
	// join event and get new data
	ajax("joinevent",{id:cid},function(d) { getevent(cid); });

}

// unjoin event
function eventunjoin() {
	
	// update events array
	userevents[cid] = false;
	
	// unjoin event and get new data
	ajax("joinevent",{id:cid,is_join:0},function(d) {  getevent(cid); });

}

// get event data
function getevent(id) {

	// disable
	disable();
	
	// get event, set data and map
	ajax("getevent",{id:id},function(d) { // {"id":"1","name":"BPO 2011 - Laragne-Monteglin, France\t","description":"International Belgium Paragliding Open 2011","start":"2011-08-19 22:00:00","end":"2011-08-26 21:59:59","latitude":"44.31290761351669","longitude":"5.833636838714597","sports_id":"5","type":"trip","gps_path":"","created":"0000-00-00 00:00:00","status":"3"} or {"id":"2","name":"80km from Laragne to Montagne de Bure and Back\t","description":"Probably the best flight I ever had ...","start":"2011-08-21 18:00:00","end":null,"latitude":"44.2953836506088","longitude":"5.762524041961683","sports_id":"5","type":"event","gps_path":"http:\/\/staging.followmeflying.com\/data\/gps\/e6d4958ef4a1ea668ebc5264d4f16eef.kml","created":"0000-00-00 00:00:00","status":"3"}
		
		// reset photo
		photodata = "";
		
		// parse data
		var o = JSON.parse(d);
		
		// show buttons
		if(userevents[o.id]) { hide("eventjoinbutton"); show("eventunjoinbutton"); }
		else { show("eventjoinbutton"); hide("eventunjoinbutton"); }
		
		// update event data
		$("#eventphoto").attr('width','1');	
		html("eventname",'<img src="http://mobile.yalldo.com/images/sports/'+o.sports_id+'.jpg"/> &nbsp;'+o.name);
		html("detailsname",'<img src="http://mobile.yalldo.com/images/sports/'+o.sports_id+'.jpg"/> &nbsp;'+o.name);
		html("eventdescription",o.description);
		html("detailsdescription",o.description);
		if(o.end) html("eventtime",date(o.start)+" - "+date(o.end));
		else html("eventtime",date(o.start));
		if(o.gps_path) html("eventgps","<a href='javascript:page(\"details\")'>Show GPS Details</a>"); else html("eventgps","");
		cid = o.id;
		
		// create event map if not exists, otherwise update
		point = new google.maps.LatLng(o.latitude,o.longitude);
		if(eventmap==null) {
			eventmap = new google.maps.Map(document.getElementById("eventmap"),{zoom:8,center:point,mapTypeId:google.maps.MapTypeId.ROADMAP});
			eventmap.markers = [];
		} else { eventmap.clear(); eventmap.setCenter(point); }
		eventmap.markers.push(new google.maps.Marker({position:point,map:eventmap}));
		title(ucfirst(o.type));
		page("event");
		
		// get event news
		ajax("geteventnews",{id:cid},function(d) { // alert(d);
			createnews("eventcomments",d);
			newsclicks("eventcomments");
		});
		
		// enable
		enable();
		
	});
	
}

// get events list
function getevents() {
	
	// get events, create list and set click handlers
	ajax("getevents",{term:$("#barinput").val(),past:past},function(d) {
		createlist("eventscontent",d);
		clickit(".eventscontentitem",function() {
			html("eventcomments","");
			getevent($(this).data("id"));
		});
	});
	
}

// send gps to email
function sendgpstoemail() {
	
	// send gps to selected email
	//ajax("sendgps",{id:cid,email:email},function(d) {
		info("GPS data sent to "+email);
	//});

}

// show details
function showdetails() {
	
	// hide or show details and update text for the link
	if(toggle("eventdetailsgps")=="none") html("eventgps","<a href='javascript:showdetails()'>Show GPS Details</a>");
	else html("eventgps","<a href='javascript:showdetails()'>Hide GPS Details</a>");

}

// sync flights
function syncit() {
	
	/*var d = '<br><a class="button button-green">Sync All</a><br><br>';
	var list = [{type:"gps",status:0},{type:"picture",status:0},{type:"gps",status:1}];
	for(i=0;i<list.length;i++) {
		d += list[i].type;
		if(!list[i].status) d += '&nbsp;&nbsp;<font color="#AA0000">Unsynced</font><br><br>';
	}
	html("syncdata",d);*/
	
	// this is temporary
	$("#barsync").attr('class','button button-green');
	info("All flights are now in sync.");

}


