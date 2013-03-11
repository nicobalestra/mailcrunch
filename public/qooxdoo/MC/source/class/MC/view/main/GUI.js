/**
 * This is the main application class of your custom application "MC"
 */
qx.Class.define("MC.view.main.GUI",
{
  extend : qx.ui.window.Window,
  construct : function(root){
	  this._root = root;
	  this.__controller = null;
	  
  },
  members: {
	show : function(root){
		if (this.__controller == null){
			throw new Error("Please set an instance of MC.controller.Controller before rendering the GUI");
		}
		
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
		//LEFT
		this.navTree = new MC.view.main.NavTree();
		horizontalSplitPane.add(this.navTree, 0);
			
		//RIGHT
		//This will be the content depending on which element of the tree is selected
		
		//var currentView = new qx.ui.core.Widget();
		//currentView.setDecorator(null);
		var wm = new qx.ui.window.Manager();
		this.__desktop = new qx.ui.window.Desktop(wm);
		horizontalSplitPane.add(this.__desktop, 1);
		
		//Add LEFT and RIGHT to the main view
		verticalSplit.add(horizontalSplitPane, 1);
		dockLayoutComposite.add(verticalSplit);
		
		this.__controller.setNavTree(this.navTree);	
		this.__controller.setDesktop(this.__desktop);

	},
	
	setController: function(controller){
		this.__controller = controller;
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
	
