qx.Class.define("MC.model.AbstractRemoteTableModel", {
  type: "abstract",
  extend: qx.ui.table.model.Remote,
  construct: function(columns){
    this.base(arguments);
    this._setColumns();
  },
  members: {
  
    _setColumns : function(){
      throw new Error("You need to implement _setColumns");
    },
    _loadRowCount : function(){
      var query = new MC.remote.Query(this._getEntity());
      query.addListener("resultsReady", 
                        function(results){
                          var obj = results.getJsonResults();
                          this.debug("Number of rows... " + obj.count)
        
                          this._onRowCountLoaded(obj.count);},
                       this);
      query.count();
      
      //var count = this.__call(this._getCountUrl(), function(data){
      //  var obj = qx.lang.Json.parse(data);
      //  this.debug("Number of rows... " + obj.count)
        
      //  this._onRowCountLoaded(obj.count);
      //});
    },
    
    _getEntity: function(){
      throw new Error("Please implement the function _getEntity");
    },
    _loadRowData: function(firstRow, lastRow){
      this.debug("Call to _loadRowData with firstRow = " + firstRow + " and lastRow = " + lastRow);
      var query = new MC.remote.Query(this._getEntity());
      query.addListener("resultsReady", function(results){
				
                                           var data = results.getResults();
                                           var dataObj = qx.lang.Json.parse(data);
                                           this._onRowDataLoaded(dataObj);
                                       }, this);
      query.selectAll(firstRow, lastRow);
      
      //var data = this.__call(this._getContentUrl(firstRow, lastRow), 
      //                      function(data){
      //                           var dataObj = qx.lang.Json.parse(data);
      //                            this._onRowDataLoaded(dataObj);
      //                       });
      
    },
    
    __call : function(url, callback){

      var req = new qx.io.request.Xhr();
      req.setUrl(url);
      req.addListener("success", function(){
        //this.debug("AJAX SUCCESS for url : " + url + " -> " + req.getResponseText())
          
        callback.call(this, req.getResponseText());  
      }, this);
        
      req.send();
    },
		
		    /**
     * Reloads the model and clears the local cache.
     *
     */
    reloadData : function()
    {
      // If there is currently a request on its way, then this request will bring
      // obsolete data -> Ignore it
      if (this._firstLoadingBlock != -1) {
        var cancelingSucceed = this._cancelCurrentRequest();
        if (cancelingSucceed) {
          // The request was canceled -> We're not loading any blocks any more
          this._firstLoadingBlock = -1;
          this._ignoreCurrentRequest = false;
        } else {
          // The request was not canceled -> Ignore it
          this._ignoreCurrentRequest = true;
        }
        // Force clearing row cache, because of reloading data.
        //this._clearCache = true;
      }

      this._clearCache=true;	

      // Forget a possibly outstanding request
      // (_loadRowCount will tell the listeners anyway, that the whole table
      // changed)
      //
      // NOTE: This will inform the listeners as soon as the new row count is
      // known
      this._firstRowToLoad = -1;
      this._lastRowToLoad = -1;
      this._loadRowCountRequestRunning = true;
      this._loadRowCount();
    }

    
  }
});