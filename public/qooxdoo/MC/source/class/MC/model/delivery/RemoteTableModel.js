qx.Class.define("MC.model.delivery.RemoteTableModel", {
  extend: MC.model.AbstractRemoteTableModel,
  construct: function(){
    this.base(arguments);
  },
  members: {
  
    _getCountUrl : function(){
      return "/rpc/delivery/count"
    },
    _getContentUrl : function(){
      return "/rpc/delivery";
    },
    _getColumns : function(){
      
    }
   
  }
});