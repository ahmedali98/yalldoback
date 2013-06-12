/***********************************************************************/
/*                                                                     */
/*    RECORD.JS - Record related functionalities                       */
/*    Copyright (c) 2013 Yalldo - Developed by ahmed@koutaniemi.com    */
/*                                                                     */
/***********************************************************************/
/*
 ************ 1- Setting up the Timer
 ************ 2- Getting the GEO Location
 ************ 3- Database Customs functions for creating, accessing, saving...etc
 ************ 4- Working with capturing pictures for the flight & Site Info
 ************ 5- Working with Uploading or Syncing: pictures - Gpstraces (files)
 *
 *    Note: We will assume that the user hasn't a flightId or any flights created while creating the framework of the application, however
 *    later on when a user records a flight and actually create a flightId, we can pass the new flightId instead of the one we will
 *    be using now (which is basically a string made of 'F'+ Formatted Current Time string)
 *
 */

// init time

var zecsec = 0;
var seconds = 0;
var mints = 0;
var hours = 0;
var totalTime = 0;
var firstLat = 99;
var firstLon = 99;
var tRecStarted = 0;

var startchron = 0;

function chronometer() {
    if (startchron == 1) {
        zecsec += 1; // set tenths of a second
        // set seconds
        if (zecsec > 9) {
            zecsec = 0;
            seconds += 1;
        }
        // set minutes
        if (seconds > 59) {
            seconds = 0;
            mints += 1;
        }
        // set hours
        if (mints > 59) {
            mints = 0;
            hours += 1;
        }
        // adds data in #Timer
        document.getElementById('stopwatch').innerHTML = format(hours) + ':' + format(mints) + ':' + format(seconds);
        totalTime = hours * 3600 + mints * 60 + seconds;
        setTimeout("chronometer()", 100);
    }
}

//Start the StopWatch

function startChr() {
    startchron = 1;
    chronometer();
}

//Stop the StopWatch

function stopChr() {
    startchron = 0;
}

//Reset the StopWatch                     

function resetChr() {
    zecsec = 0;
    seconds = 0;
    mints = 0;
    startchron = 0;
    document.getElementById('stopwatch').innerHTML = format(hours) + ':' + format(mints) + ':' + format(seconds);
}

//Function to format any time unit (adds '0' if less than 10)

function format(t) {
    if (t < 10) t = '0' + t;
    return t;
}

//************************ STEP TWO - GEO Location *****************************

//Starting the GEO location API - Cordova.

function resetVariables() {
    gpsCoordAquired = ''; //GPS coordinates in x; x; x; x; form to be saved in a file 
    latNew = ''; //Most recent Lattitude
    lonNew = ''; //Most recent Longitude
    latOld = ''; //Old  Lattitude
    lonOld = ''; //Old Longitude
    maxAlt = 0; //Max Altitude
    timeStampNew = ''; //New coordinates time stamp
    timeStampOld = ''; //Old coordinates time stamp
    gpsSpeed = 0; //Speed from the GPS sensor
    twoPointsDistance = 0; //distance covered between the last two gps scans
    totalDistance = 0; //Total distance traveled
    avgSpeed = 0;
    tt = formattedCTime('', '');
    GPSURLUpdated = false;
    startOfRecord = '';
    serverFlightId = '';
    var firstFix = true;
    var firstTLoc = '';
    var anotherTLoc = '';
    var count = 0;
    c_Desc = '';
    c_Time = '';
    c_Sport = '';
    c_Name = '';
    c_Priv = '';
    canBeSaved = false; //Note: For testing ""ONLY"" set to "true", used to determine if there is enough GPS points acquired to send the flight to the server
}

sourcePlanFlight = false;
flightId = '';
GPSFileName = ''; //GPS data file name to be saved to the device
resetVariables();

var neededpoints = 6; //6 default
var neededaccuracy = 40; //50 default
var selectedUnits = '';
var selectedUseknots = '';
var selectedNotifications = '';
var selectedLanguage = '';
var selectedSport = '';

var newRecord = true;

function startRecording(string) {

    if (string == "newRecord") {
        console.log('NEW RECORD');
        resetVariables();
        flightId = 'F' + tt;
        GPSFileName = 'G' + tt;
        startOfRecord = new Date();
        startDB("addGPSTrack");
        startDB("createFlight");
        endOfRecord = '';
        recordActive = true; //flag to determine if there's a flight started or paused
    }

    var options = {
        maximumAge: 3000,
        timeout: 10000,
        enableHighAccuracy: true
    };
    watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
    startChr();
    $('#stop_button').css("display", "none");
    executed = false;
}

//onSuccess Geolocation

