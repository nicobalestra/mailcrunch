/**
 * This is the main application class of your custom application "MC"
 */
qx.Class.define("MC.view.delivery.DeliveryList",
{
  extend : MC.view.EntityWindow,
  
  construct : function(model){
	  this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox(10));
		this.setShowStatusbar(true);
    this.setStatus("Delivery list (number of records)");
    this.add(this.constructTable());

   },
  members: {
    constructTable: function(){
      var model = new MC.model.delivery.RemoteTableModel(this.getMetaUrl() + "model=delivery");
      var columnBehaviour = {
        tableColumnModel: function(obj){
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      }
      
      this.__table = new qx.ui.table.Table(model, columnBehaviour);
      
      return this.__table;
    },
          
    getMetaUrl : function(){
      return "ciccio/";
    }
  }
  });
