qx.Class.define("MC.model.AbstractRemoteTableModel", {
  type: "abstract",
  extend: qx.ui.table.model.Remote,
  statics: {
    BASE_RPC_URL : "/rpc/{%}/count"
  },
  construct: function(columns){
    this.base(arguments);
  },
  members: {
  
    _loadRowCount : function(){
      this.debug("Call to _loadRowCount");
      var count = this.__call(this._getCountUrl(), function(data){
        var obj = qx.lang.Json.parse(data);
        this.debug("Number of rows... " + obj.count)
        
        this._onRowCountLoaded(obj.count);
      });
    },
    
    _loadRowData: function(firstRow, lastRow){
      this.debug("Call to _loadRowData with firstRow = " + firstRow + " and lastRow = " + lastRow);
      var data = this.__call(this._getContentUrl(), function(data){
        
        this._onRowDataLoaded(data);
      });
      
    },
    
    _getCountUrl : function(){
      throw new Error("You need to implement getCountUrl");
    },
    
    _getContentUrl : function(){
      throw new Error("You need to implement _getContentUrl");
    },
    
    __call : function(url, callback){

      var req = new qx.io.request.Xhr();
      req.setUrl(url);
      req.addListener("success", function(){
        console.log("AJAX SUCCESS for url : " + url + " -> " + req.getResponseText())
          
        callback.call(this, req.getResponseText());  
      }, this);
        
      req.send();
    }
    
  }
});