function onSuccess(position) {

    /*$('#geolocation').html( 'Latitude: '  + position.coords.latitude      + '<br />' +
                            'Longitude: ' + position.coords.longitude     + '<br />' +
                            '<hr />');
 /*alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');*/

    lonOld = lonNew;
    latOld = latNew;
    lonNew = position.coords.longitude;
    latNew = position.coords.latitude;
    timeStampOld = timeStampNew;
    timeStampNew = position.timestamp;
    gpsSpeed = position.coords.speed;

    gpsCoordAquired = latNew + ";" + lonNew + ";" + position.coords.altitude + ";" + position.timestamp + "\n";


    var accuracy = position.coords.accuracy;

    //Old App accepted accuracy was 50 meters or less and user is allowed to save after 6 points with that accuracy.
    if (accuracy < neededaccuracy) {
        console.log('the accuracy is ' + accuracy + 'm');
        updateTotalDistance(latOld, lonOld, latNew, lonNew);

        updateAvgSpeed();

        writeGPSData();

        if (maxAlt < position.coords.altitude) {
            maxAlt = Math.round(position.coords.altitude * 100) / 100;
            if (!metric) $('#maxaltitude').html(m2ft(maxAlt));
            else $('#maxaltitude').html(maxAlt);
        }
    }
}

//onError Callback receives a PositionError object

function onError(error) {
    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}

function pauseRecording() {
    //it pauses recording meaning: stops Gps watch but keeps the file open for writing later on resume with the same flight Id and Gps File name.
    clearWatch();
    stopChr(); //Pause the stopwatch
    showStopButton();

}

function showStopButton() {

    $('#stop_button').show().click(stopRecording);

}

function stopRecording() {
    //clear the watch that was started earlier
	if (canBeSaved == true) {
		endOfRecord = new Date();
		createFlight("recorded");
	} else {
		info('There is not enough points to create a flight.');
	}
}

function deleteFlight(){
 //Actions taken when the user decides to delete the current flight: 1- delete tables from database 2- Reset the variables.
	stopRecording();
	resetRecordScreen();
	startDB("dropTrace");
	recordActive = false;

}

function resetRecordScreen(){
//The Following 6 lines are dealing with resetting the record session and the record screen
    resetChr(); //Reset the stop watch to 00:00:00
    $('#stop_button').css("display", "none");
    $('#totaldistance').html('0');
    $('#avgspeed').html('0');
    $('#maxaltitude').html('0');
    newRecord = true;
    dataBox ='';
}

var dataBox ='';
function showProgressDialog(data){
	dataBox = dataBox + data + "<br>";
	$('html,body').css('overflow', 'hidden');
    html("infocontent", dataBox);
    show("info");
    hide("infobutton");
    
    // setTimeout() function will be fired after page is loaded
    // it will wait for 5 sec. and then will fire
    // $("#successMessage").hide() function
    setTimeout(function() {
         $('#info').hide();
    }, 8000);
	
}
/*
// Show a custom confirmation dialog

function showConfirm() {
    if (executed == false) {
        if (canBeSaved == true) {
            navigator.notification.confirm(
                'Are you sure you want to stop and save this GPS recording?', // message
                onConfirm, // callback to invoke with index of button pressed
                'Stop Recording!', // title
                'Stop & Save,Delete Flight' // buttonLabels
            );
        } else {
            navigator.notification.confirm(
                'Not enough points to save the flight! Do you want to ', // message
                onConfirm, // callback to invoke with index of button pressed
                'Stop Recording!', // title
                'Go back ,Delete Flight' // buttonLabels
            );
        }
        executed = true;
    }
}
*/
function clearWatch() {
    if (watchID != null) {
        navigator.geolocation.clearWatch(watchID);
        watchID = null;
    }
}

//Writting the GPS data we got from the device to a file
var GPSFileURL = '';

function writeGPSData(string) {

    if (string != "read") {
        GPSFileName = 'G' + tt;
    }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

    function gotFS(fileSystem) {
        fileSystem.root.getFile(GPSFileName, {
            create: true,
            exclusive: false
        }, gotFileEntry, fail);
    }

    function gotFileEntry(fileEntry) {

        if (string == "read") {
            fileEntry.file(gotFile, fail);
        } else {
            fileEntry.createWriter(gotFileWriter, fail);
            GPSFileURL = fileEntry.fullPath + '';
            console.log('This is the URL for the GPS File' + GPSFileURL);
        }
    }

    function gotFile(file) {
        readAsText(file);
    }

    function readAsText(file) {
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            console.log("Read as text");
            allCoords = evt.target.result;
            console.log('the contains' + allCoords);
        };
        reader.readAsText(file);
    }

    function gotFileWriter(writer) {

        writer.onwriteend = function (evt) {
            //Just for debugging...
            console.log("Done writing the GPS data we got from the sensor...");
        };

        //Append each new coordinates to the file we're writting instantly on the device.  
        writer.seek(writer.length);
        writer.write(gpsCoordAquired);

    }

    function fail(error) {
        console.log(error.code);
    }
}

