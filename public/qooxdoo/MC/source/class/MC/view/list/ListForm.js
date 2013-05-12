/**
 * This is the main application class of your custom application "MC"
 */
qx.Class.define("MC.view.list.ListForm",
{
  extend : MC.view.EntityWindow,

  construct : function(list){
    this.base(arguments);
    this.form = null;
    this.listRow = list;
    this.setLayout(new qx.ui.layout.VBox(10));
     this.setShowStatusbar(true);
    this.add(this.getContent(), {flex: 1});
    this.setCaption("Edit list query");
    this.loadContent();
  },
  members: {
    handleClose: function(){
      this.debug("Delivery for: should handle closure of window with saving of the record");
    },
    /*
     * Build the Delivery Form content.
     */
    getContent : function(){

      var ctrlsWidth = 200;
        var win = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));

      var formContainer = new qx.ui.container.Composite();
      var formLayout = new qx.ui.layout.Grid(10, 10);
      formLayout.setColumnFlex(2, 1);
      formContainer.setLayout(formLayout);


      this.form = new qx.ui.form.Form();
      //Add this as an hidden field...
      var idTxt = new qx.ui.form.TextField();
      this.form.add(idTxt, "id",null, "id");

      var nameLbl = new qx.ui.basic.Label("Name");
      var nameTxt = new qx.ui.form.TextField();
      nameTxt.setAllowGrowX(true);
      nameTxt.setRequired(true);
      this.form.add(nameTxt, "name", null, "name");
      formContainer.add(nameLbl, {row: 0, column: 1});
      formContainer.add(nameTxt, {row: 0, column: 2});

      var queryLbl = new qx.ui.basic.Label("Query");
      var queryTxt = new qx.ui.form.TextArea();
      queryTxt.setAllowGrowX(true);
      queryTxt.setRequired(true);
      this.form.add(queryTxt, "query", null, "query");
      formContainer.add(queryLbl, {row:1, column: 1});
      formContainer.add(queryTxt, {row:1, column: 2});
      win.add(formContainer);
      win.add(this.__getActionButtons());

      return win;
    },
  __getActionButtons: function(model){
      var toReturn=new qx.ui.container.Composite(new qx.ui.layout.HBox(10, "center"));

                        var save = new qx.ui.form.Button("Save");
                        save.addListener("execute", this.saveList, this)
      var cancel = new qx.ui.form.Button("Cancel");
      cancel.addListener("execute", function(e){this.close();}, this);
      toReturn.add(save);
      toReturn.add(cancel);

    return toReturn;
  },
  //Save/update the current delivery form
  saveList: function(){
    //Get the current form content.
                if (this.controller){
                                this.controller.setTarget(this.form)
                }else{
                                this.controller = new qx.data.controller.Form(this.initialModel, this.form);
                }

    var model = this.controller.createModel();

                var query = new MC.remote.Query("list");
                query.save(qx.util.Serializer.toNativeObject(model));
                this.close();
  },

  /**
   * Called on start up of the form to set the content of the delivery we want to edit.
   **/
  loadContent: function(){
    if (!this.listRow)
        return;

    var query = new MC.remote.Query("list");

                query.addListener("resultsReady", function(e){
      var jsonObj = e.getJsonResults();

      this.initialModel = qx.data.marshal.Json.createModel(jsonObj[0]);

      this.controller = new qx.data.controller.Form(this.initialModel, this.form);
                        this.controller.addBindingOptions("id", {converter: function(data) { return data + "";}},
                                                                                                                                                                                        {converter: function(data) { return parseInt(data);}});

    }, this)
    query.get(this.listRow);


  }

   }
});
