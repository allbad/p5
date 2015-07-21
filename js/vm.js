'use strict';

ko.bindingHandlers.addressAutocomplete = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();

        var options = {
            types: ['geocode'],
            componentRestrictions: {
                country: "uk"
            }
        };
        ko.utils.extend(options, allBindings.autocompleteOptions);

        var autocomplete = new google.maps.places.Autocomplete(element, options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var result = autocomplete.getPlace();
            if (!result.geometry) {
                error("Can't find location");
                return;
            }
            if (result.geometry.viewport) {
                map.fitbounds(result.geometry.viewport);
            } else {
                map.setCenter(result.geometry.location);
                map.setZoom(16);
            }
            value(result.geometry.location);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        ko.bindingHandlers.value.update(element, valueAccessor);

    }
};

ko.bindingHandlers.typeahead = {
    init: function (element, valueAccessor, bindingAccessor) {
        var substringMatcher = function (strs) {
            return function findMatches(q, cb) {
                var matches, substrRegex;

                // an array that will be populated with substring matches
                matches = [];

                // regex used to determine if a string contains the substring `q`
                substrRegex = new RegExp(q, 'i');

                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                $.each(strs, function (i, str) {
                    console.log(str);
                    if (substrRegex.test(str)) {
                        // the typeahead jQuery plugin expects suggestions to a
                        // JavaScript object, refer to typeahead docs for more info
                        matches.push(str);
                    }
                });

                cb(matches);
            };
        };
        var $e = $(element),
            options = valueAccessor();

        // passing in `null` for the `options` arguments will result in the default
        // options being used
        $e.typeahead({
            highlight: true,
            minLength: 2
        }, {
            source: substringMatcher(options.source())
        }).on('typeahead:selected', function (el, datum) {
            console.dir(datum);
        }).on('typeahead:autocompleted', function (el, datum) {
            console.dir(datum);
        });

    }
};

var MyModel = function() {
	var self = this;

	self.location = ko.observable("Victoria Park Rd, London E9 7HD, UK");
    
    self.businessList = ko.observableArray([]);
    
    self.filter = ko.observable('');
    
    self.filterBusinessList = ko.dependentObservable(function(){
        var filter = self.filter().toLowerCase();
        if(!filter){
            return self.businessList();
        } else {
            return ko.utils.arrayFilter(self.businessList(), function(business){
                return business.name.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0;
            });
        }
    });

	initializeMap();
 
	self.newLocation = ko.computed(function() {
		if (self.location() != '') {
            deleteMarkers();
			requestLocation(self.location());
		}
	});

	self.businessListItem = function(clickedBusiness) {
		var clickedBusinessName = clickedBusiness.name;
		for (var i = 0; i < mapMarkers.length; i ++) {
			if (clickedBusinessName === mapMarkers[i].title) {
				google.maps.event.trigger(mapMarkers[i], 'click');
				map.panTo(mapMarkers[i].position);
				map.setZoom(17);
			}
		}
	};
    
    // get location data using Google Map Place Service
	function requestLocation(location) {
        var request = {
			query: location
		};
		var service = new google.maps.places.PlacesService(map);
		service.textSearch(request, locationCallback);
	}

	// this is the callback function from calling the Place Service
	function locationCallback(location, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			getNeighborhoodInformation(location[0]);
		} else {
			console.log("Can't find valid location in Google Maps");
		}
	}

	function getNeighborhoodInformation(locationDetail) {
		//var lat = locationDetail.geometry.location.lat();
		//var lng = locationDetail.geometry.location.lng();
		//var name  = locationDetail.name;
		//console.log(locationDetail.formatted_address);
        var newLocation = locationDetail.formatted_address;

		var auth = {

				consumerKey : "9jEzbDg-39uVCnlMZmh5Lg",
				consumerSecret : "NYyE61bAsnrM35pe2HjjnKuw6jQ",
				accessToken : "oTvzMg8BSJwUO7n7Zmi-Euf-t7igOUVw",

				accessTokenSecret : "q_mrmjbkSmtkYlFu9RBXqBLUe_k",
				serviceProvider : {
					signatureMethod : "HMAC-SHA1"
				}
			};
			var accessor = {
				consumerSecret : auth.consumerSecret,
				tokenSecret : auth.accessTokenSecret
			};
			var parameters = [];
			parameters.push(['callback', 'cb']);
			parameters.push(['location', newLocation]);
			parameters.push(['radius_filter', 650]);
			parameters.push(['oauth_consumer_key', auth.consumerKey]);
			parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
			parameters.push(['oauth_token', auth.accessToken]);
			parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
			var message = {
				'action' : 'http://api.yelp.com/v2/search',
				'method' : 'GET',
				'parameters' : parameters
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);

			var parameterMap = OAuth.getParameterMap(message.parameters);
			parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
			
			//Ajax query
            $.ajax({
				'url' : message.action,
				'data' : parameterMap,
				'cache' : true,
				'dataType' : 'jsonp',
				'jsonpCallback' : 'cb',
				'success' : function(data, textStats, XMLHttpRequest) {
                    self.businessList(data.businesses);
                    for (var i in self.businessList()) {
                        var business = self.businessList()[i];
                        var loc = business.location.coordinate
                        var position = new google.maps.LatLng(loc.latitude, loc.longitude);
                        createMarker(business,position);
                    };
                }
            }); // end of ajax query
    }
    
}

$(function() {
	ko.applyBindings(new MyModel());
});
