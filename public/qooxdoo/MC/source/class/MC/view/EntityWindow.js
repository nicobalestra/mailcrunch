qx.Class.define("MC.view.EntityWindow",
{
  type: "abstract",
  extend : qx.ui.window.Window,
  construct : function(desktop){
	  this.base(arguments);
    this.__desktop = desktop;
    this.addListener("beforeClose", this.handleClose, this);
    this.maximize();
  },
  members: {
    handleClose: function(){
      throw new Error("Plase implement the handleClose function");
    }
    //,getContent : function(){
    //  throw new Error("Please implement the getContent function");
    //}
  }
  });
