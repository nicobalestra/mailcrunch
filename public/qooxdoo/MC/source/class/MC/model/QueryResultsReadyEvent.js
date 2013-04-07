qx.Class.define("MC.model.QueryResultsReadyEvent", {
  
  extend: qx.event.type.Event,
  construct: function(){
    this.__value = null;
  },
  members: {
    init: function(results){
      this.base(arguments);
      this.__value = results;
      
      return this;
    },
    
    getResults: function(){
      return this.__value;
    },
    getJsonResults: function(){
    var obj = qx.lang.Json.parse(this.__value);
    return obj;
    }
      
  }
})