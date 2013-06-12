function getsite(id) {
	// get site, set data and map
	ajax("getsite",{id:id,site_type:"site_sites"},function(d) {
		photodata = "";
		$("#sitephoto").attr('width','1');	
		// {"id":"1","name":"BATTAGLIA","latitude":"42.5493","longitude":"9.00344"}
		var o = JSON.parse(d);
		html("sitename",o.name);
		html("sitedetails",'Latitude: '+o.latitude+'<br>Longitude: '+o.longitude);//+'<br>Altitude: '+o.altitude+'<br>Access: '+o.access+'<br>Sport: '+o.sport+'<br>Landing: '+o.landing+'<br>Direction: '+o.direction+'<br>Takeoff: '+o.takeoff);
		point = new google.maps.LatLng(o.latitude,o.longitude);
		if(sitemap==null) {
			sitemap = new google.maps.Map(document.getElementById("sitemap"),{zoom:8,center:point,mapTypeId:google.maps.MapTypeId.ROADMAP});
			sitemap.markers = [];
		} else { sitemap.setCenter(point); }
		sitemap.clear();
		sitemap.markers.push(new google.maps.Marker({position:point,map:sitemap}));
		page("site");
		show("backbutton");
		cid = o.id;
		ajax("getsitenews",{id:cid,site_type:"site_sites"},function(d) {
			createnews("sitecomments",d);
			newsclicks("sitecomments");
		});
	});
}

function getsites() {
	// get sites and set click handlers
	ajax("getsites/",{term:$("#barinput").val()},function(d) {
		createlist("sitescontent",d);
		clickit(".sitescontentitem",function() {
			getsite($(this).data("id"));
		});
	});
	ajax("getsites/",{term:"recommended"},function(d) {
		createlist("sitesrecommended",d);
		clickit(".sitesrecommendeditem",function() {
			getsite($(this).data("id"));
		});
	});
}

function getsitesearch() {
	// get explore event list, init map and set click handlers
	ajax("getsites",{},function(d) {
		createlist("sitesearchsites",d);
		clickit(".sitesearchsitesitem",function() {
			getsite($(this).data("id"));
		});
	});
}

function sitesearchmapinit() {
	// init or update explore map
	var str = $("#barinput").val();
	if(!str) str = "Paris, France";
	var geo = new google.maps.Geocoder;
	geo.geocode({'address':str},function(results,status) {
		if(status==google.maps.GeocoderStatus.OK) {
			point = results[0].geometry.location;
			if(sitesearchmap==null) {
				sitesearchmap = new google.maps.Map(document.getElementById("sitesearchmap"),{zoom: 8, center: point, mapTypeId: google.maps.MapTypeId.ROADMAP });
			} else sitesearchmap.setCenter(point);
		} else alert("Geocode was not successful for the following reason: "+status);
	});
}