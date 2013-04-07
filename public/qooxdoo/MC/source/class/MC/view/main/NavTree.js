/**
 * This is the main application class of your custom application "MC"
 */
qx.Class.define("MC.view.main.NavTree",
{
  extend : qx.ui.tree.VirtualTree,
  events: {"changeView" : "qx.event.type.Data"},
  construct : function(){
	  this.base(arguments);
	  this.setDecorator("main");
	  this.setLabelPath("name");
    this.setWidth(250);
    this.setPadding(0);
    
    this.setChildProperty("children")
    
	  this.setup();
	  
  },
  members: {
	
	
    setup : function(){
		
		this.setOpenMode("dblclick");
		
		this.addListener("dblclick", function(e){
			this.debug("Double click.. should open the form");
		}, this);
		
		this.addListener("changeSelection", function(e){
			this.debug("changed selection");
				var data = e.getData();
				if (data.length > 0){
					this.debug("Selected..." + data[0].getView());
				}
				}, this);
				
		var url = "/rpc/navtree";
		this.store = new qx.data.store.Json(url);
		
		// connect the store and the tree
		this.store.bind("model", this, "model");
		
		// opens the 'Desktop' node
		this.store.addListener("loaded", function() {
			this.openNode(this.getModel().getChildren().getItem(0));
		}, this);
		
		this.getSelection().addListener("change", function(e) {
			this.fireDataEvent("changeView", this.getSelection().getItem(0).getView());
		}, this);
	}

  } //Members


});	
	

