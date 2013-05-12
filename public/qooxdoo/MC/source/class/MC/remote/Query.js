qx.Class.define("MC.remote.Query", {
  extend: MC.remote.RPC,

  construct: function(entity){
    this.base(arguments);
		this.entity = entity;
  },

  members: {
    count : function(){
      var url = this.BASE_RPC_URL + this.entity + "/count";
      this.GET(url);
    },
    selectAll: function(start, end){
      //var url = this.BASE_RPC_URL + this.entity + "/all";
			var url = this.BASE_RPC_URL + this.entity;
      if (!start)
          start = "";

      if (!end)
          end = "";

      url += "?b=" + start + "&e=" + end;

      this.GET(url);
    },
    get: function(id){
      var url = this.BASE_RPC_URL + this.entity + "/" + id;
      this.GET(url);
    },
		save: function(jsonObj){
			var url = this.BASE_RPC_URL + this.entity;
			if (jsonObj.id && jsonObj.id != null && jsonObj.id > 0){
				var id = jsonObj.id;
				url += ("/" + id)
			}

			var json = qx.lang.Json.stringify(jsonObj);
			this.POST(url, json);

		},
    deleteByIds: function(ids){
      console.log("GOING TO DETELE...");
      var url = this.BASE_RPC_URL + this.entity;
      this.DELETE(url, "id=" + ids.join(","));
    }

  }
});