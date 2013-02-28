Ext.define('MC.view.MainToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'mainToolbar',
    items: [
        {
            text: 'Delivery',
            menu: {
                items: [
                    {
                        text: 'New Delivery',
                        iconCls : "new-delivery",
                        handler : function() {
                            this.fireEvent("newDelivery")
                        }
                    },
                    {
                        text: 'Open Delivery',
                        iconCls : 'open-delivery'
                    },
                    {
                        text: 'List Deliveries',
                        iconCls : "list-deliveries"
                    }
                ]
            }
        }
    ]
});
