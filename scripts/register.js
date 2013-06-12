function register() {
	// try register
	var d = {firstname:$("#registername").val(),lastname:$("#registerlast").val(),email:$("#registeremail").val(),passwd:$("#registerpword").val(),auth_token:"d2763432f1725badcbc5ed61cfb3c8e5"};
	if(photodata) d.photo = photodata;
	ajax("register",d,function(d) {
		var o = JSON.parse(d);
		if(o.error) html("registerdata","<font color='#880000'>"+o.error+"<font>");
		else shownews(o);
	});
}