var firstFix = true;
var firstTLoc = '';
var anotherTLoc = '';
var count = 0;
//Calculating the distance from any 2 scanned latitudes and longitudes..

function updateTotalDistance(lat1, lon1, lat2, lon2) {
    if (lat1 && lon1 && lat2 && lon2 != '') {

        var R = 6371; // Radius of the earth in km
        var dLat = (lat2 - lat1).toRad(); // Javascript functions in radians
        var dLon = (lon2 - lon1).toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var twoPointsDistance = Math.round(R * c * 1000); // Fix Distance in meters

        if (count < 6) {
            if (firstFix) {
                firstFix = false;
                firstTLoc = new Date();
                twoPointsDistance = 0;
                console.log('First Fix assigned: 1');
                firstLat = lat1;
                firstLon = lon1;
                startDB("updateLat&Lon");
            } else {

                anotherTLoc = new Date();
                var timeDiff = (anotherTLoc - firstTLoc) / 1000; //gives the diff in seconds.
                console.log('Time Difference = ' + timeDiff);

                if (timeDiff < 10 && twoPointsDistance > 30) {
                    twoPointsDistance = 0;
                    firstTLoc = anotherTLoc;
                    console.log('We just nulled a point');
                } else {
                    console.log('Hey its less than 30 meter fix and in less than 10 seconds, so we will take that fix');
                }
            }
            count++;
            console.log('count incremented');
        }

        if (count == neededpoints) {
            canBeSaved = true;
            startDB("updateFlightStatus");
        }
        totalDistance = totalDistance + twoPointsDistance;
        if (!metric) $('#totaldistance').html(m2ft(totalDistance));
        else $('#totaldistance').html(totalDistance);
    }
}

//Calculating the AVERAGE speed of the whole flight. *the other instant speed is provided by cordova's geolocation api.

function updateAvgSpeed() {

    if (gpsSpeed != "NaN" && !isNaN(gpsSpeed)) {
        var avgSpeed = gpsSpeed;
    }

    avgSpeed = Math.round(avgSpeed * 3.6);
    if (avgSpeed < 0) avgSpeed = 0;

    if (metric == false && useknots == false) $('#avgspeed').html(kmh2mph(avgSpeed));
    else if (metric == false && useknots) $('#avgspeed').html(kmh2knots(avgSpeed));
    else $('#avgspeed').html(avgSpeed);

}

