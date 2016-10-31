
(function(){
    
    var Typey = function(){

        this.types = { };

        this.schema = function(name,newschema){
            this.types[name] = newschema;
        }

        this.number = function(target){
            return typeof target === 'number';
        }

        this.array = function(schema){
            return this._array.bind(this,schema);
        }

        this.object = function(schema){
            return this._object.bind(this,schema);
        }

        this.Array = function(target){
            return Array.isArray(target);
        }

        this.Object = function(target){
            return (!Array.isArray(target) && typeof target === 'object');
        }

        this.String = function(target){
            return typeof target === 'string';
        }

        this.Number = function(target){
            return typeof target === 'number';
        }

        this._object = function(schema,input){
            if(!this.Object(input)){
                return false;
            }
            return this.objectParse(schema,input);
        }

        this._array = function(schema,input){
            if(!this.Array(input)){
                return false;
            }
            return this.objectParse(schema,input);
        }

        this.objectParse = function(schema,input){
            var schemaKeys = Object.keys(schema);

            return schemaKeys.every(function(schemaKey,index){
              var inputValue = input[schemaKey];

              if(schemaKey === '*'){
                  return Object.keys(input).some(function(inputKey){
                      return schema[schemaKey].call(this,input[inputKey]); 
                  });
              }
              else if(!inputValue){
                  return false;
              } else {
                  if(typeof schema[schemaKey] === 'function'){
                      return schema[schemaKey].call(this,inputValue); 
                  } else {
                      return schema[schemaKey] === inputValue;
                  }
                  
              }
            });
        }

        this.deepMatch = function(type, target){
            //return (check.all(check.map(target,this.types[type]))) === true;
        }

        this.match = function(input, schema){
            return this.types[schema].call(this,input); 
        }
    }

    T = new Typey();

})()

// T.schema('array',
//     T.array({
//             2: T.number,
//     })
// );

// T.schema('nestedArray',
//     T.array({
//             '*': T.array({
//                 0: 42,
//                 1: 43
//             }),
//             1: T.object({
//                 name: 'icecream',
//                 description: T.object({
//                     awesome: true,
//                 })
//             })
//     })
// );

T.schema('chartOptions',
    T.object({
        series: T.Array,
        dates: T.Array,
        view: T.String,
        hub: T.String,
    })
);

//var test = {series: [],dates: [],view:'x', hub:'x'};
//console.log(T.match(test,'chartOptions'));
//console.log(T.match(test,'nestedArray'));
