/**
 * This is the main application class of your custom application "MC"
 */
qx.Class.define("MC.view.delivery.Delivery",
{
  extend : MC.view.EntityWindow,
  construct : function(delivery){
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox(10));
		this.setShowStatusbar(true);

	  if (!delivery){
      this.setStatus("New Delivery");
      this.__isNew = true;
    }
	  else{
      this.__delivery = delivery;
      this.setStatus("Edit Delivery")
    }
		

  },
  members: {
	  
  }
  });