// Converts numeric degrees to radians
if (typeof (Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

// Getting a formatted String of the current time.
var preFFormat = '';

function formattedCTime(string, time) {

    if (time != '') var currentTime = time;
    else var currentTime = new Date();

    var month = format(currentTime.getMonth() + 1);
    var day = format(currentTime.getDate());
    var year = currentTime.getFullYear();
    var hour = format(currentTime.getHours());
    var minuts = format(currentTime.getMinutes());
    var Seconds = format(currentTime.getSeconds());

    var fDate = hour + "." + minuts + "-" + day + "." + month + "." + year;

    var ajaxFormat = year + '-' + month + '-' + day + ' ' + hour + ':' + minuts + ':' + Seconds;
    var x = '';
    switch (month) {
    case 1:
        x = "Jan";
        break;
    case 2:
        x = "Feb";
        break;
    case 3:
        x = "Mar";
        break;
    case 4:
        x = "Apr";
        break;
    case 5:
        x = "May";
        break;
    case 6:
        x = "Jun";
        break;
    case 7:
        x = "Jul";
        break;
    case 8:
        x = "Aug";
        break;
    case 9:
        x = "Sep";
        break;
    case 10:
        x = "Oct";
        break;
    case 11:
        x = "Nov";
        break;
    case 12:
        x = "Dec";
        break;
    }
    preFFormat = "Flight - " + day + " " + x + " " + year + " at " + hour + ":" + minuts;
    if (string == "namePreFill") return preFFormat;
    else if (string == "STimeAjax") return ajaxFormat;
    else if (string == "ETimeAjax") return ajaxFormat;
    else return fDate;

}

/********************** Step 3: Working on Databases ***************************/

//var flightId = 'F' + formattedCTime('', '');
var syncFilesArray = [];
var repeat = false;
// Main function to create, add, select, basically anything dealing with databases, the "key" string defines its function.

function startDB(string, tableid, colName) {

    var db = window.openDatabase("YalldoDB", "1.0", "YalldoBeta", 4000000);
    db.transaction(populateDB, errorCB, successCB);

    var key = string; //key string which let us choose which sql query we would like to call.
    var table_id = tableid; //the id of the row of any file so we could use it to update the onserver value.

    // Populate the database 

    function populateDB(tx) {

        tx.executeSql('CREATE TABLE IF NOT EXISTS FLIGHTS (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, flightid, fname, desc, sport, timestamp, latitude, longitude, distance, period, timestampstop, status, gpsfilename, ispublic, islogged, onserver)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS FILES (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, flightid, type, fileobject,timestampstart ,timestampstop, totaldistance, onserver)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS SETTINGS (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, units, useknots, notifications, language, lastsport)');

        if (key == "createSettings") {
            tx.executeSql('INSERT INTO SETTINGS( id, units, useknots, notifications, language, lastsport) VALUES ( 1, 1, 0, 2, 1, 1)');
        }

        if (key == "createFlight") {
            //Query to be executed for create a new flight and insert its details to the database.
            tx.executeSql('INSERT INTO FLIGHTS(flightid, fname, desc, sport, timestamp, status, ispublic, islogged, onserver) VALUES ("' + flightId + '", "' + c_Name + '", "' + c_Desc + '", "' + c_Sport + '", "' + formattedCTime("STimeAjax", startOfRecord) + '", "canNotBeSaved" ,0 , 0, 0)');

        }

        if (key == "planFlight") {
            //Query to be executed to plan a new flight and insert its details to the database.
            tx.executeSql('INSERT INTO FLIGHTS(flightid, fname, desc, sport, timestamp, gpsfilename, status, ispublic, islogged, onserver) VALUES ("' + planId + '", "' + planName + '", "' + planDesc + '", "' + planSport + '", "' + planTime + "00:00:00" +'", "' + planGPS + '", "canBeSaved" ,0 , 0, 0)');

        }

        if (key == "addGPSTrack") {

            //Query to be executed for adding the GPS data to the database.
            tx.executeSql('INSERT INTO FILES(flightid,fileobject,timestampStart, timestampstop, totaldistance,onserver,type)VALUES ("' + flightId + '", "' + GPSFileURL + '", "' + startOfRecord + '", 0, 0, 0,"GPSFile")');
            console.log('Database GPS Insertion is Done!');
        }

        if (key == "updateGPSURL") {
            tx.executeSql('UPDATE FILES SET fileobject = ? , timestampstop = ? , totaldistance=? WHERE flightid= ? AND type =?', [GPSFileURL, timeStampNew, totalDistance, flightId, "GPSFile"], done, errorCB);

            function done() {
                console.log('Updating URL is done by the following: File=' + GPSFileURL + ' , timestampStop= ' + timeStampNew + ' totalDistance= ' + totalDistance);
                GPSURLUpdated = true;
            }
        }

        if (key == "updateSetting") {
            tx.executeSql('UPDATE SETTINGS SET "' + colName + '" = ? ', [tableid], updateDone4, errorCB);

            function updateDone4() {
                console.log('Default ' + colName + ' updated!(' + tableid + ')');
            }
        }

        if (key == "updateAllIds") {
            console.log("****update FlightId of the flight & GPS & pictures id's" + tableid + ' the serverId we got =' + colName);
            tx.executeSql('UPDATE FLIGHTS SET flightid = ? , onserver = ? WHERE flightid= ? ', [colName, 1, tableid], done1, errorCB);
            tx.executeSql('UPDATE FILES SET flightid = ? WHERE flightid= ? ', [colName, tableid], done2, errorCB);

            function done1() {
                console.log('Updating the Flight Id is done');
            }

            function done2() {
                console.log('Updating the GPS & Pictures Ids is done');
            }
        }

        if (key == "updateLat&Lon") {
            tx.executeSql('UPDATE FLIGHTS SET latitude = ? , longitude = ? ,gpsfilename= ? WHERE flightid= ? ', [firstLat, firstLon, GPSFileName, flightId], updateDone, errorCB);

            function updateDone() {
                console.log('Updating the Latitude and Longitude is done: lat =' + firstLat + ' Lon= ' + firstLon + " GPS File name is " + GPSFileName);
            }
        }

        if (key == "updateFlightStatus") {
            tx.executeSql('UPDATE FLIGHTS SET status = ? WHERE flightid= ? ', ["canBeSaved", flightId], updateDone3, errorCB);

            function updateDone3() {
                console.log('Flight status updated to "canBeSaved"');
            }
        }

        if (key == "saveFlight") {
            console.log('The flight Id to be looked for is ' + flightId);
            tx.executeSql('UPDATE FLIGHTS SET distance = ? , period = ? , timestampstop = ? , fname = ?,desc = ?, sport = ?, ispublic = ? WHERE flightid= ? ', [totalDistance, totalTime, endOfRecord, preFFormat, c_Desc, c_Sport, c_Priv, flightId], updateDone2, errorCB);

            function updateDone2() {
                console.log('Updating the totalDistance and Period is done: time =' + totalTime + ' distance= ' + totalDistance + preFFormat);
            }
        }

        if (key == "addPicture") {
            //Execute the query to add the picture to the database.
            if (flightId == '') flightId = 'none';

            tx.executeSql('INSERT INTO FILES (flightid,fileobject,timestampstart,onserver,type) VALUES("' + flightId + '", "' + photodata + '", "' + formattedCTime("STimeAjax", startOfRecord) + '", 0,"picture")');

            console.log('** Database Picture Insertion is Done!, with FlightId= ' + flightId + ' & with timestamp ' + formattedCTime("STimeAjax", startOfRecord));
        }

        if (key == "getPictures") {
            var newarray = [];
            tx.executeSql('SELECT * FROM FILES WHERE onserver=? AND flightid = ? AND type = ?', [0, serverFlightId, "picture"], querySuccessx, errorCB);

            function querySuccessx(tx, results) {

                var len = results.rows.length;
                if (len == 0) console.log('All files are synchronized already!');
                else console.log("rows in FILES: " + len);
                for (var i = 0; i < len; i++) {

                    var item = results.rows.item(i);

                    newarray.push(item); //pushing the new object we got from the table after adding the status and type.

                    console.log('File type: ' + item.type + ' - OnServer Status : 0 ' + "flightId:" + item.flightid);
                    syncFilesArray = newarray;

                }
            }
        }

        if (key == "checkFlights") {
            //It scans the database for any flights that has not been synced or received a Server's Flight Id
            tx.executeSql('SELECT * FROM FLIGHTS WHERE onserver = ? AND status = ?', [0, "canBeSaved"], querySuccessF, errorCB);

            function querySuccessF(tx, results) {

                var len = results.rows.length;
                alert('Flights found: ' + len);
                if (len == 0) console.log('All flights are on server!');
                for (var i = 0; i < len; i++) {

                    console.log('this is the name from the dbstart' + results.rows.item(i).flightid + ' & ' + results.rows.item(i).longitude + ' & ' + results.rows.item(i).onserver);
                    AfterRecording("dataRestore", results.rows.item(i));

                }
            }

        }

        if (key == "getSetting") {
            //It scans the database for any flights that has not been synced or received a Server's Flight Id
            tx.executeSql('SELECT * FROM SETTINGS ', [], querySuccessF, errorCB);

            function querySuccessF(tx, results) {

                if (results.rows.length == 0) {
                    startDB('createSettings');
                    console.log('setting up new settings');
                    repeat = true;
                } else {
                    repeat = false;
                    //Defaults: units, useknots, notifications, language, lastsport		1, 0, 2, 1, 1
                    selectedUnits = results.rows.item(0).units;
                    selectedUseknots = results.rows.item(0).useknots;
                    selectedNotifications = results.rows.item(0).notifications;
                    selectedLanguage = results.rows.item(0).language;
                    selectedSport = results.rows.item(0).lastsport;
                    console.log('Settings currently are: ' + selectedUnits + ' & ' + selectedUseknots + ' & ' + selectedNotifications + ' & ' + selectedLanguage + ' & ' + selectedSport);
                }

            }

        }

        if (key == "dropTrace") {
            //This is Executed when the user cancel an already going recording so it drops the pre-created flight, just cleaning the database..

            tx.executeSql('DELETE FROM FLIGHTS WHERE flightid = ? ', [flightId], DquerySuccess, errorCB);
            tx.executeSql('DELETE FROM FILES WHERE flightid = ? ', [flightId], DquerySuccess, errorCB);

            function DquerySuccess(tx, results) {
                console.log('Just dropped the GPS File & FlightId rows from the FILES & FLIGHTS table');

                resetVariables();
            }
        }

        if (key == "setOnServer") {
            if (table_id == "") {
                //It sets the onServer variable in the database to 1 after a successful upload of a file.
                tx.executeSql('UPDATE FILES SET onserver = ? WHERE flightid = ? AND type= ?', [1, serverFlightId, "GPSFile"], querySuccess, errorCB);

                function querySuccess(tx, results) {
                    console.log('GPS Upload is successful and OnServer is set to "1"');
                }
            } else {
                tx.executeSql('UPDATE FILES SET onserver = ? WHERE flightid = ? AND type= ? AND id = ?', [1, serverFlightId, "picture", table_id], querySuccess, errorCB);

                function querySuccess(tx, results) {
                    console.log(' Picture Upload is successful and OnServer is set to "1"');
                }
            }
        }

    }

    // Transaction error callback

    function errorCB(tx, err) {
        console.log("Error processing SQL: " + key + err);
    }

    // Transaction success callback

    function successCB() {
        console.log(key + " success!");

        if (key == "getPictures") uploadAllPic(serverFlightId, "pictures");

        if (key == "getSetting" && repeat == true) {
            startDB('getSetting');
            console.log("Now its repeated");
        }

        if (key == "getSetting" && repeat == false) setUnits();

        if (key == "updateSetting") startDB('getSetting');
    }

}

//*********************** Step 4 - Working with capturing pictures for the flight & Site Info ***********************

var photodata = ''; //variable for holding the data of any picture captured.

//function to start the camera so user could snap a picture.

function photocamera() {
    navigator.camera.getPicture(photocamerasuc, photocameraerr, {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
    });
}

function photocamerasuc(d) {
    photodata = "data:image/jpeg;base64," + d;
    document.getElementById(target + "photo").src = photodata;
    page(target);
    $("#" + target + "photo").attr('width', '50');

    startDB("addPicture");

}

function photocameraerr(d) {
    alert("camera error: " + d);
}


/******************************* Step 5 - Working with Uploading or Syncing: pictures - Gpstracks (files) *****************************************
 *
 *     Note: This function to be called as a last stage of syncing after the flights details has been sent to the server already, even in the case
 *				of just recording a flight on the go, that record would have a unique automatically generated flightId, userId and flightDate so we could
 *				use those values in this function in addition to passing the "kindOfFile" as a GPSFile or a picture
 *
 ***************************************************************************************************************************************************/

//**************** Uploading function **************

function uploadFile(mediafile, userid, flightid, kindoffile, dateoffile, tableid) {

    var ft = new FileTransfer();

    var options = new FileUploadOptions();
    options.fileKey = "file";

    if (kindoffile == "GPSFile") {

        options.mimeType = "text/plain";
        var path = mediafile;
        var fName = mediafile.substr(mediafile.lastIndexOf('/') + 1);;

        console.log(fName + "\n" + kindoffile + "\n" + path + "\n" + mediafile.size + "\n");

    } else {
        var path = mediafile;
        var fName = 'P' + Math.floor((Math.random() * 1000) + 100) + '.jpeg';
        options.mimeType = "image/jpeg";

    }
    options.fileName = fName;

    var params = {};
    params.userId = userid;
    params.kindOfFile = kindoffile;
    params.flightId = flightid;
    params.dateOfFile = dateoffile;

    options.params = params;

    ft.upload(path,
        "http://teachinsquare.com/upload.php", function (result) {
            console.log('Upload success: ' + result.responseCode);
            console.log(result.bytesSent + ' bytes sent');
            //alert('Upload success: ' + result.responseCode +'\n'+ result.response);

            //onserver status here gets changed for the picture of gps file to a value = 1 after the successful upload.

            startDB('setOnServer', tableid);
            console.log('it should be set now on server');

        }, function (error) {
            console.log('Error uploading file ' + path + ': ' + error.code);
            if (error.code == 3) alert('No internet connection found, but no worries files can be uploaded later');
        },
        options);
}

/*************************** This is the Syncing function and does the following ***********************************************
 *
 *		1- Checks for any 'unsent' files on the phone and put them into an array.
 *		2- Uploads all the 'unsent' files found in all the tables of the database that we put in syncFilesarray and then let
 *			the uploadFile function auto-set the onserver variable for us by its internal method startDB('setOnServer', tableid).
 *		3- Null the array to be used later.
 *
 ********************************************************************************************************************************/

function sync() {

    if (internetConnection()) {
        //First Step: checks for any 'unset' files on the phone, then save them all in one array 'syncFilesArray'
        startDB("checkFlights");
    }
}

function uploadAllPic(flight_id, type) {

    console.log('Picture "Upload All" is called & No. of pictures to be uploaded  = ' + syncFilesArray.length);
    var serverFlightId = flight_id;


    if (syncFilesArray.length > 0) {
        //If there're files found to be uploaded..
        for (var i = 0; i < syncFilesArray.length; i++) {

            var item = syncFilesArray[i];
			alert(i);
            ajax("addcomment", {
                content_id: serverFlightId,
                message: "message",
                content_type: "event",
                photo: item.photodata
            }, function (d) {
            	var x = 1;
                showProgressDialog("Picture "+x+"/"+i+" sent successfully.");
                x++;
                //info("picture saved");
                console.log("Picture was sent to server attached to:  " + serverFlightId + " again " + flightId); //both Id's should be the same (just a test)
                console.log(d);
                startDB("setOnServer", item.id);
            });
        }

        //Third Step: Null the array
        syncFilesArray = '';
    }
}

/********************************************************************************************************/
//Internet Connectivity function use the following commented line
//				if(internetConnection()) alert('internet!!!'); else alert('bad'); 
document.addEventListener("deviceready", internetConnection, false);

var interNet = false;

function internetConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.CELL] = 'Cell generic connection';
    states[Connection.NONE] = 'No network connection';

    if ((states[networkState] == "No network connection") || (states[networkState] == "Unknown connection")) interNet = false;
    else interNet = true;
    return interNet;
}

