Ext.application({
	appFolder: "js/app",
	controllers: ["Main"],

    views: ["Main"],


    name: 'MC',

    autoCreateViewport: true,
		
	launch : function() {	
		
		console.log("MailCrunch loaded");
		
	}
});
