/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * The JSON data store is responsible for fetching data from an url. The type
 * of the data has to be json.
 *
 * The loaded data will be parsed and saved in qooxdoo objects. Every value
 * of the loaded data will be stored in a qooxdoo property. The model classes
 * for the data will be created automatically.
 *
 * For the fetching itself it uses the {@link qx.io.request.Xhr} class and
 * for parsing the loaded javascript objects into qooxdoo objects, the
 * {@link qx.data.marshal.Json} class will be used.
 *
 * Please note that if you
 *
 * * upgrade from qooxdoo 1.4 or lower
 * * choose not to force the old transport
 * * use a delegate with qx.data.store.IStoreDelegate#configureRequest
 *
 * you probably need to change the implementation of your delegate to configure
 * the {@link qx.io.request.Xhr} request.
 *
 */
qx.Class.define("qx.data.store.Json",
{
  extend : qx.core.Object,


  /**
   * @param url {String|null} The url where to find the data. The store starts
   *   loading as soon as the URL is give. If you want to change some details
   *   concerning the request, add null here and set the URL as soon as
   *   everything is set up.
   * @param delegate {Object?null} The delegate containing one of the methods
   *   specified in {@link qx.data.store.IStoreDelegate}.
   */
  construct : function(url, delegate)
  {
    this.base(arguments);


    // store the marshaler and the delegate
    this._marshaler = new qx.data.marshal.Json(delegate);
    this._delegate = delegate;

    if (url != null) {
      this.setUrl(url);
    }
  },


  events :
  {
    /**
     * Data event fired after the model has been created. The data will be the
     * created model.
     */
    "loaded" : "qx.event.type.Data",

    /**
     * Fired when an error (aborted, timeout or failed) occurred
     * during the load. The data contains the respons of the request.
     * If you want more details, use the {@link #changeState} event.
     */
    "error" : "qx.event.type.Data"
  },


  properties :
  {
    /**
     * Property for holding the loaded model instance.
     */
    model : {
      nullable: true,
      event: "changeModel"
    },


    /**
     * The state of the request as an url. If you want to check if the request
     * did it’s job, use, the {@link #changeState} event and check for one of the
     * listed values.
     */
    state : {
      check : [
        "configured", "queued", "sending", "receiving",
        "completed", "aborted", "timeout", "failed"
      ],
      init : "configured",
      event : "changeState"
    },


    /**
     * The url where the request should go to.
     */
    url : {
      check: "String",
      apply: "_applyUrl",
      event: "changeUrl",
      nullable: true
    }
  },


  members :
  {
    _marshaler : null,
    _delegate : null,

    __request : null,

    // apply function
    _applyUrl: function(value, old) {
      if (value != null) {
        // take care of the resource management
        value = qx.util.AliasManager.getInstance().resolve(value);
        value = qx.util.ResourceManager.getInstance().toUri(value);

        this._createRequest(value);
      }
    },

    /**
     * Get request
     *
     * @return {Object} The request.
     */
    _getRequest: function() {
      return this.__request;
    },


    /**
     * Set request.
     *
     * @param request {Object} The request.
     */
    _setRequest: function(request) {
      this.__request = request;
    },


    /**
     * Creates and sends a GET request with the given url.
     *
     * Listeners will be added to respond to the request’s "success",
     * "changePhase" and "fail" event.
     *
     * @param url {String} The url for the request.
     */
    _createRequest: function(url) {
      // dispose old request
      if (this.__request) {
        this.__request.dispose();
        this.__request = null;
      }

      var req = new qx.io.request.Xhr(url);
      this._setRequest(req);

      // request json representation
      req.setAccept("application/json");

      // parse as json no matter what content type is returned
      req.setParser("json");

      // register the internal event before the user has the change to
      // register its own event in the delegate
      req.addListener("success", this._onSuccess, this);

      // check for the request configuration hook
      var del = this._delegate;
      if (del && qx.lang.Type.isFunction(del.configureRequest)) {
        this._delegate.configureRequest(req);
      }

      // map request phase to it’s own phase
      req.addListener("changePhase", this._onChangePhase, this);

      // add failed, aborted and timeout listeners
      req.addListener("fail", this._onFail, this);

      req.send();
    },


    /**
     * Handler called when request phase changes.
     *
     * Sets the store’s state.
     *
     * @param ev {qx.event.type.Data} The request’s changePhase event.
     */
    _onChangePhase : function(ev) {
      var requestPhase = ev.getData(),
          requestPhaseToStorePhase = {},
          state;

      requestPhaseToStorePhase = {
        "opened": "configured",
        "sent": "sending",
        "loading": "receiving",
        "success": "completed",
        "abort": "aborted",
        "timeout": "timeout",
        "statusError": "failed"
      };

      state = requestPhaseToStorePhase[requestPhase];
      if (state) {
        this.setState(state);
      }
    },


    /**
     * Handler called when not completing the request successfully.
     *
     * @param ev {qx.event.type.Event} The request’s fail event.
     */
    _onFail : function(ev) {
      var req = ev.getTarget();
      this.fireDataEvent("error", req);
    },


    /**
     * Handler for the completion of the requests. It invokes the creation of
     * the needed classes and instances for the fetched data using
     * {@link qx.data.marshal.Json}.
     *
     * @param ev {qx.event.type.Event} The request’s success event.
     */
    _onSuccess : function(ev)
    {
      if (this.isDisposed()) {
        return;
      }

       var req = ev.getTarget(),
           data = req.getResponse();

       // check for the data manipulation hook
       var del = this._delegate;
       if (del && qx.lang.Type.isFunction(del.manipulateData)) {
         data = this._delegate.manipulateData(data);
       }

       // create the class
       this._marshaler.toClass(data, true);

       var oldModel = this.getModel();

       // set the initial data
       this.setModel(this._marshaler.toModel(data));

       // get rid of the old model
       if (oldModel && oldModel.dispose) {
         oldModel.dispose();
       }

       // fire complete event
       this.fireDataEvent("loaded", this.getModel());

       // get rid of the request object
       if (this.__request) {
         this.__request.dispose();
         this.__request = null;
       }
    },


    /**
     * Reloads the data with the url set in the {@link #url} property.
     */
    reload: function() {
      var url = this.getUrl();
      if (url != null) {
        this._createRequest(url);
      }
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    if (this.__request != null) {
      this._disposeObjects("__request");
    }

    // The marshaler internally uses the singleton pattern
    // (constructor.$$instance.
    this._disposeSingletonObjects("_marshaler");
    this._delegate = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Defines the methods needed by every marshaler which should work with the
 * qooxdoo data stores.
 */
qx.Interface.define("qx.data.marshal.IMarshaler",
{
  members :
  {
    /**
     * Creates for the given data the needed classes. The classes contain for
     * every key in the data a property. The classname is always the prefix
     * <code>qx.data.model</code>. Two objects containing the same keys will not
     * create two different classes.
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     */
    toClass : function(data, includeBubbleEvents) {},


    /**
     * Creates for the given data the needed models. Be sure to have the classes
     * created with {@link #toClass} before calling this method.
     *
     * @param data {Object} The object for which models should be created.
     *
     * @return {qx.core.Object} The created model object.
     */
    toModel : function(data) {}
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class is responsible for converting json data to class instances
 * including the creation of the classes.
 */
qx.Class.define("qx.data.marshal.Json",
{
  extend : qx.core.Object,
  implement : [qx.data.marshal.IMarshaler],

  /**
   * @param delegate {Object} An object containing one of the methods described
   *   in {@link qx.data.marshal.IMarshalerDelegate}.
   */
  construct : function(delegate)
  {
    this.base(arguments);

    this.__delegate = delegate;
  },

  statics :
  {
    $$instance : null,

    /**
     * Creates a qooxdoo object based on the given json data. This function
     * is just a static wrapper. If you want to configure the creation
     * process of the class, use {@link qx.data.marshal.Json} directly.
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     *
     * @return {qx.core.Object} An instance of the corresponding class.
     */
    createModel : function(data, includeBubbleEvents) {
      // singleton for the json marshaler
      if (this.$$instance === null) {
        this.$$instance = new qx.data.marshal.Json();
      }
      // be sure to create the classes first
      this.$$instance.toClass(data, includeBubbleEvents);
      // return the model
      return this.$$instance.toModel(data);
    }
  },


  members :
  {
    __delegate : null,


    /**
     * Converts a given object into a hash which will be used to identify the
     * classes under the namespace <code>qx.data.model</code>.
     *
     * @param data {Object} The JavaScript object from which the hash is
     *   required.
     * @return {String} The hash representation of the given JavaScript object.
     */
    __jsonToHash: function(data) {
      return Object.keys(data).sort().join('"');
    },


    /**
     * Creates for the given data the needed classes. The classes contain for
     * every key in the data a property. The classname is always the prefix
     * <code>qx.data.model</code> and the hash of the data created by
     * {@link #__jsonToHash}. Two objects containing the same keys will not
     * create two different classes. The class creation process also supports
     * the functions provided by its delegate.
     *
     * Important, please keep in mind that only valid JavaScript identifiers
     * can be used as keys in the data map. For convenience '-' in keys will
     * be removed (a-b will be ab in the end).
     *
     * @see qx.data.store.IStoreDelegate
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     */
    toClass: function(data, includeBubbleEvents) {
      this.__toClass(data, includeBubbleEvents, null, 0);
    },


    /**
     * Implementation of {@link #toClass} used for recursion.
     *
     * @param data {Object} The object for which classes should be created.
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     * @param parentProperty {String|null} The name of the property the
     *   data will be stored in.
     * @param depth {Number} The depth of the data relative to the data's root.
     */
    __toClass : function(data, includeBubbleEvents, parentProperty, depth) {
      // break on all primitive json types and qooxdoo objects
      if (
        !qx.lang.Type.isObject(data)
        || !!data.$$isString // check for localized strings
        || data instanceof qx.core.Object
      ) {
        // check for arrays
        if (data instanceof Array || qx.Bootstrap.getClass(data) == "Array") {
          for (var i = 0; i < data.length; i++) {
            this.__toClass(data[i], includeBubbleEvents, null, depth+1);
          }
        }

        // ignore arrays and primitive types
        return;
      }

      var hash = this.__jsonToHash(data);

      // ignore rules
      if (this.__ignore(hash, parentProperty, depth)) {
        return;
      }

      // check for the possible child classes
      for (var key in data) {
        this.__toClass(data[key], includeBubbleEvents, key, depth+1);
      }

      // class already exists
      if (qx.Class.isDefined("qx.data.model." + hash)) {
        return;
      }

      // class is defined by the delegate
      if (
        this.__delegate
        && this.__delegate.getModelClass
        && this.__delegate.getModelClass(hash) != null
      ) {
        return;
      }

      // create the properties map
      var properties = {};
      // include the disposeItem for the dispose process.
      var members = {__disposeItem : this.__disposeItem};
      for (var key in data) {
        // apply the property names mapping
        if (this.__delegate && this.__delegate.getPropertyMapping) {
          key = this.__delegate.getPropertyMapping(key, hash);
        }

        // stip the unwanted characters
        key = key.replace(/-|\.|\s+/g, "");
        // check for valid JavaScript identifier (leading numbers are ok)
        if (qx.core.Environment.get("qx.debug")) {
          this.assertTrue((/^[$0-9A-Za-z_]*$/).test(key),
          "The key '" + key + "' is not a valid JavaScript identifier.")
        }

        properties[key] = {};
        properties[key].nullable = true;
        properties[key].event = "change" + qx.lang.String.firstUp(key);
        // bubble events
        if (includeBubbleEvents) {
          properties[key].apply = "_applyEventPropagation";
        }
        // validation rules
        if (this.__delegate && this.__delegate.getValidationRule) {
          var rule = this.__delegate.getValidationRule(hash, key);
          if (rule) {
            properties[key].validate = "_validate" + key;
            members["_validate" + key] = rule;
          }
        }
      }

      // try to get the superclass, qx.core.Object as default
      if (this.__delegate && this.__delegate.getModelSuperClass) {
        var superClass =
          this.__delegate.getModelSuperClass(hash) || qx.core.Object;
      } else {
        var superClass = qx.core.Object;
      }

      // try to get the mixins
      var mixins = [];
      if (this.__delegate && this.__delegate.getModelMixins) {
        var delegateMixins = this.__delegate.getModelMixins(hash);
        // check if its an array
        if (!qx.lang.Type.isArray(delegateMixins)) {
          if (delegateMixins != null) {
            mixins = [delegateMixins];
          }
        } else {
          mixins = delegateMixins;
        }
      }

      // include the mixin for the event bubbling
      if (includeBubbleEvents) {
        mixins.push(qx.data.marshal.MEventBubbling);
      }

      // create the map for the class
      var newClass = {
        extend : superClass,
        include : mixins,
        properties : properties,
        members : members,
        destruct : this.__disposeProperties
      };

      qx.Class.define("qx.data.model." + hash, newClass);
    },


    /**
     * Destructor for all created classes which disposes all stuff stored in
     * the properties.
     */
    __disposeProperties : function() {
      var properties = qx.util.PropertyUtil.getAllProperties(this.constructor);
      for (var desc in properties) {
        this.__disposeItem(this.get(properties[desc].name));
      };
    },


    /**
     * Helper for disposing items of the created class.
     *
     * @param item {var} The item to dispose.
     */
    __disposeItem : function(item) {
      if (!(item instanceof qx.core.Object)) {
        // ignore all non objects
        return;
      }
      // ignore already disposed items (could happen during shutdown)
      if (item.isDisposed()) {
        return;
      }
      item.dispose();
    },


    /**
     * Creates an instance for the given data hash.
     *
     * @param hash {String} The hash of the data for which an instance should
     *   be created.
     * @return {qx.core.Object} An instance of the corresponding class.
     */
    __createInstance: function(hash) {
      var delegateClass;
      // get the class from the delegate
      if (this.__delegate && this.__delegate.getModelClass) {
        delegateClass = this.__delegate.getModelClass(hash);
      }
      if (delegateClass != null) {
        return (new delegateClass());
      } else {
        var clazz = qx.Class.getByName("qx.data.model." + hash);
        return (new clazz());
      }
    },


    /**
     * Helper to decide if the delegate decides to ignore a data set.
     * @param hash {String} The property names.
     * @param parentProperty {String|null} The name of the property the data
     *   will be stored in.
     * @param depth {Number} The depth of the object relative to the data root.
     * @return {Boolean} <code>true</code> if the set should be ignored
     */
    __ignore : function(hash, parentProperty, depth) {
      var del = this.__delegate;
      return del && del.ignore && del.ignore(hash, parentProperty, depth);
    },


    /**
     * Creates for the given data the needed models. Be sure to have the classes
     * created with {@link #toClass} before calling this method. The creation
     * of the class itself is delegated to the {@link #__createInstance} method,
     * which could use the {@link qx.data.store.IStoreDelegate} methods, if
     * given.
     *
     * @param data {Object} The object for which models should be created.
     *
     * @return {qx.core.Object} The created model object.
     */
    toModel: function(data) {
      return this.__toModel(data, null, 0);
    },


    /**
     * Implementation of {@link #toModel} used for recursion.
     *
     * @param data {Object} The object for which models should be created.
     * @param parentProperty {String|null} The name of the property the
     *   data will be stored in.
     * @param depth {Number} The depth of the data relative to the data's root.
     * @return {qx.core.Object} The created model object.
     */
    __toModel: function(data, parentProperty, depth) {
      var isObject = qx.lang.Type.isObject(data);
      var isArray = data instanceof Array || qx.Bootstrap.getClass(data) == "Array";

      if (
        (!isObject && !isArray)
        || !!data.$$isString // check for localized strings
        || data instanceof qx.core.Object
      ) {
        return data;

      // ignore rules
      } else if (this.__ignore(this.__jsonToHash(data), parentProperty, depth)) {
        return data;

      } else if (isArray) {
        var array = new qx.data.Array();
        // set the auto dispose for the array
        array.setAutoDisposeItems(true);

        for (var i = 0; i < data.length; i++) {
          array.push(this.__toModel(data[i], null, depth+1));
        }
        return array;

      } else if (isObject) {
        // create an instance for the object
        var hash = this.__jsonToHash(data);
        var model = this.__createInstance(hash);

        // go threw all element in the data
        for (var key in data) {
          // apply the property names mapping
          var propertyName = key;
          if (this.__delegate && this.__delegate.getPropertyMapping) {
            propertyName = this.__delegate.getPropertyMapping(key, hash);
          }
          var propertyNameReplaced = propertyName.replace(/-|\.|\s+/g, "");
          // warn if there has been a replacement
          if (
            (qx.core.Environment.get("qx.debug")) &&
            qx.core.Environment.get("qx.debug.databinding")
          ) {
            if (propertyNameReplaced != propertyName) {
              this.warn(
                "The model contained an illegal name: '" + key +
                "'. Replaced it with '" + propertyName + "'."
              );
            }
          }
          propertyName = propertyNameReplaced;
          // only set the properties if they are available [BUG #5909]
          var setterName = "set" + qx.lang.String.firstUp(propertyName);
          if (model[setterName]) {
            model[setterName](this.__toModel(data[key], key, depth+1));
          }
        }
        return model;
      }

      throw new Error("Unsupported type!");
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this.__delegate = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * AbstractRequest serves as a base class for {@link qx.io.request.Xhr}
 * and {@link qx.io.request.Jsonp}. It contains methods to conveniently
 * communicate with transports found in {@link qx.bom.request}.
 *
 * The general procedure to derive a new request is to choose a
 * transport (override {@link #_createTransport}) and link
 * the transport’s response (override {@link #_getParsedResponse}).
 * The transport must implement {@link qx.bom.request.IRequest}.
 *
 * To adjust the behavior of {@link #send} override
 * {@link #_getConfiguredUrl} and {@link #_getConfiguredRequestHeaders}.
 */
qx.Class.define("qx.io.request.AbstractRequest",
{
  type : "abstract",

  extend : qx.core.Object,

  /**
   * @param url {String?} The URL of the resource to request.
   */
  construct : function(url)
  {
    this.base(arguments);

    if (url !== undefined) {
      this.setUrl(url);
    }

    this.__requestHeaders = {};

    var transport = this._transport = this._createTransport();
    this._setPhase("unsent");

    this.__onReadyStateChangeBound = qx.lang.Function.bind(this._onReadyStateChange, this);
    this.__onLoadBound = qx.lang.Function.bind(this._onLoad, this);
    this.__onLoadEndBound = qx.lang.Function.bind(this._onLoadEnd, this);
    this.__onAbortBound = qx.lang.Function.bind(this._onAbort, this);
    this.__onTimeoutBound = qx.lang.Function.bind(this._onTimeout, this);
    this.__onErrorBound = qx.lang.Function.bind(this._onError, this);

    transport.onreadystatechange = this.__onReadyStateChangeBound;
    transport.onload = this.__onLoadBound;
    transport.onloadend = this.__onLoadEndBound;
    transport.onabort = this.__onAbortBound;
    transport.ontimeout = this.__onTimeoutBound;
    transport.onerror = this.__onErrorBound;
  },

  events :
  {
    /**
     * Fired on every change of the transport’s readyState.
     */
    "readyStateChange": "qx.event.type.Event",

    /**
     * Fired when request completes without error and transport’s status
     * indicates success.
     */
    "success": "qx.event.type.Event",

    /**
     * Fired when request completes without error.
     */
    "load": "qx.event.type.Event",

    /**
     * Fired when request completes with or without error.
     */
    "loadEnd": "qx.event.type.Event",

    /**
     * Fired when request is aborted.
     */
    "abort": "qx.event.type.Event",

    /**
     * Fired when request reaches timeout limit.
     */
    "timeout": "qx.event.type.Event",

    /**
     * Fired when request completes with error.
     */
    "error": "qx.event.type.Event",

    /**
     * Fired when request completes without error but erroneous HTTP status.
     */
    "statusError": "qx.event.type.Event",

    /**
     * Fired on timeout, error or remote error.
     *
     * This event is fired for convenience. Usually, it is recommended
     * to handle error related events in a more granular approach.
     */
    "fail": "qx.event.type.Event",

    /**
    * Fired on change of the parsed response.
    *
    * This event allows to use data binding with the
    * parsed response as source.
    *
    * For example, to bind the response to the value of a label:
    *
    * <pre class="javascript">
    * // req is an instance of qx.io.request.*,
    * // label an instance of qx.ui.basic.Label
    * req.bind("response", label, "value");
    * </pre>
    *
    * The response is parsed (and therefore changed) only
    * after the request completes successfully. This means
    * that when a new request is made the initial emtpy value
    * is ignored, instead only the final value is bound.
    *
    */
    "changeResponse": "qx.event.type.Data",

    /**
     * Fired on change of the phase.
     */
    "changePhase": "qx.event.type.Data"
  },

  properties :
  {
    /**
     * The URL of the resource to request.
     *
     * Note: Depending on the configuration of the request
     * and/or the transport chosen, query params may be appended
     * automatically.
     */
    url: {
      check: "String"
    },


    /**
     * Timeout limit in milliseconds. Default (0) means no limit.
     */
    timeout: {
      check: "Number",
      nullable: true,
      init: 0
    },

    /**
     * Data to be send as part of the request.
     *
     * Supported types:
     *
     * * String
     * * Map
     * * qooxdoo Object
     *
     * For every supported type except strings, a URL encoded string
     * with unsafe characters escaped is internally generated and sent
     * as part of the request.
     *
     * Depending on the underlying transport and its configuration, the request
     * data is transparently included as URL query parameters or embedded in the
     * request body as form data.
     *
     * If a string is given the user must make sure it is properly formatted and
     * escaped. See {@link qx.lang.Object#toUriParameter}.
     *
     */
    requestData: {
      check: function(value) {
        return qx.lang.Type.isString(value) ||
               qx.Class.isSubClassOf(value.constructor, qx.core.Object) ||
               qx.lang.Type.isObject(value);
      },
      nullable: true
    },

    /**
     * Authentication delegate.
     *
     * The delegate must implement {@link qx.io.request.authentication.IAuthentication}.
     */
    authentication: {
      check: "qx.io.request.authentication.IAuthentication",
      nullable: true
    }
  },

  members :
  {

    /**
     * Bound handlers.
     */
    __onReadyStateChangeBound: null,
    __onLoadBound: null,
    __onLoadEndBound: null,
    __onAbortBound: null,
    __onTimeoutBound: null,
    __onErrorBound: null,

    /**
     * Parsed response.
     */
    __response: null,

    /**
     * Abort flag.
     */
     __abort: null,

    /**
     * Current phase.
     */
    __phase: null,

    /**
     * Request headers.
     */
    __requestHeaders: null,

    /**
     * Request headers (deprecated).
     */
    __requestHeadersDeprecated: null,

    /**
     * Holds transport.
     */
    _transport: null,

    /*
    ---------------------------------------------------------------------------
      CONFIGURE TRANSPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Create and return transport.
     *
     * This method MUST be overridden, unless the constructor is overridden as
     * well. It is called by the constructor and should return the transport that
     * is to be interfaced.
     *
     * @return {qx.bom.request} Transport.
     */
    _createTransport: function() {
      throw new Error("Abstract method call");
    },

    /**
     * Get configured URL.
     *
     * A configured URL typically includes a query string that
     * encapsulates transport specific settings such as request
     * data or no-cache settings.
     *
     * This method MAY be overridden. It is called in {@link #send}
     * before the request is initialized.
     *
     * @return {String} The configured URL.
     */
    _getConfiguredUrl: function() {},

    /**
     * Get configuration related request headers.
     *
     * This method MAY be overridden to add request headers for features limited
     * to a certain transport.
     *
     * @return {Map} Map of request headers.
     */
    _getConfiguredRequestHeaders: function() {},

    /**
     * Get parsed response.
     *
     * Is called in the {@link #_onReadyStateChange} event handler
     * to parse and store the transport’s response.
     *
     * This method MUST be overridden.
     *
     * @return {String} The parsed response of the request.
     */
    _getParsedResponse: function() {
      throw new Error("Abstract method call");
    },

    /**
     * Get method.
     *
     * This method MAY be overridden. It is called in {@link #send}
     * before the request is initialized.
     *
     * @return {String} The method.
     */
    _getMethod: function() {
      return "GET";
    },

    /**
     * Whether async.
     *
     * This method MAY be overridden. It is called in {@link #send}
     * before the request is initialized.
     *
     * @return {Boolean} Whether to process asynchronously.
     */
    _isAsync: function() {
      return true;
    },

    /*
    ---------------------------------------------------------------------------
      INTERACT WITH TRANSPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Send request.
     */
    send: function() {
      var transport = this._transport,
          url, method, async, serializedData;

      //
      // Open request
      //

      url = this._getConfiguredUrl();

      // Drop fragment (anchor) from URL as per
      // http://www.w3.org/TR/XMLHttpRequest/#the-open-method
      if (/\#/.test(url)) {
        url = url.replace(/\#.*/, "");
      }

      transport.timeout = this.getTimeout();

      // Support transports with enhanced feature set
      method = this._getMethod();
      async = this._isAsync();

      // Open
      if (qx.core.Environment.get("qx.debug.io")) {
        this.debug("Open low-level request with method: " +
          method + ", url: " + url + ", async: " + async);
      }

      transport.open(method, url, async);
      this._setPhase("opened");

      //
      // Send request
      //

      serializedData = this._serializeData(this.getRequestData());

      this._setRequestHeaders();

      // Send
      if (qx.core.Environment.get("qx.debug.io")) {
        this.debug("Send low-level request");
      }
      method == "GET" ? transport.send() : transport.send(serializedData);
      this._setPhase("sent");
    },

    /**
     * Abort request.
     */
    abort: function() {
       if (qx.core.Environment.get("qx.debug.io")) {
         this.debug("Abort request");
       }
       this.__abort = true;

       // Update phase to "abort" before user handler are invoked [BUG #5485]
       this.__phase = "abort";

       this._transport.abort();
    },

    /*
    ---------------------------------------------------------------------------
     REQUEST HEADERS
    ---------------------------------------------------------------------------
    */

    /**
     * Apply configured request headers to transport.
     *
     * This method MAY be overridden to customize application of request headers
     * to transport.
     */
    _setRequestHeaders: function() {
      var transport = this._transport,
          requestHeaders = this._getAllRequestHeaders();

      for (var key in requestHeaders) {
        transport.setRequestHeader(key, requestHeaders[key]);
      }

    },

    /**
     * Get all request headers.
     *
     * @return {Map} All request headers.
     */
    _getAllRequestHeaders: function() {
      var requestHeaders = {};
      // Transport specific headers
      qx.lang.Object.mergeWith(requestHeaders, this._getConfiguredRequestHeaders());
      // Authentication delegate
      qx.lang.Object.mergeWith(requestHeaders, this.__getAuthRequestHeaders());
      // User-defined, requestHeaders property (deprecated)
      qx.lang.Object.mergeWith(requestHeaders, this.__requestHeadersDeprecated);
      // User-defined
      qx.lang.Object.mergeWith(requestHeaders, this.__requestHeaders);

      return requestHeaders;
    },

    /**
    * Retrieve authentication headers from auth delegate.
    *
    * @return {Map} Authentication related request headers.
    */
    __getAuthRequestHeaders: function() {
      var auth = this.getAuthentication(),
          headers = {};

      if (auth) {
        auth.getAuthHeaders().forEach(function(header) {
          headers[header.key] = header.value;
        });
        return headers;
      }
    },

    /**
     * Set a request header.
     *
     * Note: Setting request headers has no effect after the request was send.
     *
     * @param key {String} Key of the header.
     * @param value {String} Value of the header.
     */
    setRequestHeader: function(key, value) {
      this.__requestHeaders[key] = value;
    },

    /**
     * Get a request header.
     *
     * @param key {String} Key of the header.
     * @return {String} The value of the header.
     */
    getRequestHeader: function(key) {
       return this.__requestHeaders[key];
    },

    /**
     * Remove a request header.
     *
     * Note: Removing request headers has no effect after the request was send.
     *
     * @param key {String} Key of the header.
     */
    removeRequestHeader: function(key) {
      if (this.__requestHeaders[key]) {
       delete this.__requestHeaders[key];
      }
    },


    /*
    ---------------------------------------------------------------------------
     QUERY TRANSPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Get low-level transport.
     *
     * Note: To be used with caution!
     *
     * This method can be used to query the transport directly,
     * but should be used with caution. Especially, it
     * is not advisable to call any destructive methods
     * such as <code>open</code> or <code>send</code>.
     *
     * @return {Object} An instance of a class found in
     *  <code>qx.bom.request.*</code>
     */

     // This method mainly exists so that some methods found in the
     // low-level transport can be deliberately omitted here,
     // but still be accessed should it be absolutely necessary.
     //
     // Valid use cases include to query the transport’s responseXML
     // property if performance is critical and any extra parsing
     // should be avoided at all costs.
     //
    getTransport: function() {
      return this._transport;
    },

    /**
     * Get current ready state.
     *
     * States can be:
     * UNSENT:           0,
     * OPENED:           1,
     * HEADERS_RECEIVED: 2,
     * LOADING:          3,
     * DONE:             4
     *
     * @return {Number} Ready state.
     */
    getReadyState: function() {
      return this._transport.readyState;
    },

    /**
     * Get current phase.
     *
     * A more elaborate version of {@link #getReadyState}, this method indicates
     * the current phase of the request. Maps to stateful (i.e. deterministic)
     * events (success, abort, timeout, statusError) and intermediate
     * readyStates (unsent, configured, loading, load).
     *
     * When the requests is successful, it progresses the states:<br>
     * 'unsent', 'opened', 'sent', 'loading', 'load', 'success'
     *
     * In case of failure, the final state is one of:<br>
     * 'abort', 'timeout', 'statusError'
     *
     * For each change of the phase, a {@link #changePhase} data event is fired.
     *
     * @return {String} Current phase.
     *
     */
    getPhase: function() {
      return this.__phase;
    },

    /**
     * Get status code.
     *
     * @return {Number} The transport’s status code.
     */
    getStatus: function() {
      return this._transport.status;
    },

    /**
     * Get status text.
     *
     * @return {String} The transport’s status text.
     */
    getStatusText: function() {
      return this._transport.statusText;
    },

    /**
     * Get raw (unprocessed) response.
     *
     * @return {String} The raw response of the request.
     */
    getResponseText: function() {
      return this._transport.responseText;
    },

    /**
     * Get all response headers from response.
     *
     * @return {String} All response headers.
     */
    getAllResponseHeaders: function() {
      return this._transport.getAllResponseHeaders();
    },

    /**
     * Get a single response header from response.
     *
     * @param key {String}
     *   Key of the header to get the value from.
     * @return {String}
     *   Response header.
     */
    getResponseHeader: function(key) {
      return this._transport.getResponseHeader(key);
    },

    /**
     * Get the content type response header from response.
     *
     * @return {String}
     *   Content type response header.
     */
    getResponseContentType: function() {
      return this.getResponseHeader("Content-Type");
    },

    /**
     * Whether request completed (is done).
     */
    isDone: function() {
      return this.getReadyState() === 4;
    },

    /*
    ---------------------------------------------------------------------------
      RESPONSE
    ---------------------------------------------------------------------------
    */

    /**
     * Get parsed response.
     *
     * @return {String} The parsed response of the request.
     */
    getResponse: function() {
      return this.__response;
    },

    /**
     * Set response.
     *
     * @param response {String} The parsed response of the request.
     */
    _setResponse: function(response) {
      var oldResponse = response;

      if (this.__response !== response) {
        this.__response = response;
        this.fireEvent("changeResponse", qx.event.type.Data, [this.__response, oldResponse]);
      }
    },

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Handle "readyStateChange" event.
     */
    _onReadyStateChange: function() {
      var readyState = this.getReadyState();

      if (qx.core.Environment.get("qx.debug.io")) {
        this.debug("Fire readyState: " + readyState);
      }

      this.fireEvent("readyStateChange");

      // Transport switches to readyState DONE on abort and may already
      // have successful HTTP status when response is served from cache.
      //
      // Not fire custom event "loading" (or "success", when cached).
      if (this.__abort) {
        return;
      }

      if (readyState === 3) {
        this._setPhase("loading");
      }

      if (this.isDone()) {
        this.__onReadyStateDone();
      }
    },

    /**
     * Called internally when readyState is DONE.
     */
    __onReadyStateDone: function() {
      var parsedResponse;

      if (qx.core.Environment.get("qx.debug.io")) {
        this.debug("Request completed with HTTP status: " + this.getStatus());
      }

      // Event "load" fired in onLoad
      this._setPhase("load");

      // Successful HTTP status
      if (qx.util.Request.isSuccessful(this.getStatus())) {

        // Parse response
        if (qx.core.Environment.get("qx.debug.io")) {
          this.debug("Response is of type: '" + this.getResponseContentType() + "'");
        }
        parsedResponse = this._getParsedResponse();
        this._setResponse(parsedResponse);

        this._fireStatefulEvent("success");

      // Erroneous HTTP status
      } else {

        // A remote error failure
        if (this.getStatus() !== 0) {
          this._fireStatefulEvent("statusError");
          this.fireEvent("fail");
        }
      }
    },

    /**
     * Handle "load" event.
     */
    _onLoad: function() {
      this.fireEvent("load");
    },

    /**
     * Handle "loadEnd" event.
     */
    _onLoadEnd: function() {
      this.fireEvent("loadEnd");
    },

    /**
     * Handle "abort" event.
     */
    _onAbort: function() {
      this._fireStatefulEvent("abort");
    },

    /**
     * Handle "timeout" event.
     */
    _onTimeout: function() {
      this._fireStatefulEvent("timeout");

      // A network error failure
      this.fireEvent("fail");
    },

    /**
     * Handle "error" event.
     */
    _onError: function() {
      this.fireEvent("error");

      // A network error failure
      this.fireEvent("fail");
    },

    /*
    ---------------------------------------------------------------------------
      INTERNAL / HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Fire stateful event.
     *
     * Fires event and sets phase to name of event.
     *
     * @param evt {String} Name of the event to fire.
     */
    _fireStatefulEvent: function(evt) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertString(evt);
      }
      this._setPhase(evt);
      this.fireEvent(evt);
    },

    /**
     * Set phase.
     *
     * @param phase {String} The phase to set.
     */
    _setPhase: function(phase) {
      var previousPhase = this.__phase;

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertString(phase);
        qx.core.Assert.assertMatch(phase,
          /^(unsent)|(opened)|(sent)|(loading)|(load)|(success)|(abort)|(timeout)|(statusError)$/);
      }

      this.__phase = phase;
      this.fireDataEvent("changePhase", phase, previousPhase);
    },

    /**
     * Serialize data
     *
     * @param data {String|Map|qx.core.Object} Data to serialize.
     * @return {String} Serialized data.
     */
    _serializeData: function(data) {
      var isPost = typeof this.getMethod !== "undefined" && this.getMethod() == "POST";

      if (!data) {
        return;
      }

      if (qx.lang.Type.isString(data)) {
        return data;
      }

      if (qx.Class.isSubClassOf(data.constructor, qx.core.Object)) {
        return qx.util.Serializer.toUriParameter(data);
      }

      if (qx.lang.Type.isObject(data)) {
        return qx.util.Uri.toParameter(data, isPost);
      }
    }
  },

  environment:
  {
    "qx.debug.io": false
  },

  destruct: function()
  {
    var transport = this._transport,
        noop = function() {};

    if (this._transport) {
      transport.onreadystatechange = transport.onload = transport.onloadend =
      transport.onabort = transport.ontimeout = transport.onerror = noop;

      transport.dispose();
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Static helpers for handling requests.
 */
qx.Bootstrap.define("qx.util.Request",
{
  statics:
  {
    /**
     * Whether URL given points to resource that is cross-domain,
     * i.e. not of same origin.
     *
     * @param url {String} URL.
     * @return {Boolean} Whether URL is cross domain.
     */
    isCrossDomain: function(url) {
      var result = qx.util.Uri.parseUri(url),
          location = window.location;

      if (!location) {
        return false;
      }

      var protocol = location.protocol;

      // URL is relative in the sence that it points to origin host
      if (!(url.indexOf("//") !== -1)) {
        return false;
      }

      if (protocol.substr(0, protocol.length-1) == result.protocol &&
          location.host === result.host &&
          location.port === result.port) {
        return false;
      }

      return true;
    },

    /**
     * Determine if given HTTP status is considered successful.
     *
     * @param status {Number} HTTP status.
     * @return {Boolean} Whether status is considered successful.
     */
    isSuccessful: function(status) {
      return (status >= 200 && status < 300 || status === 304);
    },

    /**
     * Request body is ignored for HTTP method GET and HEAD.
     *
     * See http://www.w3.org/TR/XMLHttpRequest2/#the-send-method.
     *
     * @param method {String} The HTTP method.
     * @return {Boolean} Whether request may contain body.
     */
    methodAllowsRequestBody: function(method) {
      return !((/^(GET)|(HEAD)$/).test(method));
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#ignore(qx.data.IListData)
#ignore(qx.locale.LocalizedString)

************************************************************************ */

/**
 * This is an util class responsible for serializing qooxdoo objects.
 */
qx.Class.define("qx.util.Serializer",
{
  statics :
  {

    /**
     * Serializes the properties of the given qooxdoo object. To get the
     * serialization working, every property needs to have a string
     * representation because the value of the property will be concatenated to the
     * serialized string.
     *
     * @param object {qx.core.Object} Any qooxdoo object
     * @param qxSerializer {Function} Function used for serializing qooxdoo
     *   objects stored in the propertys of the object. Check for the type of
     *   classes <ou want to serialize and return the serialized value. In all
     *   other cases, just return nothing.
     * @param dateFormat {qx.util.format.DateFormat} If a date formater is given,
     *   the format method of this given formater is used to convert date
     *   objects into strings.
     * @return {String} The serialized object.
     */
    toUriParameter : function(object, qxSerializer, dateFormat)
    {
      var result = "";
      var properties = qx.util.PropertyUtil.getAllProperties(object.constructor);

      for (var name in properties) {
        // ignore property groups
        if (properties[name].group != undefined) {
          continue;
        }
        var value = object["get" + qx.lang.String.firstUp(name)]();

        // handle arrays
        if (qx.lang.Type.isArray(value)) {
          var isdataArray = qx.data && qx.data.IListData &&
            qx.Class.hasInterface(value && value.constructor, qx.data.IListData);
          for (var i = 0; i < value.length; i++) {
            var valueAtI = isdataArray ? value.getItem(i) : value[i];
            result += this.__toUriParameter(name, valueAtI, qxSerializer);
          };
        } else if (qx.lang.Type.isDate(value) && dateFormat != null) {
          result += this.__toUriParameter(
            name, dateFormat.format(value), qxSerializer
          );
        } else {
          result += this.__toUriParameter(name, value, qxSerializer);
        }
      }
      return result.substring(0, result.length - 1);
    },


    /**
     * Helper method for {@link #toUriParameter}. Check for qooxdoo objects
     * and returns the serialized name value pair for the given parameter.
     *
     * @param name {String} The name of the value
     * @param value {var} The value itself
     * @param qxSerializer {Function} The serializer for qooxdoo objects.
     * @return {String} The serialized name value pair.
     */
    __toUriParameter : function(name, value, qxSerializer)
    {
      if (value instanceof qx.core.Object && qxSerializer != null) {
        var encValue = encodeURIComponent(qxSerializer(value));
        if (encValue === undefined) {
          var encValue = encodeURIComponent(value);
        }
      } else {
        var encValue = encodeURIComponent(value);
      }
      return encodeURIComponent(name) + "=" + encValue + "&";
    },


    /**
     * Serializes the properties of the given qooxdoo object into a native
     * object.
     *
     * @param object {qx.core.Object}
     *   Any qooxdoo object
     *
     * @param qxSerializer {Function}
     *   Function used for serializing qooxdoo objects stored in the propertys
     *   of the object. Check for the type of classes you want to serialize
     *   and return the serialized value. In all other cases, just return
     *   nothing.
     * @param dateFormat {qx.util.format.DateFormat} If a date formater is given,
     *   the format method of this given formater is used to convert date
     *   objects into strings.
     * @return {String}
     *   The serialized object.
     */
    toNativeObject : function(object, qxSerializer, dateFormat)
    {
      var result;

      // null or undefined
      if (object == null)
      {
        return null;
      }

      // data array
      if (qx.data && qx.data.IListData && qx.Class.hasInterface(object.constructor, qx.data.IListData))
      {
        result = [];
        for (var i = 0; i < object.getLength(); i++)
        {
          result.push(qx.util.Serializer.toNativeObject(
            object.getItem(i), qxSerializer, dateFormat)
          );
        }

        return result;
      }

      // other arrays
      if (qx.lang.Type.isArray(object))
      {
        result = [];
        for (var i = 0; i < object.length; i++)
        {
          result.push(qx.util.Serializer.toNativeObject(
            object[i], qxSerializer, dateFormat)
          );
        }

        return result;
      }

      // qooxdoo object
      if (object instanceof qx.core.Object)
      {
        if (qxSerializer != null)
        {
          var returnValue = qxSerializer(object);

          // if we have something returned, return that
          if (returnValue != undefined)
          {
            return returnValue;
          }

          // continue otherwise
        }

        result = {};

        var properties =
          qx.util.PropertyUtil.getAllProperties(object.constructor);

        for (var name in properties)
        {
          // ignore property groups
          if (properties[name].group != undefined)
          {
            continue;
          }

          var value = object["get" + qx.lang.String.firstUp(name)]();
          result[name] = qx.util.Serializer.toNativeObject(
            value, qxSerializer, dateFormat
          );
        }

        return result;
      }

      // date objects with date format
      if (qx.lang.Type.isDate(object) && dateFormat != null) {
        return dateFormat.format(object);
      }

      // localized strings
      if (qx.locale && qx.locale.LocalizedString && object instanceof qx.locale.LocalizedString) {
        return object.toString();
      }

      // JavaScript objects
      if (qx.lang.Type.isObject(object))
      {
        result = {};

        for (var key in object)
        {
          result[key] = qx.util.Serializer.toNativeObject(
            object[key], qxSerializer, dateFormat
          );
        }

        return result;
      }

      // all other stuff, including String, Date, RegExp
      return object;
    },


    /**
     * Serializes the properties of the given qooxdoo object into a json object.
     *
     * @param object {qx.core.Object} Any qooxdoo object
     * @param qxSerializer {Function} Function used for serializing qooxdoo
     *   objects stored in the propertys of the object. Check for the type of
     *   classes <ou want to serialize and return the serialized value. In all
     *   other cases, just return nothing.
     * @param dateFormat {qx.util.format.DateFormat} If a date formater is given,
     *   the format method of this given formater is used to convert date
     *   objects into strings.
     * @return {String} The serialized object.
     */
    toJson : function(object, qxSerializer, dateFormat) {
      var result = "";

      // null or undefined
      if (object == null) {
        return "null";
      }

      // data array
      if (qx.data && qx.data.IListData && qx.Class.hasInterface(object.constructor, qx.data.IListData)) {
        result += "[";
        for (var i = 0; i < object.getLength(); i++) {
          result += qx.util.Serializer.toJson(object.getItem(i), qxSerializer, dateFormat) + ",";
        }
        if (result != "[") {
          result = result.substring(0, result.length - 1);
        }
        return result + "]";
      }

      // other arrays
      if (qx.lang.Type.isArray(object)) {
        result += "[";
        for (var i = 0; i < object.length; i++) {
          result += qx.util.Serializer.toJson(object[i], qxSerializer, dateFormat) + ",";
        }
        if (result != "[") {
          result = result.substring(0, result.length - 1);
        }
        return result + "]";
      }

      // qooxdoo object
      if (object instanceof qx.core.Object) {
        if (qxSerializer != null) {
          var returnValue = qxSerializer(object);
          // if we have something returned, ruturn that
          if (returnValue != undefined) {
            return '"' + returnValue + '"';
          }
          // continue otherwise
        }
        result += "{";
        var properties = qx.util.PropertyUtil.getAllProperties(object.constructor);
        for (var name in properties) {
          // ignore property groups
          if (properties[name].group != undefined) {
            continue;
          }
          var value = object["get" + qx.lang.String.firstUp(name)]();
          result += '"' + name + '":' + qx.util.Serializer.toJson(value, qxSerializer, dateFormat) + ",";
        }
        if (result != "{") {
          result = result.substring(0, result.length - 1);
        }
        return result + "}";
      }

      // localized strings
      if (object instanceof qx.locale.LocalizedString) {
        object = object.toString();
        // no return here because we want to have the string checks as well!
      }

      // date objects with formater
      if (qx.lang.Type.isDate(object) && dateFormat != null) {
        return '"' + dateFormat.format(object) + '"';
      }

      // javascript objects
      if (qx.lang.Type.isObject(object)) {
        result += "{";
        for (var key in object) {
          result += '"' + key + '":' +
                    qx.util.Serializer.toJson(object[key], qxSerializer, dateFormat) + ",";
        }
        if (result != "{") {
          result = result.substring(0, result.length - 1);
        }
        return result + "}";
      }

      // strings
      if (qx.lang.Type.isString(object)) {
        // escape
        object = object.replace(/([\\])/g, '\\\\');
        object = object.replace(/(["])/g, '\\"');
        object = object.replace(/([\r])/g, '\\r');
        object = object.replace(/([\f])/g, '\\f');
        object = object.replace(/([\n])/g, '\\n');
        object = object.replace(/([\t])/g, '\\t');
        object = object.replace(/([\b])/g, '\\b');

        return '"' + object + '"';
      }

      // Date and RegExp
      if (qx.lang.Type.isDate(object) || qx.lang.Type.isRegExp(object)) {
        return '"' + object + '"';
      }

      // all other stuff
      return object + "";
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Send HTTP requests and handle responses using the HTTP client API.
 *
 * Configuration of the request is done with properties. Events are fired for
 * various states in the life cycle of a request, such as "success". Request
 * data is transparently processed.
 *
 * Here is how to request a JSON file and listen to the "success" event:
 *
 * <pre class="javascript">
 * var req = new qx.io.request.Xhr("/some/path/file.json");
 *
 * req.addListener("success", function(e) {
 *   var req = e.getTarget();
 *
 *   // Response parsed according to the server's
 *   // response content type, e.g. JSON
 *   req.getResponse();
 * }, this);
 *
 * // Send request
 * req.send();
 * </pre>
 *
 * Some noteable features:
 *
 * * Abstraction of low-level request
 * * Convenient setup using properties
 * * Fine-grained events
 * * Symbolic phases
 * * Transparent processing of request data
 * * Stream-lined authentication
 * * Automagic parsing of response based on content type
 *
 * Cross-origin requests are supported, but require browser support
 * (see <a href="http://caniuse.com/#search=CORS">caniuse.com</a>) and backend configuration
 * (see <a href="https://developer.mozilla.org/en/http_access_control">MDN</a>).
 * Note that IE's <code>XDomainRequest</code> is not currently supported.
 * For a cross-browser alternative, consider {@link qx.io.request.Jsonp}.
 *
 * In order to debug requests, set the environment flag
 * <code>qx.debug.io</code>.
 *
 * Internally uses {@link qx.bom.request.Xhr}.
 */
qx.Class.define("qx.io.request.Xhr",
{
  extend: qx.io.request.AbstractRequest,

  /**
   * @param url {String?} The URL of the resource to request.
   * @param method {String?} The HTTP method.
   */
  construct: function(url, method) {
    if (method !== undefined) {
      this.setMethod(method);
    }

    this.base(arguments, url);
  },

  // Only document events with transport specific details.
  // For a complete list of events, refer to AbstractRequest.

  events:
  {
    /**
     * Fired on every change of the transport’s readyState.
     *
     * See {@link qx.bom.request.Xhr} for available readyStates.
     */
    "readyStateChange": "qx.event.type.Event",

    /**
    * Fired when request completes without eror and transport’s status
    * indicates success.
     *
     * Refer to {@link qx.util.Request#isSuccessful} for a list of HTTP
     * status considered successful.
     */
    "success": "qx.event.type.Event",

    /**
     * Fired when request completes without error.
     *
     * Every request not canceled or aborted completes. This means that
     * even requests receiving a response with erroneous HTTP status
     * fire a "load" event. If you are only interested in successful
     * responses, listen to the {@link #success} event instead.
     */
    "load": "qx.event.type.Event",

    /**
     * Fired when request completes without error but erroneous HTTP status.
     *
     * Refer to {@link qx.util.Request#isSuccessful} for a list of HTTP
     * status considered successful.
     */
    "statusError": "qx.event.type.Event"
  },

  statics:
  {
    /**
     * {Map} Map of parser functions. Parsers defined here can be
     * referenced symbolically, e.g. with {@link #setParser}.
     *
     * Known parsers are: <code>"json"</code> and <code>"xml"</code>.
     */
    PARSER: {
      json: qx.lang.Json.parse,
      xml: qx.xml.Document.fromString
    }
  },

  properties:
  {
    /**
     * The HTTP method.
     */
    method: {
      init: "GET"
    },

    /**
     * Whether the request should be executed asynchronously.
     */
    async: {
      check: "Boolean",
      init: true
    },

    /**
     * The content type to accept. By default, every content type
     * is accepted.
     *
     * Note: Some backends send distinct representations of the same
     * resource depending on the content type accepted. For instance,
     * a backend may respond with either a JSON (the accept header
     * indicates so) or a HTML representation (the default, no accept
     * header given).
     */
    accept: {
      check: "String",
      nullable: true
    },

    /**
     * Whether to allow request to be answered from cache.
     *
     * Allowed values:
     *
     * * <code>true</code>: Allow caching (Default)
     * * <code>false</code>: Prohibit caching. Appends nocache parameter to URL.
     * * <code>String</code>: Any Cache-Control request directive
     *
     * If a string is given, it is inserted in the request's Cache-Control
     * header. A request’s Cache-Control header may contain a number of directives
     * controlling the behavior of any caches in between client and origin
     * server.
     *
     * * <code>"no-cache"</code>: Force caches to submit request in order to
     *   validate the freshness of the representation. Note that the requested
     *   resource may still be served from cache if the representation is
     *   considered fresh. Use this directive to ensure freshness but save
     *   bandwidth when possible.
     * * <code>"no-store"</code>: Do not keep a copy of the representation under
     *   any conditions.
     *
     * See <a href="http://www.mnot.net/cache_docs/#CACHE-CONTROL">
     * Caching tutorial</a> for an excellent introduction to Caching in general.
     * Refer to the corresponding section in the
     * <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9">
     * HTTP 1.1 specification</a> for more details and advanced directives.
     *
     * It is recommended to choose an appropriate Cache-Control directive rather
     * than prohibit caching using the nocache parameter.
     */
    cache: {
      check: function(value) {
        return qx.lang.Type.isBoolean(value) ||
          qx.lang.Type.isString(value);
      },
      init: true
    }
  },

  members:
  {

    /**
     * {Function} Parser.
     */
    __parser: null,

    /*
    ---------------------------------------------------------------------------
      CONFIGURE TRANSPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Create XHR transport.
     *
     * @return {qx.bom.request.Xhr} Transport.
     */
    _createTransport: function() {
      return new qx.bom.request.Xhr();
    },

    /**
     * Get configured URL.
     *
     * Append request data to URL if HTTP method is GET. Append random
     * string to URL if required by value of {@link #cache}.
     *
     * @return {String} The configured URL.
     */
    _getConfiguredUrl: function() {
      var url = this.getUrl(),
          serializedData;

      if (this.getMethod() === "GET" && this.getRequestData()) {
        serializedData = this._serializeData(this.getRequestData());
        url = qx.util.Uri.appendParamsToUrl(url, serializedData);
      }

      if (this.getCache() === false) {
        // Make sure URL cannot be served from cache and new request is made
        url = qx.util.Uri.appendParamsToUrl(url, {nocache: new Date().valueOf()});
      }

      return url;
    },

    // overridden
    _getConfiguredRequestHeaders: function() {
      var headers = {},
          isAllowsBody = qx.util.Request.methodAllowsRequestBody(this.getMethod());

      // Follow convention to include X-Requested-With header when same origin
      if (!qx.util.Request.isCrossDomain(this.getUrl())) {
        headers["X-Requested-With"] = "XMLHttpRequest";
      }

      // Include Cache-Control header if configured
      if (qx.lang.Type.isString(this.getCache())) {
        headers["Cache-Control"] = this.getCache();
      }

      // By default, set content-type urlencoded for requests with body
      if (this.getRequestData() !== "null" && isAllowsBody) {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }

      // What representations to accept
      if (this.getAccept()) {
        if (qx.core.Environment.get("qx.debug.io")) {
          this.debug("Accepting: '" + this.getAccept() + "'");
        }
        headers["Accept"] = this.getAccept();
      }

      return headers;
    },

    // overridden
    _getMethod: function() {
      return this.getMethod();
    },

    // overridden
    _isAsync: function() {
      return this.isAsync();
    },

    /*
    ---------------------------------------------------------------------------
      PARSING
    ---------------------------------------------------------------------------
    */

    /**
     * Returns response parsed with parser determined by
     * {@link #_getParser}.
     *
     * @return {String|Object} The parsed response of the request.
     */
    _getParsedResponse: function() {
      var response = this._transport.responseText,
          parser = this._getParser();

      if (typeof parser === "function") {
        if (response !== "") {
          return parser.call(this, response);
        }
      }

      return response;
    },

    /**
     * Set parser used to parse response once request has
     * completed successfully.
     *
     * Usually, the parser is correctly inferred from the
     * content type of the response. This method allows to force the
     * parser being used, e.g. if the content type returned from
     * the backend is wrong or the response needs special parsing.
     *
     * Parsers most typically used can be referenced symbolically.
     * To cover edge cases, a function can be given. When parsing
     * the response, this function is called with the raw response as
     * first argument.
     *
     * @param parser {String|Function}
     *
     *        <br>Can be:
     *
     *         * A parser defined in {@link qx.io.request.Xhr#PARSER},
     *           referenced by string.
     *
     *         * The function to invoke.
     *           Receives the raw response as argument.
     *
     * @return {Function} The parser function
     */
    setParser: function(parser) {
      var Xhr = qx.io.request.Xhr;

      // Symbolically given known parser
      if (typeof Xhr.PARSER[parser] === "function") {
        return this.__parser = Xhr.PARSER[parser];
      }

      // If parser is not a symbol, it must be a function
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertFunction(parser);
      }

      return this.__parser = parser;
    },


    /**
     * Get the parser.
     *
     * If not defined explicitly using {@link #setParser},
     * the parser is inferred from the content type.
     *
     * Override this method to extend the list of content types
     * being handled.
     *
     * @return {Function|null} The parser function or <code>null</code> if the
     * content type is undetermined.
     *
     */
    _getParser: function() {
      var parser = this.__parser,
          contentType;

      // Use user-provided parser, if any
      if (parser) {
        return parser;
      }

      // Content type undetermined
      if (!this.isDone()) {
        return null;
      }

      // See http://restpatterns.org/Glossary/MIME_Type

      contentType = this.getResponseContentType() || "";

      // Ignore parameters (e.g. the character set)
      contentType = contentType.replace(/;.*$/, "");

      if ((/^application\/(\w|\.)*\+?json$/).test(contentType)) {
        parser = qx.io.request.Xhr.PARSER["json"];
      }

      if ((/^application\/xml$/).test(contentType)) {
        parser = qx.io.request.Xhr.PARSER["xml"];
      }

      // Deprecated
      if ((/[^\/]+\/[^\+]+\+xml$/).test(this.getResponseContentType())) {
        parser = qx.io.request.Xhr.PARSER["xml"];
      }

      return parser;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/* ************************************************************************
#ignore(XDomainRequest)
#require(qx.bom.request.Xhr#open)
#require(qx.bom.request.Xhr#send)
#require(qx.bom.request.Xhr#on)
#require(qx.bom.request.Xhr#onreadystatechange)
#require(qx.bom.request.Xhr#onload)
#require(qx.bom.request.Xhr#onloadend)
#require(qx.bom.request.Xhr#onerror)
#require(qx.bom.request.Xhr#onabort)
#require(qx.bom.request.Xhr#ontimeout)
#require(qx.bom.request.Xhr#setRequestHeader)
#require(qx.bom.request.Xhr#getAllResponseHeaders)
#require(qx.bom.request.Xhr#getRequest)
************************************************************************ */

/**
 * A wrapper of the XMLHttpRequest host object (or equivalent). The interface is
 * similar to <a href="http://www.w3.org/TR/XMLHttpRequest/">XmlHttpRequest</a>.
 *
 * Hides browser inconsistencies and works around bugs found in popular
 * implementations.
 *
 * <div class="desktop">
 * Example:
 *
 * <pre class="javascript">
 *  var req = new qx.bom.request.Xhr();
 *  req.onload = function() {
 *    // Handle data received
 *    req.responseText;
 *  }
 *
 *  req.open("GET", url);
 *  req.send();
 * </pre>
 * </div>
 */
qx.Bootstrap.define("qx.bom.request.Xhr",
{

  construct: function() {
    this.__onNativeReadyStateChangeBound = qx.Bootstrap.bind(this.__onNativeReadyStateChange, this);
    this.__onNativeAbortBound = qx.Bootstrap.bind(this.__onNativeAbort, this);
    this.__onTimeoutBound = qx.Bootstrap.bind(this.__onTimeout, this);

    this.__initNativeXhr();
    this._emitter = new qx.event.Emitter();

    // BUGFIX: IE
    // IE keeps connections alive unless aborted on unload
    if (window.attachEvent) {
      this.__onUnloadBound = qx.Bootstrap.bind(this.__onUnload, this);
      window.attachEvent("onunload", this.__onUnloadBound);
    }

  },

  statics :
  {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
  },


  events : {
    /** Fired at ready state changes. */
    "readystatechange" : "qx.bom.request.Xhr",

    /** Fired on error. */
    "error" : "qx.bom.request.Xhr",

    /** Fired at loadend. */
    "loadend" : "qx.bom.request.Xhr",

    /** Fired on timeouts. */
    "timeout" : "qx.bom.request.Xhr",

    /** Fired when the request is aborted. */
    "abort" : "qx.bom.request.Xhr",

    /** Fired on successful retrieval. */
    "load" : "qx.bom.request.Xhr"
  },


  members :
  {
    /*
    ---------------------------------------------------------------------------
      PUBLIC
    ---------------------------------------------------------------------------
    */

    /**
     * {Number} Ready state.
     *
     * States can be:
     * UNSENT:           0,
     * OPENED:           1,
     * HEADERS_RECEIVED: 2,
     * LOADING:          3,
     * DONE:             4
     */
    readyState: 0,

    /**
     * {String} The response of the request as text.
     */
    responseText: "",

    /**
     * {Object} The response of the request as a Document object.
     */
    responseXML: null,

    /**
     * {Number} The HTTP status code.
     */
    status: 0,

    /**
     * {String} The HTTP status text.
     */
    statusText: "",

    /**
     * {Number} Timeout limit in milliseconds.
     *
     * 0 (default) means no timeout. Not supported for synchronous requests.
     */
    timeout: 0,

    /**
     * Initializes (prepares) request.
     *
     * @lint ignoreUndefined(XDomainRequest)
     *
     * @param method {String?"GET"}
     *  The HTTP method to use.
     * @param url {String}
     *  The URL to which to send the request.
     * @param async {Boolean?true}
     *  Whether or not to perform the operation asynchronously.
     * @param user {String?null}
     *  Optional user name to use for authentication purposes.
     * @param password {String?null}
     *  Optional password to use for authentication purposes.
     */
    open: function(method, url, async, user, password) {
      this.__checkDisposed();

      // Mimick native behavior
      if (typeof url === "undefined") {
        throw new Error("Not enough arguments");
      } else if (typeof method === "undefined") {
        method = "GET";
      }

      // Reset flags that may have been set on previous request
      this.__abort = false;
      this.__send = false;
      this.__conditional = false;

      // Store URL for later checks
      this.__url = url;

      if (typeof async == "undefined") {
        async = true;
      }
      this.__async = async;

      // BUGFIX
      // IE < 9 and FF < 3.5 cannot reuse the native XHR to issue many requests
      if (!this.__supportsManyRequests() && this.readyState > qx.bom.request.Xhr.UNSENT) {
        // XmlHttpRequest Level 1 requires open() to abort any pending requests
        // associated to the object. Since we're dealing with a new object here,
        // we have to emulate this behavior. Moreover, allow old native XHR to be garbage collected
        //
        // Dispose and abort.
        //
        this.dispose();

        // Replace the underlying native XHR with a new one that can
        // be used to issue new requests.
        this.__initNativeXhr();
      }

      // Restore handler in case it was removed before
      this.__nativeXhr.onreadystatechange = this.__onNativeReadyStateChangeBound;

      try {
        if (qx.core.Environment.get("qx.debug.io")) {
          qx.Bootstrap.debug(qx.bom.request.Xhr, "Open native request with method: " +
            method + ", url: " + url + ", async: " + async);
        }

        this.__nativeXhr.open(method, url, async, user, password);

      // BUGFIX: IE, Firefox < 3.5
      // Some browsers do not support Cross-Origin Resource Sharing (CORS)
      // for XMLHttpRequest. Instead, an exception is thrown even for async requests
      // if URL is cross-origin (as per XHR level 1). Use the proprietary XDomainRequest
      // if available (supports CORS) and handle error (if there is one) this
      // way. Otherwise just assume network error.
      //
      // Basically, this allows to detect network errors.
      } catch(OpenError) {

        // Only work around exceptions caused by cross domain request attempts
        if (!qx.util.Request.isCrossDomain(url)) {
          // Is same origin
          throw OpenError;
        }

        if (!this.__async) {
          this.__openError = OpenError;
        }

        if (this.__async) {
          // Try again with XDomainRequest
          // (Success case not handled on purpose)
          // - IE 9
          if (window.XDomainRequest) {
            this.readyState = 4;
            this.__nativeXhr = new XDomainRequest();
            this.__nativeXhr.onerror = qx.Bootstrap.bind(function() {
              this._emit("readystatechange");
              this._emit("error");
              this._emit("loadend");
            }, this);

            if (qx.core.Environment.get("qx.debug.io")) {
              qx.Bootstrap.debug(qx.bom.request.Xhr, "Retry open native request with method: " +
                method + ", url: " + url + ", async: " + async);
            }
            this.__nativeXhr.open(method, url, async, user, password);
            return;
          }

          // Access denied
          // - IE 6: -2146828218
          // - IE 7: -2147024891
          // - Legacy Firefox
          window.setTimeout(qx.Bootstrap.bind(function() {
            if (this.__disposed) {
              return;
            }
            this.readyState = 4;
            this._emit("readystatechange");
            this._emit("error");
            this._emit("loadend");
          }, this));
        }

      }

      // BUGFIX: IE < 9
      // IE < 9 tends to cache overly agressive. This may result in stale
      // representations. Force validating freshness of cached representation.
      if (qx.core.Environment.get("engine.name") === "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 9 &&
        this.__nativeXhr.readyState > 0) {
          this.__nativeXhr.setRequestHeader("If-Modified-Since", "-1");
        }

      // BUGFIX: Firefox
      // Firefox < 4 fails to trigger onreadystatechange OPENED for sync requests
      if (qx.core.Environment.get("engine.name") === "gecko" &&
          parseInt(qx.core.Environment.get("engine.version"), 10) < 2 &&
          !this.__async) {
        // Native XHR is already set to readyState DONE. Fake readyState
        // and call onreadystatechange manually.
        this.readyState = qx.bom.request.Xhr.OPENED;
        this._emit("readystatechange");
      }

    },

    /**
     * Sets an HTTP request header to be used by the request.
     *
     * Note: The request must be initialized before using this method.
     *
     * @param key {String}
     *  The name of the header whose value is to be set.
     * @param value {String}
     *  The value to set as the body of the header.
     * @return {qx.bom.request.Xhr} Self for chaining.
     */
    setRequestHeader: function(key, value) {
      this.__checkDisposed();

      // Detect conditional requests
      if (key == "If-Match" || key == "If-Modified-Since" ||
        key == "If-None-Match" || key == "If-Range") {
        this.__conditional = true;
      }

      this.__nativeXhr.setRequestHeader(key, value);
      return this;
    },

    /**
     * Sends request.
     *
     * @param data {String|Document?null}
     *  Optional data to send.
     * @return {qx.bom.request.Xhr} Self for chaining.
     */
    send: function(data) {
      this.__checkDisposed();

      // BUGFIX: IE & Firefox < 3.5
      // For sync requests, some browsers throw error on open()
      // while it should be on send()
      //
      if (!this.__async && this.__openError) {
        throw this.__openError;
      }

      // BUGFIX: Opera
      // On network error, Opera stalls at readyState HEADERS_RECEIVED
      // This violates the spec. See here http://www.w3.org/TR/XMLHttpRequest2/#send
      // (Section: If there is a network error)
      //
      // To fix, assume a default timeout of 10 seconds. Note: The "error"
      // event will be fired correctly, because the error flag is inferred
      // from the statusText property. Of course, compared to other
      // browsers there is an additional call to ontimeout(), but this call
      // should not harm.
      //
      if (qx.core.Environment.get("engine.name") === "opera" &&
          this.timeout === 0) {
        this.timeout = 10000;
      }

      // Timeout
      if (this.timeout > 0) {
        this.__timerId = window.setTimeout(this.__onTimeoutBound, this.timeout);
      }

      // BUGFIX: Firefox 2
      // "NS_ERROR_XPC_NOT_ENOUGH_ARGS" when calling send() without arguments
      data = typeof data == "undefined" ? null : data;

      // Some browsers may throw an error when sending of async request fails.
      // This violates the spec which states only sync requests should.
      try {
        if (qx.core.Environment.get("qx.debug.io")) {
          qx.Bootstrap.debug(qx.bom.request.Xhr, "Send native request");
        }
        this.__nativeXhr.send(data);
      } catch(SendError) {
        if (!this.__async) {
          throw SendError;
        }

        // BUGFIX
        // Some browsers throws error when file not found via file:// protocol.
        // Synthesize readyState changes.
        if (this._getProtocol() === "file:") {
          this.readyState = 2;
          this.__readyStateChange();

          var that = this;
          window.setTimeout(function() {
            if (that.__disposed) {
              return;
            }
            that.readyState = 3;
            that.__readyStateChange();

            that.readyState = 4;
            that.__readyStateChange();
          });

        }

      }

      // BUGFIX: Firefox
      // Firefox fails to trigger onreadystatechange DONE for sync requests
      if (qx.core.Environment.get("engine.name") === "gecko" && !this.__async) {
        // Properties all set, only missing native readystatechange event
        this.__onNativeReadyStateChange();
      }

      // Set send flag
      this.__send = true;
      return this;
    },

    /**
     * Abort request.
     *
     * Cancels any network activity.
     * @return {qx.bom.request.Xhr} Self for chaining.
     */
    abort: function() {
      this.__checkDisposed();

      this.__abort = true;
      this.__nativeXhr.abort();

      if (this.__nativeXhr) {
        this.readyState = this.__nativeXhr.readyState;
      }
      return this;
    },


    /**
     * Helper to emit events and call the callback methods.
     * @param event {String} The name of the event.
     */
    _emit: function(event) {
      this["on" + event]();
      this._emitter.emit(event, this);
    },

    /**
     * Event handler for XHR event that fires at every state change.
     *
     * Replace with custom method to get informed about the communication progress.
     */
    onreadystatechange: function() {},

    /**
     * Event handler for XHR event "load" that is fired on successful retrieval.
     *
     * Note: This handler is called even when the HTTP status indicates an error.
     *
     * Replace with custom method to listen to the "load" event.
     */
    onload: function() {},

    /**
     * Event handler for XHR event "loadend" that is fired on retrieval.
     *
     * Note: This handler is called even when a network error (or similar)
     * occurred.
     *
     * Replace with custom method to listen to the "loadend" event.
     */
    onloadend: function() {},

    /**
     * Event handler for XHR event "error" that is fired on a network error.
     *
     * Replace with custom method to listen to the "error" event.
     */
    onerror: function() {},

    /**
    * Event handler for XHR event "abort" that is fired when request
    * is aborted.
    *
    * Replace with custom method to listen to the "abort" event.
    */
    onabort: function() {},

    /**
    * Event handler for XHR event "timeout" that is fired when timeout
    * interval has passed.
    *
    * Replace with custom method to listen to the "timeout" event.
    */
    ontimeout: function() {},


    /**
     * Add an event listener for the given event name.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function to execute when the event is fired
     * @param ctx {var?} The context of the listener.
     * @return {qx.bom.request.Xhr} Self for chaining.
     */
    on: function(name, listener, ctx) {
      this._emitter.on(name, listener, ctx);
      return this;
    },


    /**
     * Get a single response header from response.
     *
     * @param header {String}
     *  Key of the header to get the value from.
     * @return {String}
     *  Response header.
     */
    getResponseHeader: function(header) {
      this.__checkDisposed();

      return this.__nativeXhr.getResponseHeader(header);
    },

    /**
     * Get all response headers from response.
     *
     * @return {String} All response headers.
     */
    getAllResponseHeaders: function() {
      this.__checkDisposed();

      return this.__nativeXhr.getAllResponseHeaders();
    },

    /**
     * Get wrapped native XMLHttpRequest (or equivalent).
     *
     * Can be XMLHttpRequest or ActiveX.
     *
     * @return {Object} XMLHttpRequest or equivalent.
     */
    getRequest: function() {
      return this.__nativeXhr;
    },

    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Dispose object and wrapped native XHR.
     * @return {Boolean} <code>true</code> if the object was successfully disposed
     */
    dispose: function() {
      if (this.__disposed) {
        return false;
      }

      window.clearTimeout(this.__timerId);

      // Remove unload listener in IE. Aborting on unload is no longer required
      // for this instance.
      if (window.detachEvent) {
        window.detachEvent("onunload", this.__onUnloadBound);
      }

      // May fail in IE
      try {
        this.__nativeXhr.onreadystatechange;
      } catch(PropertiesNotAccessable) {
        return false;
      }

      // Clear out listeners
      var noop = function() {};
      this.__nativeXhr.onreadystatechange = noop;
      this.__nativeXhr.onload = noop;
      this.__nativeXhr.onerror = noop;

      // Abort any network activity
      this.abort();

      // Remove reference to native XHR
      this.__nativeXhr = null;

      this.__disposed = true;
      return true;
    },

    /*
    ---------------------------------------------------------------------------
      PROTECTED
    ---------------------------------------------------------------------------
    */

    /**
     * Create XMLHttpRequest (or equivalent).
     *
     * @return {Object} XMLHttpRequest or equivalent.
     */
    _createNativeXhr: function() {
      var xhr = qx.core.Environment.get("io.xhr");

      if (xhr === "xhr") {
        return new XMLHttpRequest();
      }

      if (xhr == "activex") {
        return new window.ActiveXObject("Microsoft.XMLHTTP");
      }

      qx.Bootstrap.error(this, "No XHR support available.");
    },

    /**
     * Get protocol of requested URL.
     *
     * @return {String} The used protocol.
     */
    _getProtocol: function() {
      var url = this.__url;
      var protocolRe = /^(\w+:)\/\//;

      // Could be http:// from file://
      if (url !== null && url.match) {
        var match = url.match(protocolRe);
        if (match && match[1]) {
          return match[1];
        }
      }

      return window.location.protocol;
    },

    /*
    ---------------------------------------------------------------------------
      PRIVATE
    ---------------------------------------------------------------------------
    */

    /**
     * {Object} XMLHttpRequest or equivalent.
     */
    __nativeXhr: null,

    /**
     * {Boolean} Whether request is async.
     */
    __async: null,

    /**
     * {Function} Bound __onNativeReadyStateChange handler.
     */
    __onNativeReadyStateChangeBound: null,

    /**
     * {Function} Bound __onNativeAbort handler.
     */
    __onNativeAbortBound: null,

    /**
     * {Function} Bound __onUnload handler.
     */
    __onUnloadBound: null,

    /**
     * {Function} Bound __onTimeout handler.
     */
    __onTimeoutBound: null,

    /**
     * {Boolean} Send flag
     */
    __send: null,

    /**
     * {String} Requested URL
     */
    __url: null,

    /**
     * {Boolean} Abort flag
     */
    __abort: null,

    /**
     * {Boolean} Timeout flag
     */
    __timeout: null,

    /**
     * {Boolean} Whether object has been disposed.
     */
    __disposed: null,

    /**
     * {Number} ID of timeout timer.
     */
    __timerId: null,

    /**
     * {Error} Error thrown on open, if any.
     */
    __openError: null,

    /**
     * {Boolean} Conditional get flag
     */
     __conditional: null,

    /**
     * Init native XHR.
     */
    __initNativeXhr: function() {
      // Create native XHR or equivalent and hold reference
      this.__nativeXhr = this._createNativeXhr();

      // Track native ready state changes
      this.__nativeXhr.onreadystatechange = this.__onNativeReadyStateChangeBound;

      // Track native abort, when supported
      if (this.__nativeXhr.onabort) {
        this.__nativeXhr.onabort = this.__onNativeAbortBound;
      }

      // Reset flags
      this.__disposed = this.__send = this.__abort = false;
    },

    /**
     * Track native abort.
     *
     * In case the end user cancels the request by other
     * means than calling abort().
     */
    __onNativeAbort: function() {
      // When the abort that triggered this method was not a result from
      // calling abort()
      if (!this.__abort) {
        this.abort();
      }
    },

    /**
     * Handle native onreadystatechange.
     *
     * Calls user-defined function onreadystatechange on each
     * state change and syncs the XHR status properties.
     */
    __onNativeReadyStateChange: function() {
      var nxhr = this.__nativeXhr,
          propertiesReadable = true;

      if (qx.core.Environment.get("qx.debug.io")) {
        qx.Bootstrap.debug(qx.bom.request.Xhr, "Received native readyState: " + nxhr.readyState);
      }

      // BUGFIX: IE, Firefox
      // onreadystatechange() is called twice for readyState OPENED.
      //
      // Call onreadystatechange only when readyState has changed.
      if (this.readyState == nxhr.readyState) {
        return;
      }

      // Sync current readyState
      this.readyState = nxhr.readyState;

      // BUGFIX: IE
      // Superfluous onreadystatechange DONE when aborting OPENED
      // without send flag
      if (this.readyState === qx.bom.request.Xhr.DONE &&
          this.__abort && !this.__send) {
        return;
      }

      // BUGFIX: IE
      // IE fires onreadystatechange HEADERS_RECEIVED and LOADING when sync
      //
      // According to spec, only onreadystatechange OPENED and DONE should
      // be fired.
      if (!this.__async && (nxhr.readyState == 2 || nxhr.readyState == 3)) {
        return;
      }

      // Default values according to spec.
      this.status = 0;
      this.statusText = this.responseText = "";
      this.responseXML = null;

      if (this.readyState >= qx.bom.request.Xhr.HEADERS_RECEIVED) {
        // In some browsers, XHR properties are not readable
        // while request is in progress.
        try {
          this.status = nxhr.status;
          this.statusText = nxhr.statusText;
          this.responseText = nxhr.responseText;
          this.responseXML = nxhr.responseXML;
        } catch(XhrPropertiesNotReadable) {
          propertiesReadable = false;
        }

        if (propertiesReadable) {
          this.__normalizeStatus();
          this.__normalizeResponseXML();
        }
      }

      this.__readyStateChange();

      // BUGFIX: IE
      // Memory leak in XMLHttpRequest (on-page)
      if (this.readyState == qx.bom.request.Xhr.DONE) {
        // Allow garbage collecting of native XHR
        if (nxhr) {
          nxhr.onreadystatechange = function() {};
        }
      }

    },

    /**
     * Handle readystatechange. Called internally when readyState is changed.
     */
    __readyStateChange: function() {
      var that = this;

      // Cancel timeout before invoking handlers because they may throw
      if (this.readyState === qx.bom.request.Xhr.DONE) {
        // Request determined DONE. Cancel timeout.
        window.clearTimeout(this.__timerId);
      }

      // BUGFIX: IE
      // IE < 8 fires LOADING and DONE on open() - before send() - when from cache
      if (qx.core.Environment.get("engine.name") == "mshtml" &&
          qx.core.Environment.get("browser.documentmode") < 8) {

        // Detect premature events when async. LOADING and DONE is
        // illogical to happen before request was sent.
        if (this.__async && !this.__send && this.readyState >= qx.bom.request.Xhr.LOADING) {

          if (this.readyState == qx.bom.request.Xhr.LOADING) {
            // To early to fire, skip.
            return;
          }

          if (this.readyState == qx.bom.request.Xhr.DONE) {
            window.setTimeout(function() {
              if (that.__disposed) {
                return;
              }
              // Replay previously skipped
              that.readyState = 3;
              that._emit("readystatechange");

              that.readyState = 4;
              that._emit("readystatechange");
              that.__readyStateChangeDone();
            });
            return;
          }

        }
      }

      // Always fire "readystatechange"
      this._emit("readystatechange");
      if (this.readyState === qx.bom.request.Xhr.DONE) {
        this.__readyStateChangeDone();
      }
    },

    /**
     * Handle readystatechange. Called internally by
     * {@link #__readyStateChange} when readyState is DONE.
     */
    __readyStateChangeDone: function() {
      // Fire "timeout" if timeout flag is set
      if (this.__timeout) {
        this._emit("timeout");

        // BUGFIX: Opera
        // Since Opera does not fire "error" on network error, fire additional
        // "error" on timeout (may well be related to network error)
        if (qx.core.Environment.get("engine.name") === "opera") {
          this._emit("error");
        }

        this.__timeout = false;

      // Fire either "abort", "load" or "error"
      } else {
        if (this.__abort) {
          this._emit("abort");
        } else{
          if (this.__isNetworkError()) {
            this._emit("error");
          } else {
            this._emit("load");
          }
        }
      }

      // Always fire "onloadend" when DONE
      this._emit("loadend");
    },

    /**
     * Check for network error.
     *
     * @return {Boolean} Whether a network error occured.
     */
    __isNetworkError: function() {
      var error;

      // Infer the XHR internal error flag from statusText when not aborted.
      // See http://www.w3.org/TR/XMLHttpRequest2/#error-flag and
      // http://www.w3.org/TR/XMLHttpRequest2/#the-statustext-attribute
      //
      // With file://, statusText is always falsy. Assume network error when
      // response is empty.
      if (this._getProtocol() === "file:") {
        error = !this.responseText;
      } else {
        error = !this.statusText;
      }

      return error;
    },

    /**
     * Handle faked timeout.
     */
    __onTimeout: function() {
      // Basically, mimick http://www.w3.org/TR/XMLHttpRequest2/#timeout-error
      var nxhr = this.__nativeXhr;
      this.readyState = qx.bom.request.Xhr.DONE;

      // Set timeout flag
      this.__timeout = true;

      // No longer consider request. Abort.
      nxhr.abort();
      this.responseText = "";
      this.responseXML = null;

      // Signal readystatechange
      this.__readyStateChange();
    },

    /**
     * Normalize status property across browsers.
     */
    __normalizeStatus: function() {
      var isDone = this.readyState === qx.bom.request.Xhr.DONE;

      // BUGFIX: Most browsers
      // Most browsers tell status 0 when it should be 200 for local files
      if (this._getProtocol() === "file:" && this.status === 0 && isDone) {
        if (!this.__isNetworkError()) {
          this.status = 200;
        }
      }

      // BUGFIX: IE
      // IE sometimes tells 1223 when it should be 204
      if (this.status === 1223) {
        this.status = 204;
      }

      // BUGFIX: Opera
      // Opera tells 0 for conditional requests when it should be 304
      //
      // Detect response to conditional request that signals fresh cache.
      if (qx.core.Environment.get("engine.name") === "opera") {
        if (
          isDone &&                 // Done
          this.__conditional &&     // Conditional request
          !this.__abort &&          // Not aborted
          this.status === 0         // But status 0!
        ) {
          this.status = 304;
        }
      }
    },

    /**
     * Normalize responseXML property across browsers.
     */
    __normalizeResponseXML: function() {
      // BUGFIX: IE
      // IE does not recognize +xml extension, resulting in empty responseXML.
      //
      // Check if Content-Type is +xml, verify missing responseXML then parse
      // responseText as XML.
      if (qx.core.Environment.get("engine.name") == "mshtml" &&
          (this.getResponseHeader("Content-Type") || "").match(/[^\/]+\/[^\+]+\+xml/) &&
           this.responseXML && !this.responseXML.documentElement) {
        var dom = new window.ActiveXObject("Microsoft.XMLDOM");
        dom.async = false;
        dom.validateOnParse = false;
        dom.loadXML(this.responseText);
        this.responseXML = dom;
      }
    },

    /**
     * Handler for native unload event.
     */
    __onUnload: function() {
      try {
        // Abort and dispose
        if (this) {
          this.dispose();
        }
      } catch(e) {}
    },

    /**
     * Helper method to determine whether browser supports reusing the
     * same native XHR to send more requests.
     * @return {Boolean} <code>true</code> if request object reuse is supported
     */
    __supportsManyRequests: function() {
      var name = qx.core.Environment.get("engine.name");
      var version = qx.core.Environment.get("browser.version");

      return !(name == "mshtml" && version < 9 ||
               name == "gecko" && version < 3.5);
    },

    /**
     * Throw when already disposed.
     */
    __checkDisposed: function() {
      if (this.__disposed) {
        throw new Error("Already disposed");
      }
    }
  },

  defer: function() {
    qx.core.Environment.add("qx.debug.io", false);
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The desktop is a widget, which can act as container for windows. It can be
 * used to define a clipping region for internal windows e.g. to create
 * an MDI like application.
 */
qx.Class.define("qx.ui.window.Desktop",
{
  extend : qx.ui.core.Widget,

  include : [
    qx.ui.core.MChildrenHandling,
    qx.ui.window.MDesktop,
    qx.ui.core.MBlocker
  ],

  implement : qx.ui.window.IDesktop,

  /**
   * @param windowManager {IWindowManager} The window manager to use for the desktop.
   *    If not provided, an instance of {@link qx.ui.window.Window#DEFAULT_MANAGER_CLASS} is used.
   */
  construct : function(windowManager)
  {
    this.base(arguments);
    windowManager = windowManager || new qx.ui.window.Window.DEFAULT_MANAGER_CLASS();

    this.getContentElement().disableScrolling();
    this._setLayout(new qx.ui.layout.Canvas());
    this.setWindowManager(windowManager);
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The Toolbar class is the main part of the toolbar widget.
 *
 * It can handle added {@link Button}s, {@link CheckBox}es, {@link RadioButton}s
 * and {@link Separator}s in its {@link #add} method. The {@link #addSpacer} method
 * adds a spacer at the current toolbar position. This means that the widgets
 * added after the method call of {@link #addSpacer} are aligned to the right of
 * the toolbar.
 *
 * For more details on the documentation of the toolbar widget, take a look at the
 * documentation of the {@link qx.ui.toolbar}-Package.
 */
qx.Class.define("qx.ui.toolbar.ToolBar",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MChildrenHandling,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // add needed layout
    this._setLayout(new qx.ui.layout.HBox());

    // initialize the overflow handling
    this.__removedItems = [];
    this.__removePriority = [];
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Appearance of the widget */
    appearance :
    {
      refine : true,
      init : "toolbar"
    },

    /** Holds the currently open menu (when the toolbar is used for menus) */
    openMenu :
    {
      check : "qx.ui.menu.Menu",
      event : "changeOpenMenu",
      nullable : true
    },

    /** Whether icons, labels, both or none should be shown. */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      inheritable : true,
      apply : "_applyShow",
      event : "changeShow"
    },

    /** The spacing between every child of the toolbar */
    spacing :
    {
      nullable : true,
      check : "Integer",
      themeable : true,
      apply : "_applySpacing"
    },

    /**
     * Widget which will be shown if at least one toolbar item is hidden.
     * Keep in mind to add this widget to the toolbar before you set it as
     * indicator!
     */
    overflowIndicator :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applyOverflowIndicator"
    },

    /** Enables the overflow handling which automatically removes items.*/
    overflowHandling :
    {
      init : false,
      check : "Boolean",
      apply : "_applyOverflowHandling"
    }
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired if an item will be hidden by the {@link #overflowHandling}.*/
    "hideItem" : "qx.event.type.Data",

    /** Fired if an item will be show by the {@link #overflowHandling}.*/
    "showItem" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      OVERFLOW HANDLING
    ---------------------------------------------------------------------------
    */

    __removedItems : null,
    __removePriority : null,


    // overridden
    _computeSizeHint : function()
    {
      // get the original hint
      var hint = this.base(arguments);
      if (true && this.getOverflowHandling()) {
        var minWidth = 0;
        // if an overflow widget is given, use its width + spacing as min width
        var overflowWidget = this.getOverflowIndicator();
        if (overflowWidget) {
          minWidth = overflowWidget.getSizeHint().width + this.getSpacing();
        }
        // reset the minWidth because we reduce the count of elements
        hint.minWidth = minWidth;
      }
      return hint;
    },


    /**
     * Resize event handler.
     *
     * @param e {qx.event.type.Data} The resize event.
     */
    _onResize : function(e) {
      this._recalculateOverflow(e.getData().width);
    },


    /**
     * Responsible for calculation the overflow based on the available width.
     *
     * @param width {Integer?null} The available width.
     * @param requiredWidth {Integer?null} The required width for the widget
     *   if available.
     */
    _recalculateOverflow : function(width, requiredWidth)
    {
      // do nothing if overflow handling is not enabled
      if (!this.getOverflowHandling()) {
        return;
      }

      // get all required sizes
      requiredWidth = requiredWidth || this.getSizeHint().width;
      var overflowWidget = this.getOverflowIndicator();
      var overflowWidgetWidth = 0;
      if (overflowWidget) {
        overflowWidgetWidth = overflowWidget.getSizeHint().width;
      }

      if (width == undefined && this.getBounds() != null) {
        width = this.getBounds().width;
      }

      // if we still don't have a width, than we are not added to a parrent
      if (width == undefined) {
        // we should ignore it in that case
        return;
      }

      // if we have not enough space
      if (width < requiredWidth) {
        do {
          // get the next child
          var childToHide = this._getNextToHide();
          // if there is no child to hide, just do nothing
          if (!childToHide) {
            return;
          }
          // get margins or spacing
          var margins = childToHide.getMarginLeft() + childToHide.getMarginRight();
          margins = Math.max(margins, this.getSpacing());
          var childWidth = childToHide.getSizeHint().width + margins;
          this.__hideChild(childToHide);

          // new width is the requiredWidth - the removed childs width
          requiredWidth -= childWidth;

          // show the overflowWidgetWidth
          if (overflowWidget && overflowWidget.getVisibility() != "visible") {
            overflowWidget.setVisibility("visible");
            // if we need to add the overflow indicator, we need to add its width
            requiredWidth += overflowWidgetWidth;
            // add spacing or margins
            var overflowWidgetMargins =
              overflowWidget.getMarginLeft() +
              overflowWidget.getMarginRight();
            requiredWidth += Math.max(overflowWidgetMargins, this.getSpacing());
          }
        } while (requiredWidth > width);

      // if we can possibly show something
      } else if (this.__removedItems.length > 0) {
        do {
          var removedChild = this.__removedItems[0];
          // if we have something we can show
          if (removedChild) {
            // get the margins or spacing
            var margins = removedChild.getMarginLeft() + removedChild.getMarginRight();
            margins = Math.max(margins, this.getSpacing());

            // check if the element has been rendered before [BUG #4542]
            if (removedChild.getDecoratorElement() == null) {
              // if not, apply the decorator element because it can change the
              // width of the child with padding e.g.
              removedChild.syncAppearance();
              // also invalidate the layout cache to trigger size hint
              // recalculation
              removedChild.invalidateLayoutCache();
            }
            var removedChildWidth = removedChild.getSizeHint().width;

            // check if it fits in in case its the last child to replace
            var fits = false;
            // if we can remove the overflow widget if its available
            if (this.__removedItems.length == 1 && overflowWidgetWidth > 0) {
              var addedMargin = margins - this.getSpacing();
              var wouldRequiredWidth =
                requiredWidth -
                overflowWidgetWidth +
                removedChildWidth +
                addedMargin;
              fits = width > wouldRequiredWidth;
            }

            // if it just fits in || it fits in when we remove the overflow widget
            if (width > requiredWidth + removedChildWidth + margins || fits) {
              this.__showChild(removedChild);
              requiredWidth += removedChildWidth;
              // check if we need to remove the overflow widget
              if (overflowWidget && this.__removedItems.length == 0) {
                overflowWidget.setVisibility("excluded");
              }
            } else {
              return;
            }
          }
        } while (width >= requiredWidth && this.__removedItems.length > 0);
      }
    },


    /**
     * Helper to show a toolbar item.
     *
     * @param child {qx.ui.core.Widget} The widget to show.
     */
    __showChild : function(child)
    {
      child.setVisibility("visible");
      this.__removedItems.shift();
      this.fireDataEvent("showItem", child)
    },


    /**
     * Helper to exclude a toolbar item.
     *
     * @param child {qx.ui.core.Widget} The widget to exclude.
     */
    __hideChild : function(child)
    {
      // ignore the call if no child is given
      if (!child) {
        return;
      }
      this.__removedItems.unshift(child);
      child.setVisibility("excluded");
      this.fireDataEvent("hideItem", child);
    },


    /**
     * Responsible for returning the next item to remove. In It checks the
     * priorities added by {@link #setRemovePriority}. If all priorized widgets
     * already excluded, it takes the widget added at last.
     *
     * @return {qx.ui.core.Widget|null} The widget which should be removed next.
     *   If null is returned, no widget is availablew to remove.
     */
    _getNextToHide : function()
    {
      // get the elements by priority
      for (var i = this.__removePriority.length - 1; i >= 0; i--) {
        var item = this.__removePriority[i];
        // maybe a priority is left out and spacers don't have the visibility
        if (item && item.getVisibility && item.getVisibility() == "visible") {
          return item;
        }
      };

      // if there is non found by priority, check all available widgets
      var children = this._getChildren();
      for (var i = children.length -1; i >= 0; i--) {
        var child = children[i]
        // ignore the overflow widget
        if (child == this.getOverflowIndicator()) {
          continue;
        }
        // spacer don't have the visibility
        if (child.getVisibility && child.getVisibility() == "visible") {
          return child;
        }
      };
    },


    /**
     * The removal of the toolbar items is priority based. You can change these
     * priorities with this method. The higher a priority, the earlier it will
     * be excluded. Remmeber to use every priority only once! If you want
     * override an already set priority, use the override parameter.
     * Keep in mind to only use already added items.
     *
     * @param item {qx.ui.core.Widget} The item to give the priority.
     * @param priority {Integer} The priority, higher means removed earlier.
     * @param override {Boolean} true, if the priority should be overridden.
     */
    setRemovePriority : function(item, priority, override)
    {
      // security check for overriding priorities
      if (!override && this.__removePriority[priority] != undefined) {
        throw new Error("Priority already in use!");
      }
      this.__removePriority[priority] = item;
    },


    // property apply
    _applyOverflowHandling : function(value, old)
    {
      // invalidate the own and the parrents layout cach because the size hint changes
      this.invalidateLayoutCache();
      var parent = this.getLayoutParent();
      if (parent) {
        parent.invalidateLayoutCache();
      }

      // recalculate if possible
      var bounds = this.getBounds()
      if (bounds && bounds.width) {
        this._recalculateOverflow(bounds.width);
      }

      // if the handling has been enabled
      if (value) {
        // add the resize listener
        this.addListener("resize", this._onResize, this);

      // if the handlis has been disabled
      } else {
        this.removeListener("resize", this._onResize, this);

        // set the overflow indicator to excluded
        var overflowIndicator = this.getOverflowIndicator();
        if (overflowIndicator) {
          overflowIndicator.setVisibility("excluded");
        }

        // set all buttons back to visible
        for (var i = 0; i < this.__removedItems.length; i++) {
          this.__removedItems[i].setVisibility("visible");
        };
        // reset the removed items
        this.__removedItems = [];
      }
    },


    // property apply
    _applyOverflowIndicator : function(value, old)
    {
      if (old) {
        this._remove(old);
      }

      if (value) {
        // check if its a child of the toolbar
        if (this._indexOf(value) == -1) {
          throw new Error("Widget must be child of the toolbar.");
        }
        // hide the widget
        value.setVisibility("excluded");
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU OPEN
    ---------------------------------------------------------------------------
    */

    __allowMenuOpenHover : false,

    /**
     * Indicate if a menu could be opened on hover or not.
     *
     * @internal
     * @param value {Boolean} <code>true</code> if a menu could be opened,
     *    <code>false</code> otherwise.
     */
    _setAllowMenuOpenHover : function(value) {
      this.__allowMenuOpenHover = value
    },

    /**
     * Return if a menu could be opened on hover or not.
     *
     * @internal
     * @return {Boolean} <code>true</code> if a menu could be opened,
     *    <code>false</code> otherwise.
     */
    _isAllowMenuOpenHover : function () {
      return this.__allowMenuOpenHover;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySpacing : function(value, old)
    {
      var layout = this._getLayout();
      value == null ? layout.resetSpacing() : layout.setSpacing(value);
    },


    // property apply
    _applyShow : function(value) {
      var children = this._getChildren();
      for (var i=0; i < children.length; i++) {
        if (children[i].setShow) {
          children[i].setShow(value);
        }
      };
    },


    /*
    ---------------------------------------------------------------------------
      CHILD HANDLING
    ---------------------------------------------------------------------------
    */
    // overridden
    _add : function(child, options) {
      this.base(arguments, child, options);
      // sync the show property (bug #6743) - but only if show wasn't explicitly set for the child (bug #6823)
      if (child.setShow && !qx.util.PropertyUtil.getUserValue(child, "show")) {
        child.setShow(this.getShow());
      }

      var newWidth =
        this.getSizeHint().width +
        child.getSizeHint().width +
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _addAt : function(child, index, options) {
      this.base(arguments, child, index, options);
      // sync the show property (bug #6743) - but only if show wasn't explicitly set for the child (bug #6823)
      if (child.setShow && !qx.util.PropertyUtil.getUserValue(child, "show")) {
        child.setShow(this.getShow());
      }

      var newWidth =
        this.getSizeHint().width +
        child.getSizeHint().width +
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _addBefore : function(child, before, options) {
      this.base(arguments, child, before, options);
      // sync the show property (bug #6743) - but only if show wasn't explicitly set for the child (bug #6823)
      if (child.setShow && !qx.util.PropertyUtil.getUserValue(child, "show")) {
        child.setShow(this.getShow());
      }

      var newWidth =
        this.getSizeHint().width +
        child.getSizeHint().width +
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _addAfter : function(child, after, options) {
      this.base(arguments, child, after, options);
      // sync the show property (bug #6743) - but only if show wasn't explicitly set for the child (bug #6823)
      if (child.setShow && !qx.util.PropertyUtil.getUserValue(child, "show")) {
        child.setShow(this.getShow());
      }

      var newWidth =
        this.getSizeHint().width +
        child.getSizeHint().width +
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _remove : function(child) {
      this.base(arguments, child);
      var newWidth =
        this.getSizeHint().width -
        child.getSizeHint().width -
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _removeAt : function(index) {
      var child = this._getChildren()[index];
      this.base(arguments, index);
      var newWidth =
        this.getSizeHint().width -
        child.getSizeHint().width -
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _removeAll : function() {
      this.base(arguments);
      this._recalculateOverflow(null, 0);
    },


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Add a spacer to the toolbar. The spacer has a flex
     * value of one and will stretch to the available space.
     *
     * @return {qx.ui.core.Spacer} The newly added spacer object. A reference
     *   to the spacer is needed to remove this spacer from the layout.
     */
    addSpacer : function()
    {
      var spacer = new qx.ui.core.Spacer;
      this._add(spacer, {flex:1});
      return spacer;
    },


    /**
     * Adds a separator to the toolbar.
     */
    addSeparator : function() {
      this.add(new qx.ui.toolbar.Separator);
    },


    /**
     * Returns all nested buttons which contains a menu to show. This is mainly
     * used for keyboard support.
     *
     * @return {Array} List of all menu buttons
     */
    getMenuButtons : function()
    {
      var children = this.getChildren();
      var buttons = [];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child instanceof qx.ui.menubar.Button) {
          buttons.push(child);
        } else if (child instanceof qx.ui.toolbar.Part) {
          buttons.push.apply(buttons, child.getMenuButtons());
        }
      }

      return buttons;
    }
  },


  destruct : function() {
    if (this.hasListener("resize")) {
      this.removeListener("resize", this._onResize, this);
    }

  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * A widget used for decoration proposes to structure a toolbar. Each
 * Separator renders a line between the buttons around.
 */
qx.Class.define("qx.ui.toolbar.Separator",
{
  extend : qx.ui.core.Widget,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "toolbar-separator"
    },

    // overridden
    anonymous :
    {
      refine : true,
      init : true
    },

    // overridden
    width :
    {
      refine : true,
      init : 0
    },

    // overridden
    height :
    {
      refine : true,
      init : 0
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * A button which opens the connected menu when clicking on it.
 */
qx.Class.define("qx.ui.form.MenuButton",
{
  extend : qx.ui.form.Button,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param icon {String?null} Initial icon
   * @param menu {qx.ui.menu.Menu} Connect to menu instance
   */
  construct : function(label, icon, menu)
  {
    this.base(arguments, label, icon);

    // Initialize properties
    if (menu != null) {
      this.setMenu(menu);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The menu instance to show when clicking on the button */
    menu :
    {
      check : "qx.ui.menu.Menu",
      nullable : true,
      apply : "_applyMenu",
      event : "changeMenu"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */
    // overridden
    _applyVisibility : function(value, old) {
      this.base(arguments, value, old);

      // hide the menu too
      var menu = this.getMenu();
      if (value != "visible" && menu) {
        menu.hide();
      }
    },


    // property apply
    _applyMenu : function(value, old)
    {
      if (old)
      {
        old.removeListener("changeVisibility", this._onMenuChange, this);
        old.resetOpener();
      }

      if (value)
      {
        value.addListener("changeVisibility", this._onMenuChange, this);
        value.setOpener(this);

        value.removeState("submenu");
        value.removeState("contextmenu");
      }
    },




    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Positions and shows the attached menu widget.
     *
     * @param selectFirst {Boolean?false} Whether the first menu button should be selected
     */
    open : function(selectFirst)
    {
      var menu = this.getMenu();

      if (menu)
      {
        // Hide all menus first
        qx.ui.menu.Manager.getInstance().hideAll();

        // Open the attached menu
        menu.setOpener(this);
        menu.open();

        // Select first item
        if (selectFirst)
        {
          var first = menu.getSelectables()[0];
          if (first) {
            menu.setSelectedButton(first);
          }
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener for visibility property changes of the attached menu
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onMenuChange : function(e)
    {
      var menu = this.getMenu();

      if (menu.isVisible()) {
        this.addState("pressed");
      } else {
        this.removeState("pressed");
      }
    },


    // overridden
    _onMouseDown : function(e)
    {
      // call the base function to get into the capture phase [BUG #4340]
      this.base(arguments, e);

      // only open on left clicks [BUG #5125]
      if(e.getButton() != "left") {
        return;
      }

      var menu = this.getMenu();
      if (menu)
      {
        // Toggle sub menu visibility
        if (!menu.isVisible()) {
          this.open();
        } else {
          menu.exclude();
        }

        // Event is processed, stop it for others
        e.stopPropagation();
      }
    },


    // overridden
    _onMouseUp : function(e)
    {
      // call base for firing the execute event
      this.base(arguments, e);

      // Just stop propagation to stop menu manager
      // from getting the event
      e.stopPropagation();
    },


    // overridden
    _onMouseOver : function(e)
    {
      // Add hovered state
      this.addState("hovered");
    },


    // overridden
    _onMouseOut : function(e)
    {
      // Just remove the hover state
      this.removeState("hovered");
    },


    // overridden
    _onKeyDown : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
          this.removeState("abandoned");
          this.addState("pressed");

          var menu = this.getMenu();
          if (menu)
          {
            // Toggle sub menu visibility
            if (!menu.isVisible()) {
              this.open();
            } else {
              menu.exclude();
            }
          }

          e.stopPropagation();
      }
    },


    // overridden
    _onKeyUp : function(e) {
      // no action required here
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * This singleton manages visible menu instances and supports some
 * core features to schedule menu open/close with timeout support.
 *
 * It also manages the whole keyboard support for the currently
 * registered widgets.
 *
 * The zIndex order is also managed by this class.
 */
qx.Class.define("qx.ui.menu.Manager",
{
  type : "singleton",
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Create data structure
    this.__objects = [];

    var el = document.body;
    var Registration = qx.event.Registration;

    // React on mouse events, but on native, to support inline applications
    Registration.addListener(window.document.documentElement, "mousedown", this._onMouseDown, this, true);
    Registration.addListener(el, "mousewheel", this._onMouseWheel, this, true);

    // React on keypress events
    Registration.addListener(el, "keydown", this._onKeyUpDown, this, true);
    Registration.addListener(el, "keyup", this._onKeyUpDown, this, true);
    Registration.addListener(el, "keypress", this._onKeyPress, this, true);

    // only use the blur event to hide windows on non touch devices [BUG #4033]
    // When the menu is located on top of an iFrame, the select will fail
    if (!qx.core.Environment.get("event.touch")) {
      // Hide all when the window is blurred
      qx.bom.Element.addListener(window, "blur", this.hideAll, this);
    }

    // Create open timer
    this.__openTimer = new qx.event.Timer;
    this.__openTimer.addListener("interval", this._onOpenInterval, this);

    // Create close timer
    this.__closeTimer = new qx.event.Timer;
    this.__closeTimer.addListener("interval", this._onCloseInterval, this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __scheduleOpen : null,
    __scheduleClose : null,
    __openTimer : null,
    __closeTimer : null,
    __objects : null,




    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Query engine for menu children.
     *
     * @param menu {qx.ui.menu.Menu} Any menu instance
     * @param start {Integer} Child index to start with
     * @param iter {Integer} Iteration count, normally <code>+1</code> or <code>-1</code>
     * @param loop {Boolean?false} Whether to wrap when reaching the begin/end of the list
     * @return {qx.ui.menu.Button} Any menu button or <code>null</code>
     */
    _getChild : function(menu, start, iter, loop)
    {
      var children = menu.getChildren();
      var length = children.length;
      var child;

      for (var i=start; i<length && i>=0; i+=iter)
      {
        child = children[i];
        if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
          return child;
        }
      }

      if (loop)
      {
        i = i == length ? 0 : length-1;
        for (; i!=start; i+=iter)
        {
          child = children[i];
          if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
            return child;
          }
        }
      }

      return null;
    },


    /**
     * Whether the given widget is inside any Menu instance.
     *
     * @param widget {qx.ui.core.Widget} Any widget
     * @return {Boolean} <code>true</code> when the widget is part of any menu
     */
    _isInMenu : function(widget)
    {
      while(widget)
      {
        if (widget instanceof qx.ui.menu.Menu) {
          return true;
        }

        widget = widget.getLayoutParent();
      }

      return false;
    },


    /**
     * Returns an instance of a menu button if the given widget is a child
     *
     * @param widget {qx.ui.core.Widget} any widget
     * @return {qx.ui.menu.Button} Any menu button instance or <code>null</code>
     */
    _getMenuButton : function(widget)
    {
      while(widget)
      {
        if (widget instanceof qx.ui.menu.AbstractButton) {
          return widget;
        }

        widget = widget.getLayoutParent();
      }

      return null;
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a menu to the list of visible menus.
     *
     * @param obj {qx.ui.menu.Menu} Any menu instance.
     */
    add : function(obj)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!(obj instanceof qx.ui.menu.Menu)) {
          throw new Error("Object is no menu: " + obj);
        }
      }

      var reg = this.__objects;
      reg.push(obj);
      obj.setZIndex(1e6+reg.length);
    },


    /**
     * Remove a menu from the list of visible menus.
     *
     * @param obj {qx.ui.menu.Menu} Any menu instance.
     */
    remove : function(obj)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!(obj instanceof qx.ui.menu.Menu)) {
          throw new Error("Object is no menu: " + obj);
        }
      }

      var reg = this.__objects;
      if (reg) {
        qx.lang.Array.remove(reg, obj);
      }
    },


    /**
     * Hides all currently opened menus.
     */
    hideAll : function()
    {
      var reg = this.__objects;
      if (reg)
      {
        for (var i=reg.length-1; i>=0; i--) {
          reg[i].exclude();
        }
      }
    },


    /**
     * Returns the menu which was opened at last (which
     * is the active one this way)
     *
     * @return {qx.ui.menu.Menu} The current active menu or <code>null</code>
     */
    getActiveMenu : function()
    {
      var reg = this.__objects;
      return reg.length > 0 ? reg[reg.length-1] : null;
    },




    /*
    ---------------------------------------------------------------------------
      SCHEDULED OPEN/CLOSE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Schedules the given menu to be opened after the
     * {@link qx.ui.menu.Menu#openInterval} configured by the
     * menu instance itself.
     *
     * @param menu {qx.ui.menu.Menu} The menu to schedule for open
     */
    scheduleOpen : function(menu)
    {
      // Cancel close of given menu first
      this.cancelClose(menu);

      // When the menu is already visible
      if (menu.isVisible())
      {
        // Cancel all other open requests
        if (this.__scheduleOpen) {
          this.cancelOpen(this.__scheduleOpen);
        }
      }

      // When the menu is not visible and not scheduled already
      // then schedule it for opening
      else if (this.__scheduleOpen != menu)
      {
        // menu.debug("Schedule open");
        this.__scheduleOpen = menu;
        this.__openTimer.restartWith(menu.getOpenInterval());
      }
    },


    /**
     * Schedules the given menu to be closed after the
     * {@link qx.ui.menu.Menu#closeInterval} configured by the
     * menu instance itself.
     *
     * @param menu {qx.ui.menu.Menu} The menu to schedule for close
     */
    scheduleClose : function(menu)
    {
      // Cancel open of the menu first
      this.cancelOpen(menu);

      // When the menu is already invisible
      if (!menu.isVisible())
      {
        // Cancel all other close requests
        if (this.__scheduleClose) {
          this.cancelClose(this.__scheduleClose);
        }
      }

      // When the menu is visible and not scheduled already
      // then schedule it for closing
      else if (this.__scheduleClose != menu)
      {
        // menu.debug("Schedule close");
        this.__scheduleClose = menu;
        this.__closeTimer.restartWith(menu.getCloseInterval());
      }
    },


    /**
     * When the given menu is scheduled for open this pending
     * request is canceled.
     *
     * @param menu {qx.ui.menu.Menu} The menu to cancel for open
     */
    cancelOpen : function(menu)
    {
      if (this.__scheduleOpen == menu)
      {
        // menu.debug("Cancel open");
        this.__openTimer.stop();
        this.__scheduleOpen = null;
      }
    },


    /**
     * When the given menu is scheduled for close this pending
     * request is canceled.
     *
     * @param menu {qx.ui.menu.Menu} The menu to cancel for close
     */
    cancelClose : function(menu)
    {
      if (this.__scheduleClose == menu)
      {
        // menu.debug("Cancel close");
        this.__closeTimer.stop();
        this.__scheduleClose = null;
      }
    },




    /*
    ---------------------------------------------------------------------------
      TIMER EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for a pending open request. Configured to the interval
     * of the current menu to open.
     *
     * @param e {qx.event.type.Event} Interval event
     */
    _onOpenInterval : function(e)
    {
      // Stop timer
      this.__openTimer.stop();

      // Open menu and reset flag
      this.__scheduleOpen.open();
      this.__scheduleOpen = null;
    },


    /**
     * Event listener for a pending close request. Configured to the interval
     * of the current menu to close.
     *
     * @param e {qx.event.type.Event} Interval event
     */
    _onCloseInterval : function(e)
    {
      // Stop timer, reset scheduling flag
      this.__closeTimer.stop();

      // Close menu and reset flag
      this.__scheduleClose.exclude();
      this.__scheduleClose = null;
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for mousedown events
     *
     * @param e {qx.event.type.Mouse} mousedown event
     */
    _onMouseDown : function(e)
    {
      var target = e.getTarget();
      target = qx.ui.core.Widget.getWidgetByElement(target, true);

      // If the target is 'null' the click appears on a DOM element witch is not
      // a widget. This happens normally with an inline application, when the user
      // clicks not in the inline application. In this case all all currently
      // open menus should be closed.
      if (target == null) {
        this.hideAll();
        return;
      }

      // If the target is the one which has opened the current menu
      // we ignore the mousedown to let the button process the event
      // further with toggling or ignoring the click.
      if (target.getMenu && target.getMenu() && target.getMenu().isVisible()) {
        return;
      }

      // All clicks not inside a menu will hide all currently open menus
      if (this.__objects.length > 0 && !this._isInMenu(target)) {
        this.hideAll();
      }
    },


    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * {Map} Map of all keys working on an active menu selection
     * @lint ignoreReferenceField(__selectionKeys)
     */
    __selectionKeys :
    {
      "Enter" : 1,
      "Space" : 1
    },


    /**
     * {Map} Map of all keys working without a selection
     * @lint ignoreReferenceField(__navigationKeys)
     */
    __navigationKeys :
    {
      "Escape" : 1,
      "Up" : 1,
      "Down" : 1,
      "Left" : 1,
      "Right" : 1
    },


    /**
     * Event handler for all keyup/keydown events. Stops all events
     * when any menu is opened.
     *
     * @param e {qx.event.type.KeySequence} Keyboard event
     */
    _onKeyUpDown : function(e)
    {
      var menu = this.getActiveMenu();
      if (!menu) {
        return;
      }

      // Stop for all supported key combos
      var iden = e.getKeyIdentifier();
      if (this.__navigationKeys[iden] || (this.__selectionKeys[iden] && menu.getSelectedButton())) {
        e.stopPropagation();
      }
    },


    /**
     * Event handler for all keypress events. Delegates the event to the more
     * specific methods defined in this class.
     *
     * Currently processes the keys: <code>Up</code>, <code>Down</code>,
     * <code>Left</code>, <code>Right</code> and <code>Enter</code>.
     *
     * @param e {qx.event.type.KeySequence} Keyboard event
     */
    _onKeyPress : function(e)
    {
      var menu = this.getActiveMenu();
      if (!menu) {
        return;
      }

      var iden = e.getKeyIdentifier();
      var navigation = this.__navigationKeys[iden];
      var selection = this.__selectionKeys[iden];

      if (navigation)
      {
        switch(iden)
        {
          case "Up":
            this._onKeyPressUp(menu);
            break;

          case "Down":
            this._onKeyPressDown(menu);
            break;

          case "Left":
            this._onKeyPressLeft(menu);
            break;

          case "Right":
            this._onKeyPressRight(menu);
            break;

          case "Escape":
            this.hideAll();
            break;
        }

        e.stopPropagation();
        e.preventDefault();
      }
      else if (selection)
      {
        // Do not process these events when no item is hovered
        var button = menu.getSelectedButton();
        if (button)
        {
          switch(iden)
          {
            case "Enter":
              this._onKeyPressEnter(menu, button, e);
              break;

            case "Space":
              this._onKeyPressSpace(menu, button, e);
              break;
          }

          e.stopPropagation();
          e.preventDefault();
        }
      }
    },


    /**
     * Event handler for <code>Up</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     */
    _onKeyPressUp : function(menu)
    {
      // Query for previous child
      var selectedButton = menu.getSelectedButton();
      var children = menu.getChildren();
      var start = selectedButton ? menu.indexOf(selectedButton)-1 : children.length-1;
      var nextItem = this._getChild(menu, start, -1, true);

      // Reconfigure property
      if (nextItem) {
        menu.setSelectedButton(nextItem);
      } else {
        menu.resetSelectedButton();
      }
    },


    /**
     * Event handler for <code>Down</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     */
    _onKeyPressDown : function(menu)
    {
      // Query for next child
      var selectedButton = menu.getSelectedButton();
      var start = selectedButton ? menu.indexOf(selectedButton)+1 : 0;
      var nextItem = this._getChild(menu, start, 1, true);

      // Reconfigure property
      if (nextItem) {
        menu.setSelectedButton(nextItem);
      } else {
        menu.resetSelectedButton();
      }
    },


    /**
     * Event handler for <code>Left</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     */
    _onKeyPressLeft : function(menu)
    {
      var menuOpener = menu.getOpener();
      if (!menuOpener) {
        return;
      }

      // Back to the "parent" menu
      if (menuOpener instanceof qx.ui.menu.AbstractButton)
      {
        var parentMenu = menuOpener.getLayoutParent();

        parentMenu.resetOpenedButton();
        parentMenu.setSelectedButton(menuOpener);
      }

      // Goto the previous toolbar button
      else if (menuOpener instanceof qx.ui.menubar.Button)
      {
        var buttons = menuOpener.getMenuBar().getMenuButtons();
        var index = buttons.indexOf(menuOpener);

        // This should not happen, definitely!
        if (index === -1) {
          return;
        }

        // Get previous button, fallback to end if first arrived
        var prevButton = null;
        var length =  buttons.length;
        for (var i = 1; i <= length; i++)
        {
          var button = buttons[(index - i + length) % length];
          if(button.isEnabled() && button.isVisible()) {
            prevButton = button;
            break;
          }
        }

        if (prevButton && prevButton != menuOpener) {
          prevButton.open(true);
        }
      }
    },


    /**
     * Event handler for <code>Right</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     */
    _onKeyPressRight : function(menu)
    {
      var selectedButton = menu.getSelectedButton();

      // Open sub-menu of hovered item and select first child
      if (selectedButton)
      {
        var subMenu = selectedButton.getMenu();

        if (subMenu)
        {
          // Open previously hovered item
          menu.setOpenedButton(selectedButton);

          // Hover first item in new submenu
          var first = this._getChild(subMenu, 0, 1);
          if (first) {
            subMenu.setSelectedButton(first);
          }

          return;
        }
      }

      // No hover and no open item
      // When first button has a menu, open it, otherwise only hover it
      else if (!menu.getOpenedButton())
      {
        var first = this._getChild(menu, 0, 1);

        if (first)
        {
          menu.setSelectedButton(first);

          if (first.getMenu()) {
            menu.setOpenedButton(first);
          }

          return;
        }
      }

      // Jump to the next toolbar button
      var menuOpener = menu.getOpener();

      // Look up opener hierarchy for menu button
      if (menuOpener instanceof qx.ui.menu.Button && selectedButton)
      {
        // From one inner selected button try to find the top level
        // menu button which has opened the whole menu chain.
        while (menuOpener)
        {
          menuOpener = menuOpener.getLayoutParent();
          if (menuOpener instanceof qx.ui.menu.Menu)
          {
            menuOpener = menuOpener.getOpener();
            if (menuOpener instanceof qx.ui.menubar.Button) {
              break;
            }
          }
          else
          {
            break;
          }
        }

        if (!menuOpener) {
          return;
        }
      }

      // Ask the toolbar for the next menu button
      if (menuOpener instanceof qx.ui.menubar.Button)
      {
        var buttons = menuOpener.getMenuBar().getMenuButtons();
        var index = buttons.indexOf(menuOpener);

        // This should not happen, definitely!
        if (index === -1) {
          return;
        }

        // Get next button, fallback to first if end arrived
        var nextButton = null;
        var length =  buttons.length;
        for (var i = 1; i <= length; i++)
        {
          var button = buttons[(index + i) % length];
          if(button.isEnabled() && button.isVisible()) {
            nextButton = button;
            break;
          }
        }

        if (nextButton && nextButton != menuOpener) {
          nextButton.open(true);
        }
      }
    },


    /**
     * Event handler for <code>Enter</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     * @param button {qx.ui.menu.AbstractButton} The selected button
     * @param e {qx.event.type.KeySequence} The keypress event
     */
    _onKeyPressEnter : function(menu, button, e)
    {
      // Route keypress event to the selected button
      if (button.hasListener("keypress"))
      {
        // Clone and reconfigure event
        var clone = e.clone();
        clone.setBubbles(false);
        clone.setTarget(button);

        // Finally dispatch the clone
        button.dispatchEvent(clone);
      }

      // Hide all open menus
      this.hideAll();
    },


    /**
     * Event handler for <code>Space</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     * @param button {qx.ui.menu.AbstractButton} The selected button
     * @param e {qx.event.type.KeySequence} The keypress event
     */
    _onKeyPressSpace : function(menu, button, e)
    {
      // Route keypress event to the selected button
      if (button.hasListener("keypress"))
      {
        // Clone and reconfigure event
        var clone = e.clone();
        clone.setBubbles(false);
        clone.setTarget(button);

        // Finally dispatch the clone
        button.dispatchEvent(clone);
      }
    },


    /**
     * Event handler for mousewheel which hides all windows on scroll.
     *
     * @param e {qx.event.type.MouseWheel} The mouse wheel event.
     */
    _onMouseWheel : function(e) {
      var target = e.getTarget();
      target = qx.ui.core.Widget.getWidgetByElement(target, true);

      if (this.__objects.length > 0 && !this._isInMenu(target)) {
        this.hideAll();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var Registration = qx.event.Registration;
    var el = document.body;

    // React on mousedown/mouseup events
    Registration.removeListener(window.document.documentElement, "mousedown", this._onMouseDown, this, true);

    // React on keypress events
    Registration.removeListener(el, "keydown", this._onKeyUpDown, this, true);
    Registration.removeListener(el, "keyup", this._onKeyUpDown, this, true);
    Registration.removeListener(el, "keypress", this._onKeyPress, this, true);

    this._disposeObjects("__openTimer", "__closeTimer");
    this._disposeArray("__objects");
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The menu is a popup like control which supports buttons. It comes
 * with full keyboard navigation and an improved timeout based mouse
 * control behavior.
 *
 * This class is the container for all derived instances of
 * {@link qx.ui.menu.AbstractButton}.
 *
 * @childControl slidebar {qx.ui.menu.MenuSlideBar} shows a slidebar to easily navigate inside the menu (if too little space is left)
 */
qx.Class.define("qx.ui.menu.Menu",
{
  extend : qx.ui.core.Widget,

  include : [
    qx.ui.core.MPlacement,
    qx.ui.core.MRemoteChildrenHandling
  ],


  construct : function()
  {
    this.base(arguments);

    // Use hard coded layout
    this._setLayout(new qx.ui.menu.Layout);

    // Automatically add to application's root
    var root = this.getApplicationRoot();
    root.add(this);

    // Register mouse listeners
    this.addListener("mouseover", this._onMouseOver);
    this.addListener("mouseout", this._onMouseOut);

    // add resize listener
    this.addListener("resize", this._onResize, this);
    root.addListener("resize", this._onResize, this);

    this._blocker = new qx.ui.core.Blocker(root);

    // Initialize properties
    this.initVisibility();
    this.initKeepFocus();
    this.initKeepActive();
  },



  properties :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET PROPERTIES
    ---------------------------------------------------------------------------
    */

    // overridden
    appearance :
    {
      refine : true,
      init : "menu"
    },

    // overridden
    allowGrowX :
    {
      refine : true,
      init: false
    },

    // overridden
    allowGrowY :
    {
      refine : true,
      init: false
    },

    // overridden
    visibility :
    {
      refine : true,
      init : "excluded"
    },

    // overridden
    keepFocus :
    {
      refine : true,
      init : true
    },

    // overridden
    keepActive :
    {
      refine : true,
      init : true
    },


    /*
    ---------------------------------------------------------------------------
      STYLE OPTIONS
    ---------------------------------------------------------------------------
    */

    /** The spacing between each cell of the menu buttons */
    spacingX :
    {
      check : "Integer",
      apply : "_applySpacingX",
      init : 0,
      themeable : true
    },

    /** The spacing between each menu button */
    spacingY :
    {
      check : "Integer",
      apply : "_applySpacingY",
      init : 0,
      themeable : true
    },

    /**
    * Default icon column width if no icons are rendered.
    * This property is ignored as soon as an icon is present.
    */
    iconColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyIconColumnWidth"
    },

    /** Default arrow column width if no sub menus are rendered */
    arrowColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyArrowColumnWidth"
    },

    /**
     * Color of the blocker
     */
    blockerColor :
    {
      check : "Color",
      init : null,
      nullable: true,
      apply : "_applyBlockerColor",
      themeable: true
    },

    /**
     * Opacity of the blocker
     */
    blockerOpacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyBlockerOpacity",
      themeable: true
    },


    /*
    ---------------------------------------------------------------------------
      FUNCTIONALITY PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** The currently selected button */
    selectedButton :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applySelectedButton"
    },

    /** The currently opened button (sub menu is visible) */
    openedButton :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applyOpenedButton"
    },

    /** Widget that opened the menu */
    opener :
    {
      check : "qx.ui.core.Widget",
      nullable : true
    },




    /*
    ---------------------------------------------------------------------------
      BEHAVIOR PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** Interval in ms after which sub menus should be opened */
    openInterval :
    {
      check : "Integer",
      themeable : true,
      init : 250,
      apply : "_applyOpenInterval"
    },

    /** Interval in ms after which sub menus should be closed  */
    closeInterval :
    {
      check : "Integer",
      themeable : true,
      init : 250,
      apply : "_applyCloseInterval"
    },

    /** Blocks the background if value is <code>true<code> */
    blockBackground :
    {
      check : "Boolean",
      themeable : true,
      init : false
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __scheduledOpen : null,
    __onAfterSlideBarAdd : null,

    /** {qx.ui.core.Blocker} blocker for background blocking */
    _blocker : null,

    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Opens the menu and configures the opener
     */
    open : function()
    {
      if (this.getOpener() != null)
      {
        var isPlaced = this.placeToWidget(this.getOpener());
        if(isPlaced) {
          this.__updateSlideBar();
          this.show();

          this._placementTarget = this.getOpener();
        } else {
          this.warn("Could not open menu instance because 'opener' widget is not visible");
        }
      } else {
        this.warn("The menu instance needs a configured 'opener' widget!");
      }
    },


    /**
     * Opens the menu at the mouse cursor position
     *
     * @param e {qx.event.type.Mouse}  Mouse event to align to
     */
    openAtMouse : function(e)
    {
      this.placeToMouse(e);
      this.__updateSlideBar();
      this.show();

      this._placementTarget = {
        left: e.getDocumentLeft(),
        top: e.getDocumentTop()
      };
    },


    /**
     * Opens the menu in relation to the given point
     *
     * @param point {Map} Coordinate of any point with the keys <code>left</code>
     *   and <code>top</code>.
     */
    openAtPoint : function(point)
    {
      this.placeToPoint(point);
      this.__updateSlideBar();
      this.show();

      this._placementTarget = point;
    },


    /**
     * Convenience method to add a separator to the menu
     */
    addSeparator : function() {
      this.add(new qx.ui.menu.Separator);
    },


    /**
     * Returns the column sizes detected during the pre-layout phase
     *
     * @return {Array} List of all column widths
     */
    getColumnSizes : function() {
      return this._getMenuLayout().getColumnSizes();
    },


    /**
     * Return all selectable menu items.
     *
     * @return {qx.ui.core.Widget[]} selectable widgets
     */
    getSelectables : function() {
      var result = [];
      var children = this.getChildren();

      for (var i = 0; i < children.length; i++)
      {
        if (children[i].isEnabled()) {
          result.push(children[i]);
        }
      }

      return result;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIconColumnWidth : function(value, old) {
      this._getMenuLayout().setIconColumnWidth(value);
    },


    // property apply
    _applyArrowColumnWidth : function(value, old) {
      this._getMenuLayout().setArrowColumnWidth(value);
    },


    // property apply
    _applySpacingX : function(value, old) {
      this._getMenuLayout().setColumnSpacing(value);
    },


    // property apply
    _applySpacingY : function(value, old) {
      this._getMenuLayout().setSpacing(value);
    },


    // overridden
    _applyVisibility : function(value, old)
    {
      this.base(arguments, value, old);

      var mgr = qx.ui.menu.Manager.getInstance();

      if (value === "visible")
      {
        // Register to manager (zIndex handling etc.)
        mgr.add(this);

        // Mark opened in parent menu
        var parentMenu = this.getParentMenu();
        if (parentMenu) {
          parentMenu.setOpenedButton(this.getOpener());
        }
      }
      else if (old === "visible")
      {
        // Deregister from manager (zIndex handling etc.)
        mgr.remove(this);

        // Unmark opened in parent menu
        var parentMenu = this.getParentMenu();
        if (parentMenu && parentMenu.getOpenedButton() == this.getOpener()) {
          parentMenu.resetOpenedButton();
        }

        // Clear properties
        this.resetOpenedButton();
        this.resetSelectedButton();
      }

      this.__updateBlockerVisibility();
    },


    /**
     * Updates the blocker's visibility
     */
    __updateBlockerVisibility : function()
    {
      if (this.isVisible())
      {
        if (this.getBlockBackground()) {
          var zIndex = this.getZIndex();
          this._blocker.blockContent(zIndex - 1);
        }
      }
      else
      {
        if (this._blocker.isContentBlocked()) {
          this._blocker.unblockContent();
        }
      }
    },


    /**
     * Get the parent menu. Returns <code>null</code> if the menu doesn't have a
     * parent menu.
     *
     * @return {Menu|null} The parent menu.
     */
    getParentMenu : function()
    {
      var widget = this.getOpener();
      if (!widget || !(widget instanceof qx.ui.menu.AbstractButton)) {
        return null;
      }

      if (widget && widget.getContextMenu() === this) {
        return null;
      }

      while (widget && !(widget instanceof qx.ui.menu.Menu)) {
        widget = widget.getLayoutParent();
      }
      return widget;
    },


    // property apply
    _applySelectedButton : function(value, old)
    {
      if (old) {
        old.removeState("selected");
      }

      if (value) {
        value.addState("selected");
      }
    },


    // property apply
    _applyOpenedButton : function(value, old)
    {
      if (old && old.getMenu()) {
        old.getMenu().exclude();
      }

      if (value) {
        value.getMenu().open();
      }
    },


    // property apply
    _applyBlockerColor : function(value, old) {
      this._blocker.setColor(value);
    },


    // property apply
    _applyBlockerOpacity : function(value, old) {
      this._blocker.setOpacity(value);
    },


    /*
    ---------------------------------------------------------------------------
    SCROLLING SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this.getChildControl("slidebar", true) || this;
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "slidebar":
          var control = new qx.ui.menu.MenuSlideBar();

          var layout = this._getLayout();
          this._setLayout(new qx.ui.layout.Grow());

          var slidebarLayout = control.getLayout();
          control.setLayout(layout);
          slidebarLayout.dispose();

          var children = qx.lang.Array.clone(this.getChildren());
          for (var i=0; i<children.length; i++) {
            control.add(children[i]);
          }

          this.removeListener("resize", this._onResize, this);
          control.getChildrenContainer().addListener("resize", this._onResize, this);

          this._add(control);

        break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Get the menu layout manager
     *
     * @return {Layout} The menu layout manager
     */
    _getMenuLayout : function()
    {
      if (this.hasChildControl("slidebar")) {
        return this.getChildControl("slidebar").getChildrenContainer().getLayout();
      } else {
        return this._getLayout();
      }
    },


    /**
     * Get the menu bounds
     *
     * @return {Map} The menu bounds
     */
    _getMenuBounds : function()
    {
      if (this.hasChildControl("slidebar")) {
        return this.getChildControl("slidebar").getChildrenContainer().getBounds();
      } else {
        return this.getBounds();
      }
    },


    /**
     * Computes the size of the menu. This method is used by the
     * {@link qx.ui.core.MPlacement} mixin.
     * @return {Map} The menu bounds
     */
    _computePlacementSize : function() {
      return this._getMenuBounds();
    },


    /**
     * Updates the visibility of the slidebar based on the menu's current size
     * and position.
     */
    __updateSlideBar : function()
    {
      var menuBounds = this._getMenuBounds();
      if (!menuBounds)
      {
        this.addListenerOnce("resize", this.__updateSlideBar, this)
        return;
      }

      var rootHeight = this.getLayoutParent().getBounds().height;
      var top = this.getLayoutProperties().top;
      var left = this.getLayoutProperties().left;

      // Adding the slidebar must be deferred because this call can happen
      // during the layout flush, which make it impossible to move existing
      // layout to the slidebar
      if (top < 0)
      {
        this._assertSlideBar(function() {
          this.setHeight(menuBounds.height + top);
          this.moveTo(left, 0);
        });
      }
      else if (top + menuBounds.height > rootHeight)
      {
        this._assertSlideBar(function() {
          this.setHeight(rootHeight - top);
        });
      }
      else
      {
        this.setHeight(null);
      }
    },


    /**
     * Schedules the addition of the slidebar and calls the given callback
     * after the slidebar has been added.
     *
     * @param callback {Function} the callback to call
     * @return {var|undefined} The return value of the callback if the slidebar
     * already exists, or <code>undefined</code> if it doesn't
     */
    _assertSlideBar : function(callback)
    {
      if (this.hasChildControl("slidebar")) {
        return callback.call(this);
      }

      this.__onAfterSlideBarAdd = callback;
      qx.ui.core.queue.Widget.add(this);
    },


    // overridden
    syncWidget : function(jobs)
    {
      this.getChildControl("slidebar");
      if (this.__onAfterSlideBarAdd)
      {
        this.__onAfterSlideBarAdd.call(this);
        delete this.__onAfterSlideBarAdd;
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Update position if the menu or the root is resized
     */
    _onResize : function()
    {
      if (this.isVisible())
      {
        var target = this._placementTarget;
        if (!target) {
          return
        } else if (target instanceof qx.ui.core.Widget) {
          this.placeToWidget(target);
        } else if (target.top !== undefined) {
          this.placeToPoint(target);
        } else {
          throw new Error("Unknown target: " + target);
        }
        this.__updateSlideBar();
      }
    },


    /**
     * Event listener for mouseover event.
     *
     * @param e {qx.event.type.Mouse} mouseover event
     */
    _onMouseOver : function(e)
    {
      // Cache manager
      var mgr = qx.ui.menu.Manager.getInstance();

      // Be sure this menu is kept
      mgr.cancelClose(this);

      // Change selection
      var target = e.getTarget();
      if (target.isEnabled() && target instanceof qx.ui.menu.AbstractButton)
      {
        // Select button directly
        this.setSelectedButton(target);

        var subMenu = target.getMenu && target.getMenu();
        if (subMenu)
        {
          subMenu.setOpener(target);

          // Finally schedule for opening
          mgr.scheduleOpen(subMenu);

          // Remember scheduled menu for opening
          this.__scheduledOpen = subMenu;
        }
        else
        {
          var opened = this.getOpenedButton();
          if (opened) {
            mgr.scheduleClose(opened.getMenu());
          }

          if (this.__scheduledOpen)
          {
            mgr.cancelOpen(this.__scheduledOpen);
            this.__scheduledOpen = null;
          }
        }
      }
      else if (!this.getOpenedButton())
      {
        // When no button is opened reset the selection
        // Otherwise keep it
        this.resetSelectedButton();
      }
    },


    /**
     * Event listener for mouseout event.
     *
     * @param e {qx.event.type.Mouse} mouseout event
     */
    _onMouseOut : function(e)
    {
      // Cache manager
      var mgr = qx.ui.menu.Manager.getInstance();

      // Detect whether the related target is out of the menu
      if (!qx.ui.core.Widget.contains(this, e.getRelatedTarget()))
      {
        // Update selected property
        // Force it to the open sub menu in cases where that is opened
        // Otherwise reset it. Menus which are left by the cursor should
        // not show any selection.
        var opened = this.getOpenedButton();
        opened ? this.setSelectedButton(opened) : this.resetSelectedButton();

        // Cancel a pending close request for the currently
        // opened sub menu
        if (opened) {
          mgr.cancelClose(opened.getMenu());
        }

        // When leaving this menu to the outside, stop
        // all pending requests to open any other sub menu
        if (this.__scheduledOpen) {
          mgr.cancelOpen(this.__scheduledOpen);
        }
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (!qx.core.ObjectRegistry.inShutDown) {
      qx.ui.menu.Manager.getInstance().remove(this);
    }

    this.getApplicationRoot().removeListener("resize", this._onResize, this);
    this._placementTarget = null;
    this._disposeObjects("_blocker");
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Layouter used by the qooxdoo menu's to render their buttons
 *
 * @internal
 */
qx.Class.define("qx.ui.menu.Layout",
{
  extend : qx.ui.layout.VBox,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Spacing between each cell on the menu buttons */
    columnSpacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },

    /**
     * Whether a column and which column should automatically span
     * when the following cell is empty. Spanning may be disabled
     * through setting this property to <code>null</code>.
     */
    spanColumn :
    {
      check : "Integer",
      init : 1,
      nullable : true,
      apply : "_applyLayoutChange"
    },

    /** Default icon column width if no icons are rendered */
    iconColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyLayoutChange"
    },

    /** Default arrow column width if no sub menus are rendered */
    arrowColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyLayoutChange"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __columnSizes : null,

    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var child, sizes, spacing;

      var spanColumn = this.getSpanColumn();
      var columnSizes = this.__columnSizes = [0, 0, 0, 0];
      var columnSpacing = this.getColumnSpacing();
      var spanColumnWidth = 0;
      var maxInset = 0;

      // Compute column sizes and insets
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child.isAnonymous()) {
          continue;
        }

        sizes = child.getChildrenSizes();

        for (var column=0; column<sizes.length; column++)
        {
          if (spanColumn != null && column == spanColumn && sizes[spanColumn+1] == 0) {
            spanColumnWidth = Math.max(spanColumnWidth, sizes[column]);
          } else {
            columnSizes[column] = Math.max(columnSizes[column], sizes[column])
          }
        }

        var insets = children[i].getInsets();
        maxInset = Math.max(maxInset, insets.left + insets.right);
      }

      // Fix label column width is cases where the maximum button with no shortcut
      // is larger than the maximum button with a shortcut
      if (spanColumn != null && columnSizes[spanColumn] + columnSpacing + columnSizes[spanColumn+1] < spanColumnWidth) {
        columnSizes[spanColumn] = spanColumnWidth - columnSizes[spanColumn+1] - columnSpacing;
      }

      // When merging the cells for label and shortcut
      // ignore the spacing between them
      if (spanColumnWidth == 0) {
        spacing = columnSpacing * 2;
      } else {
        spacing = columnSpacing * 3;
      }

      // Fix zero size icon column
      if (columnSizes[0] == 0) {
        columnSizes[0] = this.getIconColumnWidth();
      }

      // Fix zero size arrow column
      if (columnSizes[3] == 0) {
        columnSizes[3] = this.getArrowColumnWidth();
      }

      var height = this.base(arguments).height;

      // Build hint
      return {
        minHeight: height,
        height : height,
        width : qx.lang.Array.sum(columnSizes) + maxInset + spacing
      };
    },



    /*
    ---------------------------------------------------------------------------
      CUSTOM ADDONS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the column sizes detected during the pre-layout phase
     *
     * @return {Array} List of all column widths
     */
    getColumnSizes : function() {
      return this.__columnSizes || null;
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this.__columnSizes = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This widget draws a separator line between two instances of
 * {@link qx.ui.menu.AbstractButton} and is inserted into the
 * {@link qx.ui.menu.Menu}.
 *
 * For convenience reasons there is also
 * a method {@link qx.ui.menu.Menu#addSeparator} to append instances
 * of this class to the menu.
 */
qx.Class.define("qx.ui.menu.Separator",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "menu-separator"
    },

    // overridden
    anonymous :
    {
      refine : true,
      init : true
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The abstract menu button class is used for all type of menu content
 * for example normal buttons, checkboxes or radiobuttons.
 *
 * @childControl icon {qx.ui.basic.Image} icon of the button
 * @childControl label {qx.ui.basic.Label} label of the button
 * @childControl shortcut {qx.ui.basic.Label} shows if specified the shortcut
 * @childControl arrow {qx.ui.basic.Image} shows the arrow to show an additional widget (e.g. popup or submenu)
 */
qx.Class.define("qx.ui.menu.AbstractButton",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MExecutable],
  implement : [qx.ui.form.IExecutable],
  type : "abstract",


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Use hard coded layout
    this._setLayout(new qx.ui.menu.ButtonLayout);

    // Add listeners
    this.addListener("click", this._onClick);
    this.addListener("keypress", this._onKeyPress);

    // Add command listener
    this.addListener("changeCommand", this._onChangeCommand, this);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    blockToolTip :
    {
      refine : true,
      init : true
    },

    /** The label text of the button */
    label :
    {
      check : "String",
      apply : "_applyLabel",
      nullable : true,
      event: "changeLabel"
    },

    /** Whether a sub menu should be shown and which one */
    menu :
    {
      check : "qx.ui.menu.Menu",
      apply : "_applyMenu",
      nullable : true,
      dereference : true,
      event : "changeMenu"
    },

    /** The icon to use */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      themeable : true,
      nullable : true,
      event: "changeIcon"
    },

    /** Indicates whether the label for the command (shortcut) should be visible or not. */
    showCommandLabel :
    {
      check : "Boolean",
      apply : "_applyShowCommandLabel",
      themeable : true,
      init : true,
      event: "changeShowCommandLabel"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "icon":
          control = new qx.ui.basic.Image;
          control.setAnonymous(true);
          this._add(control, {column:0});
          break;

        case "label":
          control = new qx.ui.basic.Label;
          control.setAnonymous(true);
          this._add(control, {column:1});
          break;

        case "shortcut":
          control = new qx.ui.basic.Label;
          control.setAnonymous(true);
          if (!this.getShowCommandLabel()) {
            control.exclude();
          }
          this._add(control, {column:2});
          break;

        case "arrow":
          control = new qx.ui.basic.Image;
          control.setAnonymous(true);
          this._add(control, {column:3});
          break;
      }

      return control || this.base(arguments, id);
    },


    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      selected : 1
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT UTILS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the dimensions of all children
     *
     * @return {Array} Preferred width of each child
     */
    getChildrenSizes : function()
    {
      var iconWidth=0, labelWidth=0, shortcutWidth=0, arrowWidth=0;

      if (this._isChildControlVisible("icon"))
      {
        var icon = this.getChildControl("icon");
        iconWidth = icon.getMarginLeft() + icon.getSizeHint().width + icon.getMarginRight();
      }

      if (this._isChildControlVisible("label"))
      {
        var label = this.getChildControl("label");
        labelWidth = label.getMarginLeft() + label.getSizeHint().width + label.getMarginRight();
      }

      if (this._isChildControlVisible("shortcut"))
      {
        var shortcut = this.getChildControl("shortcut");
        shortcutWidth = shortcut.getMarginLeft() + shortcut.getSizeHint().width + shortcut.getMarginRight();
      }

      if (this._isChildControlVisible("arrow"))
      {
        var arrow = this.getChildControl("arrow");
        arrowWidth = arrow.getMarginLeft() + arrow.getSizeHint().width + arrow.getMarginRight();
      }

      return [ iconWidth, labelWidth, shortcutWidth, arrowWidth ];
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Event listener for click
     *
     * @param e {qx.event.type.Mouse} mouseup event
     */
    _onClick : function(e) {
      // pass
    },


    /**
     * Event listener for mouseup event
     *
     * @param e {qx.event.type.KeySequence} keypress event
     */
    _onKeyPress : function(e) {
      // pass
    },


    /**
     * Event listener for command changes. Updates the text of the shortcut.
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onChangeCommand : function(e)
    {
      var command = e.getData();

      // do nothing if no command is set
      if (command == null) {
        return;
      }

      if (qx.core.Environment.get("qx.dynlocale"))
      {
        var oldCommand = e.getOldData();
        if (!oldCommand) {
          qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
        }
        if (!command) {
          qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
        }
      }

      var cmdString = command != null ? command.toString() : "";
      this.getChildControl("shortcut").setValue(cmdString);
    },


    /**
     * Update command string on locale changes
     */
    _onChangeLocale : qx.core.Environment.select("qx.dynlocale",
    {
      "true" : function(e) {
        var command = this.getCommand();
        if (command != null) {
          this.getChildControl("shortcut").setValue(command.toString());
        }
      },

      "false" : null
    }),


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon : function(value, old)
    {
      if (value) {
        this._showChildControl("icon").setSource(value);
      } else {
        this._excludeChildControl("icon");
      }
    },

    // property apply
    _applyLabel : function(value, old)
    {
      if (value) {
        this._showChildControl("label").setValue(value);
      } else {
        this._excludeChildControl("label");
      }
    },

    // property apply
    _applyMenu : function(value, old)
    {
      if (old)
      {
        old.resetOpener();
        old.removeState("submenu");
      }

      if (value)
      {
        this._showChildControl("arrow");

        value.setOpener(this);
        value.addState("submenu");
      }
      else
      {
        this._excludeChildControl("arrow");
      }
    },

    // property apply
    _applyShowCommandLabel : function(value, old)
    {
      if (value) {
        this._showChildControl("shortcut");
      } else {
        this._excludeChildControl("shortcut");
      }
    }
  },


  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this.removeListener("changeCommand", this._onChangeCommand, this);

    if (this.getMenu())
    {
      if (!qx.core.ObjectRegistry.inShutDown) {
        this.getMenu().destroy();
      }
    }

    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }
  }
});

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Layout used for the menu buttons which may contain four elements. A icon,
 * a label, a shortcut text and an arrow (for a sub menu)
 *
 * @internal
 */
qx.Class.define("qx.ui.menu.ButtonLayout",
{
  extend : qx.ui.layout.Abstract,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value) {
        this.assert(name=="column", "The property '"+name+"' is not supported by the MenuButton layout!");
      },

      "false" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var child;
      var column;

      var columnChildren = [];
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        column = child.getLayoutProperties().column;
        columnChildren[column] = child;
      }

      var menu = this.__getMenu(children[0]);

      var columns = menu.getColumnSizes();
      var spacing = menu.getSpacingX();

      // stretch label column
      var neededWidth = qx.lang.Array.sum(columns) + spacing * (columns.length - 1);
      if (neededWidth < availWidth) {
        columns[1] += availWidth - neededWidth;
      }


      var left=0, top=0;
      var Util = qx.ui.layout.Util;

      for (var i=0, l=columns.length; i<l; i++)
      {
        child = columnChildren[i];

        if (child)
        {
          var hint = child.getSizeHint();
          var top = Util.computeVerticalAlignOffset(child.getAlignY()||"middle", hint.height, availHeight, 0, 0);
          var offsetLeft = Util.computeHorizontalAlignOffset(child.getAlignX()||"left", hint.width, columns[i], child.getMarginLeft(), child.getMarginRight());
          child.renderLayout(left + offsetLeft, top, hint.width, hint.height);
        }

        if (columns[i] > 0) {
          left += columns[i] + spacing;
        }
      }
    },


    /**
     * Get the widget's menu
     *
     * @param widget {qx.ui.core.Widget} the widget to get the menu for
     * @return {qx.ui.menu.Menu} the menu
     */
    __getMenu : function(widget)
    {
      while (!(widget instanceof qx.ui.menu.Menu)) {
        widget = widget.getLayoutParent();
      }
      return widget;
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var neededHeight = 0;
      var neededWidth = 0;

      for (var i=0, l=children.length; i<l; i++)
      {
        var hint = children[i].getSizeHint();
        neededWidth += hint.width;
        neededHeight = Math.max(neededHeight, hint.height);
      }

      return {
        width : neededWidth,
        height : neededHeight
      }
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Container, which provides scrolling in one dimension (vertical or horizontal).
 *
 * @childControl button-forward {qx.ui.form.RepeatButton} button to step forward
 * @childControl button-backward {qx.ui.form.RepeatButton} button to step backward
 * @childControl content {qx.ui.container.Composite} container to hold the content
 * @childControl scrollpane {qx.ui.core.scroll.ScrollPane} the scroll pane holds the content to enable scrolling
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create slide bar container
 *   slideBar = new qx.ui.container.SlideBar().set({
 *     width: 300
 *   });
 *
 *   // set layout
 *   slideBar.setLayout(new qx.ui.layout.HBox());
 *
 *   // add some widgets
 *   for (var i=0; i<10; i++)
 *   {
 *     slideBar.add((new qx.ui.core.Widget()).set({
 *       backgroundColor : (i % 2 == 0) ? "red" : "blue",
 *       width : 60
 *     }));
 *   }
 *
 *   this.getRoot().add(slideBar);
 * </pre>
 *
 * This example creates a SlideBar and add some widgets with alternating
 * background colors. Since the content is larger than the container, two
 * scroll buttons at the left and the right edge are shown.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/slidebar.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.container.SlideBar",
{
  extend : qx.ui.core.Widget,

  include :
  [
    qx.ui.core.MRemoteChildrenHandling,
    qx.ui.core.MRemoteLayoutHandling
  ],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param orientation {String?"horizontal"} The slide bar orientation
   */
  construct : function(orientation)
  {
    this.base(arguments);

    var scrollPane = this.getChildControl("scrollpane");
    this._add(scrollPane, {flex: 1});

    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    this.addListener("mousewheel", this._onMouseWheel, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "slidebar"
    },

    /** Orientation of the bar */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "horizontal",
      apply : "_applyOrientation"
    },

    /** The number of pixels to scroll if the buttons are pressed */
    scrollStep :
    {
      check : "Integer",
      init : 15,
      themeable : true
    }
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired on scroll animation end invoked by 'scroll*' methods. */
    scrollAnimationEnd : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this.getChildControl("content");
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "button-forward":
          control = new qx.ui.form.RepeatButton;
          control.addListener("execute", this._onExecuteForward, this);
          control.setFocusable(false);
          this._addAt(control, 2);
          break;

        case "button-backward":
          control = new qx.ui.form.RepeatButton;
          control.addListener("execute", this._onExecuteBackward, this);
          control.setFocusable(false);
          this._addAt(control, 0);
          break;

        case "content":
          control = new qx.ui.container.Composite();

          /*
           * Gecko < 2 does not update the scroll position after removing an
           * element. So we have to do this by hand.
           */
          if (qx.core.Environment.get("engine.name") == "gecko" &&
            parseInt(qx.core.Environment.get("engine.version")) < 2)
          {
            control.addListener("removeChildWidget", this._onRemoveChild, this);
          }

          this.getChildControl("scrollpane").add(control);
          break;

        case "scrollpane":
          control = new qx.ui.core.scroll.ScrollPane();
          control.addListener("update", this._onResize, this);
          control.addListener("scrollX", this._onScroll, this);
          control.addListener("scrollY", this._onScroll, this);
          control.addListener("scrollAnimationEnd", this._onScrollAnimationEnd, this);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      barLeft : true,
      barTop : true,
      barRight : true,
      barBottom : true
    },

    /*
    ---------------------------------------------------------------------------
      PUBLIC SCROLL API
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls the element's content by the given amount.
     *
     * @param offset {Integer?0} Amount to scroll
     * @param duration {Number?} The time in milliseconds the scroll to should take.
     */
    scrollBy : function(offset, duration)
    {
      var pane = this.getChildControl("scrollpane");
      if (this.getOrientation() === "horizontal") {
        pane.scrollByX(offset, duration);
      } else {
        pane.scrollByY(offset, duration);
      }
    },


    /**
     * Scrolls the element's content to the given coordinate
     *
     * @param value {Integer} The position to scroll to.
     * @param duration {Number?} The time in milliseconds the scroll to should take.
     */
    scrollTo : function(value, duration)
    {
      var pane = this.getChildControl("scrollpane");
      if (this.getOrientation() === "horizontal") {
        pane.scrollToX(value, duration);
      } else {
        pane.scrollToY(value, duration);
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */
    // overridden
    _applyEnabled : function(value, old, name) {
      this.base(arguments, value, old, name);
      this._updateArrowsEnabled();
    },


    // property apply
    _applyOrientation : function(value, old)
    {
      var oldLayouts = [this.getLayout(), this._getLayout()];
      var buttonForward = this.getChildControl("button-forward");
      var buttonBackward = this.getChildControl("button-backward");

      // old can also be null, so we have to check both explicitly to set
      // the states correctly.
      if (old == "vertical" && value == "horizontal")
      {
        buttonForward.removeState("vertical");
        buttonBackward.removeState("vertical");
        buttonForward.addState("horizontal");
        buttonBackward.addState("horizontal");
      }
      else if (old == "horizontal" && value == "vertical")
      {
        buttonForward.removeState("horizontal");
        buttonBackward.removeState("horizontal");
        buttonForward.addState("vertical");
        buttonBackward.addState("vertical");
      }


      if (value == "horizontal")
      {
        this._setLayout(new qx.ui.layout.HBox());
        this.setLayout(new qx.ui.layout.HBox());
      }
      else
      {
        this._setLayout(new qx.ui.layout.VBox());
        this.setLayout(new qx.ui.layout.VBox());
      }

      if (oldLayouts[0]) {
        oldLayouts[0].dispose();
      }

      if (oldLayouts[1]) {
        oldLayouts[1].dispose();
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls pane on mousewheel events
     *
     * @param e {qx.event.type.Mouse} the mouse event
     */
    _onMouseWheel : function(e)
    {
      var delta = 0;
      var pane = this.getChildControl("scrollpane");
      if (this.getOrientation() === "horizontal") {
        delta = e.getWheelDelta("x");

        var position = pane.getScrollX();
        var max = pane.getScrollMaxX();
        var steps = parseInt(delta);

        // pass the event to the parent if both scrollbars are at the end
        if (!(
          steps < 0 && position <= 0 ||
          steps > 0 && position >= max ||
          delta == 0)
        ) {
          e.stop();
        }
      } else {
        delta = e.getWheelDelta("y");

        var position = pane.getScrollY();
        var max = pane.getScrollMaxY();
        var steps = parseInt(delta);

        // pass the event to the parent if both scrollbars are at the end
        if (!(
          steps < 0 && position <= 0 ||
          steps > 0 && position >= max ||
          delta == 0
        )) {
          e.stop();
        }
      }

      this.scrollBy(delta * this.getScrollStep());
    },


    /**
     * Update arrow enabled state after scrolling
     */
    _onScroll : function() {
      this._updateArrowsEnabled();
    },


    /**
     * Handler to fire the 'scrollAnimationEnd' event.
     */
    _onScrollAnimationEnd : function() {
      this.fireEvent("scrollAnimationEnd");
    },


    /**
     * Listener for resize event. This event is fired after the
     * first flush of the element which leads to another queuing
     * when the changes modify the visibility of the scroll buttons.
     *
     * @param e {Event} Event object
     */
    _onResize : function(e)
    {
      var content = this.getChildControl("scrollpane").getChildren()[0];
      if (!content) {
        return;
      }

      var innerSize = this.getInnerSize();
      var contentSize = content.getBounds();

      var overflow = (this.getOrientation() === "horizontal") ?
        contentSize.width > innerSize.width :
        contentSize.height > innerSize.height;

      if (overflow) {
        this._showArrows()
        this._updateArrowsEnabled();
      } else {
        this._hideArrows();
      }
    },


    /**
     * Scroll handler for left scrolling
     *
     */
    _onExecuteBackward : function() {
      this.scrollBy(-this.getScrollStep());
    },


    /**
     * Scroll handler for right scrolling
     *
     */
    _onExecuteForward : function() {
      this.scrollBy(this.getScrollStep());
    },


    /**
     * Helper function for Gecko. Modifies the scroll offset when a child is
     * removed.
     */
    _onRemoveChild : function()
    {
      qx.event.Timer.once(
        function()
        {
          // It might happen that the child control is already disposed in very
          // seldom cases - anyway check against that (Bug #5339)
          var scrollpane = this.getChildControl("scrollpane");
          if (!scrollpane.isDisposed()) {
            this.scrollBy(scrollpane.getScrollX());
          }
        },
        this,
        50
      );
    },


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Update arrow enabled state
     */
    _updateArrowsEnabled : function()
    {
      // set the disables state directly because we are overriding the
      // inheritance
      if (!this.getEnabled()) {
        this.getChildControl("button-backward").setEnabled(false);
        this.getChildControl("button-forward").setEnabled(false);
        return;
      }

      var pane = this.getChildControl("scrollpane");

      if (this.getOrientation() === "horizontal")
      {
        var position = pane.getScrollX();
        var max = pane.getScrollMaxX();
      }
      else
      {
        var position = pane.getScrollY();
        var max = pane.getScrollMaxY();
      }

      this.getChildControl("button-backward").setEnabled(position > 0);
      this.getChildControl("button-forward").setEnabled(position < max);
    },


    /**
     * Show the arrows (Called from resize event)
     *
     */
    _showArrows : function()
    {
      this._showChildControl("button-forward");
      this._showChildControl("button-backward");
    },


    /**
     * Hide the arrows (Called from resize event)
     *
     */
    _hideArrows : function()
    {
      this._excludeChildControl("button-forward");
      this._excludeChildControl("button-backward");

      this.scrollTo(0);
    }
  }

});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The MenuSlideBar is used to scroll menus if they don't fit on the screen.
 *
 * @childControl button-forward {qx.ui.form.HoverButton} scrolls forward of hovered
 * @childControl button-backward {qx.ui.form.HoverButton} scrolls backward if hovered
 *
 * @internal
 */
qx.Class.define("qx.ui.menu.MenuSlideBar",
{
  extend : qx.ui.container.SlideBar,

  construct : function()
  {
    this.base(arguments, "vertical");
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "menu-slidebar"
    }
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "button-forward":
          control = new qx.ui.form.HoverButton();
          control.addListener("execute", this._onExecuteForward, this);
          this._addAt(control, 2);
          break;

        case "button-backward":
          control = new qx.ui.form.HoverButton();
          control.addListener("execute", this._onExecuteBackward, this);
          this._addAt(control, 0);
          break;
      }

      return control || this.base(arguments, id);
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The HoverButton is an {@link qx.ui.basic.Atom}, which fires repeatedly
 * execute events while the mouse is over the widget.
 *
 * The rate at which the execute event is fired accelerates is the mouse keeps
 * inside of the widget. The initial delay and the interval time can be set using
 * the properties {@link #firstInterval} and {@link #interval}. The
 * {@link #execute} events will be fired in a shorter amount of time if the mouse
 * remains over the widget, until the min {@link #minTimer} is reached.
 * The {@link #timerDecrease} property sets the amount of milliseconds which will
 * decreased after every firing.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var button = new qx.ui.form.HoverButton("Hello World");
 *
 *   button.addListener("execute", function(e) {
 *     alert("Button is hovered");
 *   }, this);
 *
 *   this.getRoot.add(button);
 * </pre>
 *
 * This example creates a button with the label "Hello World" and attaches an
 * event listener to the {@link #execute} event.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/hoverbutton.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.form.HoverButton",
{
  extend : qx.ui.basic.Atom,
  include : [qx.ui.core.MExecutable],
  implement : [qx.ui.form.IExecutable],

  /**
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   */
  construct : function(label, icon)
  {
    this.base(arguments, label, icon);

    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);

    this.__timer = new qx.event.AcceleratingTimer();
    this.__timer.addListener("interval", this._onInterval, this);
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "hover-button"
    },

    /**
     * Interval used after the first run of the timer. Usually a smaller value
     * than the "firstInterval" property value to get a faster reaction.
     */
    interval :
    {
      check : "Integer",
      init  : 80
    },

    /**
     * Interval used for the first run of the timer. Usually a greater value
     * than the "interval" property value to a little delayed reaction at the first
     * time.
     */
    firstInterval :
    {
      check : "Integer",
      init  : 200
    },

    /** This configures the minimum value for the timer interval. */
    minTimer :
    {
      check : "Integer",
      init  : 20
    },

    /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
    timerDecrease :
    {
      check : "Integer",
      init  : 2
    }
  },


  members :
  {
    __timer : null,


    /**
     * Start timer on mouse over
     *
     * @param e {qx.event.type.Mouse} The mouse event
     */
    _onMouseOver : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      this.__timer.set({
        interval: this.getInterval(),
        firstInterval: this.getFirstInterval(),
        minimum: this.getMinTimer(),
        decrease: this.getTimerDecrease()
      }).start();

      this.addState("hovered");
    },


    /**
     * Stop timer on mouse out
     *
     * @param e {qx.event.type.Mouse} The mouse event
     */
    _onMouseOut : function(e)
    {
      this.__timer.stop();
      this.removeState("hovered");

      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }
    },


    /**
     * Fire execute event on timer interval event
     */
    _onInterval : function()
    {
      if (this.isEnabled())
      {
        this.execute();
      } else {
        this.__timer.stop();
      }
    }
  },


  destruct : function() {
    this._disposeObjects("__timer");
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * A menubar button
 */
qx.Class.define("qx.ui.menubar.Button",
{
  extend : qx.ui.form.MenuButton,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, menu)
  {
    this.base(arguments, label, icon, menu);

    this.removeListener("keydown", this._onKeyDown);
    this.removeListener("keyup", this._onKeyUp);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "menubar-button"
    },

    show :
    {
      refine : true,
      init : "inherit"
    },

    focusable :
    {
      refine : true,
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Inspects the parent chain to find the MenuBar
     *
     * @return {qx.ui.menubar.MenuBar} MenuBar instance or <code>null</code>.
     */
    getMenuBar : function()
    {
      var parent = this;
      while (parent)
      {
        /* this method is also used by toolbar.MenuButton, so we need to check
           for a ToolBar instance. */
        if (parent instanceof qx.ui.toolbar.ToolBar) {
          return parent;
        }

        parent = parent.getLayoutParent();
      }

      return null;
    },


    // overridden
    open : function(selectFirst) {
      this.base(arguments, selectFirst);

      var menubar = this.getMenuBar();
      menubar._setAllowMenuOpenHover(true);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener for visibility property changes of the attached menu
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onMenuChange : function(e)
    {
      var menu = this.getMenu();
      var menubar = this.getMenuBar();

      if (menu.isVisible())
      {
        this.addState("pressed");

        // Sync with open menu property
        if (menubar) {
          menubar.setOpenMenu(menu);
        }
      }
      else
      {
        this.removeState("pressed");

        // Sync with open menu property
        if (menubar && menubar.getOpenMenu() == menu) {
          menubar.resetOpenMenu();
          menubar._setAllowMenuOpenHover(false);
        }
      }
    },

    // overridden
    _onMouseUp : function(e)
    {
      this.base(arguments, e);

      // Set state 'pressed' to visualize that the menu is open.
      var menu = this.getMenu();
      if (menu && menu.isVisible() && !this.hasState("pressed")) {
        this.addState("pressed");
      }
    },

    /**
     * Event listener for mouseover event
     *
     * @param e {qx.event.type.Mouse} mouseover event object
     */
    _onMouseOver : function(e)
    {
      // Add hovered state
      this.addState("hovered");

      // Open submenu
      if (this.getMenu())
      {
        var menubar = this.getMenuBar();

        if (menubar._isAllowMenuOpenHover())
        {
          // Hide all open menus
          qx.ui.menu.Manager.getInstance().hideAll();

          // Set it again, because hideAll remove it.
          menubar._setAllowMenuOpenHover(true);

          // Then show the attached menu
          if (this.isEnabled()) {
            this.open();
          }
        }
      }
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The real menu button class which supports a command and an icon. All
 * other features are inherited from the {@link qx.ui.menu.AbstractButton}
 * class.
 */
qx.Class.define("qx.ui.menu.Button",
{
  extend : qx.ui.menu.AbstractButton,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param icon {String} Initial icon
   * @param command {qx.ui.core.Command} Initial command (shortcut)
   * @param menu {qx.ui.menu.Menu} Initial sub menu
   */
  construct : function(label, icon, command, menu)
  {
    this.base(arguments);

    // Initialize with incoming arguments
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    if (command != null) {
      this.setCommand(command);
    }

    if (menu != null) {
      this.setMenu(menu);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "menu-button"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    // overridden
    _onClick : function(e)
    {
      if (e.isLeftPressed())
      {
        this.execute();

        // don't close menus if the button is a sub menu button
        if (this.getMenu()) {
          return;
        }
      } else {
        // don't close menus if the button has a context menu
        if (this.getContextMenu()) {
          return;
        }
      }

      qx.ui.menu.Manager.getInstance().hideAll();
    },


    // overridden
    _onKeyPress : function(e) {
      this.execute();
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A part is a container for multiple toolbar buttons. Each part comes
 * with a handle which may be used in later versions to drag the part
 * around and move it to another position. Currently mainly used
 * for structuring large toolbars beyond the capabilities of the
 * {@link Separator}.
 *
 * @childControl handle {qx.ui.basic.Image} prat handle to visualize the separation
 * @childControl container {qx.ui.toolbar.PartContainer} holds the content of the toolbar part
 */
qx.Class.define("qx.ui.toolbar.Part",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MRemoteChildrenHandling],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Hard coded HBox layout
    this._setLayout(new qx.ui.layout.HBox);

    // Force creation of the handle
    this._createChildControl("handle");
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "toolbar/part"
    },

    /** Whether icons, labels, both or none should be shown. */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      inheritable : true,
      event : "changeShow"
    },

    /** The spacing between every child of the toolbar */
    spacing :
    {
      nullable : true,
      check : "Integer",
      themeable : true,
      apply : "_applySpacing"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "handle":
          control = new qx.ui.basic.Image();
          control.setAlignY("middle");
          this._add(control);
          break;

        case "container":
          control = new qx.ui.toolbar.PartContainer();
          control.addListener("syncAppearance", this.__onSyncAppearance, this);
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    getChildrenContainer : function() {
      return this.getChildControl("container");
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applySpacing : function(value, old)
    {
      var layout = this.getChildControl("container").getLayout();
      value == null ? layout.resetSpacing() : layout.setSpacing(value);
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */
    /**
     * Helper which applies the left, right and middle states.
     */
    __onSyncAppearance : function() {
      // check every child
      var children = this.getChildrenContainer().getChildren();
      children = children.filter(function(child) {
        return child.getVisibility() == "visible";
      });
      for (var i = 0; i < children.length; i++) {
        // if its the first child
        if (i == 0 && i != children.length - 1) {
          children[i].addState("left");
          children[i].removeState("right");
          children[i].removeState("middle");
        // if its the last child
        } else if (i == children.length - 1 && i != 0) {
          children[i].addState("right");
          children[i].removeState("left");
          children[i].removeState("middle");
        // if there is only one child
        } else if (i == 0 && i == children.length - 1) {
          children[i].removeState("left");
          children[i].removeState("middle");
          children[i].removeState("right");
        } else {
          children[i].addState("middle");
          children[i].removeState("right");
          children[i].removeState("left");
        }
      };
    },


    /**
     * Adds a separator to the toolbar part.
     */
    addSeparator : function() {
      this.add(new qx.ui.toolbar.Separator);
    },


    /**
     * Returns all nested buttons which contains a menu to show. This is mainly
     * used for keyboard support.
     *
     * @return {Array} List of all menu buttons
     */
    getMenuButtons : function()
    {
      var children = this.getChildren();
      var buttons = [];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child instanceof qx.ui.menubar.Button) {
          buttons.push(child);
        }
      }

      return buttons;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The container used by {@link Part} to insert the buttons.
 *
 * @internal
 */
qx.Class.define("qx.ui.toolbar.PartContainer",
{
  extend : qx.ui.container.Composite,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.HBox);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    appearance :
    {
      refine : true,
      init : "toolbar/part/container"
    },

    /** Whether icons, labels, both or none should be shown. */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      inheritable : true,
      event : "changeShow"
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Container for menubar buttons to display a classic application menu.
 */
qx.Class.define("qx.ui.menubar.MenuBar",
{
  extend : qx.ui.toolbar.ToolBar,



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Appearance of the widget */
    appearance :
    {
      refine : true,
      init : "menubar"
    }
  }
});