function AfterRecording(key, item, planName, planDesc, planTime, planSport, planPrivacy, planGPS) {
    //Show the Create Flight Page...
    //page('create'); show("backbutton"); hide("plusmenu");

    //Pre Fill the Fields.

    //flightid, name, desc, sport, timestamp, latitude, longitude, distance, period, timestampstop, status, ispublic, islogged, onserver
    //totalDistance, totalTime, endOfRecord, preFFormat, flightId

    if (key == "dataRestore") {

        c_Time = item.timestamp;
        c_Name = item.fname;
        flightId = item.flightid;
        firstLat = item.latitude;
        firstLon = item.longitude;
        c_Desc = item.desc;
        c_Sport = item.sport;
        c_End = item.timestampstop;
        c_Priv = item.ispublic;
        GPSFileName = item.gpsfilename;

        console.log("Restored Data: " + preFFormat + " & " + flightId + " & " + firstLat + " & " + firstLon + " & " + c_Desc + " & " + c_Sport + " & " + c_Time + " & " + c_End + " & " + GPSFileName);

        getServerId(flightId, c_Name, c_Desc, c_Time, firstLat, firstLon, c_Sport, c_End, GPSFileName);
        
        console.log('The Database variables are: ' + c_Name + c_Desc + c_Sport + c_Time);

        resetVariables();
        
    } else if (key == "plan") {

        startDB("planFlight"); //Inserting a new flight with the info planed by the user.

        console.log("Saving the planed flight: " + planId + ' & ' + planName + ' & ' + planDesc + ' & ' + planTime);

        getServerId(planId, planName, planDesc, planTime, 99, 99, planSport, 0, planGPS);


    } else {
    	resetRecordScreen();
    	//hide("backbutton");
    	
        preFFormat = formattedCTime("namePreFill", startOfRecord); //????????????????????????????????

        console.log("This is the StartOfRecord Time " + preFFormat);

        endOfRecord = formattedCTime("ETimeAjax", endOfRecord);

        preFFormat = $('#createname').val();
        c_Time = formattedCTime("STimeAjax", startOfRecord);
        c_Desc = $('#createdesc').val();
        c_Sport = $('#createsport').val();
        c_Priv = $('#createstatus').val();
        c_End = endOfRecord;

        //This stores the totalDistance, period of the flight, the suggested name for the flight, User Discription & Sport & end time of the flight.
        startDB("saveFlight");
        
		showProgressDialog("Saving Flight...");
        console.log("just testing the database insertion:" + "\n :" + endOfRecord + " - total Time= " + totalTime);

        getServerId(flightId, preFFormat, c_Desc, c_Time, firstLat, firstLon, c_Sport, c_End, GPSFileName);
        
        console.log('The Database variables are: ' + c_Name + c_Desc + c_Sport + c_Time);
            
        resetVariables();
    }

}

