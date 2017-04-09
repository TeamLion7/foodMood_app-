// GLOBAL VARIABLES
// =====================================================================================
var userLocation;
var cuisineChosen;
var businessInfo = {
  businessId: [],
  businessImages: [],
  businessAddress: []
};
var imageCount;
// FUNCTIONS
// =====================================================================================
// Opening screen of app - asks user to input their location
function homeScreen() {
  var openingGreeting = $("<div>");
  openingGreeting.html("<h1 id ='opening-greeting'> What are you in the <span id='mood-text2'><i> mood </i></span> for?</h1>");
  var locationForm = $("<form>");
  locationForm.attr("id", "location-form");
  locationForm.html("<input class='form-control' id='user-location' type='text' name='user-location' placeholder='Enter your address to get started!'/>");
  var homeScreenSubmit = $("<button>");
  homeScreenSubmit.attr("class", "btn btn-default");
  homeScreenSubmit.attr("type", "submit");
  homeScreenSubmit.attr("id", "home-screen-submit");
  homeScreenSubmit.html("Submit");
  $("#main-section").append(locationForm);
  $("#main-section").append(openingGreeting);
  $("#location-form").append(homeScreenSubmit);
}
// Screen opened after the user inputs their location, lists cuisines types for the user to
// choose from
function openScreen() {
  var cuisineType = $("<div class='cuisine-type'>");
  cuisineType.html("<h1 class='cuisine-type'> What type of cuisine? </h1>");
  $("#main-section").append(cuisineType);
  var foodTypes = ["Italian", "Chinese", "Mediterranean", "Mexican", "Surprise Me"];
  var counter = 1;
  for(var i = 0; i < foodTypes.length; i++) {
    // var foodDiv = $("<div>");
    // foodDiv.attr("class", "radio");
    // foodDiv.attr("id", "food-div" + counter);
    //
    // $(".cuisine-type").append(foodDiv);


    var foodList = $("<label>");
    foodList.attr("class", "food-list radio");
    foodList.attr("id", "food-list" + counter);
    foodList.html("<input value=" + foodTypes[i] + " " + "type='radio' name='optradio' class='food-value'>" + foodTypes[i]);
    $("#cuisine-header").append(foodList);
    counter++;
  }
  var getStarted = $("<p>");
  getStarted.attr("id", "get-started");
  getStarted.html("<a id='get-started-text'>Submit</a>");
  $("#cuisine-header").append(getStarted);
}
// Pulls photos from the Yelp API based on the user's location and desired cuisine type
// The photos are then stored in the businessInfos array
function yelpSearch() {
  var queryURL = 'https://api.yelp.com/v2/search';
  var auth= {
    consumerKey: 'auktxeLEVeqlzAMSmT6CzQ',
    consumerSecret: 'kGoz9Jmvzxwuu3FiTvyhgbkRkaI',
    accessToken: 'JCT1veuw5aGAVPpGKeHyEqY-m4b1Om5k',
    accessTokenSecret: 'B5fgXIsqZ--6_cTGZb356yPiiSc',
    serviceProvider: {
      signatureMethod: "HMAC-SHA1"
    }
  };
  var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
  };
  var parameters = [];
    parameters.push(['term', cuisineChosen]);
    parameters.push(['location', userLocation]);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
    parameters.push(['callback', 'cb']);
  var message = {
    'action': 'https://api.yelp.com/v2/search',
    'method': 'GET',
    'parameters': parameters
  };
  // console.log(message.action);
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
  // console.log(parameterMap);
  $.ajax({
    'url' : message.action,
    'data' : parameterMap,
    'dataType' : 'jsonp',
    // 'timeout': '1000',
    'cache': true
  }).done(function(data) {
      console.log(data);
      var businessId = [];
      for (var i = 0; i < 10; i++) {
        var result = data.businesses[i].id;
        // var result2 = result.replace( /\-\d+$/, "");
        businessId.push(result);
        console.log(businessId);
    }
    var counter = 1;
    for (i = 0; i < businessId.length; i++){
      var parameters2 = [];
        parameters2.push(['oauth_consumer_key', auth.consumerKey]);
        parameters2.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters2.push(['oauth_token', auth.accessToken]);
        parameters2.push(['oauth_signature_method', 'HMAC-SHA1']);
        parameters2.push(['callback', 'cb']);
      var message2 = {
        'action': 'https://api.yelp.com/v2/business/' + businessId[i],
        'method': 'GET',
        'parameters': parameters2
      };
      OAuth.setTimestampAndNonce(message2);
      OAuth.SignatureMethod.sign(message2, accessor);
      var parameterMap2 = OAuth.getParameterMap(message2.parameters);
      parameterMap2.oauth_signature =
      OAuth.percentEncode(parameterMap2.oauth_signature);
        $.ajax({
          'url': message2.action,
          'data': parameterMap2,
          'dataType' : 'jsonp',
          'timeout': '1000',
          'cache': true
        }).done(function(response) {
          // need to store image value and replace "ms" in jpg to change with "l" or "o"
          var businessId = response.id;
          var customerImage = response.image_url;
          var customerImageL = customerImage.replace(/[^\/]+$/,'l.jpg');
          var yelpAddress = response.location.address;
          businessInfo.businessId.push(businessId);
          businessInfo.businessImages.push(customerImageL);
          businessInfo.businessAddress.push(yelpAddress);
          console.log (businessInfo);
          console.log(response.menu_provider);
          counter++;
        }).fail(function(jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
          console.log("text status: + " + textStatus);
        });
      }
      }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log('error[' + errorThrown + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
  });
}
// Displays a photo of a restuarant's food from the businessInfos array along with like &
// dislike buttons
function showPhoto() {
  $("#main-section").empty();
  var foodImagesDiv = $("<div>");
  foodImagesDiv.attr("id", "food-images");
  $("#main-section").append(foodImagesDiv);
  imageCount = 0;
  var foodImage = $("<img>");
  foodImage.attr("id", "food-img");
  foodImage.attr("class", "well well-lg");
  foodImage.attr("src", businessInfo.businessImages[imageCount]);
  foodImage.css({
    'width': '400px',
    'height': '400px'
  });
  $("#food-images").append(foodImage);
  console.log(businessInfo.businessAddress[imageCount]);
  // Creating like/dislike "buttons" as images with Bootstrap img-rounded class
  // Need to add on-click event listener and cursor hover event
  var buttonsDiv = $("<div>");
  buttonsDiv.attr("id", "buttons-div");
  imageCount = 0;
  // Creating like & dislike "buttons" as images with Bootstrap img-rounded class
  // **Need to add on-click event listener for both buttons**
  var dislikeButton = $("<img>");
  dislikeButton.addClass("img-rounded");
  dislikeButton.attr("id", "dislike-btn");
  dislikeButton.attr("src", "assets/images/dislike-button3.png");
  buttonsDiv.append(dislikeButton);
  var likeButton = $("<img>");
  likeButton.addClass("img-rounded");
  likeButton.attr("id", "like-btn");
  likeButton.attr("src", "assets/images/like-button2.png");
  buttonsDiv.append(likeButton);
  $("#main-section").append(buttonsDiv);
}
function nextPhoto() {
  imageCount++;
  if (imageCount >= businessInfo.businessImages.length) {
    imageCount = 0;
  }
  else {
    $("#food-images").empty();
    var foodImage = $("<img>");
    foodImage.attr("src", businessInfo.businessImages[imageCount]);
    $("#food-images").append(foodImage);
    console.log(businessInfo.businessAddress[imageCount]);
  }
}
function lovePhoto() {
  $("#like-btn").hide();
  $("#dislike-btn").hide();
  $("#food-images").hide();
  console.log('test');

  lovePhotoDiv = $("<div>");
  lovePhotoDiv.attr("id", "love-photo");

  var yelpInfoDiv = $("<div>");
  yelpInfoDiv.attr("class", "yelp-info-div");


  var businessDisplay = $("<h1>").html(businessInfo.businessName[imageCount]);
  var ratingImage = $("<img>");
  ratingImage.attr("src", businessInfo.businessRating[imageCount]);
  ratingImage.attr("alt", "Yelp Rating");
  var yelpLogo2 = $("<img>");
  // Need to link Yelp page!!!! //
  yelpLogo2.attr("src", "assets/images/Yelp_trademark_RGB_outline.png");
  yelpLogo2.attr("alt", "Yelp Logo");
  yelpLogo2.attr("id", "yelp-logo-2");
  var ratingDisplay = $("<h2>");
  ratingDisplay.append(ratingImage);
  ratingDisplay.append(yelpLogo2);
  var reviewCount = businessInfo.businessReviewCount[imageCount];
  var reviewCountDisplay = $("<h3>").html("Based on " + reviewCount + " reviews");

  yelpInfoDiv.append(businessDisplay);
  yelpInfoDiv.append(ratingDisplay);
  yelpInfoDiv.append(reviewCountDisplay);
  lovePhotoDiv.append(yelpInfoDiv);

  getDirections();
}
// Uses Google Maps Embed API to display directions from the user's current location
// to the desired restaurant
function getDirections() {
  var apiKey = "AIzaSyDUxezpr4WRRo7HEPE-HgmQ4WYCexWVdQs";
  var origin = userLocation;
  var destination = businessInfo.businessAddress[imageCount];
  // To be replaced with actual restaurant address //
  var queryURL = "https://www.google.com/maps/embed/v1/directions?key=" + apiKey +
    "&origin=" + origin + "&destination=" + destination;
  var mapDisplay = $("<iframe>");
  mapDisplay.attr("class", "well well-lg");
  // added Id to allow for positioning of iframe
  mapDisplay.attr("id", "googleMaps");
  mapDisplay.attr("src", queryURL);
  mapDisplay.attr("width", "600");
  mapDisplay.attr("height", "450");
  mapDisplay.attr("frameborder", "0");
  mapDisplay.attr("style", "border:0");
  $("#main-section").append(mapDisplay);
}
// MAIN PROCESS
// ==========================================================================================
// Open the home screen immediately
homeScreen();
// Click event handler for the home-screen-submit button, assigns the user's location and
// desired cuisine type to variables to be used in the yelpSearch function, then executes
// the openScreen function
$(document).on("click", "#home-screen-submit", function(event) {
  event.preventDefault();
  userLocation = $("#user-location").val().trim();
  validation(userLocation);
  $("#user-location").val("");
  console.log(userLocation);
  $("#main-section").empty();
  openScreen();
});
// After the user chooses a cuisine type and clicks the get started button, the yelpSearch
// function is executed without reloading the page
$(document).one("click", "#get-started", function(event) {
  event.preventDefault();
  cuisineChosen = $('input[name=optradio]:checked').val();
  console.log(cuisineChosen);
  yelpSearch();
  $(document).ajaxStop(function() {
    showPhoto();
  });
  // timeId = setTimeout(showPhoto, 1500);
});
// If the user clicks the like button execute the ??? function
$(document).on("click", "#like-btn", lovePhoto);
  // Execute function for showing yelp restaurant info and google maps directions
// // If the user clicks the dislike button, execute the nextPhoto function
// $(document).on("click”, "#dislike-btn”, nextPhoto);
$(document).on("click","#dislike-btn", nextPhoto);



function validation(userLocation) {

     

   if (userLocation.length === 5) {
        for( var i = 0; i < 5; i++) {
          if (userLocation.charCodeAt(i) >= 48 && userLocation.charCodeAt(i) <= 57) { 
            console.log("it is a zip code");
          
        }// end if
        else if ((userLocation.charCodeAt(i) >= 65 && userLocation.charCodeAt(i) <= 90) || (userLocation.charCodeAt(i) >= 97 && userLocation.charCodeAt(i) <= 121) ){

          console.log("It is a city");

        } // end else of

        else {
          console.log("it is not a zip code or a city");
          break;
        }// end else
        
        }//end for

     
    }// end if

}// end function

 

      