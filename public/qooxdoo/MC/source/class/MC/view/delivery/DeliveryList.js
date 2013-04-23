/**
 * This is the main application class of your custom application "MC"
 *
   #asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
   #asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
*/
qx.Class.define("MC.view.delivery.DeliveryList",
{
  extend : MC.view.AbstractEntityList,
  
  construct : function(desktop){
	  this.base(arguments);
    this.__desktop = desktop;
    this.setCaption("Deliveries");
    this.setStatus("Delivery list (number of records)");
   },
  members: {
    handleClose: function(){
      this.debug("Delivery for: should handle closure of window with saving of the record");
    },
    /**
     * Open a new entity when double clicking on a row or when pressing the New button
     */
    _openEntity: function(event){
      var id = null;
      if (event){
        var row;
        this.debug("CALL To DeliveryList._openEntity with : "  + event.getRow());
        var model = this.__table.getTableModel();
        row = model.getRowData(event.getRow())
        id = row.id;
        this.debug("Opening delivery form with delivery " + id);
      }
      
      var deliveryForm = new MC.view.delivery.DeliveryForm(id);
      deliveryForm.setModal(true);
			deliveryForm.addListener("close", this._refreshMyself, this);
      
      this.__desktop.add(deliveryForm, {left: 0, right: 0});
      deliveryForm.open();
    },

    _getModel: function(){
      return new MC.model.delivery.RemoteTableModel();
    }
  }
  });
