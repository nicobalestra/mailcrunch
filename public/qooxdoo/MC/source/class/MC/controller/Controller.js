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
        var action = e.getData();
        action = action.replace("-", "_");
        action = action.charAt(0).toUpperCase() + action.substring(1);
        if (this["__open" + action])
               this["__open" + action].call(this);
     },

     __openNewDelivery : function(){
                          //Passing null to the constructor indicates a new delivery must be created.
          var delivery = new MC.view.delivery.DeliveryForm(null);
          delivery.center();
          this.__desktop.add(delivery);
          delivery.open();
                        },

     __openDelivery_list : function(){
        var deliveryList = new MC.view.delivery.DeliveryList(this.__desktop);
        deliveryList.center();
        deliveryList.open();
        this.__desktop.add(deliveryList);
      },
    __openList_list : function(){
        var list = new MC.view.list.ListList(this.__desktop);
        list.center();
        list.open();
        this.__desktop.add(list);
      },
      setDesktop : function(desktop){
          this.__desktop = desktop;
      }

  }


});
