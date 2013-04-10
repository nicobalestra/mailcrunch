qx.Class.define("MC.model.Query", {
  extend: qx.core.Object,
  
  events: {
    "resultsReady" : "MC.model.QueryResultsReadyEvent"
  },
  
  construct: function(entity){
    this.base(arguments);
    this.BASE_RPC_URL = "/rpc/";

    this.entity = entity;
  },

  members: {
    count : function(){
      var url = this.BASE_RPC_URL + this.entity + "/count";
      this._call(url);
    },
    selectAll: function(start, end){
      //var url = this.BASE_RPC_URL + this.entity + "/all";
			var url = this.BASE_RPC_URL + this.entity;
      if (!start)
          start = "";
      
      if (!end)
          end = "";
      
      url += "?b=" + start + "&e=" + end;
      
      this._call(url);
      },
    get: function(id){
      var url = this.BASE_RPC_URL + this.entity + "/" + id;
      this._call(url);
    },
		save: function(jsonObj){
			var url = this.BASE_RPC_URL + this.entity;
			if (jsonObj.id && jsonObj.id != null && jsonObj.id > 0){
				var id = jsonObj.id;
				url += ("/" + id)
			}
			
			var json = qx.lang.Json.stringify(jsonObj);
			this._call(url, {method: "POST", params: json});
			
		},
  _call: function(url, opts){
		
     var req = new qx.io.request.Xhr();
		 if (opts){
		 	if (opts.method)
				req.setMethod(opts.method);
			 
			if (opts.params)
				req.setRequestData({":json" : opts.params});
		 }
     req.setUrl(url);
     req.addListener("success", function(){
       this.debug("Response: " + req.getResponseText());
       this.fireEvent("resultsReady", MC.model.QueryResultsReadyEvent, [req.getResponseText()]); 
       //callback.call(this, req.getResponseText());  
      }, this);
        
     req.send();

  }
    
  }
});