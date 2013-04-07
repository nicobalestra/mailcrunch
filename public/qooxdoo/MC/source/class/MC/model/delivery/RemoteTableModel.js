qx.Class.define("MC.model.delivery.RemoteTableModel", {
  extend: MC.model.AbstractRemoteTableModel,
  construct: function(){
    this.base(arguments);
  },
  members: {
  
    _getEntity: function(){
      return "delivery";
    },
    _setColumns: function(){
      this.setColumnIds(["id", "subject", "from_email_address"]);
      this.setColumnNamesById({id: "ID", subject: "Subject", from_email_address: "From"});
    }
   
  }
});