/***********************************************************************/
/*                                                                     */
/*    CREATE.JS - Create flight related functionalities                */
/*    Copyright (c) 2013 Yalldo - Developed by lauri@koutaniemi.com    */
/*                                                                     */
/***********************************************************************/

// facebook login
function facebook() {

	// login as test user (for testing)
	testaccount("test@yalldo.com","testit");

}


// login to yalldo
function login() {
	
	// try login using auth token and show news if successful
	ajax("login",{email:$("#loginemail").val(),passwd:$("#loginpword").val(),auth_token:"d2763432f1725badcbc5ed61cfb3c8e5"},function(d) {
		var o = JSON.parse(d);
		if(o.error) {
			if(o.error=="Wrong data") o.error = "E-mail or password was incorrect";
			html("logindata","<font color='#880000'>"+o.error+"</font>");
		} else shownews(o);
	});
}

// forgot email sending
function loginforgot() {
	
	// reset password
	ajax("resetpassword",{email:$("#loginemailforgot").val(),auth_token:"d2763432f1725badcbc5ed61cfb3c8e5"},function(d) {
		var o = JSON.parse(d);
		if(o.error) html("logindata","<font color='#880000'>"+o.error+"</font>");
		else html("logindata","<font color='#008800'>Password sent!</font>");
		$("#loginemailforgot").val("");
		hide("loginforgot");
	});
	
}

// login with test account
function testaccount(email,passwd) {
	disable();
	// login with selected testaccount
	ajax("login",{email:email,passwd:passwd,auth_token:"d2763432f1725badcbc5ed61cfb3c8e5"},function(d) {
		var o = JSON.parse(d);
		if(o.error) html("logindata",o.error);
		else { shownews(o); if(testpage) { welcome(); page(testpage); } }
		enable();
	});
}
