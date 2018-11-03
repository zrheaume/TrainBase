
// FIRST THINGS FIRST

// Set firebase config properties
var config = {
    apiKey: "AIzaSyDOOt03wntdQ-OkEkxMkAIfPgR7SggeKns",
    authDomain: "trainbase-bdd04.firebaseapp.com",
    databaseURL: "https://trainbase-bdd04.firebaseio.com",
    projectId: "trainbase-bdd04",
    storageBucket: "trainbase-bdd04.appspot.com",
    messagingSenderId: "905603546965"
  };
  firebase.initializeApp(config);

// Set "trainbase" reference to firebase database
var trainbase = firebase.database();

// Create an obejct "tb" short for trainbase
// This will contain the majority of the app's functionality
let tb = {

    // tb.onSched is an array that will be used to hold the most current
    // copy of the firebase train schedule, also be used to store newly added 
    // trains
    onSched : [],

    // tb.add( x )
    // Method to pass parameters of new train into to add it to the database
    // Will push new train to the tb.onSched array and add it to firebase 
    // element "trainSchedule"
    add : function(trainToAdd) {
        tb.onSched.push(trainToAdd);
        let onSchedString = JSON.stringify(tb.onSched);
        trainbase.ref().set({
            trainSchedule : onSchedString
        })
    },

    // We need methods to refresh the schedule display, arrival times and the current time
    refresh : {
        // the refresh.scheduleDisplay() method will clear the table, thentake each element in the  
        // array of trains and add it to the table
        scheduleDisplay : function () {
            console.log("Refreshing schedule");
            $("#train-table").html("");
            tb.refresh.times();
            tb.onSched.forEach( function (currentTrain) {
                console.log("Working...");
                console.log(currentTrain);
                console.log("=-=-=-=-=-=-=-=-=");

                let tempRow = $("<tr>");
                let tempNameDisp = $("<td>");
                tempNameDisp.text(currentTrain.name);
                let tempDestDisp = $("<td>");
                tempDestDisp.text(currentTrain.destination)
                let tempArriDisp = $("<td>");
                tempArriDisp.text(currentTrain.next_arrival);
                let tempFreqDisp = $("<td>");
                tempFreqDisp.text(currentTrain.time_tilNext);

                tempRow.append(tempNameDisp);
                tempRow.append(tempDestDisp);
                tempRow.append(tempArriDisp);
                tempRow.append(tempFreqDisp);

                $("#train-table").append(tempRow);
            });
        },

        // refresh.times() method will be resonsible for updating time components
        times : function ( ) {
            let currentMoment = moment().format("hh:mm");
            $("#current-time").text(currentMoment);
            tb.onSched.forEach( function (currentTrain) {
                let convertedFa = moment(currentTrain.first_arrival, "HH:mm").subtract(1, "years");
                let diffTime = moment().diff(moment(convertedFa), "minutes");
                let tilNext = currentTrain.frequency - (diffTime % currentTrain.frequency);
                currentTrain.time_tilNext = tilNext;
                let nextTime = moment().add(tilNext, "minutes");
                currentTrain.next_arrival = nextTime.format("hh:mm MM/DD");

            });
        },
        automate : {
            period : 30000,
            init : function ( ) {
                intervalID = setInterval(tb.refresh.scheduleDisplay, tb.refresh.automate.period);
            }
        }
    }
}

$(document).ready(function( ){
    let loadMoment = moment();
    let timeOfLoad = loadMoment.format("HH:mm");
    let today = loadMoment.format("MM/DD/YY");
    $("#current-time").text(timeOfLoad);
    $("#current-date").text(today);
    tb.refresh.automate.init();

    $("#submit-train").on("click", function (event) {
        event.preventDefault();
        // name
        let trainNameInput = $("#train-name-input").val();
        let trainDestInput = $("#train-dest-input").val();
        let trainArriInput = $("#train-arri-input").val();
        let trainFreqInput = $("#train-freq-input").val();

        let newTrain = {
            name : trainNameInput,
            destination : trainDestInput,
            first_arrival : trainArriInput,
            frequency : trainFreqInput
        };
        console.log("Train Created")
        console.log(newTrain);
        console.log("=-=-=-=-=-=-=-=-=")

        tb.add(newTrain);
        $("#train-name-input").val("");
        $("#train-dest-input").val("");
        $("#train-arri-input").val("");
        $("#train-freq-input").val("");
    });

    trainbase.ref().on("value", function(snapshot){
        let update = snapshot.val();
        let updateArr = JSON.parse(update.trainSchedule);
        console.log("Train schedule updated")
        console.log(updateArr);
        console.log("=-=-=-=-=-=-=-=-=")

        tb.onSched = updateArr;
        tb.refresh.times();
        tb.refresh.scheduleDisplay();

    })
});