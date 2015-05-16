var viewModel = function() {
	var self = this;
	var map;
	var lauriston = new google.maps.LatLng(51.5380286, -0.0449686);
	var startLocation = lauriston;

	self.location = ko.observable(startLocation);

	initializeMap();

	self.topPicks = ko.observableArray([]);

	self.newLocation = ko.computed(function() {
		if (self.location() != '') {
			requestLocation(self.location());
		}
	});

	function initializeMap() {
		var mapOptions = {
			zoom: 17,
			center: lauriston
		};

		map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
	}

	// get location data using Google Map Place Service
	function requestLocation(location) {
		var request = {
			query: location
		};
		service = new google.maps.places.PlacesService(map);
		service.textSearch(request, locationCallback);
	}

	// this is the callback function from calling the Place Service
	function locationCallback(location, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			getNeighborhoodInformation(location[0]);
			console.log("value of location:" + location[0]);
		} else {
			console.log("Invalid location, not found in Google Maps");
		}
	}

	function getNeighborhoodInformation(locationDetail) {
		var lat = locationDetail.geometry.location.lat();
		var lng = locationDetail.geometry.location.lng();
		var name  = locationDetail.name;
		newLocation = new google.maps.LatLng(lat,lng);
		map.setCenter(newLocation);
		console.log("Lat and long for  " + name + " : " + lat + "**" + lng);

		var auth = {
				//
				// Update with your auth tokens.
				//
				consumerKey : "9jEzbDg-39uVCnlMZmh5Lg",
				consumerSecret : "NYyE61bAsnrM35pe2HjjnKuw6jQ",
				accessToken : "oTvzMg8BSJwUO7n7Zmi-Euf-t7igOUVw",
				// This example is a proof of concept, for how to use the Yelp v2 API with javascript.
				// You wouldn't actually want to expose your access token secret like this in a real application.
				accessTokenSecret : "q_mrmjbkSmtkYlFu9RBXqBLUe_k",
				serviceProvider : {
					signatureMethod : "HMAC-SHA1"
				}
			};
			var accessor = {
				consumerSecret : auth.consumerSecret,
				tokenSecret : auth.accessTokenSecret
			};
			parameters = [];
			parameters.push(['callback', 'cb']);
			parameters.push(['oauth_consumer_key', auth.consumerKey]);
			parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
			parameters.push(['oauth_token', auth.accessToken]);
			parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
			var message = {
				'action' : 'http://api.yelp.com/v2/search/?location=E9 7JN&sort=2&limit=20&radius_filter=2500&cc=GB',
				'method' : 'GET',
				'parameters' : parameters
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			var parameterMap = OAuth.getParameterMap(message.parameters);
			parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
			console.log(parameterMap);
			$.ajax({
				'url' : message.action,
				'data' : parameterMap,
				'cache' : true,
				'dataType' : 'jsonp',
				'jsonpCallback' : 'cb',
				'success' : function(data, textStats, XMLHttpRequest) {
					$.each(data.businesses, function(i,item){
						console.log(item.name + item.url)
					});
				}
			});
	}

}

$(function() {
	ko.applyBindings(new viewModel());
});