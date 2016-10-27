var fs = require('fs');

function testAnalytics(){

    var msperday = 1000*60*60*24;

    var frontEndAnalytic = {
        angular: null,
        backbone: null,
        react: null,
        ember: null,
        knockout: null,
        aurelia: null,
        polymer: null,
        vue: null,
        mercury: 1, 
    };

    var timerange = 7;  
    
    var linearAscent = function(schema,hub){
        var results = [];
        for(var i = 0; i<timerange; i++){
            var newAnalytic = {};
            newAnalytic.date = msperday * i; 
            newAnalytic.hub = hub;
            newAnalytic.viewName = 'javascriptFrameworks';
            newAnalytic.data = {};
            Object.keys(schema).reverse().forEach(function(key, index){
                newAnalytic.data[key] = i + index;
            });
            results.push(newAnalytic);
            //console.log(newAnalytic);
        }
        return results; 
    }

    var linearDescent = function(schema, hub){
        var results = [];
        var multiplier = timerange;
        for(var i = 0; i<timerange; i++){
            var newAnalytic = {};
            newAnalytic.date = msperday * i; 
            newAnalytic.hub = hub;
            newAnalytic.viewName = 'javascriptFrameworks';
            newAnalytic.data = {};
            Object.keys(schema).reverse().forEach(function(key, index){
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

    var linearAscentArray = linearAscent(frontEndAnalytic, 'San Francisco');
    var linearDescentArray = linearDescent(frontEndAnalytic,'Kansas City');
    var combinedArray = [linearAscentArray, linearDescentArray];
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