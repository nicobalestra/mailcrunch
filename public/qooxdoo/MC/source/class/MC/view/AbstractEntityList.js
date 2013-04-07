/**
 * This is the main application class of your custom application "MC"
 *
   #asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
   #asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
*/
qx.Class.define("MC.view.AbstractEntityList",
{
  extend : MC.view.EntityWindow,
  
  construct : function(desktop){
	  this.base(arguments);
    this.__desktop=desktop;
    this.setLayout(new qx.ui.layout.VBox(10));
		this.setShowStatusbar(true);
    this.buildContent();
   },
  members: {
    buildContent : function(){
      this.setLayout(new qx.ui.layout.VBox());
      this.add(this.__constructToolbar());
      this.add(this.__constructTable(), {flex: 1});
    },
    
    /*
     * Private function to build the table
     */
    __constructTable: function(){
      var model = this._getModel();

      var columnBehaviour = {
        tableColumnModel: function(obj){
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      }
      
      this.__table = new qx.ui.table.Table(model, columnBehaviour);
      this.__table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);      
      this.__table.set({
        width: 600,
        height: 400,
        decorator: null
      }); 
      
      //Add the listeners linked to selecting an element
      this.__table.addListener("cellClick", this._handleRowSelection, this);
      this.__table.addListener("cellDblclick", this._openEntity, this);
      return this.__table;
    },
    __constructToolbar: function(){
      var toolbar = new qx.ui.toolbar.ToolBar();
      var part = new qx.ui.toolbar.Part();
      toolbar.add(part);
      
      /** NEW ENTITY **/
      this.__newButton = new qx.ui.toolbar.Button("New", "icon/22/actions/list-add.png");
      this.__newButton.addListener("execute", function(e){
        this.debug("Clicked New button");
        this._openEntity(null);
      }, this)
      
      part.add(this.__newButton);
      
      /** DELETE BUTTON **/
      this.__deleteButton = new qx.ui.toolbar.Button("Delete", "icon/22/actions/list-remove.png");
      this.__deleteButton.addListener("execute", function(e){
        this.debug("Click on deleteButton");
        var selectionModel = this.__table.getSelectionModel();
        var model = this.__table.getTableModel();
        var selectedRow = [];
        selectionModel.iterateSelection(function(index){
          selectedRow.push(model.getRowData(index));
        }, this);
        
        for (var row in selectedRow){
          this.debug("Going to remove row " + selectedRow[row]);
        }
        
      }, this);
      this.__deleteButton.setEnabled(false);
      part.add(this.__deleteButton);
      
      
      return toolbar;
    },

    _handleRowSelection : function(){
      this.debug("Handling the row selectio....");
       //Enable/Disable the delete button..
      var selectionModel = this.__table.getSelectionModel();
      
      this.__deleteButton.setEnabled(selectionModel.getSelectedCount() > 0);
    },
    
    /**
     * Abstract function knowing how to open an entity. Needs to be implemented by subclasses
     * since the behaviour of the double click is specific to the entity.
     */
    _openEntity: function(){
        throw new Error("Please implement the function _openEntity !");
    },
    _getModel : function(){
        throw new Error("Please implement the function _getModel !");
    }

  }
  });
