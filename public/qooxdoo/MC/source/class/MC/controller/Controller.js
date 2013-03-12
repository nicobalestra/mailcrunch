qx.Class.define("MC.controller.Controller", {
  extend: qx.core.Object,	
  construct: function(){
	this.__navTree = null;
	this.__desktop = null;
  },
  
  type: "singleton",	
  members: {
	  setNavTree : function(tree){
		  this.__navTree = tree;
		  this.__navTree.addListener("changeView", this.__changeView, this);
		  },
    
	  __changeView: function(e){
	  	  this.debug("Opening window .. '" + e.getData() + "'");
		    switch (e.getData()){
			    case "delivery-new" :
				    this.__openNewDelivery();
				    break;
			    case "delivery-list" :
            this.debug("IN DELIVERYLIST")  
				    this.__openDeliveryList();
				    break;
  			}
		  },
    
		  __openNewDelivery : function(){
		  	  //Passing null to the constructor indicates a new delivery must be created.
		  	  var delivery = new MC.view.delivery.Delivery(null);
		  	  delivery.center();
          this.__desktop.add(delivery);
          delivery.open();
			    /* var win = new qx.ui.window.Window("New Delivery", "icon/16/apps/office-calendar.png");
			    win.setLayout(new qx.ui.layout.VBox(10));
			    win.setShowStatusbar(true);
			    win.setStatus("New Delivery");
			    //I should remove any opened window before closing...
			    this.__desktop.add(delivery);
			    win.open();
          */
			},
    
    __openDeliveryList : function(){
        var deliveryList = new MC.view.delivery.DeliveryList();
        deliveryList.center();
        deliveryList.open();
        this.__desktop.add(deliveryList);
      },
    
			setDesktop : function(desktop){
				this.__desktop = desktop;
			}

	  }
		

});
