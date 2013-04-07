qx.Class.define("MC.controller.Controller", {
  extend: qx.core.Object,	
  construct: function(){
	  this.__navTree = null;
	  this.__desktop = null;
    this.__newDelivery = null;
    this.__deliveryList = null;
  },
  
  type: "singleton",	
  members: {
	  setNavTree : function(tree){
		  this.__navTree = tree;
		  this.__navTree.addListener("changeView", this.__changeView, this);
		  },
    
    closeAllDesktopWindows : function(){
      var children = this.__desktop.getWindows();
      for (var idx in children){
        children[idx].close();
      }
    }, 
	  __changeView: function(e){
        this.debug("Tryig to close all windows... ");
        this.closeAllDesktopWindows();
	  	  this.debug("Opening window .. '" + e.getData() + "'");
		    switch (e.getData()){
			    case "delivery-new" :
				    this.__openNewDelivery();
				    break;
			    case "delivery-list" :
            this.__openDeliveryList();
				    break;
  			}
		  },
    
     __openNewDelivery : function(){
		  	  //Passing null to the constructor indicates a new delivery must be created.
		  	  var delivery = new MC.view.delivery.DeliveryForm(null);
		  	  delivery.center();
          this.__desktop.add(delivery);
          delivery.open();
			},
    
     __openDeliveryList : function(){
        var deliveryList = new MC.view.delivery.DeliveryList(this.__desktop);
        deliveryList.center();
        deliveryList.open();
        this.__desktop.add(deliveryList);
      },
    
			setDesktop : function(desktop){
				this.__desktop = desktop;
			}

	  }
		

});
