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
      var query = new MC.model.Query(this._getEntity());
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
      //this.debug("Call to _loadRowData with firstRow = " + firstRow + " and lastRow = " + lastRow);
      var query = new MC.model.Query(this._getEntity());
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
    }
    
  }
});