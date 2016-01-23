var esriApp = angular.module('esriApp', []);

esriApp.controller('UIController', ['$scope', function($scope) {
    $scope.mapX = 0;
    $scope.mapY = 0;
    $scope.lat = 0;
    $scope.lon = 0;
    $scope.showTooltip = false;
    $scope.showNoteText = false;
    $scope.noteText = '';
    var selectedNote = null;

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
        'esri/tasks/query',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/Color',
        'esri/layers/FeatureLayer',
        'esri/geometry/screenUtils',
        'dojo/domReady!'
    ], function(Map, arcgisUtils, esriConfig, urlUtils, Point, SpatialReference, Draw, Graphic, GeometryService, webMercatorUtils, Query, SimpleMarkerSymbol, SimpleLineSymbol, Color, FeatureLayer, screenUtils) {
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

            var selectionMarker = new SimpleMarkerSymbol();
            var line = new SimpleLineSymbol();
            line.setColor(new Color([56, 168, 0, 1]));
            selectionMarker.setOutline(line);
            selectionMarker.setColor(new Color([255, 255, 255, 1]));
            notesLayer.setSelectionSymbol(selectionMarker);

            notesLayer.on('mouse-over', function(event) {
                $scope.showTooltip = true;
                $('#toolTip').text(event.graphic.attributes.note);
                if (!event.graphic.attributes.note) {
                    $('#toolTip').text('** NO NOTE AVAILABLE **');
                }
                $('#toolTip').css({
                    top: event.screenPoint.y,
                    left: event.screenPoint.x + 20
                });
                $scope.$apply();
            });

            notesLayer.on('mouse-out', function(event) {
                $scope.showTooltip = false;
                $('#toolTip').text('');
                $('#toolTip').css({
                    top: 0,
                    left: 0
                });
                $scope.$apply();
            });

            notesLayer.on('click', function(event) {
                // This DOES NOT work. It selects the point briefly, but then Removes
                // the selection immediately after running the success callback.
                // console.log(event);
                // var query = new Query();
                // query.geometry = event.graphic.geometry;
                // notesLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function(features, selectionMethod) {
                //     console.log('features');
                //     console.log(features);
                //     console.log(notesLayer.getSelectedFeatures());
                //     console.log(notesLayer);
                // },
                // function(err) {
                //     console.log('err');
                //     console.log(err);
                // });

                if (selectedNote) {
                    selectedNote.setSymbol(null);
                }
                selectedNote = event.graphic;
                selectedNote.setSymbol(selectionMarker);
                event.stopPropagation();

                // console.log(event.graphic.symbol);
                // if (!event.graphic.symbol) {
                //     event.graphic.setSymbol(selectionMarker);
                // } else {
                // //if (event.graphic.symbol == selectionMarker) {
                //     event.graphic.setSymbol(null);
                // }
            });
            var newGeometry = null;
            drawToolbar.on("draw-end", function(evt) {
                //$scope.showNoteText = true;
                var screenPoint = screenUtils.toScreenPoint(map.extent, map.width, map.height, evt.geometry);
                $scope.showNoteText = true;
                $('#noteText').css({
                    left: screenPoint.x + 20,
                    top: screenPoint.y
                });
                drawToolbar.deactivate();
                //var newAttributes = lang.mixin({}, selectedTemplate.template.prototype.attributes);
                newGeometry = evt.geometry;
                // notesLayer.applyEdits([newGraphic], null, null);
                $scope.$apply();
            });

             //drawToolbar.activate(Draw.POINT);

            $scope.addNote = function() {
                console.log('adding note');
                // console.log(notesLayer.applyEdits);
                drawToolbar.activate(Draw.POINT);
            };

            $scope.saveNote = function() {
                var newGraphic = new Graphic(newGeometry, null, {ID: '', 'SHAPE_1': 'POLYPOLY', note: $scope.noteText});
                notesLayer.applyEdits([newGraphic], null, null);
                $scope.noteText = '';
                $scope.showNoteText = false;
            };

            $scope.deleteNote = function() {
                console.log('deleting note');
                // console.log(notesLayer.applyEdits);
                if (selectedNote) {
                    notesLayer.applyEdits(null, null, [selectedNote]);
                }

            };

            map.on('click', function(event) {
                if (selectedNote) {
                    selectedNote.setSymbol(null);
                    selectedNote = null;
                }
                console.log('map clicked');
            });

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
