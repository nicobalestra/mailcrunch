qx.Class.define("MC.model.list.ListTableModel", {
  extend: MC.model.AbstractRemoteTableModel,
  construct: function(){
    this.base(arguments);
  },
  members: {

    _getEntity: function(){
      return "list";
    },
    _setColumns: function(){
      this.setColumnIds(["id", "query", "entity"]);
      this.setColumnNamesById({id: "ID", query: "Query", entity: "Entity"});
    }

  }
});
