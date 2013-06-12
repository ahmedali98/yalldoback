/***********************************************************************/
/*                                                                     */
/*    CLUBS.JS - Club related functionalities                          */
/*    Copyright (c) 2013 Yalldo - Developed by lauri@koutaniemi.com    */
/*                                                                     */
/***********************************************************************/

// follow selected club
function clubfollow() {
	
	// update clubs array
	userclubs[cid] = true;
	
	// add it to database and update club
	ajax("joinclub",{id:cid},function(d) { getclub(cid); });

}

// unfollow selected club
function clubunfollow() {

	// update clubs array
	userclubs[cid] = false;
	
	// update it to database and get new club data
	ajax("joinclub",{id:cid,is_join:0},function(d) {  getclub(cid); });

}

// get club data
function getclub(id) {
	
	// get club, set data and map
	ajax("getclub",{id:id},function(d) { //alert(d);
		
		// reset photo
		photodata = "";
		
		// parse object
		var o = JSON.parse(d);
		if(o.link) o.link = "<br><a href='"+o.link+"'>"+o.link+"</a>";
		if(o.description=="default_club_description") o.description = "This is the page of the YALLDO club. Some clubs are fully public, some require the approval of your request by a club administrator.<br><br>The YALLDO Club is fully public. You are free to remove it from your club list but are also welcome to participate is and leave your comments about the service, how you use it, how you would like it to evolve.<br><br>Feel free to add other clubs to your list and follow their activities.<br><br>Thanks again for joining the YALLDO community,<br>The YALLDO Staff";
		
		// set buttons
		if(userclubs[o.id]) { hide("clubfollowbutton"); show("clubunfollowbutton"); }
		else { show("clubfollowbutton"); hide("clubunfollowbutton"); }
		
		// update elements and data
		$("#clubphoto").attr('width','1');
		style("clubtop","background","url('"+o.top_file_name+"') no-repeat center");
		if(o.membership=="validation") o.type = "private"; else o.type = "public";
		html("clubname",o.name+" ("+o.type+")");
		html("clubdescription",o.description+" (followers: "+o.number+")"+o.link);
		page("club");
		cid = o.id;
		
		// get club news
		ajax("getclubnews",{id:cid},function(d) {
			createnews("clubcomments",d);
			newsclicks("clubcomments");
		});
		
	});
	
}
		
// get clubs
function getclubs() {

	// init elements
	html("clubstitle","Loading...");
	html("clubstitle2","");
	html("clubscontent","");
	html("clubsrecommended","");
	
	// get clubs, create list and set click handlers
	ajax("getclubs",{term:$("#barinput").val()},function(d) {
		if($("#barinput").val()) html("clubstitle","Search Results");
		else html("clubstitle","My Clubs");
		createlist("clubscontent",d.substring(9,d.length-1));
		clickit(".clubscontentitem",function() {
			getclub($(this).data("id"));
		});
	});
	
	// show recommended clubs
	if(!$("#barinput").val()) {
		ajax("getclubs",{term:"recommended"},function(d) {
			html("clubstitle2","Recommended Clubs");
			createlist("clubsrecommended",d.substring(9,d.length-1));
			clickit(".clubsrecommendeditem",function() {
				getclub($(this).data("id"));
			});
		});
		
	}
	
}

// get clubs to notify
function getclubstonotify() {

	// get buddies for logged user and set click handlers
	ajax("getclubs",{},function(d) {
		createlist("notifyclubs",d.substring(9,d.length-1));
		clickit(".notifyclubsitem",function() {
			if(this.style.paddingLeft=="100px") this.style.paddingLeft = "0px";
			else this.style.paddingLeft = "100px";
		});
	});
	
}
