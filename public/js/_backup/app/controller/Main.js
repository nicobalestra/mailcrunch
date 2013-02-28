Ext.define('MC.controller.Main', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'mainToolbar',
            selector: 'mainToolbar'
        }],

    init : function(){
        var me = this;

        me.control ({
            '[iconCls=new-delivery]' : {
                click : me.handleNewDelivery
            }
        });
    },

    handleNewDelivery : function (){
        console.log ("NEW DELIVERY");
        me.fireEvent ("open-new-delivery");
    }

});