function getServerId(f_id, f_name, f_desc, f_time, f_lat, f_lon, f_sport, f_end, f_gpsfname) {

    if (internetConnection()) {
    	showProgressDialog("Connecting to server...")
        var tobesent =
            ajax("editevent", {
                id: 0,
                name: f_name,
                description: f_desc,
                start: f_time,
                end: "0000-00-00 00:00:00", //This should be changed to c_End but waiting for backend.
                latitude: f_lat,
                longitude: f_lon,
                sports_id: f_sport
            }, function (d) {


                //Set the New Flight Id from the server
                var obj = JSON.parse(d);
                serverFlightId = obj.id;
                console.log("The Flight Id from the server is " + serverFlightId);

                showProgressDialog("Connection Stablished...");

                AfterReceivingId(f_gpsfname, f_id, serverFlightId);
                console.log("Check this " + d);
                ajax("getevents", {}, function (d) {
                    var o = JSON.parse(d);
                    if (o.error) info("error: " + o.error);
                    //else  //info("flight successfully created");
                   // page('events');
                });
            });

    } else {
        info("No internet connection, your flight will be synced later.");
    }

}

function AfterReceivingId( key, flightId, serverFlightId ) {
    if(key!="noneYet") {
		allCoords = '';
		
		writeGPSData("read");

		//Update the Database "tables" with the new Flight ID we got from the server and set it instead of the old initial one..
		startDB("updateAllIds", flightId, serverFlightId);

		console.log("the stuff to be sent: Flight ID " + serverFlightId + " and the coordinates: " + allCoords);

		//Send the GPS Trace we Recorded to the server then Set its status to ONSERVER = 1

		ajax("savetrace", {
		    id: serverFlightId,
		    gps: allCoords
		}, function (d) {
		    //alert("gps saved");	
		    console.log(d);
		    //Set the GPS Trace File Status to uploaded.
		    startDB("setOnServer");
		    //info("gps saved");
			showProgressDialog("GPS Trace sent successfully...");
			//Gather all the pictures attached to the current flight(id) to send them all.
			startDB("getPictures");
		});

		
		
	} else {
		startDB("updateAllIds", flightId, serverFlightId); 
	}
}

