var viewModel = function() {
	var self = this;
	var map;
	var lauriston = new google.maps.LatLng(51.5380286, -0.0449686);
	var startLocation = lauriston;
	var iconBase = "img/";
	var mapMarkers = [];
	var infoWindow;

	self.location = ko.observable(startLocation);

	initializeMap();

	self.yelpSelect = ko.observableArray([]);

	self.newLocation = ko.computed(function() {
		if (self.location() != '') {
			requestLocation(self.location());
		}
	});

	self.clickYelpSpot = function(clickedSpot) {
		var clickedSpotName = clickedSpot.name;
		console.log("I was clicked!!" + clickedSpotName);
		console.log(mapMarkers[i]);
		for (var i = 0; i < mapMarkers.length; i ++) {
			if (clickedSpotName === mapMarkers[i].title) {
				console.log("I was clicked!!" + clickedSpotName);
				google.maps.event.trigger(mapMarkers[i], 'click');
				map.panTo(mapMarkers[i].position);
				map.setZoom(15);
			}
		}
	};

	function initializeMap() {
		var mapOptions = {
			zoom: 17,
			center: lauriston,
			zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.DEFAULT,
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            disableDoubleClickZoom: true,
            mapTypeControl: false,
            scaleControl: true,
            scrollwheel: true,
            panControl: false,
            streetViewControl: false,
            draggable : true,
            overviewMapControl: true,
            overviewMapControlOptions: {
                opened: false,
            },
			styles: [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}],
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
				'action' : 'http://api.yelp.com/v2/search/?location=E9 7JN&sort=2&limit=20&radius_filter=650&cc=GB',
				'method' : 'GET',
				'parameters' : parameters
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			var parameterMap = OAuth.getParameterMap(message.parameters);
			parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
			$.ajax({
				'url' : message.action,
				'data' : parameterMap,
				'cache' : true,
				'dataType' : 'jsonp',
				'jsonpCallback' : 'cb',
				'success' : function(data, textStats, XMLHttpRequest) {
					self.yelpSelect(data.businesses);
						for (var i in self.yelpSelect()) {
							/*console.log(self.yelpSelect()[i].name);*/
							var position = new google.maps.LatLng(self.yelpSelect()[i].location.coordinate.latitude, 
                                               self.yelpSelect()[i].location.coordinate.longitude);
							createMarker(self.yelpSelect()[i],position);
						};
					}
				});
		}

	function createMarker(selection, position) {
		var name = selection.name;
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: name,
			icon: iconBase + '32px-Yelp.png'
		});
	}

}

$(function() {
	ko.applyBindings(new viewModel());
});