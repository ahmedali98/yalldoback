/***********************************************************************/
/*                                                                     */
/*    BUDDIES.JS - Friend related functionalities                      */
/*    Copyright (c) 2013 Yalldo - Developed by lauri@koutaniemi.com    */
/*                                                                     */
/***********************************************************************/

// get buddy list
function getbuddies() {

	// get buddies for logged user and set click handlers
	ajax("getfriends",{term:$("#barinput").val()},function(d) {

		// create list from data
		createlist("buddiescontent",d);

		/*/ accept click handlers and actions
		clickit(".buddiesokitem",function() {
			ajax("addfriend",{users_id:$(this).data("id")},function(d) {
				info("user added to your buddies");
				getbuddies();
			});
		});*/

		// message click handlers and actions
		clickit(".buddiescontentchatitem",function() {
			info("Message sent!");
		});

	});
	
	// get recommended buddies for logged user
	ajax("getfriends",{term:"recommended"},function(d) {

		// create list from data
		createlist("buddiesrecommended",d);

		/*/ accept click handlers and actions
		clickit(".buddiescontentokitem",function() {
			ajax("addfriend",{users_id:$(this).data("id")},function(d) {
				info("user added to your buddies");
				getbuddies();
			});
		});*/

		// message click handlers and actions
		clickit(".buddiesrecommendedchatitem",function() {
			info("Message sent!");
		});

	});

}

// get buddies to notify
function getbuddiestonotify() {
	
	// get buddies for logged user
	ajax("getfriends",{},function(d) {
	
		// create list from data
		createlist("notifybuddies",d);
		
		// set click handlers
		clickit(".notifybuddiesitem",function() {
			
			// toggle selected item or send it back
			if(this.style.paddingLeft=="100px") this.style.paddingLeft = "0px";
			else this.style.paddingLeft = "100px";
		
		});
	
	});
	
}
