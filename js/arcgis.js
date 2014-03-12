var map, geocoder, homeButton, hExtent;

      require(["esri/map","esri/dijit/Geocoder","esri/tasks/geometry","esri/geometry/Extent","esri/SpatialReference","esri/dijit/HomeButton", "dojo/domReady!"], 
      function(Map, Geocoder,Geometry, Extent,SpatialReference,HomeButton) {
         
	function mapReady(){
		map = new Map("map", {
			basemap: "topo",
          	center: [-98.585422,39.827796], // long, lat
          	zoom: 5,
          	sliderStyle: "small",
          	spatialReference: { wkid:4326 }
		});
		
		var locator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
		
		dojo.connect(map,"onClick",function(evt){
			locator.locationToAddress(evt.mapPoint,100);
		});
				
		geocoder = new Geocoder({map: map}, "search");
        geocoder.startup();
        geocoder.on("select",showLocation);
      	
      	var home = new HomeButton({map:map},"HomeButton");
      	home.startup();
      	
      	if(navigator.geolocation){
      		navigator.geolocation.getCurrentPosition(function(position){
      			var locator = new esri.tasks.Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
				var cP = new esri.geometry.Point(position.coords);
				console.log(cP.x-.1);
				hExtent = new Extent(cP.x-.1,cP.y-.1,cP.x+.1,cP.y+.1, new SpatialReference({ wkid:4326 }));
				hExtent.centerAt(cP);
				home.extent = hExtent;	
      		});
		} 
		addLayers();
		}
		
		function addLayers(){
		var wwLyr = new esri.layers.ArcGISDynamicMapServiceLayer("http://gis.srh.noaa.gov/arcgis/rest/services/watchwarn/MapServer");
        map.addLayer(wwLyr);
        
		var radarLyr = new esri.layers.ArcGISDynamicMapServiceLayer("http://gis.srh.noaa.gov/arcgis/rest/services/Radar_warnings/MapServer");
		map.addLayer(radarLyr);

        var wxLyr  = new esri.layers.ArcGISDynamicMapServiceLayer("http://gis.srh.noaa.gov/arcgis/rest/services/wxmap/MapServer");
		map.addLayer(wxLyr);

		var resizeTimer;
    	dojo.connect(map, 'onLoad', function(theMap) {
      	dojo.connect(dijit.byId('map'), 'resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
          map.resize();
          map.reposition();
         }, 500);
        });
       });
		}
		
		locator.on("location-to-address-complete", function(evt) {
          if (evt.address.address) {
          	alert(evt.address.address);
          }
       });
		
		function showLocation(evt){
			map.graphics.clear();
			console.log(evt.result.name);
			var searchLoc = evt.result.name.split(',');
			$.get(
				"http://api.openweathermap.org/data/2.5/find?mode=json&",//?q=fairfax,va&units=imperial",
				{q:searchLoc[0]+","+searchLoc[1],units:"imperial"},
				function(data) {
					console.log(data.list[0]);
					var wxData = data.list[0];
					alert(wxData.name);
					}
			)
		}
	
		        
        $(document).ready(function(){mapReady();})
        
      });