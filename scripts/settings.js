function savesettings() {
	// save user settings
	ajax("savesettings",{metric:$("#settingsunit").val(),emailnoti:$("#settingsnoti").val(),language:$("#settingslang").val()},function(d) {
		var o = JSON.parse(d);
		if(o.error) info("there was an error while saving settings");
		else info("settings saved");
		unit($("#settingsunit").val());
	});
}