var fSetupSource = ''; //to determine what initiated "create flight" is it a gps record or plan a new flight

function createFlight(key) {

    if (key == "recorded") {
        $("#tr_date").hide();
        $('#createname').attr('value', preFFormat);
        sourcePlanFlight = false;
        page('create');

    } else if (key == "save") {

        if (sourcePlanFlight) {
            //Called after the "Next" of plan a new flight is clicked.
            AfterRecording("plan", null, planName, planDesc, planTime, planSport, planPrivacy, planGPS);

        } else {
            //Called after the "Next" of a Record Session is clicked.

            AfterRecording();
        }
    }
}

/*
	Function to be called at the launch of the app, to check/set the units for the user.
		1- check if there's an inserted settings row or not: 
			a) yes, then get the settings from it.
			b) No, then insert and set default settings into database.
		
		2- Set the new units by calling the function metric.
		
		3- Show the new units all over the fields in the UI.
*/

startDB('getSetting');

function setUnits() {

    console.log("This should be after all database processing is over");
    if (selectedUnits == 1) {
        metric = true;
        //alert("metric");
    } else {
        metric = false;
    }

    if (selectedUseknots == 1) {
        useknots = true;
    } else {
        useknots = false;
    }

    unit(metric);
}

function unit(metric) {

    if (metric) {
        //alert("metric units is set");
        speedname = "km/h";
        distancename = "m";
        temperaturename = "c";

    } else {
        //alert("mperial units is set");
        speedname = "mp/h";
        distancename = "ft";
        temperaturename = "f";
    }

    if (useknots) {
        speedname = "kt";
    }

    $('#s_unit').html(" " + speedname);
    $('#d_unit').html(" " + distancename);
    $('#d_unit2').html(" " + distancename);
    $('#d_unit3').html(" " + distancename);

    $('#settingsunit').val(selectedUnits);
    $('#useknots').val(selectedUseknots);
    $('#settingsnoti').val(selectedNotifications);
    $('#settingslang').val(selectedLanguage);
    $('#createsport').val(selectedSport);

    reloadValues();
}

