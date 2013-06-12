// main news
var mainnews = [
	
	{ // example 1: commented event, site or club
	
		dynamic:true,
		messages:true,
		user:"http://mobile.followmeflying.com/data/users/1574.jpg",
		action:"Lauri Koutaniemi commented a club",
		time:"2013-06-03 11:43:33",
		comment:"What are these clubs?",
		name:"Yalldo Club",
		desc:"Yalldo Official Club description",
		thumb:"http://followmeflying.com/data/clubicon/clubicon_1_1367245993.jpg",
		likes:[{user:1},{user:2},{user:4},{user:7},{user:8},{user:9}],
		comments:[
			{
				user:"http://mobile.followmeflying.com/data/users/1573.jpg",
				comment:"These are real clubs that you can join",
				time:"2013-06-03 11:44:33"
			},{
				user:"http://mobile.followmeflying.com/data/users/1572.jpg",
				comment:"And you can create clubs as well!",
				time:"2013-06-03 11:45:33"
			}
		]
		
	},{ // example 2: posted a photo, gps, video or checked in
		
		dynamic:true,
		messages:true,
		user:"http://mobile.followmeflying.com/data/users/1574.jpg",
		action:"Lauri Koutaniemi uploaded a GPS trace",
		time:"2013-06-03 11:43:33",
		comment:"", // can be also not defined or include comment (for a photo)
		image:"http://maps.google.com/api?parameters..."
	
	},{ // example 3: created, modified, joined or started to follow event/club/site
		
		dynamic:true,
		messages:true,
		user:"http://mobile.followmeflying.com/data/users/1574.jpg",
		action:"Lauri Koutaniemi commented a club",
		time:"2013-06-03 11:43:33",
		name:"Yalldo Club",
		desc:"Yalldo Official Club description",
		thumb:"http://followmeflying.com/data/clubicon/clubicon_1_1367245993.jpg"
	
	},{ // example 4: became buddies or joined yalldo
		
		user:"http://mobile.followmeflying.com/data/users/1574.jpg",
		action:"Lauri Koutaniemi followed PLANFAIT",
		time:"2013-06-03 11:43:33"
	
	}
	
];

// news for events
var eventnews = [

	{ // example 1: comment, with sub-comments and likes

		dynamic:true,
		messages:true,
		user:"http://mobile.followmeflying.com/data/users/1574.jpg",
		action:"Lauri Koutaniemi",
		time:"2013-06-03 11:43:33",
		comment:"Still few seats left",
		likes:[{user:1},{user:2},{user:4},{user:7},{user:8},{user:9}],
		comments:[
			{
				user:"http://mobile.followmeflying.com/data/users/1574.jpg",
				comment:"Hey, I'm in!",
				time:"2013-06-03 11:44:33"
			},{
				user:"http://mobile.followmeflying.com/data/users/1573.jpg",
				comment:"Me too",
				time:"2013-06-03 11:45:33"
			}
		]
	
	},{ // example 2: photo, without comments or likes
		
		dynamic:true,
		messages:true,
		user:"http://mobile.followmeflying.com/data/users/1574.jpg",
		action:"Lauri Koutaniemi",
		time:"2013-06-03 11:43:33",
		image:"http://followmeflying.com/data/flight/flight_1_1370012206.jpg"
	
	}
	
];

var futurenews = [
	
	// testing future news for the main news page
	{user:"images/icon-flight.png",action:"Future flight no 3",time:"in 3 days"},
	{user:"images/icon-flight.png",action:"Future flight no 2",time:"in 2 days"},
	{user:"images/icon-flight.png",action:"Future flight no 1",time:"in 1 days"},

];