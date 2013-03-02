/**
 * This is the main application class of your custom application "MC"
 */
qx.Class.define("MC.view.main.GUI",
{
  extend : qx.ui.window.Window,
  construct : function(root){
	  this._root = root;
  },
  members: {
	show : function(root){
		// Document is the application root
		var doc = this._root;
		var dockLayout = new qx.ui.layout.Dock();
		var dockLayoutComposite = new qx.ui.container.Composite(dockLayout);
		doc.add(dockLayoutComposite, {edge: 1});
      
		//Main vertical split
		var verticalSplit = new qx.ui.splitpane.Pane("vertical");
		//Put the main menu in the top side of the window
		var menu = this.getMenuBar();
		verticalSplit.add(menu, 0);
		//The bottom side of the window is made by a pane on the left containing the tree
		//and the main window on the right
		var horizontalSplitPane = new qx.ui.splitpane.Pane("horizontal");
		horizontalSplitPane.setDecorator(null);
		horizontalSplitPane.add(this.getNavigationTree(), 0);
		
		//This will be the content depending on which element
		var currentView = new qx.ui.core.Widget();
		currentView.setDecorator(null);
		horizontalSplitPane.add(currentView, 1);
		verticalSplit.add(horizontalSplitPane, 1);
		dockLayoutComposite.add(verticalSplit);
	},
	
    getNavigationTree : function(){
		// creates the tree
		var tree = new qx.ui.tree.VirtualTree(null, "name", "children").set({
			width : 200,
			height : 400
		});
		tree.setOpenMode("dblclick");
		tree.addListener("changeSelection", function(e){
				var data = e.getData();
				if (data.length > 0){
					alert(data[0].getLabel());
				}
				});
		var url = "/rpc/navtree";
		var store = new qx.data.store.Json(url);
		// connect the store and the tree
		store.bind("model", tree, "model");
		
		// opens the 'Desktop' node
		store.addListener("loaded", function() {
			tree.openNode(tree.getModel().getChildren().getItem(0));
		}, this);
		return tree;
	},
	
	getMenuBar : function(){
		var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow());
		var menu = new qx.ui.menubar.MenuBar();
		frame.add(menu);
		
		var fileMenu = new qx.ui.menubar.Button("File");
		menu.add(fileMenu);
		
		return frame;
	}

  } //Members


});	
	
