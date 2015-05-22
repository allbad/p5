var viewModel = function() {
	var self = this;
	var map;
	var lauriston = new google.maps.LatLng(51.5380286, -0.0449686);
	var startLocation = lauriston;
	var iconBase = "img/";
	var mapMarkers = [];
	var infowindow;
	var mapStyles = {};

	mapStyles.regular = [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}];
	mapStyles.midnight = [
	{
		stylers: [
	      { saturation: -100 }
	    ]
	  },{
	    elementType: "labels",
	    stylers: [
	      { visibility: "off" }
	    ]
	  },{
	    featureType: "poi",
	    stylers: [
	      { visibility: "off" }
	    ]
	  },{
	    stylers: [
	      { invert_lightness: true }
	    ]
	  },{
	  }
	];

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
		for (var i = 0; i < mapMarkers.length; i ++) {
			if (clickedSpotName === mapMarkers[i].title) {
				google.maps.event.trigger(mapMarkers[i], 'click');
				map.panTo(mapMarkers[i].position);
				map.setZoom(18);
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
			/*styles: [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}],
        */};

		map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

		map.setOptions({styles: mapStyles.regular});

		infowindow = new google.maps.InfoWindow();
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
		var snippet = selection.snippet_text;
		var category = selection.categories[0][0];
		var image = selection.image_url;
		var address = selection.location.display_address;
		var phone = selection.display_phone;
		url = selection.url;
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: name,
			icon: iconBase + 'yelp-icon32.png'
		});
		mapMarkers.push(marker);

		var contentString = '<div id="iw-container">' +
                    '<div class="iw-title">' + name + '</div>' +
                    '<div class="iw-content">' +
                      '<div class="iw-subTitle">' + category + '</div>' +
                      '<img src="'+ image + '" alt="' + name + '" height="115" width="83">' +
                      '<p>' + snippet + '<span><a href="' + url + '"> more</a></span></p>' +
                    '</div>' +
                    '<div class="iw-bottom-gradient"></div>' +
                  '</div>';
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(contentString);
			infowindow.open(map, marker);
		});

		google.maps.event.addListener(map, 'click', function() {
			infowindow.close();
		});

		google.maps.event.addListener(infowindow, 'domready', function() {

	    // Reference to the DIV that wraps the bottom of infowindow
	    var iwOuter = $('.gm-style-iw');

	    /* Since this div is in a position prior to .gm-div style-iw.
	     * We use jQuery and create a iwBackground variable,
	     * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
	    */
	    var iwBackground = iwOuter.prev();

	    // Removes background shadow DIV
	    iwBackground.children(':nth-child(2)').css({'display' : 'none'});

	    // Removes white background DIV
	    iwBackground.children(':nth-child(4)').css({'display' : 'none'});

	    // Moves the infowindow 115px to the right.
	    iwOuter.parent().parent().css({left: '115px'});

	    // Moves the shadow of the arrow 76px to the left margin.
	    iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

	    // Moves the arrow 76px to the left margin.
	    iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

	    // Changes the desired tail shadow color.
	    iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(196, 18, 0, 0.6) 0px 1px 6px', 'z-index' : '1'});

	    // Reference to the div that groups the close button elements.
	    var iwCloseBtn = iwOuter.next();

	    // Apply the desired effect to the close button
	    iwCloseBtn.css({opacity: '1', right: '54px', top: '18px', 'border-radius': '10px'});

	    // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
	    if($('.iw-content').height() < 140){
	      $('.iw-bottom-gradient').css({display: 'none'});
	    }

	    // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
	    iwCloseBtn.mouseout(function(){
	      $(this).css({opacity: '1'});
	    });
	  });
	}

}

$(function() {
	ko.applyBindings(new viewModel());
});