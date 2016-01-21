var esriApp = angular.module('esriApp', []);

esriApp.controller('UIController', ['$scope', function($scope) {
    $scope.mapX = 0;
    $scope.mapY = 0;
    $scope.lat = 0;
    $scope.lon = 0;

    require([
        'esri/map',
        'esri/arcgis/utils',
        'esri/config',
        'esri/urlUtils',
        'esri/geometry/Point',
        'esri/SpatialReference',
        'esri/toolbars/draw',
        'esri/graphic',
        'esri/tasks/GeometryService',
        'esri/geometry/webMercatorUtils',
        'dojo/domReady!'
    ], function(Map, arcgisUtils, esriConfig, urlUtils, Point, SpatialReference, Draw, Graphic, GeometryService, webMercatorUtils) {
        var map = null;



        urlUtils.addProxyRule({
            urlPrefix: 'www.arcgis.com',
            proxyUrl: '/api/esriProxy'
        });
        urlUtils.addProxyRule({
            urlPrefix: 'services5.arcgis.com',
            proxyUrl: '/api/esriProxy'
        });
        urlUtils.addProxyRule({
            urlPrefix: 'tasks.arcgisonline.com',
            proxyUrl: '/api/esriProxy'
        });

        esriConfig.defaults.geometryService = new GeometryService('http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');

        var createMapOptions = {
            mapOptions: {
                center: new Point(-10169947, 4459788, new SpatialReference(102100)),
                zoom: 15
                // ,
                // basemap: "streets"
            }
        }
        arcgisUtils.createMap('4e3f8d8b87d54e589e60eca1f5c770fe', 'mapDiv', createMapOptions).then(function (res) {
            map = res.map;
            // console.log(map.loaded);
            // map.on('load', function(event) {
            //     console.log(event);
            // });
            console.log(map.basemapLayerIds);
            console.log(map.graphicsLayerIds);
            console.log(map.layerIds);

            var drawToolbar = new Draw(map);
            var notesLayer = map.getLayer('notes_7183');

            notesLayer.on('click', function(event) {
                console.log(event);
            });

            drawToolbar.on("draw-end", function(evt) {
                drawToolbar.deactivate();
                //var newAttributes = lang.mixin({}, selectedTemplate.template.prototype.attributes);
                var newGraphic = new Graphic(evt.geometry, null, {ID: 1010, 'SHAPE_1': 'POLYPOLY', note: "THIS IS A NEW NOTE"});
                notesLayer.applyEdits([newGraphic], null, null);
            });

             //drawToolbar.activate(Draw.POINT);

            $scope.addNote = function() {

                console.log('adding note');
                // console.log(notesLayer.applyEdits);
                drawToolbar.activate(Draw.POINT);
            };

            // map.on('click', function(event) {
            //     drawToolbar.
            // });

            map.on('mouse-move', function(event) {
                $scope.mapX = event.mapPoint.x;
                $scope.mapY = event.mapPoint.y;

                var lngLat = webMercatorUtils.xyToLngLat($scope.mapX, $scope.mapY);
                $scope.lat = lngLat[1];
                $scope.lon = lngLat[0];
                $scope.$apply();
                //console.log(map.spatialReference);
                //console.log(map.getZoom());
                //console.log(event);
            });
        });


        // var map = new Map('mapDiv', {
        //     center: [-56.049, 38.485],
        //     zoom: 3,
        //     basemap: "streets"
        // });
    });
}]);
