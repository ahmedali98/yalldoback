/***********************************************************************/
/*                                                                     */
/*    EXPLORE.JS - Explore related functionalities                     */
/*    Copyright (c) 2013 Yalldo - Developed by lauri@koutaniemi.com    */
/*                                                                     */
/***********************************************************************/

// init explore map
function exploremapinit() {

	// get the address
	var str = $("#barinput").val();
	if(!str) str = "Paris, France";
	var geo = new google.maps.Geocoder;
	
	// set or update google map
	geo.geocode({'address':str},function(results,status) {
		if(status==google.maps.GeocoderStatus.OK) {
			point = results[0].geometry.location;
			if(exploremap==null) {
				exploremap = new google.maps.Map(document.getElementById("exploremap"),{zoom: 8, center: point, mapTypeId: google.maps.MapTypeId.ROADMAP });
				getexplore(49.43154964807801,4.110034400000018,48.27499842675287,0.5944094000000177);
				exploremap.markers = [];
			} else {
				exploremap.setCenter(point);
				getexplore(exploremap.getBounds().getNorthEast().lat(),exploremap.getBounds().getNorthEast().lng(),exploremap.getBounds().getSouthWest().lat(),exploremap.getBounds().getSouthWest().lng());
				exploremap.clear();
			}
		} else console.log("Geocode was not successful for the following reason: "+status);
	});
		
}

// get explore map with coords
function getexplore(c1,c2,c3,c4) {
	
	// get explore event list, init map and set click handlers
	ajax("getevents",{ne_latitude:c1,ne_longitude:c2,sw_latitude:c3,sw_longitude:c4},function(d) {
		createlist("exploreevents",d);
		clickit(".exploreeventsitem",function() {
			getevent($(this).data("id"));
		});
	});
	
}