function optionsHandlers() {
    $('#settingsunit').on('change', function () {
        selectedUnits = this.value;
        startDB('updateSetting', selectedUnits, 'units');
    });

    $('#useknots').on('change', function () {
        selectedUseknots = this.value;
        startDB('updateSetting', selectedUseknots, 'useknots');
    });

    $('#settingsnoti').on('change', function () {
        selectedNotifications = this.value;
        startDB('updateSetting', selectedNotifications, 'notifications');
    });

    $('#settingslang').on('change', function () {
        selectedLanguage = this.value;
        startDB('updateSetting', selectedLanguage, 'language');
    });

    $('#createsport').on('change', function () {
        selectedSport = this.value;
        startDB('updateSetting', selectedSport, 'lastsport');
    });
}

function m2ft(meters) {
    return Math.round(meters * 3.280839895013123);
}

function kmh2mph(speed) {
    return Math.round(speed * 0.621371);
}

function kmh2knots(speed) {
    return Math.round(speed * 0.539956803);
}

function reloadValues() {

    //alert("reloadValues");
    //alert(totalDistance + 'meters');

    if (!metric) {
        $('#maxaltitude').html(m2ft(maxAlt));

        $('#maxaltitude').hide();
        $('#maxaltitude').show();
    } else {
        $('#maxaltitude').html(maxAlt);

        $('#maxaltitude').hide();
        $('#maxaltitude').show();
    }

    if (metric == false && useknots == false) {
        $('#avgspeed').html(kmh2mph(avgSpeed));
    } else if (metric == false && useknots) {
        $('#avgspeed').html(kmh2knots(avgSpeed));
        $('#avgspeed').hide();
        $('#avgspeed').show();
    } else {
        $('#avgspeed').html(avgSpeed);
        $('#avgspeed').hide();
        $('#avgspeed').show();
    }

    if (metric) {
        $('#totaldistance').html(totalDistance);
        //  alert('meters=' + totalDistance);
        $('#totaldistance').hide();
        $('#totaldistance').show();
    } else {
        var y = m2ft(totalDistance);
        $('#totaldistance').html(y);
        //alert('miles=' + y);
        $('#totaldistance').hide();
        $('#totaldistance').show();
    }
}

var planName = '';
var planDesc = '';
var planTime = '';
var planSport = '';
var planPrivacy = '';
    
function planFlight() {

    $("#tr_date").show();

    var planFName = formattedCTime("namePreFill", new Date());

    $('#createname').attr('value', planFName);

    sourcePlanFlight = true;

    planName = $('#createname').val();
    planDesc = $('#createdesc').val();
    planTime = $('#createdate').val(); //Here we should validate the date actually.. for later..
    planSport = $('#createsport').val();
    planPrivacy = $('#createstatus').val();
	
	console.log(planTime + ' & ' + planName + ' & ' + planSport + ' & ' + planPrivacy);
    var t = formattedCTime('', '');
    planId = 'PF' + t; //setting a plan flight id (flightId) with the current time stamp
    planGPS = 'noneYet'; //setting a GPS file name with the current time stamp
}
