var fs = require('fs');

function testAnalytics(){

    var msperday = 1000*60*60*24;

    var schemas = {

        javascriptFrameworks: {
                                    angular: null,
                                    backbone: null,
                                    react: null,
                                    ember: null,
                                    knockout: null,
                                    aurelia: null,
                                    polymer: null,
                                    vue: null,
                                    mercury: 1, 
                                },

        serverLanguages:        {
                                    node: null,
                                    rails: null,
                                },

    }
 
    var timerange = 7;  
    
    var linearAscent = function(schemaname,hub){
        var results = [];
        for(var i = 0; i<timerange; i++){
            var newAnalytic = {};
            newAnalytic.date = msperday * i; 
            newAnalytic.hub = hub;
            newAnalytic.viewName = schemaname;
            newAnalytic.data = {};
            Object.keys(schemas[schemaname]).reverse().forEach(function(key, index){
                newAnalytic.data[key] = i + index;
            });
            results.push(newAnalytic);
        }
        return results; 
    }

    var linearDescent = function(schemaname, hub){
        var results = [];
        var multiplier = timerange;
        for(var i = 0; i<timerange; i++){
            var newAnalytic = {};
            newAnalytic.date = msperday * i; 
            newAnalytic.hub = hub;
            newAnalytic.viewName = schemaname;
            newAnalytic.data = {};
            Object.keys(schemas[schemaname]).reverse().forEach(function(key, index){
                newAnalytic.data[key] = multiplier + index;
            });
            results.push(newAnalytic);
            //console.log(newAnalytic);
            multiplier--;
        }
        return results; 
    }

    var scatterPlot = function(obj){



    }

    var linearAscentArray = linearAscent('javascriptFrameworks', 'San Francisco');
    var linearDescentArray = linearDescent('javascriptFrameworks','Kansas City');
    var linearAscentArrayBackend = linearAscent('serverLanguages', 'San Francisco');

    var combinedArray = [linearAscentArray, linearDescentArray, linearAscentArrayBackend];
    fs.writeFile('./spec/testAnalytics.json',JSON.stringify(combinedArray),function(err,result){
        if(err){
            console.log('error');
        } else {
            fs.readFile('./spec/testAnalytics.json','utf8',function(err,result){
                var r = JSON.parse(result);
            });
        }
    });
}

testAnalytics();