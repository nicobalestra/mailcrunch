qx.Class.define("MC.remote.RPC", {
  extend: qx.core.Object,

  events: {
    "resultsReady" : "MC.model.QueryResultsReadyEvent"
  },

  construct: function(){
    this.base(arguments);
    this.BASE_RPC_URL = "/rpc/";
  },

  members: {
		/**
		 * @PUBLIC
		 **/
		DELETE: function(url, params){

			return this.__call(url, {method: "DELETE", params: params});

		},

		/**
		 * @PUBLIC
		 **/
		PUT: function(url, params){
			if (!params)
				throw new Error("Nothing to PUT while calling MC.model.RPC._put");

			return this.__call(url, {method: "PUT", params: params});

		},

		/**
		 * @PUBLIC
		 **/
		GET: function(url){
			this.__call(url);
		},

		/**
		 * @PUBILC
		 **/
		POST: function(url, params){

			if (!params)
				throw new Error("Nothing to POST while calling MC.model.RPC._post");

			return this.__call(url, {method: "POST", params: params});
		},

		/**
		 * @private
		 */
  __call: function(url, opts){

     var req = new qx.io.request.Xhr();
		 if (opts){
		 	if (opts.method)
				req.setMethod(opts.method);

			if (opts.params){
        console.log("Calling " + this.method + " with json " + opts.params);
				req.setRequestData({":json" : opts.params});
      }
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