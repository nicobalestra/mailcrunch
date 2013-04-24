qx.Class.define("MC.remote.Delivery", {
  extend: MC.remote.RPC,
  
  construct: function(){
    this.base(arguments);
  },

  members: {
		send : function(deliveryID){
			var url = this.BASE_RPC_URL + "delivery/send";
			this.PUT(url, qx.lang.Json.stringify({id: deliveryID}));
		}    
  }
});