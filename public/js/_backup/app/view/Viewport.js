Ext.define('MC.view.Viewport', {
    renderTo: Ext.getBody(),
    extend: 'Ext.container.Viewport',
    requires:[
        'Ext.layout.container.Border',
        'MC.view.MainToolbar'
    ],

    layout: {
        type: 'border'
    },

    items: [{
        region: 'north',
        xtype: 'mainToolbar',
        title: 'west'
    }]
    });
