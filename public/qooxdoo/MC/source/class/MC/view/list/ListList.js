/**
 * This is the main application class of your custom application "MC"
 *
   #asset(qx/icon/${qx.icontheme}/22/actions/list-add.png)
   #asset(qx/icon/${qx.icontheme}/22/actions/list-remove.png)
*/
qx.Class.define("MC.view.list.ListList",
{
  extend : MC.view.AbstractEntityList,

  construct : function(desktop){
    this.base(arguments);
    this.__desktop = desktop;
    this.setCaption("List of data views");
    this.setStatus("Lists (number of records)");
   },
  members: {
    handleClose: function(){
      this.debug("List of queries: should handle closure of window with saving of the record");
    },
    /**
     * Open a new entity when double clicking on a row or when pressing the New button
     */
    _openEntity: function(event){
      var id = null;
      if (event){
        var row;
        this.debug("Opening form with row : "  + event.getRow());
        var model = this.__table.getTableModel();
        row = model.getRowData(event.getRow());
        id = row.id;
        this.debug("Opening list form with list ID " + id);
      }

      var listForm = new MC.view.list.ListForm(id);
      listForm.setModal(true);
      listForm.addListener("close", this._refreshMyself, this);

      this.__desktop.add(listForm, {left: 0, right: 0});
      listForm.open();
    },

    _getModel: function(){
      return new MC.model.list.ListTableModel();
    }
  }
  });
