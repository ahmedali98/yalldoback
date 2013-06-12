/***********************************************************************/
/*                                                                     */
/*    NOTIFICATIONS.JS - Notification related functionalities          */
/*    Copyright (c) 2013 Yalldo - Developed by lauri@koutaniemi.com    */
/*                                                                     */
/***********************************************************************/

// get notifications
function getnotifications() {
	
	// get notifications for the user
	ajax("getnotifications",{},function(d) {
		var o = JSON.parse(d.substring(1,d.length-1));
		html("menu2",notifications(o));
	});
	
}