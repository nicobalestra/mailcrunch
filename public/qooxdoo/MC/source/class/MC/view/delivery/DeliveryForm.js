/**
 * This is the main application class of your custom application "MC" 
 */
qx.Class.define("MC.view.delivery.DeliveryForm",
{
  extend : MC.view.EntityWindow,

  construct : function(deliveryRow){
    this.base(arguments);
    this.form = null;
    this.deliveryRow = deliveryRow;
    this.setLayout(new qx.ui.layout.VBox(10));
		this.setShowStatusbar(true);
    this.add(this.getContent(), {flex: 1});

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
      var tabView = new qx.ui.tabview.TabView();
      
      this.form = new qx.ui.form.Form();
      //Add this as an hidden field...
      var idTxt = new qx.ui.form.TextField();
			this.form.add(idTxt, "id",null, "id");      

      tabView.add(this.__generateGeneralTab(ctrlsWidth));
      tabView.add(this.__generateContentTab(ctrlsWidth));
      
      win.add(tabView, {flex: 1});
      
      win.add(this.__getActionButtons());

      return win;
    },
    __generateGeneralTab: function(ctrlsWidth){
       var row = 1; 
        
       var addToTab = function(tab, form, label, name, control){
        form.add(control, label, null, name);
        tab.add(new qx.ui.basic.Label(label).set({
            allowShrinkX: false,
            paddingTop: 3
          }), {row: row, column: 1});
         tab.add(control, {row: row, column: 2});
         row++;
       }

        var generalTab = new qx.ui.tabview.Page("General");
        var layout = new qx.ui.layout.Grid(10, 10);
        layout.setColumnFlex(2, 1);
        generalTab.setLayout(layout);
        
        
        var emailFrom = new qx.ui.form.TextField();
        emailFrom.setAllowGrowX(true);
        emailFrom.setWidth(ctrlsWidth);
        emailFrom.setRequired(true);
        addToTab(generalTab, this.form, "From", "from_email_address", emailFrom);
  
        var friendlyName = new qx.ui.form.TextField();
        friendlyName.setAllowGrowX(true);
        friendlyName.setRequired(true);
        friendlyName.setWidth(ctrlsWidth);
        addToTab(generalTab, this.form, "Friendly Name", "friendly_name", friendlyName);
        
        var subject = new qx.ui.form.TextField();
        subject.setRequired(true);
        subject.setWidth(ctrlsWidth);
        addToTab(generalTab, this.form, "Subject", "subject", subject);
        return generalTab;
    },
     /**
      Generate the email content tab (HTML for now)
      the HTML content has two tabs: wysiwyg and source
     */
     __generateContentTab: function(ctrlsWidth){
        
        //The Main content tab
        var mainContentTab = new qx.ui.tabview.Page("Content");
        var layout = new qx.ui.layout.VBox();
        mainContentTab.setLayout(layout);
        
        //The content tab contains another tabview (HTML + TEXT (in the future))
        var contentTabView = new qx.ui.tabview.TabView();
        
        var contentHTML = new qx.ui.tabview.Page("HTML");
        contentHTML.setLayout(new qx.ui.layout.VBox());
        contentTabView.add(contentHTML);
       
       //Preview Tab
        this.htmlEditor = new MC.view.components.HtmlEditor("Let's put something");
        var html = new qx.ui.form.TextArea();
       
        this.form.add(html, "body_html", null, "body_html");
       
        contentHTML.add(this.htmlEditor, {flex: 1});
       
       
       mainContentTab.add(contentTabView, {flex: 1});
       
        return mainContentTab;
    },
  __getActionButtons: function(model){
      var toReturn=new qx.ui.container.Composite(new qx.ui.layout.HBox(10, "center"));

      var send = new qx.ui.form.Button("Send");
			send.addListener("execute", this.sendDelivery, this);
      
			var save = new qx.ui.form.Button("Save");
			save.addListener("execute", this.saveDelivery, this)
      var cancel = new qx.ui.form.Button("Cancel");
      cancel.addListener("execute", function(e){this.close();}, this);
      toReturn.add(send);
      toReturn.add(save);
      toReturn.add(cancel);
    
    return toReturn;
  },
  //Save/update the current delivery form  
  saveDelivery: function(){
    //Get the current form content.  
		if (this.controller){
				this.controller.setTarget(this.form)				
		}else{
				this.controller = new qx.data.controller.Form(this.initialModel, this.form);
		}
      
    var model = this.controller.createModel();
    model.setBody_html(this.htmlEditor.__htmlArea.getCompleteHtml());
      
		var query = new MC.remote.Query("delivery");
		query.save(qx.util.Serializer.toNativeObject(model));
		this.close();
  },
		
	sendDelivery : function(){
    //Get the current form content.  
		if (this.controller){
				this.controller.setTarget(this.form)				
		}else{
				this.controller = new qx.data.controller.Form(this.initialModel, this.form);
		}
      
    var model = this.controller.createModel();
		var id = model.getId();
		
		var rpc = new MC.remote.Delivery();
		rpc.send(id);
	},
		
  /**
   * Called on start up of the form to set the content of the delivery we want to edit.
   **/  
  loadContent: function(){
    if (!this.deliveryRow)
        return;
    
    var query = new MC.remote.Query("delivery");

		query.addListener("resultsReady", function(e){
      var jsonObj = e.getJsonResults();
    
      this.initialModel = qx.data.marshal.Json.createModel(jsonObj[0]);

      this.controller = new qx.data.controller.Form(this.initialModel, this.form);
			this.controller.addBindingOptions("id", {converter: function(data) { return data + "";}}, 
																							{converter: function(data) { return parseInt(data);}});
			
      //Explicitely set the content of the htmlarea since it doesn't support 
      //property binding.
      this.htmlEditor.__htmlArea.addListener("ready", 
																						 function(e){
        																				this.htmlEditor.__htmlArea.setValue(jsonObj[0]["body_html"]);
      																			}, this);
      
    }, this)
    query.get(this.deliveryRow);
    
    
  }

   }
});
