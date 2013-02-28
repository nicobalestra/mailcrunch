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

        me.application.on({
            newDelivery: this.onNewDelivery,
            scope: this
        });
    },

    onNewDelivery : function(){
        alert("Now I shoudl open the form");
    },
    handleNewDelivery : function (){
        console.log ("NEW DELIVERY");

    }

});
