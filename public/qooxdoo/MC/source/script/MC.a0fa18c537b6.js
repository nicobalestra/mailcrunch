/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Mixin responsible for setting the background color of a widget.
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 */
qx.Mixin.define("qx.ui.decoration.MBackgroundColor",
{
  properties :
  {
    /** Color of the background */
    backgroundColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyBackgroundColor"
    }
  },


  members :
  {
    /**
     * Tint function for the background color. This is suitable for the
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param element {Element} The element which could be resized.
     * @param bgcolor {Color} The new background color.
     * @param styles {Map} A map of styles to apply.
     */
    _tintBackgroundColor : function(element, bgcolor, styles) {
      if (bgcolor == null) {
        bgcolor = this.getBackgroundColor();
      }

      if (qx.core.Environment.get("qx.theme"))
      {
        bgcolor = qx.theme.manager.Color.getInstance().resolve(bgcolor);
      }

      styles.backgroundColor = bgcolor || "";
    },


    /**
     * Resize function for the background color. This is suitable for the
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param element {Element} The element which could be resized.
     * @param width {Number} The new width.
     * @param height {Number} The new height.
     * @return {Map} A map containing the desired position and dimension
     *   (width, height, top, left).
     */
    _resizeBackgroundColor : function(element, width, height) {
      var insets = this.getInsets();
      width -= insets.left + insets.right;
      height -= insets.top + insets.bottom;
      return {
        left : insets.left,
        top : insets.top,
        width : width,
        height : height
      };
    },


    // property apply
    _applyBackgroundColor : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
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
/**
 * Mixin for supporting the background images on decorators.
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 */
qx.Mixin.define("qx.ui.decoration.MBackgroundImage",
{
  properties :
  {
    /** The URL of the background image */
    backgroundImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyBackgroundImage"
    },


    /** How the background image should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat", "scale"],
      init : "repeat",
      apply : "_applyBackgroundImage"
    },


    /**
     * Either a string or a number, which defines the horizontal position
     * of the background image.
     *
     * If the value is an integer it is interpreted as a pixel value, otherwise
     * the value is taken to be a CSS value. For CSS, the values are "center",
     * "left" and "right".
     */
    backgroundPositionX :
    {
      nullable : true,
      apply : "_applyBackgroundPosition"
    },


    /**
     * Either a string or a number, which defines the vertical position
     * of the background image.
     *
     * If the value is an integer it is interpreted as a pixel value, otherwise
     * the value is taken to be a CSS value. For CSS, the values are "top",
     * "center" and "bottom".
     */
    backgroundPositionY :
    {
      nullable : true,
      apply : "_applyBackgroundPosition"
    },


    /**
     * Property group to define the background position
     */
    backgroundPosition :
    {
      group : ["backgroundPositionY", "backgroundPositionX"]
    }
  },


  members :
  {
    /**
     * Whether an info was already displayed for browsers using the AlphaImageLoader (IE6 - IE9)
     * together with the 'backgroundPosition' property. The AlphaImageLoader is not able to make use
     * of this CSS property. So the developer should be informed about this *once*.
     */
    __infoDisplayed : false,

    /**
     * Mapping for the dynamic decorator.
     *
     * @param styles {Map} CSS styles as map
     * @param content {String?null} The content of the created div as HTML
     * @return {String} The generated HTML fragment
     */
    _generateMarkup : function(styles, content) {
      return this._generateBackgroundMarkup(styles, content);
    },


    /**
     * Responsible for generating the markup for the background.
     * This method just uses the settings in the properties to generate
     * the markup.
     *
     * @param styles {Map} CSS styles as map
     * @param content {String?null} The content of the created div as HTML
     * @return {String} The generated HTML fragment
     */
    _generateBackgroundMarkup: function(styles, content)
    {
      var markup = "";

      var image = this.getBackgroundImage();
      var repeat = this.getBackgroundRepeat();

      var top = this.getBackgroundPositionY();
      if (top == null) {
        top = 0;
      }

      var left = this.getBackgroundPositionX();
      if (left == null) {
        left = 0;
      }

      styles.backgroundPosition = left + " " + top;

      // Support for images
      if (image)
      {
        var resolved = qx.util.AliasManager.getInstance().resolve(image);
        markup = qx.bom.element.Decoration.create(resolved, repeat, styles);
      }
      else
      {
        if ((qx.core.Environment.get("engine.name") == "mshtml"))
        {
          /*
           * Internet Explorer as of version 6 for quirks and standards mode,
           * or version 7 in quirks mode adds an empty string to the "div"
           * node. This behavior causes rendering problems, because the node
           * would then have a minimum size determined by the font size.
           * To be able to set the "div" node height to a certain (small)
           * value independent of the minimum font size, an "overflow:hidden"
           * style is added.
           * */
          if (parseFloat(qx.core.Environment.get("engine.version")) < 7 ||
            qx.core.Environment.get("browser.quirksmode"))
          {
            // Add additionally style
            styles.overflow = "hidden";
          }
        }

        if (!content) {
          content = "";
        }

        markup = '<div style="' + qx.bom.element.Style.compile(styles) + '">' + content + '</div>';
      }

      return markup;
    },


    // property apply
    _applyBackgroundImage : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    },

    // property apply
    _applyBackgroundPosition : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.bom.element.Decoration.isAlphaImageLoaderEnabled() && !this.__infoDisplayed)
        {
          this.info("Applying a background-position value has no impact when using the 'AlphaImageLoader' to display PNG images!");
          this.__infoDisplayed = true;
        }
      }
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * A basic decorator featuring simple borders based on CSS styles.
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 */
qx.Mixin.define("qx.ui.decoration.MSingleBorder",
{
  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY: WIDTH
    ---------------------------------------------------------------------------
    */

    /** top width of border */
    widthTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },

    /** right width of border */
    widthRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },

    /** bottom width of border */
    widthBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },

    /** left width of border */
    widthLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY: STYLE
    ---------------------------------------------------------------------------
    */

    /** top style of border */
    styleTop :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** right style of border */
    styleRight :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** bottom style of border */
    styleBottom :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** left style of border */
    styleLeft :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY: COLOR
    ---------------------------------------------------------------------------
    */

    /** top color of border */
    colorTop :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** right color of border */
    colorRight :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** bottom color of border */
    colorBottom :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** left color of border */
    colorLeft :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: EDGE
    ---------------------------------------------------------------------------
    */

    /** Property group to configure the left border */
    left : {
      group : [ "widthLeft", "styleLeft", "colorLeft" ]
    },

    /** Property group to configure the right border */
    right : {
      group : [ "widthRight", "styleRight", "colorRight" ]
    },

    /** Property group to configure the top border */
    top : {
      group : [ "widthTop", "styleTop", "colorTop" ]
    },

    /** Property group to configure the bottom border */
    bottom : {
      group : [ "widthBottom", "styleBottom", "colorBottom" ]
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: TYPE
    ---------------------------------------------------------------------------
    */

    /** Property group to set the border width of all sides */
    width :
    {
      group : [ "widthTop", "widthRight", "widthBottom", "widthLeft" ],
      mode : "shorthand"
    },

    /** Property group to set the border style of all sides */
    style :
    {
      group : [ "styleTop", "styleRight", "styleBottom", "styleLeft" ],
      mode : "shorthand"
    },

    /** Property group to set the border color of all sides */
    color :
    {
      group : [ "colorTop", "colorRight", "colorBottom", "colorLeft" ],
      mode : "shorthand"
    }
  },


  members :
  {
    /**
     * Takes a styles map and adds the border styles styles in place
     * to the given map. This is the needed behavior for
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleBorder : function(styles)
    {
      if (qx.core.Environment.get("qx.theme"))
      {
        var Color = qx.theme.manager.Color.getInstance();

        var colorTop = Color.resolve(this.getColorTop());
        var colorRight = Color.resolve(this.getColorRight());
        var colorBottom = Color.resolve(this.getColorBottom());
        var colorLeft = Color.resolve(this.getColorLeft());
      }
      else
      {
        var colorTop = this.getColorTop();
        var colorRight = this.getColorRight();
        var colorBottom = this.getColorBottom();
        var colorLeft = this.getColorLeft();
      }

      // Add borders
      var width = this.getWidthTop();
      if (width > 0) {
        styles["border-top"] = width + "px " + this.getStyleTop() + " " + (colorTop || "");
      }

      var width = this.getWidthRight();
      if (width > 0) {
        styles["border-right"] = width + "px " + this.getStyleRight() + " " + (colorRight || "");
      }

      var width = this.getWidthBottom();
      if (width > 0) {
        styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + (colorBottom || "");
      }

      var width = this.getWidthLeft();
      if (width > 0) {
        styles["border-left"] = width + "px " + this.getStyleLeft() + " " + (colorLeft || "");
      }

      // Check if valid
      if (qx.core.Environment.get("qx.debug"))
      {
        if (styles.length === 0) {
          throw new Error("Invalid Single decorator (zero border width). Use qx.ui.decorator.Background instead!");
        }
      }

      // Add basic styles
      styles.position = "absolute";
      styles.top = 0;
      styles.left = 0;
    },


    /**
     * Resize function for the decorator. This is suitable for the
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param element {Element} The element which could be resized.
     * @param width {Number} The new width.
     * @param height {Number} The new height.
     * @return {Map} A map containing the desired position and dimension.
     *   (width, height, top, left).
     */
    _resizeBorder : function(element, width, height) {
      var insets = this.getInsets();
      width -= insets.left + insets.right;
      height -= insets.top + insets.bottom;

      // Fix to keep applied size above zero
      // Makes issues in IE7 when applying value like '-4px'
      if (width < 0) {
        width = 0;
      }

      if (height < 0) {
        height = 0;
      }

      return {
        left : insets.left - this.getWidthLeft(),
        top : insets.top - this.getWidthTop(),
        width : width,
        height : height
      };
    },



    /**
     * Implementation of the interface for the single border.
     *
     * @return {Map} A map containing the default insets.
     *   (top, right, bottom, left)
     */
    _getDefaultInsetsForBorder : function()
    {
      return {
        top : this.getWidthTop(),
        right : this.getWidthRight(),
        bottom : this.getWidthBottom(),
        left : this.getWidthLeft()
      };
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyWidth : function()
    {
      this._applyStyle();

      this._resetInsets();
    },


    // property apply
    _applyStyle : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
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
 * A basic decorator featuring background colors and simple borders based on
 * CSS styles.
 */
qx.Class.define("qx.ui.decoration.Single",
{
  extend : qx.ui.decoration.Abstract,
  include : [
    qx.ui.decoration.MBackgroundImage,
    qx.ui.decoration.MBackgroundColor,
    qx.ui.decoration.MSingleBorder
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param width {Integer} Width of the border
   * @param style {String} Any supported border style
   * @param color {Color} The border color
   */
  construct : function(width, style, color)
  {
    this.base(arguments);

    // Initialize properties
    if (width != null) {
      this.setWidth(width);
    }

    if (style != null) {
      this.setStyle(style);
    }

    if (color != null) {
      this.setColor(color);
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _markup : null,


    /*
    ---------------------------------------------------------------------------
      INTERFACE IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    // interface implementation
    getMarkup : function()
    {
      if (this._markup) {
        return this._markup;
      }

      var styles = {};

      // get the single border styles
      this._styleBorder(styles);

      var html = this._generateBackgroundMarkup(styles);

      return this._markup = html;
    },


    // interface implementation
    resize : function(element, width, height) {
      // get the width and height of the mixins
      var pos = this._resizeBorder(element, width, height);

      element.style.width = pos.width + "px";
      element.style.height = pos.height + "px";

      element.style.left = pos.left + "px";
      element.style.top = pos.top + "px";
    },


    // interface implementation
    tint : function(element, bgcolor) {
      this._tintBackgroundColor(element, bgcolor, element.style);
    },


    // overridden
    _isInitialized: function() {
      return !!this._markup;
    },


    // overridden
    _getDefaultInsets : function() {
      return this._getDefaultInsetsForBorder();
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._markup = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)
     * Michael Haitz (mhaitz)
     * Jonathan Weiß (jonathan_rass)

   Contributors:
     * Petr Kobalicek (e666e)

************************************************************************ */

/* ************************************************************************

#asset(qx/static/blank.html)

************************************************************************ */

/**
 * Rich text editor widget which encapsulates the low-level {@link qx.bom.htmlarea.HtmlArea}
 * component to offer editing features.
 *
 *
 * Optimized for the use at a RIA.
 */
qx.Class.define("qx.ui.embed.HtmlArea",
{
  extend : qx.ui.core.Widget,

  /*
   * IMPORTANT NOTE
   * If you add functionality which manipulates the content of the HtmlArea
   * AND you want make these changes undo-/redo-able you have to make sure
   * to implement methods in the "Manager" and "UndoManager" classes.
   */

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Constructor
   *
   * @param value {String} Initial content
   * @param styleInformation {String | Map | null} Optional style information for the editor's document
   *                                               Can be a string or a map (example: { "p" : "padding:2px" }
   * @param source {String} source of the iframe
   */
  construct : function(value, styleInformation, source)
  {
    this.__postPonedProperties = {};

    // **********************************************************************
    //   INIT
    // **********************************************************************
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Grow);

    this.__addAppearListener();

    this.__initValues = { content: value,
                          styleInfo: styleInformation,
                          source: source };

    qx.event.Registration.addListener(document.body, "mousedown", this.block, this, true);
    qx.event.Registration.addListener(document.body, "mouseup", this.release, this, true);
    qx.event.Registration.addListener(document.body, "losecapture", this.release, this, true);
  },


 /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /**
     * Thrown when the editor gets an error at loading time.
     */
    "loadingError"     : "qx.event.type.Data",

    /**
     * Only available if messengerMode is active. This event returns the current content of the editor.
     */
    "messengerContent" : "qx.event.type.Data",

    /**
     * This event holds a data map which informs about the formatting at the
     * current cursor position. It holds the following keys:
     *
     * * bold
     * * italic
     * * underline
     * * strikethrough
     * * fontSize
     * * fontFamily
     * * insertUnorderedList
     * * insertOrderedList
     * * justifyLeft
     * * justifyCenter
     * * justifyRight
     * * justifyFull
     *
     * This map can be used to control/update a toolbar states.
     */
    "cursorContext"    : "qx.event.type.Data",

    /**
     * This event is dispatched when the editor is ready to use
     */
    "ready"            : "qx.event.type.Event",

    /**
     * This event is dispatched when the editor is ready to use after it was
     * re-located and re-initialized. Only implemented for Gecko browsers.
     */
    "readyAfterInvalid" : "qx.event.type.Event",

    /**
     * This event is dispatched when the editor gets the focus and his own handling is done
     */
    "focused"          : "qx.event.type.Event",


    /**
     * This event is dispatched when the document receives an "focusout" event
     */
    "focusOut"         : "qx.event.type.Event",

    /**
     * This event is dispatched when the editor gets a right click.
     *
     * Fires a data event with the following data:
     *
     * * x - absolute x coordinate
     * * y - absolute y coordinate
     * * relX - relative x coordinate
     * * relY - relative y coordinate
     * * target - DOM element target
     */
    "contextmenu"      : "qx.event.type.Data",

    /**
     * Holds information about the state of undo/redo
     * Keys are "undo" and "redo".
     * Possible values are 0 and -1 to stay in sync with
     * the kind the "cursorContext" event works.
     * (1 = active/pressed, 0 = possible/not pressed, -1 = disabled)
     */
    "undoRedoState"    : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Checks if the given node is a block node
     *
     * @param node {Node} Node
     * @return {Boolean} whether it is a block node
     */
    isBlockNode : function(node)
    {
      var deprecatedFunction = qx.ui.embed.HtmlArea.isBlockNode;
      var deprecationMessage = "Please use the method 'qx.dom.Node.isBlockNode' instead.";
      qx.log.Logger.deprecatedMethodWarning(deprecatedFunction, deprecationMessage);

      return qx.dom.Node.isBlockNode(node);
    },


    /**
     * Checks if one element is in the list of elements that are allowed to contain a paragraph in HTML
     *
     * @param node {Node} node to check
     * @return {Boolean}
     */
    isParagraphParent : function(node) {
      return qx.bom.htmlarea.HtmlArea.isParagraphParent(node);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Selected content type. Currently only XHTML is supported. */
    contentType :
    {
      check : "String",
      init  : "xhtml",
      apply : "_applyContentType"
    },


    /**
     * If turned on the editor acts like a messenger widget e.g. if one hits the Enter key the current content gets
     * outputted (via a DataEvent) and the editor clears his content
     */
    messengerMode :
    {
      check : "Boolean",
      init  : false,
      apply : "_applyMessengerMode"
    },


    /**
     * Toggles whether a p element is inserted on each line break or not.
     * A "normal" linebreak can be achieved using the combination "Shift+Enter" anyway
     */
    insertParagraphOnLinebreak :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyInsertParagraphOnLinebreak"
    },


    /**
     * If true we add a linebreak after control+enter
     */
    insertLinebreakOnCtrlEnter :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyInsertLinebreakOnCtrlEnter"
    },


    /**
     * Function to use in postprocessing html. See getHtml() and __getHtml().
     */
    postProcess:
    {
      check: "Function",
      nullable: true,
      init: null,
      apply : "_applyPostProcess"
    },


    /**
     * Toggles whether to use Undo/Redo
     */
    useUndoRedo :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyUseUndoRedo"
    },

    /**
     * appearance
     */
    appearance :
    {
      refine : true,
      init   : "htmlarea"
    },

    /**
     * Default font family to use when e.g. user removes all content
     */
    defaultFontFamily :
    {
      check : "String",
      init : "Verdana",
      apply : "_applyDefaultFontFamily"
    },

    /**
     * Default font family to use when e.g. user removes all content
     */
    defaultFontSize :
    {
      check : "Integer",
      init : 4,
      apply : "_applyDefaultFontSize"
    },

    /**
     * Focusable
     */
    focusable :
    {
      refine : true,
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __editorComponent: null,
    __postPonedProperties: null,
    __blockerElement : null,
    __initValues : null,
    __onDOMNodeRemoved : null,


    /**
     * Initializes the blocker element if (yet) not available
     */
    _initBlockerElement : function ()
    {
      if (!this.__blockerElement) {
        this.__blockerElement = this._createBlockerElement();
      }
    },


    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    _applyContentType : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setContentType(value);
      } else {
        this.__postPonedProperties["ContentType"] = value;
      }
    },


    _applyMessengerMode : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setMessengerMode(value);
      } else {
        this.__postPonedProperties["MessengerMode"] = value;
      }
    },


    _applyInsertParagraphOnLinebreak : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setInsertParagraphOnLinebreak(value);
      } else {
        this.__postPonedProperties["InsertParagraphOnLinebreak"] = value;
      }
    },


    _applyInsertLinebreakOnCtrlEnter : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setInsertLinebreakOnCtrlEnter(value);
      } else {
        this.__postPonedProperties["InsertLinebreakOnCtrlEnter"] = value;
      }
    },


    _applyPostProcess : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setPostProcess(value);
      } else {
        this.__postPonedProperties["PostProcess"] = value;
      }
    },


    _applyUseUndoRedo : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setUseUndoRedo(value);
      } else {
        this.__postPonedProperties["UseUndoRedo"] = value;
      }
    },


    _applyDefaultFontFamily : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setDefaultFontFamily(value);
      } else {
        this.__postPonedProperties["DefaultFontFamily"] = value;
      }
    },


    _applyDefaultFontSize : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setDefaultFontSize(value);
      } else {
        this.__postPonedProperties["DefaultFontSize"] = value;
      }
    },

    // overridden
    _applyNativeContextMenu : function(value, old)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setNativeContextMenu(value);
      } else {
        this.__postPonedProperties["NativeContextMenu"] = value;
      }
    },


    /**
     * Creates <div> element which is aligned over iframe node to avoid losing mouse events.
     *
     * @return {Object} Blocker element node
     */
    _createBlockerElement : function()
    {
      var el = new qx.html.Element("div");

      el.setStyles({
        zIndex   : 20,
        position : "absolute",
        display  : "none"
      });

      // IE needs some extra love here to convince it to block events.
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        el.setStyles({
          backgroundImage: "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")",
          backgroundRepeat: "repeat"
        });
      }

      return el;
    },


    /*
    ---------------------------------------------------------------------------
      SETUP
    ---------------------------------------------------------------------------
    */

    /**
     * Adds the "appear" listener for correct startup
     *
     */
    __addAppearListener : function() {
      this.addListenerOnce("appear", this.__setupEditorComponent);
    },


    /**
     * Setup the low-level editor component and the listener delegate methods.
     */
    __setupEditorComponent : function()
    {
      var domElement = this.getContentElement().getDomElement();
      this.__editorComponent = new qx.bom.htmlarea.HtmlArea(domElement,
                                                           this.__initValues.content,
                                                           this.__initValues.styleInfo,
                                                           this.__initValues.source);
      this.__applyPostPonedProperties();
      this.__setupDelegateListeners();

      if ((qx.core.Environment.get("engine.name") == "gecko")) {
        this.__setupInvalidateListener();
      }

      this.addListener("appear", this.forceEditable);
    },


    /**
     * Applies the postponed properties to the editor component
     *
     */
    __applyPostPonedProperties : function()
    {
      for(var propertyName in this.__postPonedProperties) {
        this.__editorComponent["set" + propertyName](this.__postPonedProperties[propertyName]);
      }
    },


    /**
     * Setup listeners for events of the low-level editing component and fires
     * them at the editing widget.
     */
    __setupDelegateListeners : function()
    {
      this.__editorComponent.addListener("ready", this.__delegateEvent, this);
      this.__editorComponent.addListener("readyAfterInvalid", this.__delegateEvent, this);
      this.__editorComponent.addListener("focused", this.__delegateEvent, this);
      this.__editorComponent.addListener("focusOut", this.__delegateEvent, this);

      this.__editorComponent.addListener("loadingError", this.__delegateDataEvent, this);
      this.__editorComponent.addListener("cursorContext", this.__delegateDataEvent, this);
      this.__editorComponent.addListener("contextmenu", this.__delegateDataEvent, this);
      this.__editorComponent.addListener("undoRedoState", this.__delegateDataEvent, this);
      this.__editorComponent.addListener("messengerContent", this.__delegateDataEvent, this);
    },


    /**
     * Clones the incoming event and fires it at itself to let the application
     * developers listen to the widget instance.
     *
     * @param e {qx.event.type.Event} event instance
     */
    __delegateEvent : function(e)
    {
      var clone = e.clone();
      this.fireEvent(clone.getType());
    },


    /**
     * Clones the incoming data event and fires it at itself to let the application
     * developers listen to the widget instance.
     *
     * @param e {qx.event.type.Data} event instance
     */
    __delegateDataEvent : function(e)
    {
      var clone = e.clone();
      this.fireDataEvent(clone.getType(), e.getData());
    },


    /**
     * Listens to DOM changes of the container element to get informed when the
     * HtmlArea is moved to another container.
     *
     * This method is only implemented for Gecko browsers.
     */
    __setupInvalidateListener : function()
    {
      this.__onDOMNodeRemoved = qx.lang.Function.bind(this.__invalidateEditor, this);

      var element = this.getContainerElement().getDomElement();
      qx.bom.Event.addNativeListener(element, "DOMNodeRemoved", this.__onDOMNodeRemoved);
    },


    /**
     * Invalidates the editor component if the connected DOM node is removed.
     *
     * @param e {qx.event.type.Event} event instance
     */
    __invalidateEditor : qx.event.GlobalError.observeMethod(function(e)
    {
      if (this.__editorComponent && !this.__editorComponent.isDisposed()) {
        this.__editorComponent.invalidateEditor();
      }
    }),


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    // overridden
    renderLayout : function(left, top, width, height)
    {
      this.base(arguments, left, top, width, height);

      var pixel = "px";
      var insets = this.getInsets();

      if (!this.__blockerElement) {
        this._initBlockerElement();
      }

      this.__blockerElement.setStyles({
        left   : insets.left + pixel,
        top    : insets.top + pixel,
        width  : (width - insets.left - insets.right) + pixel,
        height : (height - insets.top - insets.bottom) + pixel
      });
    },


    /**
     * Returns the iframe object which is used to render the content
     *
     * @return {Iframe?null} iframe DOM element or null if the editor is not initialized
     */
    getIframeObject : function() {
      return this.__editorComponent != null ? this.__editorComponent.getIframeObject() : null;
    },

    /**
     * Getter for command manager.
     *
     * @return {qx.bom.htmlarea.manager.Command|qx.bom.htmlarea.manager.UndoRedo?null} manager instance
     * or null if the editor is not initialized
     */
    getCommandManager : function() {
      return this.__editorComponent != null ? this.__editorComponent.getCommandManager() : null;
    },


    /**
     * Setting the value of the editor if it's initialized
     *
     * @param value {String} new content to set
     */
    setValue : function(value)
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.setValue(value);
      } else {
        this.__initValues.content = value;
      }
    },


    /**
     * Getting the value of the editor.
     * <b>Attention</b>: The content of the editor is synced
     * at focus/blur events, but not on every input. This method
     * is not delivering the current content in a stable manner.
     * To get the current value of the editor use the {@link #getComputedValue}
     * method instead.
     *
     * @return {String?null} value of the editor or null if it's not initialized
     */
    getValue : function()
    {
      if (this.__editorComponent != null) {
        return this.__editorComponent.getValue();
      } else {
        return this.__initValues.content;
      }
    },


    /**
     * Getting the computed value of the editor.
     * This method returns the current value of the editor traversing
     * the elements below the body element. With this method you always
     * get the current value, but it is much more expensive. So use it
     * carefully.
     *
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @return {String?null} computed value of the editor or null if the editor is not initialized
     */
    getComputedValue : function(skipHtmlEncoding) {
      return this.__editorComponent != null ? this.__editorComponent.getHtml(skipHtmlEncoding) : null;
    },


    /**
     * Returns the complete content of the editor
     *
     * @return {String?null} complete content or null if the editor is not initialized
     */
    getCompleteHtml : function() {
      return this.__editorComponent != null ? this.__editorComponent.getCompleteHtml() : null;
    },


    /**
     * Returns the document of the iframe
     *
     * @return {Object}
     */
    getContentDocument : function() {
      return this.__editorComponent != null ? this.__editorComponent.getContentDocument() : null;
    },

    /**
     * Returns the body of the document
     *
     * @return {Object}
     */
    getContentBody : function() {
      return this.__editorComponent != null ? this.__editorComponent.getContentBody() : null;
    },


    /**
     * Returns the body of the document
     *
     * @return {Object}
     */
    getContentWindow : function() {
      return this.__editorComponent != null ? this.__editorComponent.getContentWindow() : null;
    },


    /**
     * Returns all the words that are contained in a node.
     *
     * @param node {Object} the node element where the text should be retrieved from.
     * @return {String[]} all the words.
     */
    getWords : function(node) {
      return this.__editorComponent != null ? this.__editorComponent.getWords(node) : null;
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Returns all words
     *
     * @return {Map} all words
     */
    getWordsWithElement : function() {
      return this.__editorComponent != null ? this.__editorComponent.getWordsWithElement() : null;
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Returns all text nodes
     *
     * @return {Array} Text nodes
     */
    getTextNodes : function() {
      return this.__editorComponent != null ? this.__editorComponent.getTextNodes() : null;
    },


    /**
     * Whether the editor is ready to accept commands etc.
     *
     * @return {Boolean} ready or not
     */
    isReady : function() {
      return this.__editorComponent != null ? this.__editorComponent.isReady() : false;
    },


    /**
     * Forces the htmlArea to reset the document editable. This method can
     * be useful (especially for Gecko) whenever the HtmlArea was hidden and
     * gets visible again.
     */
    forceEditable : function() {
      if (this.__editorComponent != null) {
        this.__editorComponent.forceEditable();
      }
    },


    /**
     * Service method to check if the component is already loaded.
     * Overrides the base method.
     *
     * @return {Boolean}
     */
    isLoaded : function() {
      return this.__editorComponent != null ? this.__editorComponent.isLoaded() : false;
    },


    /**
     * Whether the document is in editable mode
     *
     * @param value {Boolean} whether the component should be editable
     */
    setEditable : function(value) {
      if (this.__editorComponent != null) {
        this.__editorComponent.setEditable(value);
      }
    },


    /**
     * Whether the document is in editable mode
     *
     * @return {Boolean}
     */
    getEditable : function() {
      return this.__editorComponent != null ? this.__editorComponent.getEditable() : false;
    },


    /**
     * Whether the document is in editable mode
     *
     * @return {Boolean}
     */
    isEditable : function() {
      return this.__editorComponent != null ? this.__editorComponent.isEditable() : false;
    },


    /**
     * Inserts html content on the current selection
     *
     * @param value {String} html content
     * @return {Boolean} Success of operation
     */
    insertHtml : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.insertHtml(value) : false;
    },


    /**
     * Removes all formatting styles on the current selection content and resets
     * the font family and size to the default ones. See {@link #defaultFontSize}
     * and {@link #defaultFontFamily}.
     *
     * @return {Boolean} Success of operation
     */
    removeFormat : function() {
      return this.__editorComponent != null ? this.__editorComponent.removeFormat() : false;
    },


    /**
     * Sets the current selection content to bold font style
     *
     * @return {Boolean} Success of operation
     */
    setBold : function() {
      return this.__editorComponent != null ? this.__editorComponent.setBold() : false;
    },


    /**
     * Sets the current selection content to italic font style
     *
     * @return {Boolean} Success of operation
     */
    setItalic : function() {
      return this.__editorComponent != null ? this.__editorComponent.setItalic() : false;
    },


    /**
     * Sets the current selection content to underline font style
     *
     * @return {Boolean} Success of operation
     */
    setUnderline : function() {
      return this.__editorComponent != null ? this.__editorComponent.setUnderline() : false;
    },


    /**
     * Sets the current selection content to strikethrough font style
     *
     * @return {Boolean} Success of operation
     *
     */
    setStrikeThrough : function() {
      return this.__editorComponent != null ? this.__editorComponent.setStrikeThrough() : false;
    },


    /**
     * Sets the current selection content to the specified font size
     *
     * @param value {Number} Font size
     * @return {Boolean} Success of operation
     */
    setFontSize : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setFontSize(value) : false;
    },


    /**
     * Sets the current selection content to the specified font family
     *
     * @param value {String} Font family
     * @return {Boolean} Success of operation
     */
    setFontFamily : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setFontFamily(value) : false;
    },


    /**
     * Sets the current selection content to the specified font color
     *
     * @param value {String} Color value (supported are Hex,
     * @return {Boolean} Success of operation
     */
    setTextColor : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setTextColor(value) : false;
    },


    /**
     * Sets the current selection content to the specified background color
     *
     * @param value {String} Color value (supported are Hex,
     * @return {Boolean} Success of operation
     */
    setTextBackgroundColor : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setTextBackgroundColor(value) : false;
    },


    /**
     * Left-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyLeft : function() {
      return this.__editorComponent != null ? this.__editorComponent.setJustifyLeft() : false;
    },


    /**
     * Center-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyCenter : function() {
      return this.__editorComponent != null ? this.__editorComponent.setJustifyCenter() : false;
    },


    /**
     * Right-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyRight : function() {
      return this.__editorComponent != null ? this.__editorComponent.setJustifyRight() : false;
    },


    /**
     * Full-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyFull : function() {
      return this.__editorComponent != null ? this.__editorComponent.setJustifyFull() : false;
    },


    /**
     * Indents the current selection
     *
     * @return {Boolean} Success of operation
     */
    insertIndent : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertIndent() : false;
    },


    /**
     * Outdents the current selection
     *
     * @return {Boolean} Success of operation
     */
    insertOutdent : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertOutdent() : false;
    },


    /**
     * Inserts an ordered list
     *
     * @return {Boolean} Success of operation
     */
    insertOrderedList : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertOrderedList() : false;
    },


    /**
     * Inserts an unordered list
     *
     * @return {Boolean} Success of operation
     */
    insertUnorderedList : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertUnorderedList() : false;
    },


    /**
     * Inserts a horizontal ruler
     *
     * @return {Boolean} Success of operation
     */
    insertHorizontalRuler : function() {
      return this.__editorComponent != null ? this.__editorComponent.insertHorizontalRuler() :false;
    },


    /**
     * Insert an image
     *
     * @param attributes {Map} Map of HTML attributes to apply
     * @return {Boolean} Success of operation
     */
    insertImage : function(attributes) {
      return this.__editorComponent != null ? this.__editorComponent.insertImage(attributes) : false;
    },


    /**
     * Inserts a hyperlink
     *
     * @param url {String} URL for the image to be inserted
     * @return {Boolean} Success of operation
     */
    insertHyperLink : function(url) {
      return this.__editorComponent != null ? this.__editorComponent.insertHyperLink(url) : false;
    },

    /**
     * Alias for setBackgroundColor("transparent");
     *
     * @return {Boolean} if succeeded
     */
    removeBackgroundColor : function() {
      return this.__editorComponent != null ? this.__editorComponent.removeBackgroundColor() : false;
    },


    /**
     * Sets the background color of the editor
     *
     * @param value {String} color
     * @return {Boolean} if succeeded
     */
    setBackgroundColor : function(value) {
      return this.__editorComponent != null ? this.__editorComponent.setBackgroundColor(value) : false;
    },


    /**
     * Alias for setBackgroundImage(null);
     *
     * @return {Boolean} if succeeded
     */
    removeBackgroundImage : function () {
      return this.__editorComponent != null ? this.__editorComponent.removeBackgroundImage() : false;
    },


    /**
     * Inserts an background image
     *
     * @param url {String} url of the background image to set
     * @param repeat {String} repeat mode. Possible values are "repeat|repeat-x|repeat-y|no-repeat".
     *                                     Default value is "no-repeat"
     * @param position {String?Array} Position of the background image.
     *                                Possible values are "|top|bottom|center|left|right|right top|left top|left bottom|right bottom" or
     *                                an array consisting of two values for x and
     *                                y coordinate. Both values have to define the
     *                                unit e.g. "px" or "%".
     *                                Default value is "top"
     * @return {Boolean} Success of operation
     */
    setBackgroundImage : function(url, repeat, position) {
      return this.__editorComponent != null ? this.__editorComponent.setBackgroundImage(url, repeat, position) : false;
    },


    /**
     * Selects the whole content
     *
     * @return {Boolean} Success of operation
     */
    selectAll : function() {
      return this.__editorComponent != null ? this.__editorComponent.selectAll() : false;
    },


    /**
     * Undo last operation
     * @return {Boolean} <code>true</code> if the undo command was executed successfully
     */
    undo : function() {
      return this.__editorComponent != null ? this.__editorComponent.undo() : false;
    },


    /**
     * Redo last undo
     * @return {Boolean} <code>true</code> if the redo command was executed successfully
     */
    redo : function() {
      return this.__editorComponent != null ? this.__editorComponent.redo() : false;
    },


    /*
    ---------------------------------------------------------------------------
      CONTENT MANIPLUATION
    ---------------------------------------------------------------------------
    */

    /**
     * Resets the content of the editor
     *
     */
    resetHtml : function()
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.resetHtml();
      }
    },


    /**
     * Get html content (call own recursive method)
     *
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @return {String?null} current content of the editor as XHTML or null if not initialized
     */
    getHtml : function(skipHtmlEncoding) {
      return this.__editorComponent != null ? this.__editorComponent.getHtml(skipHtmlEncoding) : null;
    },

    /**
     * Helper function to examine if HTMLArea is empty, except for
     * place holder(s) needed by some browsers.
     *
     * @return {Boolean} True, if area is empty - otherwise false.
     */
    containsOnlyPlaceholder : function() {
      return this.__editorComponent != null ? this.__editorComponent.containsOnlyPlaceHolder() : false;
    },


    /*
      -----------------------------------------------------------------------------
      PROCESS CURSOR CONTEXT
      -----------------------------------------------------------------------------
    */


    /**
     * Returns the information about the current context (focusNode). It's a
     * map with information about "bold", "italic", "underline", etc.
     *
     * @return {Map?null} formatting information about the focusNode or null if not initialized
     */
    getContextInformation : function() {
      return this.__editorComponent != null ? this.__editorComponent.getContextInformation() : null;
    },


    /*
     -----------------------------------------------------------------------------
     SELECTION
     -----------------------------------------------------------------------------
    */

    /**
     * Returns the current selection object
     *
     * @return {Selection?null} Selection object or null if not initialized.
    */
    getSelection : function() {
      return this.__editorComponent != null ? this.__editorComponent.getSelection() : null;
    },


    /**
     * Returns the currently selected text.
     *
     * @return {String?null} Selected plain text or null if not initialized.
     */
    getSelectedText : function() {
      return this.__editorComponent != null ? this.__editorComponent.getSelectedText() : null;
    },


    /**
     * Returns the content of the actual range as text
     *
     * @TODO: need to be implemented correctly
     * @return {String?null} selected text or null if not initialized
     */
    getSelectedHtml : function() {
      return this.__editorComponent != null ? this.__editorComponent.getSelectedHtml() : null;
    },


    /**
     * Clears the current selection
     *
     */
    clearSelection : function()
    {
      if (this.__editorComponent != null) {
        this.__editorComponent.clearSelection();
      }
    },


    /*
     -----------------------------------------------------------------------------
     TEXT RANGE
     -----------------------------------------------------------------------------
    */

    /**
     * Returns the range of the current selection
     *
     * @return {Range?null} Range object or null if not initialized
     */
    getRange : function() {
      return this.__editorComponent.getRange();
    },


    /**
     * Safes the current range to let the next command operate on this range.
     * Currently only interesting for IE browsers, since they loose the range /
     * selection whenever an element is clicked which need to have a focus (e.g.
     * a textfield widget).
     *
     * *NOTE:* the next executed command will reset this range.
     *
     */
    saveRange : function() {
      this.__editorComponent.saveRange();
    },


    /**
     * Returns the current stored range.
     *
     * @return {Range|null} range object or null
     */
    getSavedRange : function() {
      return this.__editorComponent.getSavedRange();
    },


    /**
     * Resets the current saved range.
     *
     */
    resetSavedRange : function() {
      this.__editorComponent.resetSavedRange();
    },


    /*
      -----------------------------------------------------------------------------
      NODES
      -----------------------------------------------------------------------------
    */

    /**
     *  Returns the node where the selection ends
     *
     *  @return {Node?null} focus node or null if not initialized
     */
    getFocusNode : function() {
      return this.__editorComponent != null ? this.__editorComponent.getFocusNode() : null;
    },

    /**
     * Cover the iframe with a transparent blocker div element. This prevents
     * mouse or key events to be handled by the iframe. To release the blocker
     * use {@link #release}.
     *
     */
    block : function()
    {
      if (!this.__blockerElement) {
        this._initBlockerElement();
      }

      if (!this.getContainerElement().hasChild(this.__blockerElement)) {
        this.getContainerElement().add(this.__blockerElement);
      }

      this.__blockerElement.setStyle("display", "block");
    },


    /**
     * Release the blocker set by {@link #block}.
     *
     */
    release : function()
    {
      if (this.__blockerElement) {
        this.__blockerElement.setStyle("display", "none");
      }
    },


    /*
    -----------------------------------------------------------------------------
      FOCUS MANAGEMENT
    -----------------------------------------------------------------------------
    */

    // overridden
    focus : function()
    {
      this.base(arguments);

      this.__focusContent();
    },

    // overridden
    tabFocus : function()
    {
      this.base(arguments);

      this.__focusContent();
    },


    /**
     * Focus the document content
     */
    __focusContent : function()
    {
      if (this.__editorComponent != null) {
        qx.event.Timer.once(function() {
          this.__editorComponent.focusContent();
        }, this, 0);
      }
    }
  },




  /*
  ---------------------------------------------------------------------------
    DESTRUCTOR
  ---------------------------------------------------------------------------
  */

  /**
   * Destructor
   *
   */
  destruct : function()
  {
    this.__postPonedProperties = this.__initValues = null;

    qx.event.Registration.removeListener(document.body, "mousedown", this.block, this, true);
    qx.event.Registration.removeListener(document.body, "mouseup", this.release, this, true);
    qx.event.Registration.removeListener(document.body, "losecapture", this.release, this, true);

    var element = this.getContainerElement().getDomElement();
    if (element) {
      qx.bom.Event.removeNativeListener(element, "DOMNodeRemoved", this.__onDOMNodeRemoved);
    }

    this._disposeObjects("__blockerElement", "__editorComponent");
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)
     * Michael Haitz (mhaitz)
     * Jonathan Weiß (jonathan_rass)

   Contributors:
     * Petr Kobalicek (e666e)

************************************************************************ */

/* ************************************************************************

#asset(qx/static/blank.html)
#require(qx.lang.normalize.String)

************************************************************************ */

/**
 * Low-level Rich text editor which can be used by connecting it to an
 * existing DOM element (DIV node).
 * This component does not contain any {@link qx.ui} code resulting in a
 * smaller footprint.
 *
 *
 * Optimized for the use at a traditional webpage.
 */
qx.Class.define("qx.bom.htmlarea.HtmlArea",
{
  extend : qx.core.Object,

  /*
   * IMPORTANT NOTE
   * If you add functionality which manipulates the content of the HtmlArea
   * AND you want make these changes undo-/redo-able you have to make sure
   * to implement methods in the "Manager" and "UndoManager" classes.
   */

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Constructor
   *
   * @param element {Element} DOM element to connect the component to
   * @param value {String} Initial content
   * @param styleInformation {String | Map | null} Optional style information for the editor's document
   *                                               Can be a string or a map (example: { "p" : "padding:2px" }
   * @param source {String} source of the iframe
   *
   * @lint ignoreDeprecated(_keyCodeToIdentifierMap)
   */
  construct : function(element, value, styleInformation, source)
  {
    this.base(arguments);

    var uri = source || qx.util.ResourceManager.getInstance().toUri(qx.core.Environment.get("qx.blankpage"));

    this.__connectToDomElement(element);
    this.__initDocumentSkeletonParts();
    this._createAndAddIframe(uri);

    // catch load event
    this._addIframeLoadListener();

    // set the optional style information - if available
    this.__styleInformation = qx.bom.htmlarea.HtmlArea.__formatStyleInformation(styleInformation);

    // Check content
    if (qx.lang.Type.isString(value)) {
      this.__value = value;
    }

    /*
     * Build up this commandManager object to stack all commands
     * which are arriving before the "real" commandManager is initialised.
     * Once initialised the stacked commands will be executed.
     */
    this.__commandManager = this.__createStackCommandManager();
  },


 /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /**
     * Thrown when the editor is loaded.
     */
    "load"             : "qx.event.type.Event",

    /**
     * Thrown when the editor gets an error at loading time.
     */
    "loadingError"     : "qx.event.type.Data",

    /**
     * Only available if messengerMode is active. This event returns the current content of the editor.
     */
    "messengerContent" : "qx.event.type.Data",

    /**
     * This event holds a data map which informs about the formatting at the
     * current cursor position. It holds the following keys:
     *
     * * bold
     * * italic
     * * underline
     * * strikethrough
     * * fontSize
     * * fontFamily
     * * insertUnorderedList
     * * insertOrderedList
     * * justifyLeft
     * * justifyCenter
     * * justifyRight
     * * justifyFull
     *
     * This map can be used to control/update a toolbar states.
     */
    "cursorContext"    : "qx.event.type.Data",

    /**
     * This event is dispatched when the editor is ready to use
     */
    "ready"            : "qx.event.type.Event",

    /**
     * This event is dispatched when the editor is ready to use after it was
     * re-located and re-initialized. Only implemented for Gecko browsers.
     */
    "readyAfterInvalid" : "qx.event.type.Event",

    /**
     * This event is dispatched when the editor gets the focus and his own handling is done
     */
    "focused"          : "qx.event.type.Event",


    /**
     * This event is dispatched when the document receives an "focusout" event
     */
    "focusOut"         : "qx.event.type.Event",

    /**
     * This event is dispatched when the editor gets a right click.
     *
     * Fires a data event with the following data:
     *
     * * x - absolute x coordinate
     * * y - absolute y coordinate
     * * relX - relative x coordinate
     * * relY - relative y coordinate
     * * target - DOM element target
     */
    "contextmenu"      : "qx.event.type.Data",

    /**
     * Holds information about the state of undo/redo
     * Keys are "undo" and "redo".
     * Possible values are 0 and -1 to stay in sync with
     * the kind the "cursorContext" event works.
     * (1 = active/pressed, 0 = possible/not pressed, -1 = disabled)
     */
    "undoRedoState"    : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    // Inserted when the property "insertParagraphOnLinebreak" is false
    simpleLinebreak : "<br>",

    EMPTY_DIV : "<div></div>",

    // regex to extract text content from innerHTML
    GetWordsRegExp     : /([^\u0000-\u0040\u005b-\u005f\u007b-\u007f]|['])+/g,
    CleanupWordsRegExp : /[\u0000-\u0040]/gi,

    /** Map with infos about hotkey methods */
    hotkeyInfo :
    {
      bold : { method: "setBold" },
      italic : { method: "setItalic" },
      underline : { method: "setUnderline" },
      undo : { method: "undo" },
      redo : { method: "redo" }
    },

    /**
     * Formats the style information. If the styleInformation was passed
     * in as a map it gets converted to a string.
     *
     * @param styleInformation {Map} CSS styles which should be applied at startup of the editor
     * @return {String}
     */
    __formatStyleInformation : function (styleInformation)
    {
      if (styleInformation == null || styleInformation == "")
      {
        return "";
      }
      else if (typeof styleInformation == "object")
      {
        var str = "";
        for (var i in styleInformation)
        {
          str += i + " { " + styleInformation[i] + " }";
        }
        return str;
      }
      else
      {
        return styleInformation;
      }
    },

    /**
     * Parse style string to map.
     *
     * Example:
     * qx.bom.htmlarea.HtmlArea.__parseStyle("text-align: left; text-weight: bold;");
     *
     * @param str {String} String that contain valid style informations separated by ";"
     * @return {Map} Map of style names and it's values
     */
    __parseStyle: function(str)
    {
      var map = {};
      var a = str.split(";");
      var i;

      for (i = 0; i < a.length; i++)
      {
        var style = a[i], sep = style.indexOf(":");

        if (sep === -1) {
          continue;
        }

        var name =  style.substring(0, sep).trim();
        var value = style.substring(sep+1, style.length).trim();

        if (name && value) {
          map[name] = value;
        }

      }

      return map;
    },

    /**
     * Get html content (own recursive method)
     *
     * @param root {Node} Root node (starting point)
     * @param outputRoot {Boolean} Controls whether the root node is also added to the output
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @param postProcess {Function} optional function to call which is executed with every element processing
     * @return {String} Content of current node
     */
    __getHtml : function(root, outputRoot, skipHtmlEncoding, postProcess)
    {
      // String builder is array for large text content
      var html = [];

      switch(root.nodeType)
      {
        // This is main area for returning html from iframe content. Content
        // from editor can be sometimes ugly, so it's needed to do some
        // postProcess to make it beautiful.
        //
        // The initial version of this function used direct HTML rendering
        // (each tag was rendered). This sometimes caused to render empty
        // elements. I'm introducing here new method - store tag name and
        // attributes and use some logic to render them (or not).

        // Node.ELEMENT_NODE
        case 1:
        // Node.DOCUMENT_FRAGMENT_NODE
        case 11:

          // for() helper variable
          var i;
          // Tag in lowercase
          var tag = root.tagName.toLowerCase();
          // Attributes map
          var attributes = {};
          // Styles map (order is not important here)
          var styles = {};
          // It's self-closing tag ? (<br />, <img />, ...)
          var closed = (!(root.hasChildNodes() || qx.bom.htmlarea.HtmlArea.__needsClosingTag(root)));

          if (outputRoot)
          {
            // --------------------------------------------------------------
            // get all of the children nodes of the div placeholder
            // but DO NOT return the placeholder div elements itself.
            // This special case is only relevant for IE browsers
            // --------------------------------------------------------------

            if ((qx.core.Environment.get("engine.name") == "mshtml"))
            {
              if (tag == "div" && root.className && root.className == "placeholder")
              {
                for (i=root.firstChild; i; i=i.nextSibling)
                {
                  html.push(qx.bom.htmlarea.HtmlArea.__getHtml(i, true, skipHtmlEncoding, postProcess));
                }
                return html.join("");
              }
            }

            // --------------------------------------------------------------
            // Parse attributes
            // --------------------------------------------------------------

            // Attributes list
            var attrs = root.attributes;
            var len = attrs.length;
            // Current attribute
            var a;

            if ((qx.core.Environment.get("engine.name") == "gecko"))
            {
              // we can leave out all auto-generated empty span elements which are marked dirty
              if (tag == "span" && len == 1 && attrs[0].name == "_moz_dirty" && root.childNodes.length == 0) {
                return "";
              }
            }

            for (i = 0; i < len; i++)
            {
              a = attrs[i];

              // TODO: Document this, I don't know what "specified" means
              if (!a.specified) {
                continue;
              }

              // Attribute name and value pair
              var name = qx.dom.Node.getName(a);
              var value = a.nodeValue;

              // Mozilla reports some special tags here; we don't need them.
              if (/(_moz|contenteditable)/.test(name))
              {
                continue;
              }

              if (name != "style")
              {
                if (qx.core.Environment.get("engine.name") == "mshtml")
                {
                  if (name == "id" && root.getAttribute("old_id"))
                  {
                    value = root.getAttribute("old_id");
                  }
                  else if (!isNaN(value))
                  {
                    // IE5: buggy on number values
                    // XXX: IE: String, Object, Number, Boolean, ... !!!
                    // XXX: Moz: String only
                    value = root.getAttribute(name);
                  }
                  else
                  {
                    value = a.nodeValue;
                  }
                }
                else
                {
                  value = a.nodeValue;
                }
              }
              else
              {
                // IE fails to put style in attributes list
                // FIXME: cssText reported by IE is UPPERCASE
                value = root.style.cssText;
              }

              if (/(_moz|^$)/.test(value))
              {
                // Mozilla reports some special tags
                // here; we don't need them.
                continue;
              }

              // Ignore old id
              if (name == "old_id") {
                continue;
              }

              // Ignore attributes with no values
              if (!value) {
                continue;
              }

              // ignore focus marker
              if (name == "id" && value == "__elementToFocus__") {
                continue;
              }

              // Ignore qooxdoo attributes (for example $$hash)
              if (name.charAt(0) === "$") {
                continue;
              }

              // Interesting attrubutes are added to attributes array
              attributes[name] = value;
            }

            // --------------------------------------------------------------
            // Parse styles
            // --------------------------------------------------------------

            if (attributes.style !== undefined)
            {
              styles = qx.bom.htmlarea.HtmlArea.__parseStyle(attributes.style);
              delete attributes.style;
            }

            // --------------------------------------------------------------
            // PostProcess
            // --------------------------------------------------------------

            // Call optional postProcess function to modify tag, attributes
            // or styles in this element.
            if (postProcess)
            {
              // create postprocess-info:
              // - info.domElement - current dom element
              // - info.tag - tag name
              // - info.attributes - attributes map (stored name and value pairs)
              // - info.styles - styles map (stored name and value pairs)
              var info = {
                domElement: root,
                tag: tag,
                attributes: attributes,
                styles: styles
              };

              // call user defined postprocessing function
              postProcess(info);

              // remove reference to dom element (is it needed ? For IE ?)
              info.domElement = null;
              // and get tag back
              tag = info.tag;
            }

            // --------------------------------------------------------------
            // Generate Html
            // --------------------------------------------------------------

            // If tag is empty, we don't want it!
            if (tag)
            {
              // Render begin of tag -> <TAG
              html.push("<", tag);

              // Render attributes -> attr=""
              for (var name in attributes)
              {
                var value = attributes[name];
                html.push(" ", name, '="', value.toString().replace(new RegExp('"', "g"), "'"), '"');
              }

              // Render styles -> style=""
              if (!qx.lang.Object.isEmpty(styles))
              {
                html.push(' style="');
                for (var name in styles)
                {
                  var value = styles[name];
                  html.push(name, ":", value.toString().replace(new RegExp('"', "g"), "'"), ";");
                }
                html.push('"');
              }

              // Render end of tag -> > or />
              html.push(closed ? " />" : ">");
            }
          }

          // Child nodes, recursive call itself

          for (i = root.firstChild; i; i = i.nextSibling)
          {
            html.push(qx.bom.htmlarea.HtmlArea.__getHtml(i, true, skipHtmlEncoding, postProcess));
          }

          // Close

          if (outputRoot && !closed && tag)
          {
            html.push("</", tag, ">");
          }
          break;

        // Node.TEXT_NODE
        case 3:

          html.push(skipHtmlEncoding ? root.data : qx.bom.htmlarea.HtmlArea.__htmlEncode(root.data));
          break;

        // Node.COMMENT_NODE
        case 8:
          // skip comments, for now ?
          html.push("<!--", root.data, "-->");
          break;
      }

      return html.join("");
    },

    // TODO: Map should be better! (Petr)
    /**
     * String containing all tags which need a corresponding closing tag
     */
    closingTags : " SCRIPT STYLE DIV SPAN TR TD TBODY TABLE EM STRONG FONT A P B I U STRIKE H1 H2 H3 H4 H5 H6 ",

    // TODO: No reason that first parameter is element, it should be only string with tag name (Petr)
    /**
     * Checks if given element needs a closing tag
     *
     * @param el {Element} Element to check
     * @return {Boolean} Closing tag needed or not
     */
    __needsClosingTag : function(el) {
      return (qx.bom.htmlarea.HtmlArea.closingTags.indexOf(" " + el.tagName + " ") != -1);
    },


    /**
     * Encodes given string with HTML-Entities
     *
     * @param s {String} String to encode
     * @return {String} Encoded string
     */
    __htmlEncode : function(s)
    {
      s = s.replace(/&/ig, "&amp;");
      s = s.replace(/</ig, "&lt;");
      s = s.replace(/>/ig, "&gt;");
      s = s.replace(/\x22/ig, "&quot;");

      // \x22 means '"' -- prevent errors in editor or compressors
      s = s.replace(/\xA9/ig, "&copy;");

      return s;
    },


    /**
     * Checks if the given node is a block node
     *
     * @param node {Node} Node
     * @return {Boolean} whether it is a block node
     */
    isBlockNode : function(node)
    {
      var deprecatedFunction = qx.bom.htmlarea.HtmlArea.isBlockNode;
      var deprecationMessage = "Please use the method 'qx.dom.Node.isBlockNode' instead.";
      qx.log.Logger.deprecatedMethodWarning(deprecatedFunction, deprecationMessage);

      return qx.dom.Node.isBlockNode(node);
    },


    /**
     * Checks if one element is in the list of elements that are allowed to contain a paragraph in HTML
     *
     * @param node {Node} node to check
     * @return {Boolean}
     */
    isParagraphParent : function(node)
    {
      if (!qx.dom.Node.isElement(node))
      {
        return false;
      }

      node = qx.dom.Node.getName(node);

      return /^(body|td|th|caption|fieldset|div)$/.test(node);
    },


    /**
     * Checks of the given node is headline node.
     *
     * @param node {Node} Node to check
     * @return {Boolean} whether it is a headline node
     */
    isHeadlineNode : function(node)
    {
      if (!qx.dom.Node.isElement(node)) {
        return false;
      }

      var nodeName = qx.dom.Node.getName(node);

      return /^h[1-6]$/.test(nodeName);
    }
 },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Selected content type. Currently only XHTML is supported. */
    contentType :
    {
      check : "String",
      init  : "xhtml"
    },


    /**
     * If turned on the editor acts like a messenger widget e.g. if one hits the Enter key the current content gets
     * outputted (via a DataEvent) and the editor clears his content
     */
    messengerMode :
    {
      check : "Boolean",
      init  : false
    },


    /**
     * Toggles whether a p element is inserted on each line break or not.
     * A "normal" linebreak can be achieved using the combination "Shift+Enter" anyway
     */
    insertParagraphOnLinebreak :
    {
      check : "Boolean",
      init  : true
    },


    /**
     * If true we add a linebreak after control+enter
     */
    insertLinebreakOnCtrlEnter :
    {
      check : "Boolean",
      init  : true
    },


    /**
     * Function to use in postProcessing html. See getHtml() and __getHtml().
     */
    postProcess:
    {
      check: "Function",
      nullable: true,
      init: null
    },


    /**
     * Toggles whether to use Undo/Redo
     */
    useUndoRedo :
    {
      check : "Boolean",
      init  : true
    },


    /**
     * Whether to use the native contextmenu or to block it and use own event
     */
    nativeContextMenu :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Default font family to use when e.g. user removes all content
     */
    defaultFontFamily :
    {
      check : "String",
      init : "Verdana"
    },


    /**
     * Default font size to use when e.g. user removes all content
     */
    defaultFontSize :
    {
      check : "Integer",
      init : 4
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __widget : null,
    __isReady : false,
    __isInvalid : false,
    __isLoaded : false,
    __isEditable : false,
    __isFirstLineSelected : false,
    __commandManager : null,
    __stackCommandManager : null,
    __currentEvent : null,
    __storedSelectedHtml : null,
    __iframe : null,
    __styleInformation : null,
    __documentSkeletonParts : null,
    __savedRange : null,
    __fireCursorContextOnNextInput : false,
    __mouseUpOnBody : false,


    /**
     * Create a "DIV" element which can be added to the document.
     * This element is the container for the editable iframe element.
     *
     * @param element {Element} DOM element to connect to
     */
    __connectToDomElement : function(element)
    {
      if (qx.dom.Node.isElement(element) &&
          qx.dom.Node.isNodeName(element, "div"))
      {
        this.__widget = element;
      }
    },


    /**
     * Creates an iframe element with the given URI and adds it to
     * the container element.
     *
     * @param uri {String} URI of the iframe
     */
    _createAndAddIframe : function(uri)
    {
      this.__iframe = qx.bom.Iframe.create();
      qx.bom.Iframe.setSource(this.__iframe, uri);

      // Omit native dotted outline border
      if ((qx.core.Environment.get("engine.name") == "mshtml")) {
        qx.bom.element.Attribute.set(this.__iframe, "hideFocus", "true");
      } else {
        qx.bom.element.Style.set(this.__iframe, "outline", "none");
      }
      qx.bom.element.Style.setStyles(this.__iframe, { width: "100%",
                                                      height: "100%" });

      qx.dom.Element.insertBegin(this.__iframe, this.__widget);
    },


    /**
     * Returns the document of the iframe.
     *
     * @return {Document}
     */
    _getIframeDocument : function() {
      return qx.bom.Iframe.getDocument(this.__iframe);
    },


    /**
     * Returns the window of the iframe.
     *
     * @return {Window}
     */
    _getIframeWindow : function() {
      return qx.bom.Iframe.getWindow(this.__iframe);
    },


    /**
     * Adds the "load" listener to the iframe.
     *
     */
    _addIframeLoadListener : function() {
      qx.event.Registration.addListener(this.__iframe, "load", this._loaded, this);
    },

    /**
     * Initial content which is written dynamically into the iframe's document
     *
     */
    __initDocumentSkeletonParts : function()
    {
      this.__documentSkeletonParts =
      {
        "xhtml" :
        {
          doctype : '<!' + 'DOCTYPE html PUBLIC "-/' + '/W3C/' + '/DTD XHTML 1.0 Transitional/' + '/EN" "http:/' + '/www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
          html : '<html xmlns="http:/' + '/www.w3.org/1999/xhtml" xml:lang="en" lang="en">',
          meta: '<title></title><meta http-equiv="Content-type" content="text/html; charset=UTF-8" />',
          style : qx.core.Environment.select("engine.name",
          {
            "mshtml" : 'html { margin:0px; padding:0px; } ' +
                       'body { font-size: 100.01%; font-family:Verdana, Geneva, Arial, Helvetica, sans-serif; width:100%; height:100%; background-color:transparent; overflow:auto; background-image:none; margin:0px; padding:5px; } ',

            "default" : 'html { width:100%; height:100%; margin:0px; padding:0px; overflow-y:auto; overflow-x:auto; } ' +
                        'body { font-size:100.01%; font-family:Verdana, Geneva, Arial, Helvetica, sans-serif; background-color:transparent; overflow:visible; background-image:none; margin:0px; padding:5px; } '
          }),
          contentStyle : 'p { margin:0px; padding:0px; }',
          body : '<body>',
          footer : '</body></html>'
        }
      };
    },


    /** private field which holds the content of the editor  */
    __value        : "",


    /**
     * Returns the iframe object which is used to render the content
     *
     * @return {Element} iframe DOM element
     */
    getIframeObject : function() {
      return this.__iframe;
    },

    /**
     * Getter for command manager.
     *
     * @return {qx.bom.htmlarea.manager.Command|qx.bom.htmlarea.manager.UndoRedo} manager instance
     */
    getCommandManager : function() {
      return this.__commandManager;
    },


    /**
     * Setting the value of the editor
     *
     * @param value {String} new content to set
     */
    setValue : function(value)
    {
      if (qx.lang.Type.isString(value))
      {
        this.__value = value;

        var doc = this._getIframeDocument();
        if (doc && doc.body) {
          doc.body.innerHTML = this.__generateDefaultContent(value);
        }
      }
    },


    /**
     * Generates the default content and inserts the given string
     *
     * @param value {String} string to insert into the default content
     * @return {String} Default content HTML
     */
    __generateDefaultContent : function(value)
    {
      // bogus node for Firefox 2.x
      var bogusNode = "";
      if ((qx.core.Environment.get("engine.name") == "gecko"))
      {
        if (qx.core.Environment.get("browser.version") <= 2) {
          bogusNode += '<br _moz_editor_bogus_node="TRUE" _moz_dirty=""/>';
        }
      }

      var zeroWidthNoBreakSpace = value.length == 0 ? "\ufeff" : "";
      var idForFontElement =
        qx.core.Environment.get("engine.name") == "gecko" ||
        qx.core.Environment.get("engine.name") == "webkit" ?
        'id="__elementToFocus__"' : '';

      var defaultContent = '<p>' +
                           '<span style="font-family:' +
                            this.getDefaultFontFamily() + '">' +
                           '<font ' + idForFontElement + ' size="' +
                           this.getDefaultFontSize() +'">' +
                           bogusNode +
                           value +
                           zeroWidthNoBreakSpace +
                           '</font>' +
                           '</span>' +
                           '</p>';

      return defaultContent;
    },


    /**
     * Getting the value of the editor.
     * <b>Attention</b>: The content of the editor is synced
     * at focus/blur events, but not on every input. This method
     * is not delivering the current content in a stable manner.
     * To get the current value of the editor use the {@link #getComputedValue}
     * method instead.
     *
     * @return {String} value of the editor
     */
    getValue : function() {
      return this.__value;
    },


    /**
     * Getting the computed value of the editor.
     * This method returns the current value of the editor traversing
     * the elements below the body element. With this method you always
     * get the current value, but it is much more expensive. So use it
     * carefully.
     *
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @return {String} computed value of the editor
     */
    getComputedValue : function(skipHtmlEncoding) {
      return this.getHtml(skipHtmlEncoding);
    },


    /**
     * Returns the complete content of the editor
     *
     * @return {String}
     */
    getCompleteHtml : function()
    {
      var skeletonParts = this.__documentSkeletonParts[this.getContentType()];

      var completeHtml = skeletonParts.html + '<head>' + skeletonParts.meta +
                         '<style type="text/css">' + skeletonParts.contentStyle + '</style>' +
                         '</head>';

      // use "'" to prevent problems with certain font names encapsulated with '"'
      completeHtml += "<body style='" + this.__getBodyStyleToExport() + "'>";
      completeHtml += this.getHtml() + '</body></html>';

      return completeHtml;
    },


    /**
     * Returns the CSS styles which should be exported as a CSS string.
     * This prevents that styles which are only for internal use appear in the
     * result (e.g. overflow settings).
     *
     * @return {String} CSS string of body styles to export
     */
    __getBodyStyleToExport : function()
    {
      var stylesToExport = [ "backgroundColor", "backgroundImage",
                             "backgroundRepeat", "backgroundPosition",
                             "fontFamily", "fontSize",
                             "marginTop", "marginBottom", "marginLeft", "marginRight",
                             "paddingTop", "paddingBottom", "paddingLeft", "paddingRight" ];

      var Style = qx.bom.element.Style;
      var body = this.getContentBody();
      var bodyStyle = {};
      var styleAttribute, styleValue;
      var modeToUse = qx.core.Environment.get("engine.name") == "mshtml" ? 2 : 1;
      for (var i=0, j=stylesToExport.length; i<j; i++)
      {
        styleAttribute = stylesToExport[i];
        styleValue = Style.get(body, styleAttribute, modeToUse);
        if (styleValue !== undefined && styleValue != "") {
          bodyStyle[styleAttribute] = styleValue;
        }
      }

      return qx.bom.element.Style.compile(bodyStyle);
    },


    /**
     * Returns the document of the iframe
     *
     * @return {Object}
     */
    getContentDocument : function ()
    {
      if (this.__isReady) {
        return this._getIframeDocument();
      }
    },

    /**
     * Returns the body of the document
     *
     * @return {Object}
     */
    getContentBody : function ()
    {
      if (this.__isReady) {
        return this._getIframeDocument().body;
      }
    },


    /**
     * Returns the window of the iframe
     *
     * @return {Node} window node
     */
    getContentWindow : function()
    {
      if (this.__isReady) {
         return this._getIframeWindow();
      }
    },


    /**
     * Returns all the words that are contained in a node.
     *
     * @param node {Object} the node element where the text should be retrieved from.
     * @return {String[]} all the words.
     */
    getWords : function(node)
    {
      if (!node) {
        node = this.getContentBody();
      }

      if (!node) {
        return [];
      }

      // Clone the node
      var nodeClone = node.cloneNode(true);
      var innerHTML = nodeClone.innerHTML;

      // Replace all ">" with space "> " to create new word borders
      innerHTML = innerHTML.replace(/>/gi, "> ");
      // Remove all line breaks
      innerHTML = innerHTML.replace(/\n/gi, " ");
      // Remove all comments
      innerHTML = innerHTML.replace(/<!--.*-->/gi, "");

      nodeClone.innerHTML = innerHTML;
      var text  =
        qx.core.Environment.get("engine.name") == "mshtml" ||
        qx.core.Environment.get("engine.name") == "opera" ?
        nodeClone.innerText : nodeClone.textContent;
      var words = text.match(qx.bom.htmlarea.HtmlArea.GetWordsRegExp);

      return !words ? [] : words;
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Returns all words
     *
     * @return {Map} all words
     */
    getWordsWithElement : function()
    {
      var list = this.getTextNodes();
      var result = {};
      var i, j, words, element, word;

      for(var i=0,len1=list.length; i<len1; ++i)
      {
        element = list[i];
        words = element.nodeValue.split(" ");

        for(var j=0,len2=words.length; j<len2; ++j)
        {
          word = this._cleanupWord(words[j]);

          if(word != null && word.length > 1)
          {
            if (!result[word])
            {
              result[word] = [];
            }

            result[word].push(element);
          }
        }
      }

      return result;
    },


    /**
     * Cleaning up a given word (removing HTML code)
     *
     * @param word {String} Word to clean
     * @return {String}
     */
    _cleanupWord : function(word)
    {
      if (!word)
      {
        return null;
      }

      return word.replace(qx.bom.htmlarea.HtmlArea.CleanupWordsRegExp, "");
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Returns all text nodes
     *
     * @return {Array} Text nodes
     */
    getTextNodes : function() {
      return this._fetchTextNodes(this.getContentBody());
    },


    /**
     * *** IN DEVELOPMENT! ***
     * Helper method for returning all text nodes
     *
     * @param element {Element} element to retrieve all text nodes from
     * @return {Array} Text nodes
     */
    _fetchTextNodes : function(element)
    {
      var result = [];
      var tmp;

      // Element node
      if(element.hasChildNodes)
      {
        for(var i=0; i<element.childNodes.length; i++)
        {
          tmp = this._fetchTextNodes(element.childNodes[i]);
          qx.lang.Array.append(result, tmp);
        }
      }

      // Text node
      if(element.nodeType == 3)
      {
        // Contains real text
        if(element.nodeValue.length > 1)
        {
          result.push(element);
        }
      }

      return result;
    },


    /*
    ---------------------------------------------------------------------------
      INITIALIZATION
    ---------------------------------------------------------------------------
    */

    __loadCounter : 0,


    /**
     * should be removed if someone find a better way to ensure that the document
     * is ready in IE6
     *
     */
    __waitForDocumentReady : function()
    {
      var doc = this._getIframeDocument();

      // first we try to get the document
      if (!doc)
      {
        this.__loadCounter++;

        if (this.__loadCounter > 5)
        {
          this.error('cant load HtmlArea. Document is not available. ' + doc);
          this.fireDataEvent("loadingError");
        }
        else
        {
          if (qx.core.Environment.get("qx.debug")) {
            this.error('document not available, try again...');
          }

          qx.event.Timer.once(function()
          {
            this.__waitForDocumentReady();
          }, this, 0);
        }
      }
      else
      {
        // reset counter, now we try to open the document
        this.__loadCounter = 0;
        this._onDocumentIsReady();
      }
    },


    /**
     * Is executed when event "load" is fired
     *
     * @param e {Object} Event object
     */
    _loaded : function(e)
    {
      if (this.__isLoaded) {
        return;
      }

      if (this.__isInvalid) {
        this.__resetEditorToValidState();
        return;
      }

      // sometimes IE does some strange things and the document is not available
      // so we wait for it
      if ((qx.core.Environment.get("engine.name") == "mshtml")) {
        this.__waitForDocumentReady();
      } else {
        this._onDocumentIsReady();
      }
    },


    /**
     * Whether the editor is ready to accept commands etc.
     *
     * @return {Boolean} ready or not
     */
    isReady : function() {
      return this.__isReady;
    },


    /**
     * Initializes the command manager, sets the document editable, renders
     * the content and adds a needed event listeners when the document is ready
     * for it.
     * After the successful startup the "ready" event is thrown.
     */
    _onDocumentIsReady : function()
    {
      var cm = new qx.bom.htmlarea.manager.Command(this);
      if (this.getUseUndoRedo()) {
        cm = new qx.bom.htmlarea.manager.UndoRedo(cm, this);
      }

      this.__isLoaded = true;

      // For IE the document needs to be set in "designMode"
      // BEFORE the content is rendered.
      if ((qx.core.Environment.get("engine.name") == "mshtml")) {
        this.setEditable(true);
      }

      // Open a new document and insert needed elements plus the initial content
      this.__renderContent();

      if (!(qx.core.Environment.get("engine.name") == "opera")) {
        this.__addListeners();
      }

      // Setting the document editable for all other browser engines
      // AFTER the content is set
      if (!(qx.core.Environment.get("engine.name") == "mshtml")) {
        this.setEditable(true);
      }

      this.__isReady = true;

      // replace the commandManager to be sure the stacked commands are
      // executed at the correct manager
      this.__commandManager = cm;
      cm.setContentDocument(this._getIframeDocument());

      this.__processStackedCommands();

      // Add listeners to opera after the edit mode is activated,
      // otherwise the listeners will be removed
      if ((qx.core.Environment.get("engine.name") == "opera")) {
        this.__addListeners();
      }

      // dispatch the "ready" event at the end of the initialization
      this.fireEvent("ready");
    },


    /**
     * Forces the htmlArea to reset the document editable. This method can
     * be useful (especially for Gecko) whenever the HtmlArea was hidden and
     * gets visible again.
     */
    forceEditable : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        var doc = this._getIframeDocument();
        if (doc)
        {
          /*
           * Don't ask my why, but this is the only way I found to get
           * gecko back to a state of an editable document after the htmlArea
           * was hidden and visible again.
           * Yes, and there are differences in Firefox 3.x and Firefox 2.x
           */
          if (parseFloat(qx.core.Environment.get("engine.version")) >= "1.9")
          {
            doc.designMode = "Off";

            doc.body.contentEditable = false;
            doc.body.contentEditable = true;
          }
          else
          {
            doc.body.contentEditable = true;
            this.__setDesignMode(true);
          }
        }
      },

      "default" : (function() {})
    }),


    /**
     * Sets the editor for all gecko browsers into the state "invalid" to be
     * able to re-initialize the editor with the next load of the iframe.
     *
     * This "invalid" state is necessary whenever the whole HtmlArea high-level
     * widget is moved around to another container.
     *
     * Only implemented for Gecko browser.
     *
     * @signature function()
     */
    invalidateEditor : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        this.__isLoaded = false;
        this.__isReady = false;
        this.__isInvalid = true;
      },

      "default" : function() {}
    }),


    /**
     * Called when the iframes is loaded and the HtmlArea is in the "invalid"
     * state. Re-initializes the HtmlArea and fires the {@link qx.bom.htmlarea.HtmlArea#readyAfterInvalid}
     * event to offer a time moment for the application developer to execute
     * commands after the re-location.
     *
     * Only implemented for Gecko browser.
     *
     * @signature function()
     */
    __resetEditorToValidState : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        this.__renderContent();
        this.__addListeners();

        this.__commandManager.setContentDocument(this._getIframeDocument());

        this.setEditable(true);
        this.forceEditable();

        this.__isLoaded = true;
        this.__isReady = true;
        this.__isInvalid = false;

        this.fireEvent("readyAfterInvalid");
      },

      "default" : function() {}
    }),


    /**
     * Returns style attribute as string of a given element
     *
     * @param elem {Element} Element to check for styles
     * @return {String} Complete style attribute as string
     */
    __getElementStyleAsString : function(elem)
    {
      var style = "";

      if (!elem) {
        return style;
      }

      try
      {
        var styleAttrib = elem.getAttribute("style");

        if (!styleAttrib) {
          return style;
        }

        // IE returns an array when calling getAttribute
        if ((qx.core.Environment.get("engine.name") == "mshtml"))
        {
          style = styleAttrib.cssText;
        }
        else
        {
          style = styleAttrib;
        }
      }
      catch(exc)
      {
        this.error("can't extract style from elem. ");
      }

      return style;
    },


    /**
     * Returns the document skeleton with content usable for the editor
     *
     * @param value {String} body.innerHTML
     * @return {String} content
     */
    __generateDocumentSkeleton : function(value)
    {
      // To hide the horizontal scrollbars in gecko browsers set the
      // "overflow-x" explicit to "hidden"
      // In mshtml browsers this does NOT work. The property "overflow-x"
      // overwrites the value of "overflow-y".
      var overflow = qx.core.Environment.get("engine.name") == "gecko" ?
        " html, body {overflow-x: visible; } " : "";

      var skeletonParts = this.__documentSkeletonParts[this.getContentType()];
      var head = '<head>' + skeletonParts.meta +
                 '<style type="text/css">' + overflow + skeletonParts.style + skeletonParts.contentStyle + this.__styleInformation + '</style>' +
                 '</head>';
      var content = skeletonParts.body + value;

      // When setting the content with a doctype IE7 has one major problem.
      // With EVERY char inserted the editor component hides the text/flickers.
      // To display it again it is necessary to unfocus and focus again the
      // editor component. To avoid this unwanted behaviour it is necessary to
      // set NO DOCTYPE.
      return skeletonParts.html + head + content + skeletonParts.footer;
    },


    /**
     * Opens a new document and sets the content (if available)
     *
     */
    __renderContent : function()
    {
      var value = this.__generateDefaultContent(this.getValue());

      if (qx.lang.Type.isString(value))
      {
        var doc = this._getIframeDocument();
        try
        {
          doc.open("text/html", true);
          doc.write(this.__generateDocumentSkeleton(value));
          doc.close();
        }
        catch (e)
        {
          this.error("cant open document on source '"+qx.bom.Iframe.queryCurrentUrl(this.__iframe) +"'", e);
          this.fireDataEvent("loadingError", e);
        }
      }
    },


    /**
     * Adds all needed eventlistener
     *
     */
    __addListeners : function()
    {
      this.__addKeyListeners();
      this.__addMouseListeners();
      this.__addFocusListeners();
    },


    /**
     * Add key event listeners to the body element
     */
    __addKeyListeners : function()
    {
      var Registration = qx.event.Registration;
      var doc = this._getIframeDocument();

      Registration.addListener(doc.body, "keypress", this._handleKeyPress, this);
      Registration.addListener(doc.body, "keyup", this._handleKeyUp,    this);
      Registration.addListener(doc.body, "keydown", this._handleKeyDown,  this);
    },


    /**
     * Add focus event listeners.
     */
    __addFocusListeners : function()
    {
      var Registration = qx.event.Registration;
      var doc = this._getIframeDocument();

      var focusBlurTarget = qx.core.Environment.get("engine.name") == "webkit" ? this._getIframeWindow() : doc.body;
      Registration.addListener(focusBlurTarget, "focus", this._handleFocusEvent, this);
      Registration.addListener(focusBlurTarget, "blur", this._handleBlurEvent, this);

      Registration.addListener(doc, "focusout",  this._handleFocusOutEvent, this);
    },


    /**
     * Add mouse event listeners.
     */
    __addMouseListeners : function()
    {
      // The mouse events are primarily needed to examine the current cursor context.
      // The cursor context examines if the current text node is formatted in any
      // manner like bold or italic. An event is thrown to e.g. activate/deactivate
      // toolbar buttons.
      // Additionally the mouseup at document level is necessary for gecko and
      // webkit to reset the focus (see Bug #2896).
      var Registration = qx.event.Registration;
      var doc = this._getIframeDocument();

      var mouseEventName = qx.core.Environment.get("engine.name") == "mshtml" ? "click" : "mouseup";
      Registration.addListener(doc.body, mouseEventName, this._handleMouseUpOnBody, this);
      Registration.addListener(doc.documentElement, mouseEventName, this._handleMouseUpOnDocument, this);

      Registration.addListener(doc.documentElement, "contextmenu", this._handleContextMenuEvent, this);
    },


    /**
     * Helper method to create an object which acts like a command manager
     * instance to collect all commands which are executed BEFORE the command
     * manager instance is ready.
     *
     * @return {Object} stack command manager object
     */
    __createStackCommandManager : function()
    {
      if (this.__stackCommandManager == null)
      {
        this.__stackCommandManager = {
          execute : function(command, value)
          {
            this.stackedCommands = true;
            this.commandStack.push( { command : command, value : value } );
          },

          commandStack : [],
          stackedCommands : false
        };
      }
      this.__stackCommandManager.stackedCommands = false;

      return this.__stackCommandManager;
    },


    /**
     * Process the stacked commands if available.
     * This feature is necessary at startup when the command manager is yet
     * not ready to execute the commands after the initialization.
     */
    __processStackedCommands : function()
    {
      var manager = this.__stackCommandManager;

      if (manager != null && manager.stackedCommands)
      {
        var commandStack = manager.commandStack;
        if (commandStack != null)
        {
          for (var i=0, j=commandStack.length; i<j; i++) {
            this.__commandManager.execute(commandStack[i].command, commandStack[i].value);
          }
        }
      }
    },


    /**
     * Sets the designMode of the document
     *
     * @param onOrOff {Boolean} Set or unset the design mode on the current document
     */
    __setDesignMode : function (onOrOff)
    {
      var doc = this._getIframeDocument();

      if (this.__isLoaded && doc)
      {
        try
        {
          if ((qx.core.Environment.get("engine.name") == "gecko"))
          {
            // FF Bug (Backspace etc. doesn't work if we dont set it twice)
            doc.designMode = (onOrOff !== false) ? 'Off' : 'On';
          }

          doc.designMode = (onOrOff !== false) ? 'On' : 'Off';
        }
        catch (e)
        {
          // Fails if the element is not shown actually
          // we set it again in _afterAppear
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      EDITABLE
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the document is in editable mode
     *
     * @param value {Boolean} Current value
     * @throws {Error} Failed to enable rich edit functionality
     */
    setEditable : function(value)
    {
      if (this.__isLoaded)
      {
        this.__setDesignMode(true);

        // For Gecko set additionally "styleWithCSS" to turn on CSS.
        // Fallback for older Gecko engines is "useCSS".
        // see http://www.mozilla.org/editor/midas-spec.html
        if ((qx.core.Environment.get("engine.name") == "gecko"))
        {
          try
          {
            var doc = this._getIframeDocument();
            doc.execCommand("styleWithCSS", false, true);
          }
          catch(ex)
          {
            try
            {
              var doc = this._getIframeDocument();
              doc.execCommand("useCSS", false, false);
            }
            catch(ex1)
            {
              if (!this.__isReady)
              {
                this.error("Failed to enable rich edit functionality");
                this.fireDataEvent("loadingError", ex1);
              }
              else {
                throw new Error("Failed to enable rich edit functionality");
              }
            }
          }
        }

        this.__isEditable = value;
      }
    },


    /**
     * Whether the document is in editable mode
     *
     * @return {Boolean}
     */
    getEditable : function() {
      return this.__isEditable;
    },


    /**
     * Whether the document is in editable mode
     *
     * @return {Boolean}
     */
    isEditable : function() {
      return this.__isEditable;
    },



    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /*
     * This flag is only needed by IE to implement the mechanism
     * of a linebreak when pressing "Ctrl+Enter". It is not possible
     * in IE to get to know that both keys are pressed together (at the
     * keypress event). It is only possible to look at the keypress event,
     * set this flag and insert the linebreak at the keyup event.
     */
    __controlPressed : false,


    /**
     * All keyUp events are delegated to this method
     *
     * @param e {Object} Event object
     */
    _handleKeyUp : function(e)
    {
      var keyIdentifier = e.getKeyIdentifier().toLowerCase();
      this.__currentEvent = e;

      if ((qx.core.Environment.get("qx.debug")) &&
          qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
        this.debug(e.getType() + " | " + keyIdentifier);
      }

      // This block inserts a linebreak when the key combination "Ctrl+Enter"
      // was pressed. It is necessary in IE to look after the keypress and the
      // keyup event. The keypress delivers the "Ctrl" key and the keyup the
      // "Enter" key. If the latter occurs right after the first one the
      // linebreak gets inserted.
      if (
        qx.core.Environment.get("engine.name") == "mshtml" ||
        qx.core.Environment.get("engine.name") == "webkit"
      ) {
        if (this.__controlPressed)
        {
          switch(keyIdentifier)
          {
            case "enter":
              if (this.getInsertLinebreakOnCtrlEnter())
              {
                if ((qx.core.Environment.get("engine.name") == "webkit"))
                {
                  this.__insertWebkitLineBreak();

                  e.preventDefault();
                  e.stopPropagation();
                }
                else
                {
                  var rng = this.__createRange(this.getSelection());

                  if (rng)
                  {
                    rng.collapse(true);
                    rng.pasteHTML('<br/><div class="placeholder"></div>');
                  }
                }

                this.__startExamineCursorContext();
              }
            break;

            // The keyUp event of the control key ends the "Ctrl+Enter" session.
            // So it is supported that the user is pressing this combination
            // several times without releasing the "Ctrl" key.
            case "control":
              this.__controlPressed = false;
              return;
            break;
          }
        }
      }
      else if ((qx.core.Environment.get("engine.name") == "gecko"))
      {
        // These keys can change the selection
        switch(keyIdentifier)
        {
          case "left":
          case "right":
          case "up":
          case "down":
          case "pageup":
          case "pagedown":
          case "delete":
          case "end":
          case "backspace":
            this.__isFirstLineSelected = (this.getFocusNode() == this.getContentBody().firstChild);
          break;
        }
      }
    },


    /**
     * Helper function which inserts an linebreak at the selection.
     *
     */
    __insertWebkitLineBreak : function()
    {
      var sel = this.getSelection();
      var helperString = "";

      // Insert bogus node if we are on an empty line:
      if(sel && (sel.focusNode.textContent == "" || sel.focusNode.parentElement.tagName == "LI")) {
        helperString = "<br class='webkit-block-placeholder' />";
      }

      this.__commandManager.execute("inserthtml", helperString + qx.bom.htmlarea.HtmlArea.simpleLinebreak);
    },


    /**
     * All keyDown events are delegated to this method
     *
     * @param e {Object} Event object
     */
    _handleKeyDown : qx.core.Environment.select("engine.name",
    {
      "mshtml|webkit" : function(e)
      {
        var keyIdentifier   = e.getKeyIdentifier().toLowerCase();

        if ((qx.core.Environment.get("qx.debug")) &&
            qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
          //this.debug(e.getType() + " | " + e.getKeyIdentifier().toLowerCase());
        }

        /* Stop the key events "Ctrl+Z" and "Ctrl+Y" for IE (disabling the browsers shortcuts) */
        if (this.__controlPressed && (keyIdentifier == "z" || keyIdentifier == "y" ||
                                      keyIdentifier == "b" || keyIdentifier == "u" ||
                                      keyIdentifier == "i" || keyIdentifier == "k"))
        {
          e.preventDefault();
          e.stopPropagation();
        }

        /*
         * Only set the flag to true
         * Setting it to false is handled in the "keyUp" handler
         * otherwise holding the "Ctrl" key and hitting e.g. "z"
         * will start the browser shortcut at the second time.
         */
        if(keyIdentifier == "control") {
          this.__controlPressed = true;
        }

      },

      "default" : function(e) {}
    }),


    /**
     * All keyPress events are delegated to this method
     *
     * @param e {Object} Event object
     */
   _handleKeyPress : function(e)
   {
      var doc = this.getContentDocument();
      var keyIdentifier   = e.getKeyIdentifier().toLowerCase();
      var isCtrlPressed   = e.isCtrlPressed();
      var isShiftPressed  = e.isShiftPressed();
      this.__currentEvent = e;

      if ((qx.core.Environment.get("qx.debug")) &&
          qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
        this.debug(e.getType() + " | " + keyIdentifier);
      }

      // if a hotkey was executed at an empty selection it is necessary to fire
      // a "cursorContext" event after the first input
      if (this.__fireCursorContextOnNextInput)
      {
        // for IE it's necessary to NOT look at the cursorcontext right after
        // the "Enter" because the corresponding styles / elements are not yet
        // created.
        var fireEvent = !((qx.core.Environment.get("engine.name") == "mshtml") && keyIdentifier == "enter") ||
                        !((qx.core.Environment.get("engine.name") == "gecko") &&  keyIdentifier == "enter");

        if (fireEvent)
        {
          this.__startExamineCursorContext();
          this.__fireCursorContextOnNextInput = false;
        }
      }


      switch(keyIdentifier)
      {
        case "enter":
          // If only "Enter" key was pressed and "messengerMode" is activated
          if (!isShiftPressed && !isCtrlPressed && this.getMessengerMode())
          {
            e.preventDefault();
            e.stopPropagation();

            this.fireDataEvent("messengerContent", this.getComputedValue());
            this.resetHtml();
          }

          // This mechanism is to provide a linebreak when pressing "Ctrl+Enter".
          // The implementation for IE is located at the "control" block and at
          // the "_handleKeyUp" method.
          if (isCtrlPressed)
          {
            if (!this.getInsertLinebreakOnCtrlEnter()) {
              return;
            }

            e.preventDefault();
            e.stopPropagation();

            if ((qx.core.Environment.get("engine.name") == "gecko"))
            {
              if (this.__isSelectionWithinWordBoundary())
              {
                this.insertHtml("<br />");
                this.__startExamineCursorContext();
                return;
              }

              // Insert additionally an empty div element - this ensures that
              // the caret is shown and the cursor moves down a line correctly
              //
              // ATTENTION: the "div" element itself gets not inserted by Gecko,
              // it is only necessary to have anything AFTER the "br" element to
              // get it work.
              this.insertHtml("<br /><div id='placeholder'></div>");
            }
            else if ((qx.core.Environment.get("engine.name") == "opera"))
            {
              // To insert a linebreak for Opera it is necessary to work with
              // ranges and add the <br> element on node-level. The selection
              // of the node afterwards is necessary for Opera to show the
              // cursor correctly.
              var sel = this.getSelection();
              var rng = this.__createRange(sel);

              if (sel && rng)
              {
                var brNode = doc.createElement("br");
                rng.collapse(true);
                rng.insertNode(brNode);
                rng.collapse(true);

                rng.selectNode(brNode);
                sel.addRange(rng);
                rng.collapse(true);
              }
            }

            this.__startExamineCursorContext();
          }

          // Special handling for IE when hitting the "Enter" key instead of
          // letting the IE insert a <p> insert manually a <br> if the
          // corresponding property is set.
          if ((qx.core.Environment.get("engine.name") == "mshtml"))
          {
            if (!this.getInsertParagraphOnLinebreak())
            {
              // Insert a "br" element to force a line break. If the insertion
              // succeeds stop the key event otherwise let the browser handle
              // the linebreak e.g. if the user is currently editing an
              // (un)ordered list.
              if (this.__commandManager.execute("inserthtml", qx.bom.htmlarea.HtmlArea.simpleLinebreak))
              {
                this.__startExamineCursorContext();
                e.preventDefault();
                e.stopPropagation();
              }
            }
          }
          // Special handling for Firefox when hitting the "Enter" key
          else if((qx.core.Environment.get("engine.name") == "gecko"))
          {
            if (this.getInsertParagraphOnLinebreak() &&
                !isShiftPressed && !isCtrlPressed)
            {
              var sel = this.getSelection();

              if (sel)
              {
                var selNode = sel.focusNode;

                // check if the caret is within a word - Gecko can handle it
                if (this.__isSelectionWithinWordBoundary())
                {
                  this.__startExamineCursorContext();
                  return;
                }

                // caret is at an empty line
                if (this.__isFocusNodeAnElement())
                {
                  this.__startExamineCursorContext();
                  return;
                }

                // check if inside a list
                while (!qx.dom.Node.isNodeName(selNode, "body"))
                {
                  if (qx.dom.Node.isNodeName(selNode, "li"))
                  {
                    this.__startExamineCursorContext();
                    return;
                  }
                  selNode = selNode.parentNode;
                }
              }

              this.__commandManager.insertParagraphOnLinebreak();
              e.preventDefault();
              e.stopPropagation();

              this.__startExamineCursorContext();
              this.__fireCursorContextOnNextInput = true;
            }
          }
          else if((qx.core.Environment.get("engine.name") == "webkit"))
          {
            if (this.getInsertParagraphOnLinebreak() && isShiftPressed)
            {
              this.__insertWebkitLineBreak();

              e.preventDefault();
              e.stopPropagation();

              this.__startExamineCursorContext();
           }
          }
          break;


        case "up" :
          // Firefox 2 needs some additional work to select the first line
          // completely in case the selection is already on the first line and
          // "key up" is pressed.
          if (qx.core.Environment.get("engine.name") == "gecko" &&
            qx.core.Environment.get("engine.version") < 1.9 && isShiftPressed)
          {
            var sel = this.getSelection();

            // First line is selected
            if(sel && sel.focusNode == doc.body.firstChild)
            {
              // Check if the first line has been (partly) selected before.
              if(this.__isFirstLineSelected)
              {
                // Check if selection does not enclose the complete line already
                if (sel.focusOffset != 0)
                {
                  // Select the complete line.
                  sel.extend(sel.focusNode, 0);
                }
              }
            }
          }

          this.__startExamineCursorContext();
          break;


        // Firefox 2 needs some extra work to move the cursor (and optionally
        // select text while moving) to first position in the first line.
        case "home":
          if (qx.core.Environment.get("engine.name") == "gecko" &&
            qx.core.Environment.get("engine.version") < 1.9)
          {
            if(isCtrlPressed)
            {
              var sel = this.getSelection();

              // Select text from current position to first character on first line
              if (isShiftPressed)
              {
                // Check if target position is not yet selected
                if (sel && (sel.focusOffset != 0) || (sel.focusNode != doc.body.firstChild))
                {
                  // Extend selection to first child at position 0
                  sel.extend(doc.body.firstChild, 0);
                }
              }
              else
              {
                var elements = null;
                var currentItem;

                // Fetch all text nodes from body element
                if (doc) {
                  elements = doc.evaluate("//text()[string-length(normalize-space(.))>0]", doc.body, null, XPathResult.ANY_TYPE, null);
                }

                if (elements && sel)
                {
                  while(currentItem = elements.iterateNext())
                  {
                    // Skip CSS text nodes
                    if(currentItem && currentItem.parentNode &&
                       currentItem.parentNode.tagName != "STYLE")
                    {
                      // Expand selection to first text node and collapse here
                      try
                      {
                        // Sometimes this does not work...
                        sel.extend(currentItem, 0);
                        if (!this.isSelectionCollapsed()) {
                          sel.collapseToStart();
                        }
                      } catch(ex) {}

                      // We have found the correct text node, leave loop here
                      break;
                    }
                  }
                }
              }
            }
          }

          this.__startExamineCursorContext();
        break;

        // For all keys which are able to reposition the cursor start to examine
        // the current cursor context
        case "left":
        case "right":
        case "down":
        case "pageup":
        case "pagedown":
        case "delete":
        case "end":
        case "backspace":
          this.__startExamineCursorContext();
        break;

        // Special shortcuts
        case "b":
          if (isCtrlPressed) {
            this.__executeHotkey('bold', true);
          }
        break;

        case "i":
        case "k":
          if (isCtrlPressed) {
            this.__executeHotkey('italic', true);
          }
        break;

        case "u":
          if (isCtrlPressed) {
            this.__executeHotkey('underline', true);
          }
        break;

        case "z":
          if (isCtrlPressed && !isShiftPressed) {
            this.__executeHotkey('undo', true);
          }
          else if (isCtrlPressed && isShiftPressed)
          {
            this.__executeHotkey('redo', true);
          }
        break;

        case "y":
          if (isCtrlPressed) {
            this.__executeHotkey('redo', true);
          }
          break;

        case "a":
          // Select the whole content if "Ctrl+A" was pressed
          //
          // NOTE: this code is NOT executed for mshtml and webkit. To get to
          // know if "Ctrl+A" is pressed in mshtml/webkit one need to check
          // this within the "keyUp" event. This info is not available
          // within the "keyPress" event in mshtml/webkit.
          if (isCtrlPressed) {
            this.selectAll();
          }
        break;

       }

       this.__currentEvent = null;
    },


    /**
     * Executes a method and prevent default
     *
     * @param hotkeyIdentifier {String} hotkey identifier for lookup
     * @param preventDefault {Boolean} whether do preventDefault or not
     */
    __executeHotkey : function (hotkeyIdentifier, preventDefault)
    {
      var method = null;
      var hotkeyInfo = qx.bom.htmlarea.HtmlArea.hotkeyInfo;
      if (hotkeyInfo[hotkeyIdentifier]) {
        method = hotkeyInfo[hotkeyIdentifier].method;
      }

      if (method != null && this[method])
      {
        this[method]();

        if (preventDefault)
        {
          this.__currentEvent.preventDefault();
          this.__currentEvent.stopPropagation();
        }

        if (this.isSelectionCollapsed()) {
          this.__fireCursorContextOnNextInput = true;
        }

        // Whenever a hotkey is pressed update the current cursorContext
        // Since this examination is done within a timeout we can be sure
        // the execution is performed before we're looking at the cursor context.
        this.__startExamineCursorContext();
      }
    },


    /**
     * Eventlistener for focus events
     *
     * @param e {Object} Event object
     */
    _handleFocusEvent : function(e)
    {
      this.__storedSelectedHtml = null;

      if (
        qx.core.Environment.get("engine.name") == "gecko" ||
        qx.core.Environment.get("engine.name") == "webkit"
      ) {
        // Remove element to focus, as the editor is focused for the first time
        // and the element is not needed anymore.
        var elementToFocus = this.getContentDocument().getElementById("__elementToFocus__");
        if (elementToFocus) {
          qx.bom.element.Attribute.reset(elementToFocus, "id");
        }
      }

      this.fireEvent("focused");
    },


    /**
     * Eventlistener for blur events
     *
     * @param e {Object} Event object
     */
    _handleBlurEvent : function(e) {
      this.__value = this.getComputedValue();
    },


    /**
     * Eventlistener for focusout events - dispatched before "blur"
     *
     * @param e {Object} Event object
     */
    _handleFocusOutEvent : function(e)
    {
      this.__controlPressed = false;

      if (this.__storedSelectedHtml == null) {
        this.__storedSelectedHtml = this.getSelectedHtml();
      }

      this.fireEvent("focusOut");
    },


    /**
     * Eventlistener for all mouse events.
     * This method is invoked for mshtml on "click" events and
     * on "mouseup" events for all others.
     *
     * @param e {qx.event.type.Mouse} mouse event instance
     */
    _handleMouseUpOnBody : function(e)
    {
      if ((qx.core.Environment.get("qx.debug")) &&
          qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
        this.debug("handleMouse " + e.getType());
      }
      this.__mouseUpOnBody = true;

      this.__startExamineCursorContext();
    },


    /**
     * Checks if the user has performed a selection and released  the mouse
     * button outside of the editor. If so the body element is re-activated
     * to receive the keypress events correctly.
     *
     * @param e {qx.event.type.Mouse} mouse event instance
     *
     * @signature function(e)
     */
    _handleMouseUpOnDocument : qx.core.Environment.select("engine.name", {
      "mshtml" : (function() {}),

      "default" : function(e)
      {
        if (!this.__mouseUpOnBody) {
          qx.bom.Element.activate(this.getContentBody());
        }
        this.__mouseUpOnBody = false;
      }
    }),


    /**
     * If the property {@link #nativeContextMenu} is set to <code>false</code> this handler method
     * stops the browser from displaying the native context menu and fires an own event for the
     * application developers to position their own (qooxdoo) contextmenu.
     *
     * Fires a data event with the following data:
     *
     *   * x - absolute x coordinate
     *   * y - absolute y coordinate
     *   * relX - relative x coordinate
     *   * relY - relative y coordinate
     *   * target - DOM element target
     *
     * Otherwise the native browser contextmenu is shown as usual.
     *
     * @param e {Object} Event object
     */
    _handleContextMenuEvent : function(e)
    {
      // only fire own "contextmenu" event if the native contextmenu should not be used
      if (!this.getNativeContextMenu())
      {
        var relX = e.getViewportLeft();
        var relY = e.getViewportTop();

        var absX = qx.bom.element.Location.getLeft(this.__widget) + relX;
        var absY = qx.bom.element.Location.getTop(this.__widget) + relY;

        var data = {
          x: absX,
          y: absY,
          relX: relX,
          relY: relY,
          target: e.getTarget()
        };

        e.preventDefault();
        e.stopPropagation();

        qx.event.Timer.once(function() {
          this.fireDataEvent("contextmenu", data);
        }, this, 0);
      }
    },


    /*
    ---------------------------------------------------------------------------
      EXEC-COMMANDS
    ---------------------------------------------------------------------------
    */

    /**
     * Service method to check if the component is already loaded.
     * Overrides the base method.
     *
     * @return {Boolean}
     */
    isLoaded : function () {
      return this.__isLoaded;
    },


    /**
     * Inserts html content on the current selection
     *
     * @param value {String} html content
     * @return {Boolean} Success of operation
     */
    insertHtml : function (value) {
      return this.__commandManager.execute("inserthtml", value);
    },


    /**
     * Removes all formatting styles on the current selection content and resets
     * the font family and size to the default ones. See {@link #defaultFontSize}
     * and {@link #defaultFontFamily}.
     *
     * @return {Boolean} Success of operation
     */
    removeFormat : function()
    {
      var value = this.__commandManager.execute("removeformat");

      // reset the default font size and family
      this.__commandManager.execute("fontsize", this.getDefaultFontSize());
      this.__commandManager.execute("fontfamily", this.getDefaultFontFamily());

      return value;
    },


    /**
     * Sets the current selection content to bold font style
     *
     * @return {Boolean} Success of operation
     */
    setBold : function() {
      return this.__commandManager.execute("bold");
    },


    /**
     * Sets the current selection content to italic font style
     *
     * @return {Boolean} Success of operation
     */
    setItalic : function() {
      return this.__commandManager.execute("italic");
    },


    /**
     * Sets the current selection content to underline font style
     *
     * @return {Boolean} Success of operation
     */
    setUnderline : function() {
      return this.__commandManager.execute("underline");
    },


    /**
     * Sets the current selection content to strikethrough font style
     *
     * @return {Boolean} Success of operation
     *
     */
    setStrikeThrough : function() {
      return this.__commandManager.execute("strikethrough");
    },


    /**
     * Sets the current selection content to the specified font size
     *
     * @param value {Number} Font size
     * @return {Boolean} Success of operation
     */
    setFontSize : function(value) {
      return this.__commandManager.execute("fontsize", value);
    },


    /**
     * Sets the current selection content to the specified font family
     *
     * @param value {String} Font family
     * @return {Boolean} Success of operation
     */
    setFontFamily : function(value) {
      return this.__commandManager.execute("fontfamily", value);
    },


    /**
     * Sets the current selection content to the specified font color
     *
     * @param value {String} Color value (supported are Hex,
     * @return {Boolean} Success of operation
     */
    setTextColor : function(value) {
      return this.__commandManager.execute("textcolor", value);
    },


    /**
     * Sets the current selection content to the specified background color
     *
     * @param value {String} Color value (supported are Hex,
     * @return {Boolean} Success of operation
     */
    setTextBackgroundColor : function(value) {
      return this.__commandManager.execute("textbackgroundcolor", value);
    },


    /**
     * Left-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyLeft : function() {
      return this.__commandManager.execute("justifyleft");
    },


    /**
     * Center-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyCenter : function() {
      return this.__commandManager.execute("justifycenter");
    },


    /**
     * Right-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyRight : function() {
      return this.__commandManager.execute("justifyright");
    },


    /**
     * Full-justifies the current selection
     *
     * @return {Boolean} Success of operation
     */
    setJustifyFull : function() {
      return this.__commandManager.execute("justifyfull");
    },


    /**
     * Indents the current selection
     *
     * @return {Boolean} Success of operation
     */
    insertIndent : function() {
      return this.__commandManager.execute("indent");
    },


    /**
     * Outdents the current selection
     *
     * @return {Boolean} Success of operation
     */
    insertOutdent : function() {
      return this.__commandManager.execute("outdent");
    },


    /**
     * Inserts an ordered list
     *
     * @return {Boolean} Success of operation
     */
    insertOrderedList : function() {
      return this.__commandManager.execute("insertorderedlist");
    },


    /**
     * Inserts an unordered list
     *
     * @return {Boolean} Success of operation
     */
    insertUnorderedList : function() {
      return this.__commandManager.execute("insertunorderedlist");
    },


    /**
     * Inserts a horizontal ruler
     *
     * @return {Boolean} Success of operation
     */
    insertHorizontalRuler : function() {
      return this.__commandManager.execute("inserthorizontalrule");
    },


    /**
     * Insert an image
     *
     * @param attributes {Map} Map of HTML attributes to apply
     * @return {Boolean} Success of operation
     */
    insertImage : function(attributes) {
      return this.__commandManager.execute("insertimage", attributes);
    },


    /**
     * Inserts a hyperlink
     *
     * @param url {String} URL for the image to be inserted
     * @return {Boolean} Success of operation
     */
    insertHyperLink : function(url) {
      return this.__commandManager.execute("inserthyperlink", url);
    },

    /**
     * Alias for setBackgroundColor("transparent");
     *
     * @return {Boolean} if succeeded
     */
    removeBackgroundColor : function () {
      return this.__commandManager.execute("backgroundcolor", "transparent");
    },


    /**
     * Sets the background color of the editor
     *
     * @param value {String} color
     * @return {Boolean} if succeeded
     */
    setBackgroundColor : function (value) {
      return this.__commandManager.execute("backgroundcolor", value);
    },


    /**
     * Alias for setBackgroundImage(null);
     *
     * @return {Boolean} if succeeded
     */
    removeBackgroundImage : function () {
      return this.__commandManager.execute("backgroundimage");
    },


    /**
     * Inserts an background image
     *
     * @param url {String} url of the background image to set
     * @param repeat {String} repeat mode. Possible values are "repeat|repeat-x|repeat-y|no-repeat".
     *                                     Default value is "no-repeat"
     * @param position {String?Array} Position of the background image. Possible values are "|top|bottom|center|left|right|right top|left top|left bottom|right bottom" or
     *                                an array consisting of two values for x and
     *                                y coordinate. Both values have to define the
     *                                unit e.g. "px" or "%".
     *                                Default value is "top"
     * @return {Boolean} Success of operation
     */
    setBackgroundImage : function(url, repeat, position) {
      return this.__commandManager.execute("backgroundimage", [ url, repeat, position ]);
    },


    /**
     * Selects the whole content
     *
     * @return {Boolean} Success of operation
     */
    selectAll : function() {
      return this.__commandManager.execute("selectall");
    },


    /**
     * Undo last operation
     * @return {Boolean} <code>true</code> if the undo command was executed
     * successfully or {@link #useUndoRedo} is inactive
     */
    undo : function()
    {
      if (this.getUseUndoRedo()) {
        return this.__commandManager.execute("undo");
      } else {
        return true;
      }
    },


    /**
     * Redo last undo
     * @return {Boolean} <code>true</code> if the redo command was executed
     * successfully or {@link #useUndoRedo} is inactive
     */
    redo : function()
    {
      if (this.getUseUndoRedo()) {
        return this.__commandManager.execute("redo");
      } else {
        return true;
      }
    },


    /*
    ---------------------------------------------------------------------------
      CONTENT MANIPLUATION
    ---------------------------------------------------------------------------
    */

    /**
     * Resets the content of the editor
     *
     */
    resetHtml : function()
    {
      var doc = this._getIframeDocument();

      // clearing the editor
      while (doc.body.firstChild) {
        doc.body.removeChild(doc.body.firstChild);
      }

      // Gecko needs a p element with a text-node (&nbsp;) to
      // show the caret after clearing out the content. Otherwise
      // the user is able to type ahead but right after the clearing the
      // caret is not visible (-> cursor does not blink)
      if (qx.core.Environment.get("engine.name") == "gecko") {
        doc.body.innerHTML = "<p>&nbsp;</p>";
      }

      // To ensure Webkit is showing a cursor after resetting the
      // content it is necessary to create a new selection and add a range
      else if (qx.core.Environment.get("engine.name") == "webkit")
      {
        var sel = this.getSelection();
        var rng = doc.createRange();

        if (rng && sel) {
          sel.addRange(rng);
        }
      }
    },


    /**
     * Get html content (call own recursive method)
     *
     * @param skipHtmlEncoding {Boolean ? false} whether the html encoding of text nodes should be skipped
     * @return {String} current content of the editor as XHTML
     */
    getHtml : function(skipHtmlEncoding)
    {
      var doc = this._getIframeDocument();

      if (doc == null) {
        return null;
      }

      return qx.bom.htmlarea.HtmlArea.__getHtml(doc.body, false, skipHtmlEncoding, this.getPostProcess());
    },

    /**
     * Helper function to examine if HTMLArea is empty, except for
     * place holder(s) needed by some browsers.
     *
     * @return {Boolean} True, if area is empty - otherwise false.
     */
    containsOnlyPlaceholder : qx.core.Environment.select("engine.name",
    {

      "mshtml" : function()
      {
        var doc = this._getIframeDocument();
        return (doc.body.innerHTML == "<P>&nbsp;</P>");
      },

      "default" : (function() {return false;})
    }),


    /*
      -----------------------------------------------------------------------------
      FOCUS MANAGEMENT
      -----------------------------------------------------------------------------
    */

    /**
     * Convenient function to select an element. The "set" method of qx.bom.Selection is not
     * sufficient here. It does select the element, but does not show the caret.
     *
     * @param element {Element} DOM element to select
     */
    _selectElement : function(element)
    {
      var selection = this.getContentWindow().getSelection();
      var range =  this.getContentDocument().createRange();

      range.setStart(element, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    },


    /**
     * Can be used to set the user focus to the content. Also used when the "TAB" key is used to
     * tab into the component. This method is also called by the {@link qx.ui.embed.HtmlArea} widget.
     *
     * @signature function()
     */
    focusContent : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        var contentDocument = this.getContentDocument();
        var elementToFocus = contentDocument.getElementById("__elementToFocus__");

        this.getContentWindow().focus();
        qx.bom.Element.focus(this.getContentBody());

        if (elementToFocus) {
          this._selectElement(elementToFocus);
        } else {
          this.__checkForContentAndSetDefaultContent();
        }
      },

      "webkit" : function()
      {
        qx.bom.Element.focus(this.getContentWindow());
        qx.bom.Element.focus(this.getContentBody());

        var elementToFocus = this.getContentDocument().getElementById("__elementToFocus__");
        if (elementToFocus) {
          qx.bom.element.Attribute.reset(elementToFocus, "id");
        }

        this.__checkForContentAndSetDefaultContent();
      },

      "opera" : function()
      {
        qx.bom.Element.focus(this.getContentWindow());
        qx.bom.Element.focus(this.getContentBody());

        this.__checkForContentAndSetDefaultContent();
      },

      "default" : function()
      {
        qx.bom.Element.focus(this.getContentBody());

        this.__checkForContentAndSetDefaultContent();
      }
    }),


    /**
     * Helper method which checks if content is available and if not sets the default content.
     */
    __checkForContentAndSetDefaultContent : function()
    {
      if (!this.__isContentAvailable()) {
        this.__resetToDefaultContentAndSelect();
      }
    },


    /**
     * Checks whether content is available
     *
     * @signature function()
     */
    __isContentAvailable : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        // important to check for all childNodes (text nodes inclusive) rather than only check for
        // child element nodes
        var childs = this.getContentBody().childNodes;

        if (childs.length == 0) {
          return false;
        } else if (childs.length == 1) {
          // consider a BR element with "_moz_dirty" attribute as empty content
          return !(childs[0] && qx.dom.Node.isNodeName(childs[0], "br") &&
                   qx.bom.element.Attribute.get(childs[0], "_moz_dirty") != null);
        } else {
          return true;
        }
      },

      "webkit" : function()
      {
        // important to check for all childNodes (text nodes inclusive) rather than only check for
        // child element nodes
        var childs = this.getContentBody().childNodes;

        if (childs.length == 0) {
          return false;
        } else if (childs.length == 1) {
          // consider a solely BR element as empty content
          return !(childs[0] && qx.dom.Node.isNodeName(childs[0], "br"));
        } else {
          return true;
        }
      },

      "default" : function()
      {
        // important to check for all childNodes (text nodes inclusive) rather than only check for
        // child element nodes
        var childs = this.getContentBody().childNodes;

        if (childs.length == 0) {
          return false;
        } else if (childs.length == 1) {
          return !(childs[0] && qx.dom.Node.isNodeName(childs[0], "p") &&
                   childs[0].firstChild == null);
        } else {
          return true;
        }
      }
    }),


    /**
     * Resets the content and selects the default focus node
     *
     * @signature function()
     */
    __resetToDefaultContentAndSelect : qx.core.Environment.select("engine.name",
    {
      "gecko|webkit" : function()
      {
        this.getContentDocument().body.innerHTML = this.__generateDefaultContent("");

        var elementToFocus = this.getContentDocument().getElementById("__elementToFocus__");
        qx.bom.element.Attribute.reset(elementToFocus, "id");
        this._selectElement(elementToFocus);
      },

      "default" : function()
      {
        var firstParagraph = qx.dom.Hierarchy.getFirstDescendant(this.getContentBody());

        if (qx.dom.Node.isNodeName(firstParagraph, "p"))
        {
          qx.bom.element.Style.set(firstParagraph, "font-family", this.getDefaultFontFamily());
          qx.bom.element.Style.set(firstParagraph, "font-size", this.getDefaultFontSize());
        }
      }
    }),



    /*
      -----------------------------------------------------------------------------
      PROCESS CURSOR CONTEXT
      -----------------------------------------------------------------------------
    */


    /**
     * Returns the information about the current context (focusNode). It's a
     * map with information about "bold", "italic", "underline", etc.
     *
     * @return {Map} formatting information about the focusNode
     */
    getContextInformation : function() {
      return this.__examineCursorContext();
    },

    /**
     * Wrapper method to examine the current context
     *
     */
    __startExamineCursorContext : function()
    {
      // setting a timeout is important to get the right result */
      qx.event.Timer.once(function(e) {
        var contextInfo = this.__examineCursorContext();
        this.fireDataEvent("cursorContext", contextInfo);
      }, this, 200);
    },


    /**
     * Examines the current context of the cursor (e.g. over bold text).
     * This method will dispatch the data event "cursorContext" which holds a map
     * with different keys like bold, italic, underline etc.
     * The main purpose for this event is to be able to set the states of your toolbar
     * buttons so you can e.g. visualize that the cursor is currently over bold text.
     *
     * The possible values are
     * -1 = command is not possible at the moment. Used to disable the corresponding buttons
     *  0 = command is possible at the moment. Used to enable the corresponding buttons (e.g. bold/italic/underline etc.)
     *  1 = cursor is over content which already received that command. Used to to activate the corresponding buttons (e.g. bold/italic/underline etc.)
     *
     * @lint ignoreDeprecated(_processingExamineCursorContext)
     * @return {Map?null} A map with the current styles and their value or null if no focus node is available
     */
    __examineCursorContext : function()
    {
      if (this._processingExamineCursorContext || this.getEditable() == false) {
        return null;
      }
      this._processingExamineCursorContext = true;

      if (!this.__isContentAvailable()) {
        this.__resetToDefaultContentAndSelect();
      }

      var focusNode = this.getFocusNode();
      if (focusNode == null) {
        return null;
      }

      if (qx.dom.Node.isText(focusNode)) {
        focusNode = focusNode.parentNode;
      }

      var doc = this._getIframeDocument();
      var focusNodeStyle = (qx.core.Environment.get("engine.name") == "mshtml") ?
                           focusNode.currentStyle :
                           doc.defaultView.getComputedStyle(focusNode, null);

      var isBold = false;
      var isItalic = false;
      var isUnderline = false;
      var isStrikeThrough = false;

      var unorderedList = false;
      var orderedList = false;

      var justifyLeft = false;
      var justifyCenter = false;
      var justifyRight = false;
      var justifyFull = false;

      var fontSize = null;
      var computedFontSize = null;
      var fontFamily = null;

      if (focusNodeStyle != null)
      {
        if ((qx.core.Environment.get("engine.name") == "mshtml"))
        {
          isItalic = focusNodeStyle.fontStyle == "italic";
          isUnderline = focusNodeStyle.textDecoration.indexOf("underline") !== -1;
          isStrikeThrough = focusNodeStyle.textDecoration.indexOf("line-through") !== -1;

          fontSize = focusNodeStyle.fontSize;
          fontFamily = focusNodeStyle.fontFamily;

          justifyLeft = focusNodeStyle.textAlign == "left";
          justifyCenter = focusNodeStyle.textAlign == "center";
          justifyRight = focusNodeStyle.textAlign == "right";
          justifyFull = focusNodeStyle.textAlign == "justify";
        }
        else
        {
          isItalic = focusNodeStyle.getPropertyValue("font-style") == "italic";
          isUnderline = focusNodeStyle.getPropertyValue("text-decoration").indexOf("underline") !== -1;
          isStrikeThrough = focusNodeStyle.getPropertyValue("text-decoration").indexOf("line-through") !== -1;

          fontSize = focusNodeStyle.getPropertyValue("font-size");
          fontFamily = focusNodeStyle.getPropertyValue("font-family");

          justifyLeft = focusNodeStyle.getPropertyValue("text-align") == "left";
          justifyCenter = focusNodeStyle.getPropertyValue("text-align") == "center";
          justifyRight = focusNodeStyle.getPropertyValue("text-align") == "right";
          justifyFull = focusNodeStyle.getPropertyValue("text-align") == "justify";
        }

        if (
          qx.core.Environment.get("engine.name") == "mshtml" ||
          qx.core.Environment.get("engine.name") == "opera"
        ) {
          isBold = focusNodeStyle.fontWeight == 700;
        } else {
          isBold = focusNodeStyle.getPropertyValue("font-weight") == "bold" ||
                   qx.dom.Node.isNodeName(focusNode, "b");
        }
      }

      // Traverse the DOM to get the result, instead of using the CSS-Properties.
      // In this case the CSS-Properties are not useful, e.g. Gecko always reports
      // "disc" for "list-style-type" even if it is normal text. ("disc" is the
      // initial value)
      // Traverse the DOM upwards to determine if the focusNode is inside an
      // ordered/unordered list
      var node = focusNode;

      // only traverse the DOM upwards if were are not already within the body
      // element or at the top of the document
      if (node != null && node.parentNode != null &&
          !qx.dom.Node.isDocument(node.parentNode))
      {
        while (node != null && !qx.dom.Node.isNodeName(node, "body"))
        {
          var nodename = qx.dom.Node.getName(node);

          if (nodename == "ol")
          {
            orderedList = true;
            break;
          }
          else if (nodename == "ul")
          {
            unorderedList = true;
            break;
          }

          if (computedFontSize == null || computedFontSize == "") {
            computedFontSize = qx.bom.element.Attribute.get(node, 'size');
          }

          node = node.parentNode;
        }
      }

      var eventMap = {
        bold : isBold ? 1 : 0,
        italic : isItalic ? 1 : 0,
        underline : isUnderline ? 1 : 0,
        strikethrough : isStrikeThrough ? 1 : 0,
        fontSize : (computedFontSize == null) ? fontSize : computedFontSize,
        fontFamily : fontFamily,
        insertUnorderedList : unorderedList ? 1 : 0,
        insertOrderedList : orderedList ? 1 : 0,
        justifyLeft : justifyLeft ? 1 : 0,
        justifyCenter : justifyCenter ? 1 : 0,
        justifyRight : justifyRight ? 1 : 0,
        justifyFull : justifyFull ? 1 : 0
      };

      this._processingExamineCursorContext = false;

      return eventMap;
    },



    /*
     -----------------------------------------------------------------------------
     SELECTION
     -----------------------------------------------------------------------------
    */

    /**
     * Returns the current selection object
     *
     * @return {Selection} Selection object
    */
    getSelection : qx.core.Environment.select("engine.name",
    {
       "mshtml" : function() {
         return this._getIframeDocument() ? this._getIframeDocument().selection : null;
       },

       "default" : function() {
         return this._getIframeWindow() ? this._getIframeWindow().getSelection() : null;
       }
    }),


    /**
     * Helper method to check if the selection is collapsed
     *
     * @return {Boolean} collapsed status of selection
     */
    isSelectionCollapsed : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function() {
        return this.getSelection() && this.getSelection().type == "None";
      },

      "default": function() {
        return this.getSelection() && this.getSelection().isCollapsed;
      }
    }),


    /**
     * Returns the currently selected text.
     *
     * @return {String} Selected plain text.
     */
    getSelectedText : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function() {
        return this.getRange() ? this.getRange().text : "";
      },

      "default" : function() {
        return this.getRange() ? this.getRange().toString() : "";
      }
    }),


    /**
     * Returns the content of the actual range as text
     *
     * @TODO: need to be implemented correctly
     * @return {String} selected text
     */
    getSelectedHtml : function()
    {
      // if a selection is stored, return it.
      if (this.__storedSelectedHtml != null) {
        return this.__storedSelectedHtml;
      }

      var range = this.getRange();

      if (!range) {
        return "";
      } else {
        return this.__getRangeContents(range);
      }
    },


    /**
     * Browser-specific implementation to get the current range contents
     *
     * @param range {Range} Native range object
     *
     * @signature function(range)
     * @return {String} range contents
     */
    __getRangeContents : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(range)
      {
        if (!range) {
          return "";
        }

        return range.item ? range.item(0).outerHTML : range.htmlText;
      },

      "default" : function(range)
      {
        var doc = this._getIframeDocument();

        if (doc && range)
        {
          try
          {
            var tmpBody = doc.createElement("body");
            tmpBody.appendChild(range.cloneContents());

            return tmpBody.innerHTML;
          }
          catch (exc)
          {
            // [BUG #3142]
            // ignore this exception: NOT_FOUND_ERR: DOM Exception 8
          }

          return range + "";
        }

        return "";
      }
    }),



    /**
     * Clears the current selection
     *
     */
    clearSelection : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function()
      {
        var sel = this.getSelection();

        if (sel) {
          sel.empty();
        }
      },

      "default" : function()
      {
        var sel = this.getSelection();

        if (sel) {
          sel.collapseToStart();
        }
      }
    }),


    /**
     * Checks if the cursor is within a word boundary.
     * ATTENTION: Currently only implemented for Gecko
     *
     * @signature function()
     * @return {Boolean} within word boundary
     */
    __isSelectionWithinWordBoundary : qx.core.Environment.select("engine.name", {
      "gecko" : function()
      {
        var sel = this.getSelection();
        var focusNode = this.getFocusNode();

        // check if the caret is within a word
        return sel && this.isSelectionCollapsed() && focusNode != null &&
               qx.dom.Node.isText(focusNode) && sel.anchorOffset < focusNode.length;
      },

      "default" : function() {
        return false;
      }
    }),


    /**
     * Check the selection focus node if it's an element.
     * Used a paragraph handling - if the focus node is an
     * element it's not necessary to intercept the paragraph handling.
     *
     * ATTENTION: Currently only implemented for Gecko
     *
     * @signature function()
     * @return {Boolean} selection focus node
     */
    __isFocusNodeAnElement : qx.core.Environment.select("engine.name", {
      "gecko" : function() {
        return qx.dom.Node.isElement(this.getFocusNode());
      },

      "default" : function() {
        return false;
      }
    }),


    /*
     -----------------------------------------------------------------------------
     TEXT RANGE
     -----------------------------------------------------------------------------
    */

    /**
     * Returns the range of the current selection
     *
     * @return {Range?null} Range object or null
     */
    getRange : function() {
      return this.__createRange(this.getSelection());
    },


    /**
     * Returns a range for the current selection
     *
     * @param sel {Selection} current selection object
     *
     * @signature function(sel)
     * @return {Range?null} Range object or null if the document is not available
     */
    __createRange : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(sel)
      {
        var doc = this._getIframeDocument();

        if (sel)
        {
          try {
            return sel.createRange();
          } catch(ex) {
            return doc ? doc.body.createTextRange() : null;
          }
        } else {
          return doc ? doc.body.createTextRange() : null;
        }
       },

       "default" : function(sel)
       {
         var doc = this._getIframeDocument();

         if (sel)
         {
           try {
             return sel.getRangeAt(0);
           } catch(ex) {
             return doc ? doc.createRange() : null;
           }
         } else {
           return doc ? doc.createRange() : null;
         }
       }
    }),


    /**
     * Saves the current range to let the next command operate on this range.
     * Currently only interesting for IE browsers, since they loose the range /
     * selection whenever an element is clicked which need to have a focus (e.g.
     * a textfield widget).
     *
     * *NOTE:* the next executed command will reset this range.
     *
     * @signature function()
     */
    saveRange : qx.core.Environment.select("engine.name", {
      "mshtml" : function() {
        this.__savedRange = this.getRange();
      },

      "default" : function() {}
    }),


    /**
     * Returns the current stored range.
     *
     * @signature function()
     * @return {Range|null} range object or null
     */
    getSavedRange : qx.core.Environment.select("engine.name", {
      "mshtml" : function() {
        return this.__savedRange;
      },

      "default" : function() {}
    }),


    /**
     * Resets the current saved range.
     *
     * @signature function()
     */
    resetSavedRange : qx.core.Environment.select("engine.name", {
      "mshtml" : function() {
        this.__savedRange = null;
      },

      "default" : function() {}
    }),


    /*
      -----------------------------------------------------------------------------
      NODES
      -----------------------------------------------------------------------------
    */
    /**
     * Returns the node where the selection ends
     *
     * @signature function()
     * @return {Element?null} Focus node or null if no range is available
     */
    getFocusNode : qx.core.Environment.select("engine.name",
    {
       "mshtml" : function()
       {
         var sel = this.getSelection();
         var rng;

         switch(sel.type)
         {
           case "Text":
           case "None":
             // It seems that even for selection of type "None",
             // there _is_ a correct parent element
             rng = this.__createRange(sel);

             if (rng)
             {
               rng.collapse(false);
               return rng.parentElement();
             } else {
               return null;
             }
           break;

           case "Control":
             rng = this.__createRange(sel);

             if (rng)
             {
               try {
                 rng.collapse(false);
               } catch(ex) {}

               return rng.item(0);
             } else {
               return null;
             }
           break;

           default:
             return this._getIframeDocument().body;
         }
       },

       "default" : function()
       {
         var sel = this.getSelection();

         if (sel && sel.focusNode) {
           return sel.focusNode;
         }

         return this._getIframeDocument().body;
       }
    })
  },


  environment : {
    "qx.bom.htmlarea.HtmlArea.debug" : false
  },


  /*
  ---------------------------------------------------------------------------
    DESTRUCTOR
  ---------------------------------------------------------------------------
  */

  /**
   * Destructor
   *
   */
  destruct : function()
  {
    try
    {
      var doc = this._getIframeDocument();
      var Registration = qx.event.Registration;

      Registration.removeListener(doc.body, "keypress", this._handleKeyPress, this);
      Registration.removeListener(doc.body, "keyup", this._handleKeyUp, this);
      Registration.removeListener(doc.body, "keydown", this._handleKeyDown, this);

      var focusBlurTarget = qx.core.Environment.get("engine.name") == "webkit"
        ? this._getIframeWindow() : doc.body;
      Registration.removeListener(focusBlurTarget, "focus", this._handleFocusEvent);
      Registration.removeListener(focusBlurTarget, "blur",  this._handleBlurEvent);
      Registration.removeListener(doc, "focusout", this._handleFocusOutEvent);

      var mouseEventName = qx.core.Environment.get("engine.name") == "mshtml" ?
         "click" : "mouseup";
      Registration.removeListener(doc.body, mouseEventName, this._handleMouseUpOnBody, this);
      Registration.removeListener(doc.documentElement, mouseEventName, this._handleMouseUpOnDocument, this);
      Registration.removeListener(doc.documentElement, "contextmenu", this._handleContextMenuEvent, this);

      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        // Force unload of the iframe. Unload event is not fired when htmlarea is disposed.
        // Needed to dispose event manager (which is reg. on the unload event of the iframe) + to fix "no typing in text fields possible, when editor
        // has the focus and gets disposed when hidden".
        qx.bom.Iframe.setSource(this.__iframe, "about:blank");
      }
    } catch (ex) {};

    if (this.__commandManager instanceof qx.core.Object) {
      this._disposeObjects("__commandManager");
    } else {
      this.__commandManager = null;
    }


    this.__documentSkeletonParts =  this.__iframe = this.__widget = this.__stackCommandManager = null;
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
 * This handler provides a "load" event for iframes
 */
qx.Class.define("qx.event.handler.Iframe",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL,

    /** {Map} Supported event types */
    SUPPORTED_TYPES : {
      load: 1,
      navigate: 1
    },

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_DOMNODE,

    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : false,

    /**
     * Internal function called by iframes created using {@link qx.bom.Iframe}.
     *
     * @signature function(target)
     * @internal
     * @param target {Element} DOM element which is the target of this event
     */
    onevent : qx.event.GlobalError.observeMethod(function(target) {

      // Fire navigate event when actual URL diverges from stored URL
      var currentUrl = qx.bom.Iframe.queryCurrentUrl(target);

      if (currentUrl !== target.$$url) {
        qx.event.Registration.fireEvent(target, "navigate", qx.event.type.Data, [currentUrl]);
        target.$$url = currentUrl;
      }

      // Always fire load event
      qx.event.Registration.fireEvent(target, "load");
    })
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
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {
      return target.tagName.toLowerCase() === "iframe"
    },


    // interface implementation
    registerEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    }


  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
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
     * Christian Hagendorn (Chris_schmidt)

************************************************************************ */

/* ************************************************************************

#require(qx.event.handler.Iframe)

************************************************************************ */

/**
 * Cross browser abstractions to work with iframes.
 */
qx.Class.define("qx.bom.Iframe",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {Map} Default attributes for creation {@link #create}.
     */
    DEFAULT_ATTRIBUTES :
    {
      onload : "qx.event.handler.Iframe.onevent(this)",
      frameBorder: 0,
      frameSpacing: 0,
      marginWidth: 0,
      marginHeight: 0,
      hspace: 0,
      vspace: 0,
      border: 0,
      allowTransparency: true
    },

    /**
     * Creates an DOM element.
     *
     * Attributes may be given directly with this call. This is critical
     * for some attributes e.g. name, type, ... in many clients.
     *
     * @param attributes {Map?null} Map of attributes to apply
     * @param win {Window?null} Window to create the element for
     * @return {Element} The created iframe node
     */
    create : function(attributes, win)
    {
      // Work on a copy to not modify given attributes map
      var attributes = attributes ? qx.lang.Object.clone(attributes) : {};
      var initValues = qx.bom.Iframe.DEFAULT_ATTRIBUTES;

      for (var key in initValues)
      {
        if (attributes[key] == null) {
          attributes[key] = initValues[key];
        }
      }

      return qx.dom.Element.create("iframe", attributes, win);
    },


    /**
     * Get the DOM window object of an iframe.
     *
     * @param iframe {Element} DOM element of the iframe.
     * @return {Window?null} The DOM window object of the iframe or null.
     * @signature function(iframe)
     */
    getWindow : function(iframe)
    {
      try {
        return iframe.contentWindow;
      } catch(ex) {
        return null;
      }
    },


    /**
     * Get the DOM document object of an iframe.
     *
     * @param iframe {Element} DOM element of the iframe.
     * @return {Document} The DOM document object of the iframe.
     */
    getDocument : function(iframe)
    {
      if ("contentDocument" in iframe) {
        try {
          return iframe.contentDocument;
        } catch(ex) {
          return null;
        }
      }

      try {
        var win = this.getWindow(iframe);
        return win ? win.document : null;
      } catch(ex) {
        return null;
      }
    },


    /**
     * Get the HTML body element of the iframe.
     *
     * @param iframe {Element} DOM element of the iframe.
     * @return {Element} The DOM node of the <code>body</code> element of the iframe.
     */
    getBody : function(iframe)
    {
      try
      {
        var doc = this.getDocument(iframe);
        return doc ? doc.getElementsByTagName("body")[0] : null;
      }
      catch(ex)
      {
        return null
      }
    },


    /**
     * Sets iframe's source attribute to given value
     *
     * @param iframe {Element} DOM element of the iframe.
     * @param source {String} URL to be set.
     * @signature function(iframe, source)
     */
    setSource : function(iframe, source)
    {
      try
      {
        // the guru says ...
        // it is better to use 'replace' than 'src'-attribute, since 'replace'
        // does not interfere with the history (which is taken care of by the
        // history manager), but there has to be a loaded document
        if (this.getWindow(iframe) && qx.dom.Hierarchy.isRendered(iframe))
        {
          /*
            Some gecko users might have an exception here:
            Exception... "Component returned failure code: 0x805e000a
            [nsIDOMLocation.replace]"  nsresult: "0x805e000a (<unknown>)"
          */
          try
          {
            // Webkit on Mac can't set the source when the iframe is still
            // loading its current page
            if ((qx.core.Environment.get("engine.name") == "webkit") &&
                qx.core.Environment.get("os.name") == "osx")
            {
              var contentWindow = this.getWindow(iframe);
              if (contentWindow) {
                contentWindow.stop();
              }
            }
            this.getWindow(iframe).location.replace(source);
          }
          catch(ex)
          {
            iframe.src = source;
          }
        }
        else
        {
          iframe.src = source;
        }

      // This is a programmer provided source. Remember URL for this source
      // for later comparison with current URL. The current URL can diverge
      // if the end-user navigates in the Iframe.
      this.__rememberUrl(iframe);

      }
      catch(ex) {
        qx.log.Logger.warn("Iframe source could not be set!");
      }
    },


    /**
     * Returns the current (served) URL inside the iframe
     *
     * @param iframe {Element} DOM element of the iframe.
     * @return {String} Returns the location href or null (if a query is not possible/allowed)
     */
    queryCurrentUrl : function(iframe)
    {
      var doc = this.getDocument(iframe);

      try
      {
        if (doc && doc.location) {
          return doc.location.href;
        }
      }
      catch(ex) {};

      return "";
    },


    /**
    * Remember actual URL of iframe.
    *
    * @param iframe {Element} DOM element of the iframe.
    */
    __rememberUrl: function(iframe)
    {

      // URL can only be detected after load. Retrieve and store URL once.
      var callback = function() {
        qx.bom.Event.removeNativeListener(iframe, "load", callback);
        iframe.$$url = qx.bom.Iframe.queryCurrentUrl(iframe);
      }

      qx.bom.Event.addNativeListener(iframe, "load", callback);
    }

  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Available commands for the HtmlArea component
 *
 */
qx.Class.define("qx.bom.htmlarea.manager.Command",
{
  extend : qx.core.Object,

  /**
   * Constructor
   *
   * @param editorInstance {qx.bom.htmlarea.HtmlArea} editor instance
   */
  construct : function(editorInstance)
  {
    this.base(arguments);

    this.__editorInstance = editorInstance;
    this.__doc            = null;

    this._commands       = null;
    this.__populateCommandList();

    // When executing these commands, IE 6 sometimes selects the last <span> tag
    // completly by mistake. It is necessary to check if the range is still
    // collapsed after executing one of these commands.
    this.__invalidFocusCommands =
    {
      "Bold"          : true,
      "Italic"        : true,
      "Underline"     : true,
      "StrikeThrough" : true
    };

    /**
     * Computed pixel sizes for values size attribute in <font> tag
     */
    this.__fontSizeNames = [ 10, 12, 16, 18, 24, 32, 48 ];

    // In Gecko-browser hyperlinks which are based on *collapsed* selection are
    // inserted as DOM nodes. To keep track of these nodes they are equipped
    // with an unique id (-> "qx_link" + __hyperLinkId)
    this.__hyperLinkId = 0;
  },

  statics :
  {
    /**
     * Possible values for the style property background-position
     */
    __backgroundPosition : "|top|bottom|center|left|right|right top|left top|left bottom|right bottom|",

    /**
     * Possible values for the style property background-repeat
     */
    __backgroundRepeat : "repeat repeat-x repeat-y no-repeat"

  },

  members :
  {
    __doc : null,
    __editorInstance : null,
    __startTyping : false,
    __invalidFocusCommands : null,
    __fontSizeNames : null,
    __hyperLinkId : null,


    /* ****************************************************************
     *                BASIC / INITIALISATION
     * **************************************************************** */

    /**
     * Set the contentDocument on which this manager should execute
     * his commands
     *
     * @param doc {Object} contentDocument of the editor instance
     */
    setContentDocument : function(doc) {
      this.__doc = doc;
    },


    /* ****************************************************************
     *                  COMMAND PROCESSING
     * **************************************************************** */

    /**
     * Returns the commandobject of the given command name
     *
     * @param commandName {String} name of the command
     * @return {Object ? null} commandObject or null if no command is available for the given command name
     */
    getCommandObject : function(commandName)
    {
      if (this._commands[commandName]) {
        return this._commands[commandName];
      } else {
        return null;
      }
    },

    /**
     * Populate the internal "commands" object with the available commands and their settings.
     *
     */
    __populateCommandList : function()
    {
      this._commands =
      {
        bold                  : { useBuiltin : false, identifier : "Bold", method : "__setBold" },
        italic                : { useBuiltin : false, identifier : "Italic", method : "__setItalic" },
        underline             : { useBuiltin : false, identifier : "Underline", method : "__setUnderline" },
        strikethrough         : { useBuiltin : false, identifier : "StrikeThrough", method : "__setStrikeThrough" },
        fontfamily            : { useBuiltin : true, identifier : "FontName", method : null },
        fontsize              : { useBuiltin : false, identifier : "FontSize", method : "__setFontSize" },

        textcolor             : { useBuiltin : true, identifier : "ForeColor", method : null },
        textbackgroundcolor   : { useBuiltin : false, identifier : null, method : "__setTextBackgroundColor" },

        backgroundcolor       : { useBuiltin : false, identifier : null, method : "__setBackgroundColor" },
        backgroundimage       : { useBuiltin : false, identifier : null, method : "__setBackgroundImage" },

        justifyleft           : { useBuiltin : false, identifier : "JustifyLeft", method : "__setTextAlign" },
        justifyright          : { useBuiltin : false, identifier : "JustifyRight", method : "__setTextAlign" },
        justifycenter         : { useBuiltin : false, identifier : "JustifyCenter", method : "__setTextAlign" },
        justifyfull           : { useBuiltin : false, identifier : "JustifyFull", method : "__setTextAlign" },

        indent                : { useBuiltin : true, identifier : "Indent", method : null },
        outdent               : { useBuiltin : true, identifier : "Outdent", method : null },

        copy                  : { useBuiltin : true, identifier : "Copy", method : null },
        cut                   : { useBuiltin : true, identifier : "Cut", method : null },
        paste                 : { useBuiltin : true, identifier : "Paste", method : null },

        insertorderedlist     : { useBuiltin : false, identifier : "InsertOrderedList", method : "__insertList" },
        insertunorderedlist   : { useBuiltin : false, identifier : "InsertUnorderedList", method : "__insertList" },

        inserthorizontalrule  : { useBuiltin : false, identifier : "InsertHtml", method : "__insertHr" },
        insertimage           : { useBuiltin : false, identifier : "InsertImage", method : "__insertImage" },

        inserthyperlink       : { useBuiltin : false, identifier : "CreateLink", method : "__insertHyperLink" },

        selectall             : { useBuiltin : false, identifier : "SelectAll", method : "__selectAll" },
        selectedtext          : { useBuiltin : false, identifier : null, method : "__getSelectedText" },
        selectedhtml          : { useBuiltin : false, identifier : null, method : "__getSelectedHtml" },

        inserthtml            : { useBuiltin : false, identifier : "InsertHtml", method : "__insertHtml" },
        resethtml             : { useBuiltin : false, identifier : null, method : "__resetHtml" },
        gethtml               : { useBuiltin : false, identifier : null, method : "__getHtml" },
        removeformat          : { useBuiltin : true, identifier : "RemoveFormat", method : null }
      }
    },


    /**
     * Executes the given command
     *
     * @param command {String} Command to execute
     * @param value {String|Integer?null} Value of the command (if any)
     * @return {Boolean} Result of operation
     */
    execute : function(command, value)
    {
      if (!this.__editorInstance.isReady())
      {
        this.error("editor not ready! '"+command+"':'"+value+"'");
        return false;
      }

      // Normalize
      command = command.toLowerCase();
      value   = value != null ? value : null;

      // Check if the given command is supported
      if (this._commands[command])
      {
        var result;
        var commandObject = this._commands[command];

        // We have to make sure that the elements inside the selection are
        // inside a paragraph before executing a command. Otherwise executing
        // commands will cause problems for our paragraph handling.
        //
        // EXCEPTION: this interferes with webkit browsers at indent/outdent.
        if (!((qx.core.Environment.get("engine.name") == "webkit") &&
          (command == "indent" || command == "outdent")))
        {
          if (this.__paragraphMissing()) {
            this.__insertHelperParagraph();
          }
        }

        // Pass all useBuiltin commands right to the browser
        if (commandObject.useBuiltin) {
          result = this.__executeCommand(commandObject.identifier, false, value);
        }
        else
        {
          // Call the specialized method
          if (commandObject.method != null && this[commandObject.method]) {
            result = this[commandObject.method].call(this, value, commandObject);
          }
          else {
            this.error("The method '"+ commandObject.method +"' you calling to execute the command '"+ command +"' is not available!");
          }
        }

        this.__editorInstance.resetSavedRange();
        return result;
      }
      else {
        this.error("Command " + command + " is currently not supported!");
      }
    },


    /**
     * Checks if the focus node is not inside a paragraph tag.
     *
     * @return {Boolean} True if no paragraph is found, otherwise false.
     */
    __paragraphMissing : function()
    {
      var Node = qx.dom.Node;
      var focusNode = this.__editorInstance.getFocusNode();
      var insideBlockElement = false;
      var bodyIsFocusNode = false;

      if (focusNode)
      {
        if (Node.isText(focusNode))
        {
          var parents = qx.dom.Hierarchy.getAncestors(focusNode);

          for(var i=0, j=parents.length; i<j; i++)
          {
            if (Node.isNodeName(parents[i], "p") || qx.bom.htmlarea.HtmlArea.isHeadlineNode(parents[i]))
            {
              insideBlockElement = true;
              break;
            }
          }
        }
        else if (Node.isNodeName(focusNode, "body")) {
          bodyIsFocusNode = true;
        }
      }

      return bodyIsFocusNode || !insideBlockElement;
    },


    /**
     * Inserts a paragraph tag around selection or at the insert point
     * using executeCommand.
     *
     */
    __insertHelperParagraph : function() {
      this.__executeCommand("formatBlock", false, "p");
    },


    /**
     * Internal method to deal with special cases when executing commands
     *
     * @param command {String} command to execute
     * @param ui {Boolean} Whether to show an ui when executing a command. Default is false.
     * @param value {String|Integer|null} value of the command
     * @return {Boolean} Success of operation
     */
    __executeCommand : function(command, ui, value)
    {
      try
      {
        // The document object is the default target for all execCommands
        var execCommandTarget = this.__doc;

        // Flag indicating if range was empty before executing command. Needed for IE bug.
        var emptyRange = false;

        var range = this.__editorInstance.getRange();

        // Body element must have focus before executing command
        this.__doc.body.focus();

        // IE looses the selection if the user clicks on any other element e.g.
        // a toolbar item. To manipulate the selected text correctly IE has to
        // execute the command on the previously saved Text Range object rather
        // than the document object.
        //
        // Ignore the "SelectAll" command otherwise the range handling would
        // interfere with it.
        if ((qx.core.Environment.get("engine.name") == "mshtml"))
        {
          if(command != "selectall")
          {
            // Select the content of the Text Range object to set the cursor at the right position
            // and to give user feedback. Otherwise IE will set the cursor at the first position of the
            // editor area
            range.select();

            // If the saved Text Range object contains no text collapse it and
            // execute the command at the document object or selected range is
            // a control range with an image inside.
            if(((range.text) && (range.text.length > 0)) ||
               ((range.length == 1) && (range.item(0)) && (range.item(0).tagName == "IMG"))) {
              execCommandTarget = range;
            } else {
              execCommandTarget = this.__doc;
            }

          }

          // IE has the unwanted behavior to select text after executing some commands
          // (see this.__invalidFocusCommands).
          // If this happens, we have to collapse the range afterwards.
          if( ((qx.core.Environment.get("engine.name") == "mshtml")) && (this.__invalidFocusCommands[command]) )
          {
            if (range.text == "") {
              emptyRange = true;
            }
          }

        }

        var result = execCommandTarget.execCommand(command, ui, value);

        if (emptyRange && range.text != "") {
          range.collapse();
        }

        if ((qx.core.Environment.get("qx.debug")) &&
            qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
          this.debug("execCommand " + command + " with value " + value + " succeded");
        }

        // Mark the next insert of any char as a new undo step
        this.__startTyping = false;
      }
      catch(ex)
      {
        if ((qx.core.Environment.get("qx.debug")) &&
            qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
          this.debug("execCommand " + command + " with value " + value + " failed");
        }

        return false;
      }

      return result;
    },



    /* ************************************************************
     *          CUSTOM COMMAND IMPLEMENTATION
     * *********************************************************** */


     /**
      * Returns the range to operate on
      *
      * @signature function()
      * @return {Range} native range object
      */
     __getTargetRange : qx.core.Environment.select("engine.name", {
      "mshtml" : function()
      {
        var editor = this.__editorInstance;
        var range = editor.getSavedRange() != null ?
                    editor.getSavedRange() : editor.getRange();

        return range;
      },

      "default" : function() {
        return this.__editorInstance.getRange();
      }
     }),


     /**
      * Inserts custom HTML code at the selection point.
      *
      * @param value {String} HTML code to insert
      * @param commandObject {Object} command information
      * @return {Boolean} Success of the operation
      */
     __insertHtml : qx.core.Environment.select("engine.name",
     {
       "mshtml" : function(value, commandObject)
       {
         var result;

         // Special handling if a "br" element should be inserted
         if (value == qx.bom.htmlarea.HtmlArea.simpleLinebreak) {
           return this.__insertBrOnLinebreak();
         }
         else
         {
           this.__doc.body.focus();

           var sel   = this.__editorInstance.getSelection();
           var range = this.__getTargetRange();

           // DO NOT allow pasteHTML on control selections (like selected images)
           if(range && sel && sel.type != "Control")
           {
             // Try to pasteHTML on the stored range
             try
             {
               range.pasteHTML(value);
               range.collapse(false);
               range.select();
               result = true;
             }
             catch(e) {}
           }
           else {
             result = false;
           }

           this.__editorInstance.resetSavedRange();
           return result;
         }
       },

       "default" : function (value, commandObject)
       {
         // Body element must have focus before executing command
         this.__doc.body.focus();

         return this.__doc.execCommand(commandObject.identifier, false, value);
       }
     }),


     /**
      * Inserts a paragraph when hitting the "enter" key
      *
      * @signature function()
      * @return {Boolean} whether the key event should be stopped or not
      */
     insertParagraphOnLinebreak : qx.core.Environment.select("engine.name",
     {
       "gecko" : function()
       {
         // get the current styles as structure
         var helperStyleStructure = this.__getCurrentStylesGrouped();

         // check for styles to apply at the paragraph
         var paragraphStyle = this.__generateParagraphStyle(helperStyleStructure);

         // generate the span elements to preserve the styling
         var helperStyle = this.__generateHelperString(helperStyleStructure);

         // Generate unique ids to find the elements later
         var spanId = "__placeholder__" + Date.parse(new Date());
         var paragraphId = "__paragraph__" + Date.parse(new Date());

         // A paragraph will only be inserted, if the paragraph before it has content.
         // Therefore we also insert a helper node, then the paragraph and the style
         // nodes after it.
         var htmlToInsert = '';
         var helperString = '<span id="' + spanId + '"></span>';

         htmlToInsert += helperString;
         htmlToInsert += '<p id="' + paragraphId + '" ' + paragraphStyle + '>';
         htmlToInsert += helperStyle + '</p>';

         this.__editorInstance.getCommandManager().addUndoStep("inserthtml", "insertParagraph", this.getCommandObject("inserthtml"));

         this.execute("inserthtml", htmlToInsert);

         this.__hideSuperfluousParagraph();
         qx.bom.element.Attribute.reset(this.__doc.getElementById(spanId), "id");

         // If previous paragraph only contains helperString ->  it was empty.
         // Empty paragraphs are problematic in Gecko -> not properly rendered.
         var paragraphNode = this.__doc.getElementById(paragraphId);
         if(paragraphNode.previousSibling.innerHTML == helperString)
         {
           var helperNodeFragment = this.__generateHelperNodes();
           var brNode = this.__doc.createElement("br");

           var mozDirty = this.__doc.createAttribute("_moz_dirty");
           mozDirty.nodeValue = "";
           brNode.setAttributeNode(mozDirty);

           var type     = this.__doc.createAttribute("type");
           type.nodeValue = "_moz";
           brNode.setAttributeNode(type);

           // Insert a bogus node to set lineheight and style nodes to apply the styles.
           paragraphNode.previousSibling.appendChild(helperNodeFragment);
           paragraphNode.previousSibling.appendChild(brNode);
         }

         qx.bom.element.Attribute.reset(paragraphNode, "id");

         return true;
       },

      /**
       * Gecko does not copy the paragraph's background color, and text
       * alignment so do this manually.
       */
      "webkit" : function()
      {
        var styles = this.getCurrentStyles();
        var elementStyleString = "";

        // We need to copy the background color and text alignment for Webkit
        var relevantStyles = {
          "background-color" : true,
          "text-align": true
        };

        // Iterate over current styles and save relevant ones to string.
        for(var style in styles)
        {
          if (relevantStyles[style]) {
            elementStyleString += style + ":" + styles[style] + ";"
          }
        }

        // Insert the HTML containing the generated style string.
        this.__editorInstance.insertHtml("<p style='" + elementStyleString + "'><br class='webkit-block-placeholder' />");
      },

      "default" : (function() {})
      }),

      /**
        * Apply style attributes which need to to applied at paragraph (block)
        * elements instead of span (inline) elements. To avoid doubling the
        * styles this method does delete the style attribute from the data
        * structure if it can be applied at the paragraph element.
        *
        * @param currentStylesGrouped {Map} Data structure with current styles
        * @return {String} Style attributes for paragraph element
        */
      __generateParagraphStyle : qx.core.Environment.select("engine.name",
      {
        "gecko" : function(currentStylesGrouped)
        {
          var paragraphStyle = 'style="';
          var childElement = currentStylesGrouped.child;

          // text-align has to be applied to the paragraph element to get the
          // correct behaviour since it is the top block element for the text
          if (childElement["text-align"])
          {
            paragraphStyle += 'text-align:' + childElement["text-align"] + ';';
            delete currentStylesGrouped.child["text-align"];
          }

          // To fix Bug #3346 (selecting multiple paragraphs and changing the
          // font family) it is necessary to apply the font-family to the
          // paragraph element to prevent inserting any font-family style to
          // an inner "span" element which then block the font-family style
          // attribute of the "p" element (this will applied by FF when using
          // the "fontFamily" execCommand).
          if (childElement["font-family"])
          {
            paragraphStyle += 'font-family:' + childElement["font-family"] + ';';
            delete currentStylesGrouped.child["font-family"];
          }

          var paddingsToApply = {
              "padding-top" : true,
              "padding-bottom" : true,
              "padding-left" : true,
              "padding-right" : true
          };

          var marginsToApply = {
              "margin-top" : true,
              "margin-bottom" : true,
              "margin-left" : true,
              "margin-right" : true
          };

          for (var styleAttribute in childElement)
          {
            if (paddingsToApply[styleAttribute] || marginsToApply[styleAttribute])
            {
              paragraphStyle += styleAttribute + ':' + childElement[styleAttribute] + ';';
              delete currentStylesGrouped.child[styleAttribute];
            }
          }

          paragraphStyle += '"';

          return paragraphStyle;
        },

        "default" : function() {
          return "";
        }
      }),



      /**
       * Gecko inserts a superfluous paragraph despite our own paragraph
       * handling. If detected we remove this element
       *
       * @signature function()
       */
      __hideSuperfluousParagraph : qx.core.Environment.select("engine.name",
      {
        "gecko" : function()
        {
          var sel = this.__editorInstance.getSelection();

          if (!sel || !sel.focusNode) {
            return;
          }

          var focusNode = sel.focusNode;
          var traversalNode = sel.focusNode;

          while (!qx.dom.Node.isNodeName(traversalNode, "p")) {
            traversalNode = traversalNode.parentNode;
          }

          var prevSiblingId = traversalNode.previousSibling.id;
          var nextSiblingId = traversalNode.nextSibling ? traversalNode.nextSibling.id : null;

          if (qx.lang.String.startsWith(prevSiblingId, "__paragraph__") &&
              prevSiblingId == nextSiblingId)
          {
            var nextParagraph = traversalNode.nextSibling;
            var rng = this.__editorInstance.getRange();
            rng.selectNode(nextParagraph);
            sel.addRange(rng);

            var htmlToInsert = qx.bom.htmlarea.HtmlArea.EMPTY_DIV;
            this.__editorInstance.getCommandManager().addUndoStep("inserthtml", htmlToInsert, this.getCommandObject("inserthtml"));

            this.execute("inserthtml", htmlToInsert);

            var secondRange = this.__editorInstance.getRange();

            if (focusNode)
            {
              while (focusNode && focusNode.firstChild &&
                     qx.dom.Node.isElement(focusNode.firstChild))
              {
                focusNode = focusNode.firstChild;
              }
            }

            secondRange.selectNode(focusNode);

            sel.addRange(secondRange);
            secondRange.collapse(true);
          }
        },

        "default" : (function() {})
      }),


     /**
      * ONLY IE
      * Inserts a simple linebreak ('<br>') at the current position.
      *
      * @return {Boolean} Returns true if an br element is inserted
      */
     __insertBrOnLinebreak : qx.core.Environment.select("engine.name",
     {
       "mshtml" : function()
       {
         var rng = this.__editorInstance.getRange();

         // Only insert the "br" element if we are currently NOT inside a list.
         // Return "false" to let the browser handle this (event is not stopped).
         if (rng && !qx.dom.Node.isNodeName(rng.parentElement(), "li"))
         {
           rng.pasteHTML(qx.bom.htmlarea.HtmlArea.simpleLinebreak);
           rng.collapse(false);
           rng.select();

           return true;
         }

         return false;
       },

       "default" : function() {
         return false;
       }
     }),


     /**
      * Helper function to set a text align on a range.
      * In IE we need to explicitly get the current range before executing
      * the font size command on it.
      *
      * @param value {String} text align value
      * @param commandObject {Object} command object
      * @return {Boolean} Success of operation
      */
     __setTextAlign : function(value, commandObject)
     {
       var commandTarget = (qx.core.Environment.get("engine.name") == "mshtml") ? this.__editorInstance.getRange() : this.__doc;

       return commandTarget.execCommand(commandObject.identifier, false, value);
     },


     /**
      * Inserts a list.
      * Ensures that the list is inserted without indents. If any indents are
      * present they are removed before inserting the list.
      * This only applies for IE since other browsers are removing the indents
      * as default.
      *
      * @param value {String} list value
      * @param commandObject {Object} command object
      * @return {Boolean} Success of operation
      */
     __insertList : function(value, commandObject)
     {
       // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=1608 for details
       if ((qx.core.Environment.get("engine.name") == "mshtml"))
       {
         // Get the focusNode as starting node for looking after blockquotes.
         var focusNode = this.__editorInstance.getFocusNode();
         this.__manualOutdent(focusNode);
       }

       // Body element must have focus before executing command
       this.__doc.body.focus();

       var returnValue = this.__doc.execCommand(commandObject.identifier, false, value);

       if ((qx.core.Environment.get("engine.name") == "webkit"))
       {
         // Get the parent of the current focusNode as starting node for
         // looking after blockquotes for webkit.
         var focusNode = this.__editorInstance.getFocusNode();
         this.__manualOutdent(focusNode.parentNode);
       }

       return returnValue;
     },



     /**
      * This little helper method takes a node as argument and looks along the
      * parent hierarchy for any "blockquote" elements and removes them.
      *
      * @param startNode {Node} starting point of the lookup
      */
     __manualOutdent : function(startNode)
     {
       var blockquotes = [];
       var parent = startNode.parentNode;

       while (qx.dom.Node.isNodeName(parent, "blockquote"))
       {
         blockquotes.push(parent);
         parent = parent.parentNode;
       }

       // if indents are found move the focusNode to the current parent
       // -> the first parent node which is *no* blockquote
       if (blockquotes.length > 0)
       {
         // move focus node out of blockquotes
         parent.appendChild(startNode);

         // delete blockquote nodes
         // only the last in the array is needed since the it will also remove
         // the child "blockquote" elements
         parent.removeChild(blockquotes[blockquotes.length-1]);
       }
     },



    /**
     * Inserts an image
     *
     * @param attributes {Map} map with attributes which should be applied (e.g. "src", "border", "width" and "height")
     * @param commandObject {Object} command object
     * @return {Boolean} Success of operation
     */
     __insertImage : qx.core.Environment.select("engine.name", {
       "gecko" : function(attributes, commandObject)
       {
         // Only insert an image if the src attribute info is available
         if (attributes.src)
         {
           // Insert image via the execCommand and add the attributes afterwards
           this.__doc.execCommand(commandObject.identifier, false, attributes.src);

           // source is set so remove it from the attributes map
           delete attributes.src;

           // Selection is expected to be the image node
           var sel = this.__editorInstance.getSelection();

           // TODO: need to revert the execCommand if no selection exists?
           if (sel)
           {
             var anchorNode = sel.anchorNode;
             var offset = sel.anchorOffset;
             var img = anchorNode.childNodes[offset-1];

             var attrNode;
             for (var attribute in attributes)
             {
               attrNode = this.__doc.createAttribute(attribute);
               attrNode.nodeValue = attributes[attribute];

               img.setAttributeNode(attrNode);
             }

             // Gecko does not transfer the styles of the previous sibling to the
             // element which comes right after the inserted image.
             // -> we have to insert a corresponding span element for ourselves

             // these elements can have influence on the format
             var formatElements = { "font": true,
                                    "span": true };
             var startNode = null;
             var sibling = true;

             // check if the image is one the same hierarchy level
             // IMPORTANT: if e.g. the user copy-and-pastes a text styled with
             // FONT elements Gecko does add the image inside this font element
             if (qx.dom.Node.isElement(img.previousSibling) &&
                 formatElements[qx.dom.Node.getName(img.previousSibling)]) {
               startNode = img.previousSibling;
             }
             else if (formatElements[qx.dom.Node.getName(img.parentNode)])
             {
               startNode = img.parentNode;
               sibling = false;
             }

             // documentFragment - will hold the span(s)
             var documentFragment = this.__doc.createDocumentFragment();
             var inline;

             if (sibling && startNode != null)
             {
               // if the image is a sibling of the format elements we have to
               // check for the current styles and apply them with span element(s)
               var formatElements = this.__generateImageFormatElements(startNode);

               // append the elements to the documentFragment
               documentFragment.appendChild(formatElements.root);

               // set the inline element to later insert a text node
               inline = formatElements.inline;
             }
             else
             {
               // if the image is within a e.g. "font" element or a "font"
               // element with several nested "span" elements
               // -> just add a "span" element and use the inheritance
               inline = this.__doc.createElement("span");
               documentFragment.appendChild(inline);
             }

             // the inner-most span needs a TextNode for selection
             var inlineText = this.__doc.createTextNode("");
             inline.appendChild(inlineText);

             // get the image parent node
             var imageParent = img.parentNode;

             // image is last child -> append
             // image is anywhere in between -> use nextSibling
             if (img == imageParent.lastChild) {
               imageParent.appendChild(documentFragment);
             } else {
               imageParent.insertBefore(documentFragment, img.nextSibling);
             }

             // get the current range and select the *content* of the new span
             var rng = this.__editorInstance.getRange();
             rng.selectNodeContents(inline);
           }

           return true;
         }
         else {
           return false;
         }
       },

       "mshtml" : function(attributes, commandObject)
       {
         var result = false;

         // Put together the HTML for the image
         var img = "<img ";
         for (var attrName in attributes) {
           img += attrName + "='" + attributes[attrName] + "' ";
         }
         img += "/>";

         // IE *does not* support the "insertHtml" command and
         // the "insertImage" command is not sufficient.
         // We need to add the given attributes to the image, so the
         // only working solution is to use the "pasteHTML" method of the
         // TextRange Object.
         var sel = this.__editorInstance.getSelection();
         var currRange = this.__getTargetRange();

         // DO NOT allow pasteHTML at control selections (like selected images)
         if (sel && sel.type != "Control")
         {
           try
           {
             currRange.select();
             currRange.pasteHTML(img);

             result = true;
           } catch (e) {}
         }

         this.__editorInstance.resetSavedRange();
         return result;
       },

       "default" : function(attributes, commandObject)
       {
         // Only insert an image if the src attribute info is available
         if (attributes.src)
         {
           var img = "<img ";

           for (var attrName in attributes) {
             img += attrName + "='" + attributes[attrName] + "' ";
           }

           img += "/>";

           return this.__doc.execCommand("InsertHtml", false, img);
         }
         else
         {
           return false;
         }
       }
     }),


     /**
      * Generate "span" elements to "save" the formatting after an image
      * was inserted.
      *
      * @param startNode {Node} start node for getting current styles
      * @return {Node} format elements
      */
     __generateImageFormatElements : function(startNode)
     {
       // be sure to check for childs of the previous sibling
       // e.g. a font element with a nested span inside
       while (startNode.firstChild && startNode.firstChild.nodeType == 1)
       {
         startNode = startNode.firstChild;
       }

       // get the current style of this element
       var grouped = this.__getCurrentStylesGrouped(startNode);

       var root, inlineStyle, legacyFont;
       var styles = "";
       var parent = null;
       var inline = null;
       var child = grouped.child;

       while (child)
       {
         // Since non-default font sizes are managed by "font" tags with "size"
         // attributes it is necessary to handle this in a special way
         // if a "legacy-font-size" entry is within the grouped styles it is
         // necessary to create a font element to achieve the correct format
         inline = this.__doc.createElement(child["legacy-font-size"] ? "font" : "span");

         inlineStyle = this.__doc.createAttribute("style");
         inline.setAttributeNode(inlineStyle);

         // apply the styles
         for (var styleKey in child)
         {
           if (styleKey != "child" && styleKey != "legacy-font-size")
           {
             styles += styleKey + ":" + child[styleKey] + ";";
           }
           else if (styleKey == "legacy-font-size")
           {
             legacyFont = this.__doc.createAttribute("size");
             legacyFont.nodeValue = child[styleKey];
             inline.setAttributeNode(legacyFont);
           }
         }
         inlineStyle.nodeValue = styles;

         if (parent != null) {
           parent.appendChild(inline);
         } else {
           root = inline;
         }

         parent = inline;
         child = child.child;
         styles = "";
       }

       return { root : root,
                inline : inline };
     },


     /**
      * Inserts a hyperlink. In Gecko and Opera browser these is achieved by
      * inserting DOM nodes.
      * IE is using the "CreateLink" execCommand.
      *
      * @param url {String} url to insert
      * @param commandObject {Object} command object
      * @return {Boolean} result
      */
     __insertHyperLink : qx.core.Environment.select("engine.name",
     {
       "gecko|opera" : function(url, commandObject)
       {
         var sel = this.__editorInstance.getSelection();
         var rng = this.__editorInstance.getRange();

         // If the selection is collapsed insert a link with the URL as text.
         if (sel.isCollapsed)
         {
           // Only use the link id for links which are based on a collapsed selection
           var linkId = "qx_link" + (++this.__hyperLinkId);

           // Create and insert the link as DOM nodes
           var linkNode = this.__doc.createElement("a");
           var hrefAttr = this.__doc.createAttribute("href");
           var idAttr = this.__doc.createAttribute("id");
           var linkText = this.__doc.createTextNode(url);

           idAttr.nodeValue = linkId;
           linkNode.setAttributeNode(idAttr);

           hrefAttr.nodeValue = url;
           linkNode.setAttributeNode(hrefAttr);

           linkNode.appendChild(linkText);
           rng.insertNode(linkNode);
           rng.selectNode(linkNode);

           sel.collapseToEnd();

           return true;
         }
         else {
           return this.__doc.execCommand(commandObject.identifier, false, url);
         }
       },

       "mshtml" : function(url, commandObject)
       {
         // Check for a valid text range. If it is available (=text selected)
         // insert the link via the "insertLink" execCommand otherwise insert
         // the link with the URL as link text.
         try
         {
           var result;
           var range = this.__getTargetRange();
           var editor = this.__editorInstance;
           var range = editor.getSavedRange() != null ?
                       editor.getSavedRange() : editor.getRange();

           if (range != null && range.text != "") {
             result = range.execCommand(commandObject.identifier, false, url);
           } else {
             result = this.__insertHtml(' <a href="' + url + '">' + url + '</a> ', commandObject);
           }

           this.__editorInstance.resetSavedRange();
           return result;
         }
         catch(e)
         {
           if (qx.core.Environment.get("qx.debug")) {
             this.error("inserthyperlink failed!");
           }
           return false;
         }
       },

       "default" : function(url, commandObject) {
         return this.__doc.execCommand(commandObject.identifier, false, url);
       }
     }),

     /**
      * Internal method to insert an horizontal ruler in the document
      *
      * @param value {String} empty value
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      */
     __insertHr : function(value, commandObject)
     {
       var htmlText = "<hr />";

       // Gecko needs some extra HTML elements to keep the current style setting
       // after inserting the <hr> tag.
       if ((qx.core.Environment.get("engine.name") == "gecko")) {
         htmlText += this.__generateHelperString();
       }

       return this.__insertHtml(htmlText, commandObject);
     },

     /**
      * Helper function which generates a string containing HTML which can be
      * used to apply the current style to an element.
      *
      * *** ONLY IN USE FOR GECKO ***
      *
      * @param groupedStyles {Map} Data structure with grouped styles.
      *                            Structure of the "__getCurrentStylesGrouped" method.
      * @return {String} String containing tags with special style settings.
      */
     __generateHelperString : function(groupedStyles)
     {
       var formatString = "";
       var spanBegin = '<span style="';
       var closings = [];

       // retrieve the current styles as structure if no parameter is given
       var structure = typeof groupedStyles !== "undefined" ? groupedStyles : this.__getCurrentStylesGrouped();

       // first traverse the "child" chain
       var child = structure.child;
       var legacyFont = false;

       // if no styles are available no need to create an empty "span" element
       if (qx.lang.Object.isEmpty(child)) {
         return "";
       }

       while (child)
       {
         legacyFont = child["legacy-font-size"] != null;

         // Since non-default font sizes are managed by "font" tags with "size"
         // attributes it is necessary to handle this in a special way
         // if a "legacy-font-size" entry is within the grouped styles it is
         // necessary to create a font element to achieve the correct format
         formatString += legacyFont ? '<font style="' : spanBegin;
         for (var style in child) {
           formatString += (style != "child" && style != "legacy-font-size") ? style + ':' + child[style] + ';' : "";
         }
         formatString += legacyFont ? '" size="'+ child["legacy-font-size"] +'">' : '">';

         // memorize the element to close and adjust object structure
         closings.unshift(legacyFont ? "</font>" : "</span>");
         child = child.child;
       }

       // SPECIAL CASE: only one font element
       // Gecko "optimizes" this by removing the empty font element completely
       if (closings.length == 1 && closings[0] == "</font>") {
         formatString += "<span></span>";
       }

       // close the elements
       for (var i=0, j=closings.length; i<j; i++) {
         formatString += closings[i];
       }

       return formatString;
     },


     /**
      * Helper function which generates a documentFragment of <span>-tags
      * which can be used to apply the current style to an element.
      *
      * *** ONLY IN USE FOR GECKO ***
      *
      * @return {DocumentFragment} documentFragment containing styled elements
      */
     __generateHelperNodes : function()
     {
       var fragment = this.__doc.createDocumentFragment();

       // retrieve the current styles as structure
       var structure = this.__getCurrentStylesGrouped();

       // first traverse the "child" chain
       var parent = fragment;
       var child = structure.child;
       var element;
       var legacyFont = false;
       while (child)
       {
         legacyFont = child["legacy-font-size"] != null;

         element = this.__doc.createElement(legacyFont ? "font" : "span");
         parent.appendChild(element);

         // attach styles
         for (var style in child)
         {
           if (style != "child" && style != "legacy-font-size") {
             qx.bom.element.Style.set(element, style, child[style]);
           }
         }

         if (legacyFont)
         {
           var sizeAttr = this.__doc.createAttribute("size");
           sizeAttr.nodeValue = child["legacy-font-size"];
           element.setAttributeNode(sizeAttr);
         }

         parent = element;
         child = child.child;
       }

       return fragment;
     },


     /**
      * Works with the current styles and creates a hierarchy which can be
      * used to create nodes or strings out of the hierarchy.
      *
      * *** ONLY IN USE FOR GECKO ***
      *
      * @param elem {Node ? null} optional element as root node
      * @return {Map} Hierarchy with style information
      */
     __getCurrentStylesGrouped : function(elem)
     {
       var grouped = {};
       var child = null;

       var collectedStyles = this.getCurrentStyles(elem);

       child = grouped.child = {};

       for(var attribute in collectedStyles)
       {
         // "text-decoration" has to processed afterwards
         if (attribute != "text-decoration") {
           child[attribute] = collectedStyles[attribute];
         }
       }

       // Check for any text-decorations -> special handling, because one has
       // create for each text-decoration one corresponding span element to
       // ensure the correct rendering in Gecko
       if (collectedStyles["text-decoration"])
       {
         var textDecorations = collectedStyles["text-decoration"];

         // An extra <span> is needed for every text-decoration value,
         // because the color of a decoration is based on the element's color.
         for(var i=0, j=textDecorations.length; i<j; i++)
         {
           if (child == null) {
             child = grouped.child = {};
           } else {
             child = child.child = {};
           }

           child['color'] = textDecorations[i]['color'];
           child['text-decoration'] = textDecorations[i]['text-decoration'];
         }
       }

       // SPECIAL HANDLING
       // if any "text-decoration" is used it is necessary to add an extra inner
       // child to make sure an inner span is created which holds the color
       if (collectedStyles['color'] && collectedStyles['text-decoration'])
       {
         child = child.child = {};
         child['color'] = collectedStyles['color'];
       }

       return grouped;
     },


     /**
      * Internal helper function which retrieves all style settings, which are set
      * on the focus node and saves them on a span element.
      *
      * @param element {Element ? null} optional element reference the lookup should start
      * @return {Map} map with all style settings with style attributes as keys.
      */
     getCurrentStyles : function(element)
     {
       if (element == null)
       {
         var sel = this.__editorInstance.getSelection();

         if (!sel || sel.focusNode == null) {
           return {};
         }

         // Get HTML element on which the selection has ended
         element = (sel.focusNode.nodeType == 3) ? sel.focusNode.parentNode : sel.focusNode;
       }

       // Get element's ancestors to fetch all style attributes which are inherited
       // by the element to check
       var parents = qx.dom.Hierarchy.getAncestors(element);
       var elementAndParents = qx.lang.Array.insertBefore(parents, element, parents[0]);

       var collectedStyles = this.__collectStylesOfElementCollection(elementAndParents);
       var resultMap = this.__processCollectedStyles(collectedStyles, elementAndParents);

       return resultMap;
     },


     /**
      * Processes the given element collection and collects the applied CSS
      * styles. Does some additional corrections on the styles to retrieve the
      * correct values.
      *
      * @param elementCollection {Array} Array of elements to collect styles from.
      * @return {Map} collected styles in a map.
      */
     __collectStylesOfElementCollection : function(elementCollection)
     {
       var collectedStyles = {};
       var styleAttribute, element;

       for (var i=0, j=elementCollection.length; i<j; i++)
       {
         element = elementCollection[i];

         for (var k=0, l=element.style.length; k<l; k++)
         {
           styleAttribute = element.style[k];
           if (styleAttribute.length > 0 &&
               typeof collectedStyles[styleAttribute] === "undefined") {
             collectedStyles[styleAttribute] = element.style.getPropertyValue(styleAttribute);
           }
         }

         // only process the "FONT" elements to retrieve the font size
         // for the next paragraph. Only the first occurence is important.
         if(element.tagName.toUpperCase() == "FONT" && element.size &&
            collectedStyles["legacy-font-size"] === undefined) {
           collectedStyles["legacy-font-size"] = element.size;
         }
       }

       // The size of the "FONT" element has a higher priority as the CSS
       // font size value
       if (collectedStyles["legacy-font-size"] && collectedStyles["font-size"]) {
         delete collectedStyles["font-size"];
       }

       return collectedStyles;
     },


     /**
      * Walks over the collected styles and gets inherited value of each.
      *
      * @param collectedStyles {Map} All styles which should be processed
      * @param elementAndParents {Array} Array of all elements and their parent element to process
      * @return {Map} processed styles
      */
     __processCollectedStyles : function(collectedStyles, elementAndParents)
     {
       var element = elementAndParents[0];
       var elementComputedStyle = this.__editorInstance.getContentWindow().getComputedStyle(element, null);

       var styleValue;
       var resultMap = {};
       for(var style in collectedStyles)
       {
         // "legacy-font-size" is not valid CSS attribute
         // do not get the computed of it
         if (style != "legacy-font-size") {
           styleValue = elementComputedStyle.getPropertyValue(style);
         } else {
           styleValue = collectedStyles[style];
         }

         // Get the _real_ color if the collected style has the default value
         // "transparent" by retrieving it from the parent element.
         if(style == "background-color" && styleValue == "transparent") {
           resultMap[style] = this.__getBackgroundColor(elementAndParents);
         }
         // collect all "text-decoration" styles along the parent hierarchy
         // to get the correct (with all inherited values) "text-decoration" style
         else if(style == "text-decoration") {
           resultMap[style] = this.__getTextDecorations(elementAndParents);
         } else {
           resultMap[style] = styleValue;
         }
       }

       return resultMap;
     },


     /**
      * Helper function which walks over all given parent
      * elements and stores all text-decoration values and colors.
      *
      * Returns an array containing all computed values of "text-decoration"
      * and "text-color".
      *
      * @param parents {Array} List with element's parents.
      * @return {Array} List containing style information about element's parents.
      */
     __getTextDecorations : function(parents)
     {
       var decorationValue, colorValue, parentDecoration;
       var decorationValues = [];

       var editorWindow = this.__editorInstance.getContentWindow();
       for(var i=0, j=parents.length; i<j; i++)
       {
         parentDecoration = editorWindow.getComputedStyle(parents[i], null);

         decorationValue = parentDecoration.getPropertyValue("text-decoration");
         colorValue = parentDecoration.getPropertyValue("color");

         // Check if text-decoration is valid
         if (decorationValue != "none")
         {
           decorationValues.push({
             'text-decoration': decorationValue,
             'color': colorValue
           });
         }
       }

       return decorationValues;
     },


     /**
      * Helper function which walks over all given parent
      * elements and searches for an valid value for "background-color".
      *
      * Returns the computed value of "background-color" of one parent
      * element, if it contains a _real_ color.
      *
      * @param parents {Array} List with element's parents.
      * @return {String} Background color value.
      */
     __getBackgroundColor : function(parents)
     {
       var elem, parentDecoration, parentStyleValue;

       for(var i=0; i<parents.length; i++)
       {
         elem = parents[i];

         // Retrieve computed style
         parentDecoration = this.__editorInstance.getContentWindow().getComputedStyle(elem, null);
         parentStyleValue = parentDecoration.getPropertyValue("background-color");

         // If any _real_ color is found return this one
         if (parentStyleValue != "transparent") {
           return parentStyleValue;
         }

       }
     },

     /**
      * Internal method to change the font size of the selection.
      * Most of the code is used to change the size of the bullet points
      * synchronous to it's content.
      *
      * @param value {String} font size number (as used for <font> tags)
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      */
     __setFontSize : function(value, commandObject)
     {
       var sel = this.__editorInstance.getSelection();

       var rng = ((qx.core.Environment.get("engine.name") == "mshtml")) ?
           this.__editorInstance.getRange() :
           rng = sel.getRangeAt(0);

       // <ol> or <ul> tags, which are selected, will be saved here
       var lists = [];

       // Flag indicating whether a whole <li> tag is selected
       var listEntrySelected;

       var listTypes = ["OL", "UL"];
       var tmp, i, j, element;

       // At first the selection is examined to figure out
       // a) whether several lists or
       // b) one single <ol> or <li> tag is selected

       // Fetch selected element node to examine what is inside the selection
       element = ((qx.core.Environment.get("engine.name") == "mshtml")) ?
           rng.parentElement() :
           rng.commonAncestorContainer;

       // If it is the <body> tag, a whole bunch of elements has been selected
       if (element.tagName == "BODY")
       {
         for (var i=0; i<listTypes.length; i++)
         {
           // Search for list elements...
           tmp = element.getElementsByTagName(listTypes[i]);
           for (var j=0; j<tmp.length; j++)
           {
             if (tmp[j]) {
               lists.push(tmp[j]);
             }
           }
         }
       }
       // A list tag has been (possibly only partly) selected
       else if(qx.lang.Array.contains(listTypes, element.tagName)) {
         lists.push(element);
       }

       if(lists.length > 0)
       {
         // Walk through all list elements and check if they are selected
         for(var i=0; i<lists.length; i++)
         {
           var listElement = lists[i];

           // Check if the entire list element has been selected.
           //
           // Note: If more than one element is selected in IE, they are all
           // selected completely. This is a good thing, since IE does not
           // support anchorOffset or nodeOffset. :-)
           listEntrySelected = ((qx.core.Environment.get("engine.name") == "mshtml")) ?
               // Element is selected or <body> tag is selected
               // (in this case, the list item inside the selection is selected, too)
               ( (listElement == element) || (element.tagName == "BODY") ) :

               // In other browsers, we can test more preciously
               sel.containsNode(listElement, false);

           /* Walk through all list entries in list element: */
           for(j=0; j<listElement.childNodes.length; j++)
           {
             var listEntryElement = listElement.childNodes[j];

             /*
              * Anchor node and focus nodes are special:
              * 1. they are always text nodes
              * 2. the selection "stops" on the text nodes, so that it's parent element is not completely selected
              *
              * For these reasons, focus node and anchor node are checked separately
              */
             if(
               /*
                * Whole list is selected
                * Note: IE will never come further than this line
                */
               listEntrySelected ||

               /* Check if the complete focus text node selected */
               (
                   sel.focusNode.nodeValue &&
                   qx.dom.Hierarchy.contains(listEntryElement, sel.focusNode) &&
                   (sel.focusOffset == sel.focusNode.nodeValue.length)
               ) ||

               /* Check if the complete anchor text node selected */
               (
                   qx.dom.Hierarchy.contains(listEntryElement, sel.anchorNode) &&
                   (sel.anchorOffset == 0)
               ) ||

               /* Otherwise, check if the actual <li> tag is completely(!) selected */
               (sel.containsNode(listEntryElement, false))
             )
             {
               /* Set font size on <li> tag */
               listEntryElement.style.fontSize = (this.__fontSizeNames[value] || value) + "px";
             } // if

           } // for
         } // for

       /* No lists are selected */
       }else{

         /* Check if element is inside a list entry */

         /* Retrieve selected element node */
         var parentElement = ((qx.core.Environment.get("engine.name") == "mshtml")) ? element : sel.focusNode;

         /* Get all parents */
         var parents = qx.dom.Hierarchy.getAncestors(parentElement);
         for(i=0; i<parents.length; i++)
         {

           /* Element is a list entry */
           if(parents[i].tagName == "LI") {

             if
             (
               (
                 ((qx.core.Environment.get("engine.name") == "gecko"))
                 &&
                 (
                   /* Selection starts at the beginning... */
                   (sel.anchorOffset == 0) &&

                   /* ... and ends at the end of list entry's content*/
                   (sel.focusNode.nodeValue && (sel.focusOffset == sel.focusNode.nodeValue.length) ) &&

                   /* Selection starts inside the list entry's first child... */
                   qx.dom.Hierarchy.contains(parents[i].firstChild, sel.anchorNode) &&

                   /* ... and ends inside the last child */
                   qx.dom.Hierarchy.contains(parents[i].lastChild, sel.focusNode)
                  )
               )
               ||
               (
                 /* In IE just check if the HTML of the range is equal to the actual list entry */
                 ((qx.core.Environment.get("engine.name") == "mshtml")) &&
                 (rng.htmlText == parents[i].innerHTML)
               )
             ){
               /* Set font size on <li> tag */
               parents[i].style.fontSize = (this.__fontSizeNames[value] || value) + "px";
             }

             /* We only need to modify the nearest <li> tag */
             break;

           } // if
         } // for

       }

       /* Execute command on selection */
       if ((qx.core.Environment.get("engine.name") == "mshtml")) {
         this.__doc.body.focus();
         this.__editorInstance.getRange().select();
         return this.__doc.execCommand("FontSize", false, value);
       }
       /*
        * Gecko uses span tags to save the style settings over block elements.
        * These span tags contain CSS which has a higher priority than the
        * font tags which are inserted via execCommand().
        * For each span tag inside the selection the CSS property has to be
        * removed to hand over the control to the font size value of execCommand().
        */
       else if((qx.core.Environment.get("engine.name") == "gecko"))
       {

         var parent = rng.commonAncestorContainer;

         /* Check if selection is a DOM element */
         if(parent.nodeType === 1)
         {
           /*
            * Remove the font size property if it is available, otherwise it
            * will interfere with the setting of the "font" element.
            * If we try to set the font size with the CSS property we will
            * have to transform the font sizes 1-7 to px values which will
            * never work out correctly.
            */
           var spans = parent.getElementsByTagName("span");
           for (i=0; i<spans.length; i++) {
             if (spans[i].style.fontSize)
             {
               spans[i].style.fontSize = null;
             }
           }
         }
       }

       return this.__doc.execCommand("FontSize", false, value);
     },


     /**
      * Internal method to set a background color for text.
      * Special implementation for Webkit to imitate the behaviour of IE.
      * If the selection is collapsed Webkit sets the background color
      * to the whole word which is currently under the caret.
      * All others (IE, Gecko and Opera) are using the execCommand directly.
      *
      * @param value {String} color to set
      * @param commandObject {Object} command infos
      * @return {Boolean} success of operation
      */
     __setTextBackgroundColor : qx.core.Environment.select("engine.name", {
       "mshtml" : function(value, commandObject)
       {
         // Body element must have focus before executing command
         this.__doc.body.focus();

         return this.__doc.execCommand("BackColor", false, value);
       },

       "gecko|opera" : function(value, commandObject)
       {
         // Body element must have focus before executing command
         this.__doc.body.focus();

         return this.__doc.execCommand("HiliteColor", false, value);
       },

       "webkit" : function(value, commandObject)
       {
         var sel = this.__editorInstance.getSelection();
         var rng = this.__editorInstance.getRange();

         // check for a range
         if (!sel || !sel.isCollapsed)
         {
           // Body element must have focus before executing command
           this.__doc.body.focus();

           this.__doc.execCommand("BackColor", false, value);

           // collapse the selection
           if (sel) {
             sel.collapseToEnd();
           }

           return true;
         }
         else
         {
           // Act like an IE browser
           // -> if the selection is collapsed select the whole word and
           // perform the action on this selection.
           var right  = sel.anchorOffset;
           var left   = sel.anchorOffset;
           var rng    = sel.getRangeAt(0);
           var anchor = sel.anchorNode;

           // Check the left side - stop at a linebreak or a space
           while (left > 0)
           {
             if (anchor.nodeValue.charCodeAt(left) == 160 ||
                 anchor.nodeValue.charCodeAt(left) == 32) {
               break;
             } else {
               left--;
             }
           }

           // Check the right side - stop at a linebreak or a space
           while (right < anchor.nodeValue.length)
           {
             if (anchor.nodeValue.charCodeAt(right) == 160 ||
                 anchor.nodeValue.charCodeAt(right) == 32) {
               break;
             } else {
               right++
             }
           }

           // Set the start and end of the range to cover the whole word
           rng.setStart(sel.anchorNode, sel.anchorNode.nodeValue.charAt(left) == " " ? left + 1 : left);
           rng.setEnd(sel.anchorNode, right);
           sel.addRange(rng);

           // Body element must have focus before executing command
           this.__doc.body.focus();

           this.__doc.execCommand("BackColor", false, value);

           // Collapse the selection
           sel.collapseToEnd();

           return true;
         }
       }
     }),

     /**
      * Internal method to set a background color for the whole document
      *
      * @param value {String} color info
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      */
     __setBackgroundColor : function(value, commandObject)
     {
       value = value != null && typeof value == "string" ? value : "transparent";
       qx.bom.element.Style.set(this.__doc.body, "backgroundColor", value);

       return true;
     },


     /**
      * Sets the background image of the document
      *
      * @param value {Array} Array consisting of url [0], background-repeat [1] and background-position [2]
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      */
     __setBackgroundImage : function(value, commandObject)
     {
       var url, repeat, position;
       var Command = qx.bom.htmlarea.manager.Command;

       if (value == null) {
         url = null;
       }
       else
       {
         url      = value[0];
         repeat   = value[1];
         position = value[2];
       }

       // If url is null remove the background image
       if (url == null || typeof url != "string")
       {
         qx.bom.element.Style.set(this.__doc.body, "backgroundImage", "");
         qx.bom.element.Style.set(this.__doc.body, "backgroundRepeat", "");
         qx.bom.element.Style.set(this.__doc.body, "backgroundPosition", "");

         return true;
       }

       // Normalize the url parameter. Especially when doing undo/redo operations
       // the url *can* be passed in as full CSS like 'url(SOMEURL)' rather than
       // just 'SOMEURL'.
       else
       {
         // Quick test for 'url('
         if (url.search(/^url.*\(/) == -1) {
           url = "url(" + url + ")";
         }
       }

       // Return silently if the parameter "repeat" is not valid and report
       //the error in debug mode
       if (repeat != null && !qx.lang.String.contains(Command.__backgroundRepeat, repeat))
       {
         if (qx.core.Environment.get("qx.debug")) {
           this.error("The value '" +repeat + "' is not allowed for parameter 'repeat'. Possible values are '" + Command.__backgroundRepeat + "'");
         }
         return false;
       }
       else {
         repeat = "no-repeat";
       }

       if (position != null)
       {
         if (qx.lang.Type.isString(position) &&
             !qx.lang.String.contains(Command.__backgroundPosition, '|'+position+'|'))
         {
           if (qx.core.Environment.get("qx.debug")) {
             this.error("The value '" + position + "' is not allowed for parameter 'position'. Possible values are '" + Command.__backgroundPosition + "'");
           }
           return false;
         }
         else
         {
           if (qx.lang.Type.isArray(position) && position.length == 2) {
             position = position[0] + " " + position[1];
           }
           else
           {
             if (qx.core.Environment.get("qx.debug")) {
               this.error("If an array is provided for parameter 'position' it has to define two elements!");
             }
             return false;
           }
         }
       } else {
         // Set the default value if no value is given
         position = "top";
       }

       // Don't use the "background" css property to prevent overwriting the
       // current background color
       qx.bom.element.Style.set(this.__doc.body, "backgroundImage", url);
       qx.bom.element.Style.set(this.__doc.body, "backgroundRepeat", repeat);
       qx.bom.element.Style.set(this.__doc.body, "backgroundPosition", position);

       return true;
     },


     /**
      * Selects the whole text.
      * IE uses an own implementation because the execCommand is not reliable.
      *
      * @return {Boolean} Success of operation
      */
     __selectAll : qx.core.Environment.select("engine.name", {
       "mshtml" : function(value, commandObject)
       {
         var rng = this.__doc.body.createTextRange();
         rng.select();

         return true;
       },

       "default" : function(value, commandObject)
       {
         return this.__executeCommand(commandObject.identifier, false, value);
       }
     }),


    /**
     * Returns the content of the actual range as text
     *
     * @return {String} selected text
     */
    __getSelectedText : function() {
      return this.__editorInstance.getSelectedText();
    },


    /**
     * returns the content of the actual range as text
     *
     * @return {String} selected text
     */
    __getSelectedHtml : function() {
      return this.__editorInstance.getSelectedHtml();
    },


    /**
     * Checks the formatting at the beginning of a line and resets the
     * formatting manually if necessary.
     *
     * This workaround fixes the wrong behaviour of Gecko browser which does
     * not remove the formatting itself if the cursor is at the beginning of a
     * new line and the user has not entered any text yet.
     *
     * @param attribute {String} Style attribute to check for
     * @param value {String} Style attribute value to check for
     * @return {Boolean} Whether the formatting was removed manually
     */
    __syncFormattingAtBeginOfLine : function(attribute, value)
    {
      var focusNode = this.__editorInstance.getFocusNode();
      if (focusNode.textContent == "")
      {
        // get all parent elements + including the current focus element
        var ancestors = qx.dom.Hierarchy.getAncestors(focusNode);
        ancestors.unshift(focusNode);

        var Node = qx.dom.Node;
        var Style = qx.bom.element.Style;
        var currentElement = ancestors.shift();
        while (ancestors.length > 0)
        {
          if (Node.getName(currentElement) == "p" || Node.getName(currentElement) == "body") {
            break;
          }

          // Use the local value here to get the style of the current element
          // and NOT the computed value of the element.
          if (Style.get(currentElement, attribute, Style.LOCAL_MODE) == value)
          {
            Style.reset(currentElement, attribute);
            return true;
          }

          currentElement = ancestors.shift();
        }
      }

      return false;
    },


    /**
     * Special implementation for Gecko browser to fix the wrong formatting
     * at the beginning of a new line.
     *
     * @param value {String} command value
     * @param commandObject {Object} command infos
     * @return {Boolean} Success of operation
     *
     * @signature function(value, commandObject)
     */
    __setBold : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(value, commandObject)
      {
        // Checks for any "font-weight: bold" formatting and resets it
        // manually if present
        if (this.__syncFormattingAtBeginOfLine("fontWeight", "bold")) {
          return true;
        } else {
          return this.__executeCommand(commandObject.identifier, false, value);
        }
      },

      "default" : function(value, commandObject) {
        return this.__executeCommand(commandObject.identifier, false, value);
      }
    }),


    /**
     * Special implementation for Gecko browser to fix the wrong formatting
     * at the beginning of a new line.
     *
     * @param value {String} command value
     * @param commandObject {Object} command infos
     * @return {Boolean} Success of operation
     *
     * @signature function(value, commandObject)
     */
    __setItalic : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(value, commandObject)
      {
        // Checks for any "font-style: italic" formatting and resets it
        // manually if present
        if (this.__syncFormattingAtBeginOfLine("fontStyle", "italic")) {
          return true;
        } else {
          return this.__executeCommand(commandObject.identifier, false, value);
        }
      },

      "default" : function(value, commandObject) {
        return this.__executeCommand(commandObject.identifier, false, value);
      }
    }),


     /**
      * Special implementation for Gecko browser to fix the wrong formatting
      * at the beginning of a new line.
      *
      * Special implementation for webkit browser to set the text-decoration
      * underline. In webkit the apply of text-decoration is different to other
      * browsers and cannot be performed with an <code>execCommand</code>
      *
      * @param value {String} color info
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      * @signature function(value, commandObject)
      */
     __setUnderline  : qx.core.Environment.select("engine.name",
     {
       "gecko" : function(value, commandObject)
       {
         // Checks for any "text-decoration: underline" formatting and resets it
         // manually if present
         if (this.__syncFormattingAtBeginOfLine("textDecoration", "underline")) {
           return true;
         } else {
           return this.__executeCommand(commandObject.identifier, false, value);
         }
       },

       "default" : function(value, commandObject) {
         return this.__executeCommand(commandObject.identifier, false, value);
       }
     }),


     /**
      * Special implementation for Gecko browser to fix the wrong formatting
      * at the beginning of a new line.
      *
      * Special implementation for webkit browser to set the text-decoration
      * strikethrough. In webkit the apply of text-decoration is different to other
      * browsers and cannot be performed with an <code>execCommand</code>
      *
      * @param value {String} color info
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      *
      * @signature function(value, commandObject)
      */
     __setStrikeThrough  : qx.core.Environment.select("engine.name",
     {
       "gecko" : function(value, commandObject)
       {
         // Checks for any "text-decoration: line-through" formatting and resets
         // it manually if present
         if (this.__syncFormattingAtBeginOfLine("textDecoration", "line-through")) {
           return true;
         } else {
           return this.__executeCommand(commandObject.identifier, false, value);
         }
       },

       "default" : function(value, commandObject) {
         return this.__executeCommand(commandObject.identifier, false, value);
       }
     })
  },


  /**
   * Destructor
   */
  destruct : function()
  {
    this.__doc = this.__editorInstance = this._commands = null;
    this.__invalidFocusCommands = this.__fontSizeNames = null;
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Decorator for CommandManager instance to implement Undo/Redo functionality
 *
 *
 * @param commandManager {qx.bom.htmlarea.manager.Command} commandManager instance to decorate
 */
qx.Class.define("qx.bom.htmlarea.manager.UndoRedo",
{
  extend : qx.core.Object,

  /**
   * Constructor
   *
   * @param commandManager {qx.bom.htmlarea.manager.Command} command manager instance
   * @param editorInstance {qx.ui.embed.HtmlArea} editor instance
   * @lint ignoreDeprecated(_commands)
   */
  construct : function(commandManager, editorInstance)
  {
    this.base(arguments);

    this.__commandManager = commandManager;
    this.__editorInstance = editorInstance;

    this.__undoStack = [];
    this.__redoStack = [];
    this._commands  = null;
    this.__doc = null;
    this.__registeredHandler = {};
    this.__knownActionTypes = { command : true,
                                content : true,
                                custom : true };

    this.__populateCommandList();

    this.__handleKeyPress = qx.lang.Function.bind(this._handleKeyPress, this);
    this.__handleMouseUp = qx.lang.Function.bind(this._handleMouseUp, this);

    if ((qx.core.Environment.get("engine.name") == "mshtml")) {
      this.__handleMouseDown = qx.lang.Function.bind(this._handleMouseDown, this);
    }
  },


  /**
   * @lint ignoreDeprecated(_commands)
   */
  members :
  {
    __redoPossible : false,
    __undoPossible : false,

    __contentChange : false,

    __knownActionTypes : null,

    /* Map with infos about custom registered handler */
    __registeredHandler : null,

    __commandManager : null,
    __doc : null,
    __undoStack : null,
    __redoStack : null,
    __editorInstance : null,
    __handleKeyPress : null,
    __handleMouseUp : null,
    __handleMouseDown : null,
    __currentContent : null,


    /* *******************************************************
     *
     *                 PUBLIC METHODS
     *
     * *******************************************************/

    /**
     * Set the document instance on which the UndoManager should perform his actions.
     *
     * @param doc {Document} document node to work on
     */
    setContentDocument : function(doc)
    {
      this.__doc = doc;
      this.__commandManager.setContentDocument(doc);

      qx.event.Registration.addListener(doc.body, "keypress", this.__handleKeyPress, this);

      // monitor internal changes like image resizing etc.
      qx.event.Registration.addListener(doc.body, "mouseup", this.__handleMouseUp, this);

      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        // monitor internal changes like image resizing etc.
        qx.event.Registration.addListener(doc.body, "mousedown", this.__handleMouseDown, this, true);
      }
    },


    /**
     * Inserts a paragraph when hitting the "enter" key.
     * Delegates to the real command manager instance.
     *
     * @return {Boolean} whether the key event should be stopped or not
     */
    insertParagraphOnLinebreak : function() {
      return this.__commandManager.insertParagraphOnLinebreak();
    },


    /**
     * Executes the given command and collects (if necessary) undo information.
     *
     * @param command {String} Command to execute
     * @param value {String|Integer|null} Value of the command (if any)
     * @return {Boolean} Result of operation
     */
    execute : function(command, value)
    {
      var result;

      // Normalize
      command = command.toLowerCase();

      // Check for commands handled directly be this manager otherwise pass it
      // along to the command manager and collect undo infos.
      if (this._commands[command])
      {
        // Pass all commands directly to the commandManager if they marked as
        // "passthrough". This way it is possible to execute commands without
        // adding them to the undoStack.
        if (this._commands[command].passthrough) {
          result = this.__commandManager.execute(command, value);
        } else {
          result = this[command].call(this);
        }
      }
      else
      {
        if ((qx.core.Environment.get("engine.name") == "mshtml") ||
            (qx.core.Environment.get("engine.name") == "webkit"))
        {
          this.__collectUndoInfo(command, value, this.__commandManager.getCommandObject(command));

          result = this.__commandManager.execute(command, value);

          // remove last undo step from stack if command wasn't successful
          if (!result) {
            this.__undoStack.pop();
          }
        }
        else
        {
          result = this.__commandManager.execute(command, value);

          if (result) {
            this.__collectUndoInfo(command, value, this.__commandManager.getCommandObject(command));
          }
        }

        if (command == "undo" && this.__undoStack.length == 0)
        {
          this.__undoPossible = false;
          this.__fireUndoRedoStateEvent();
        }
        else if (command == "redo" && this.__redoStack.length == 0)
        {
          this.__redoPossible = false;
          this.__fireUndoRedoStateEvent();
        }
      }

      this.__contentChange = false;

      return result;
    },


    /**
     * Public API method to add an undo step
     *
     * @param command {String} Command identifier
     * @param value {String} value of command
     * @param commandObject {Object} Info object about command
     *
     */
    addUndoStep : function(command, value, commandObject) {
      this.__collectUndoInfo(command, value, commandObject);
    },


    /**
     * Register a handler for a customized actionType. This handler methods
     * (undo and redo) are called whenever the UndoManager encounters the
     * given actionType to undo/redo the change.
     *
     * @param actionType {String} actionType to react on with undo and redo methods
     * @param undoHandler {Function} undo method
     * @param redoHandler {Function} redo method
     * @param context {Object} In this context the methods are called. When no
     *               context is given the context is the UndoManager itself.
     *
     *
     */
    registerHandler : function(actionType, undoHandler, redoHandler, context)
    {
      this.__registeredHandler[actionType] = { undo    : undoHandler,
                                               redo    : redoHandler,
                                               context : context };
    },


    /* *******************************************************
     *
     *                  UNDO METHODS
     *
     * *******************************************************/


    /**
     * Service method to check if an undo operation is currently possible
     *
     * @return {Boolean} Whether an undo is possible or not
     */
    isUndoPossible : function() {
      return this.__undoPossible;
    },


    /**
     * Undo facade method. The different types of undo (command/custom/content)
     * are delegated to their specialized implementation.
     *
     * @return {Boolean}
     */
    undo : function()
    {
       var result;

       if (this.__contentChange) {
         this.__addAdditionalContentUndoStep();
       }

       // Look after the change history
       // if any custom change was found undo it manually
       if (this.__undoStack.length > 0)
       {
         var undoStep = this.__undoStack.pop();

         if (this.__knownActionTypes[undoStep.actionType.toLowerCase()])
         {
           switch(undoStep.actionType)
           {
             case "Command":
               result = this.__undoCommand(undoStep);
               break;

             case "Content":
               result = this.__undoContent(undoStep);
               break;

             case "Internal":
               result = this.__undoInternal(undoStep);
               break;

             case "Custom":
               result = this.__undoCustom(undoStep);
               break;
           }
         }
         // Any there any handlers which are registered to this actionType?
         else if(this.__registeredHandler[undoStep.actionType])
         {
            var handler = this.__registeredHandler[undoStep.actionType];
            result = handler.undo.call(handler.context ? handler.context : this, undoStep);

            // add it automatically to the redoStack
            this.__addToRedoStack(undoStep);
         }
         else {
           this.error("actionType " + undoStep.actionType + " is not managed! Please provide a handler method!");
         }

         this.__redoPossible = true;
         this.__fireUndoRedoStateEvent();

         return result;
       }
     },


     /**
      * Undo a custom command like setting a backgroumd image/color. These commands
      * are not supported by the browsers with an execCommand identifier. The command
      * has to be executed manually and therefore the undo mechanism.
      *
      * @param undoInfo {Object} Undo info object
      * @return {Boolean}
      */
    __undoCustom : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(undoInfo)
      {
        var currentContent = this.__doc.body.innerHTML;

        var oldContent = undoInfo.content;
        this.__doc.body.innerHTML = oldContent;

        var redoAction = undoInfo;
        redoAction.content = currentContent;
        this.__addToRedoStack(redoAction);

        return true;
      },

      "default" : function(undoInfo)
      {
        // Fill the info for the (possible) redo
        var redoAction = undoInfo;
        var Style = qx.bom.element.Style;

        // Add the (different) needed parameter for the redo
        switch(undoInfo.command)
        {
          case "backgroundcolor":
            redoAction.parameter = [ Style.get(this.__doc.body, "backgroundColor") ];
          break;

          case "backgroundimage":
            redoAction.parameter = [ Style.get(this.__doc.body, "backgroundImage"),
                                     Style.get(this.__doc.body, "backgroundRepeat"),
                                     Style.get(this.__doc.body, "backgroundPosition") ];
          break;
        }

        this.__addToRedoStack(redoAction);

        // Remove the link manually
        // Only necessary if the link was inserted at a collapsed selection
        if (undoInfo.command == "inserthyperlink")
        {
          if ((qx.core.Environment.get("engine.name") == "gecko"))
          {
            var linkId = "qx_link" + this.__commandManager.__hyperLinkId;
            var link = this.__doc.getElementById(linkId);

            if (link)
            {
              link.parentNode.removeChild(link);

              return true;
            }
            else {
              return false;
            }
          }
        }
        else {
          return this.__commandManager.execute(undoInfo.command, undoInfo.value);
        }
      }
    }),


    /**
     * Undo a browser-supported command.
     *
     * @param undoInfo {Object} Undo info object
     * @return {Boolean}
     * @signature function(undoInfo)
     */
    __undoCommand : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(undoInfo) {},

      "default" : function(undoInfo)
      {
        this.__addToRedoStack(undoInfo);

        if ((qx.core.Environment.get("engine.name") == "gecko"))
        {
          if (undoInfo.command == "inserthtml" &&
              undoInfo.value == qx.bom.htmlarea.HtmlArea.EMPTY_DIV &&
              this.__checkForNextUndoStep("inserthtml", "insertParagraph"))
          {
            this.__executeExtraUndoStep();
          }
        }

        return this.__performUndo();
      }
    }),


    /**
     * Checks the next undo step with specific conditions
     *
     * @param command {String} command name
     * @param value {String} command value
     * @return {Boolean} Whether a next undo step is available
     */
    __checkForNextUndoStep : function(command, value)
    {
      if (this.__undoStack.length > 0)
      {
        var nextUndoStep = this.__undoStack[this.__undoStack.length-1];
        return (nextUndoStep.command == command &&
                nextUndoStep.value == value);
      }

      return false;
    },


    /**
     * Sometimes it's necessary to perform two undo steps. Helper method to
     * to keep the stacks in correct state.
     *
     */
    __executeExtraUndoStep : function()
    {
      this.__performUndo();

      if (this.__undoStack.length > 0)
      {
        var nextUndoStep = this.__undoStack.pop();
        this.__addToRedoStack(nextUndoStep);
      }
    },


    /**
     * Undo an internal change like resizing an image/add table cell
     *
     * @param undoInfo {Object} Undo info object
     * @return {Boolean} Success of command
     */
    __undoInternal : function(undoInfo)
    {
      this.__addToRedoStack(undoInfo);

      return this.__performUndo();
    },


    /**
     * Undo content manipulation.
     *
     * @param undoInfo {Object} Undo info object
     * @return {Boolean}
     * @signature function(undoInfo)
     */
    __undoContent : qx.core.Environment.select("engine.name", {
      "gecko" : function(undoInfo)
      {
        this.__addToRedoStack(undoInfo);

        try {
          return this.__performUndo();
        }
        catch(error)
        {
          /* It appears, that an execCommand was bound to an element which is not available when calling 'undo' */
          if (qx.core.Environment.get("qx.debug")) {
            this.error("execCommand failed! Details: " + error)
          }
        }
      },

      "mshtml|webkit" : function(undoInfo) {},

      "default" : function(undoInfo)
      {
        this.__addToRedoStack(undoInfo);

        return this.__performUndo();
      }
    }),


    /**
     * Wrapper method for undo execCommand to prevent any exceptions bubbling
     * up to the user.
     *
     * @return {Boolean} Success of execCommand
     */
    __performUndo : function()
    {
      try {
        return this.__doc.execCommand("Undo", false, null);
      } catch(e) {
        return false;
      }
    },



    /* *******************************************************
     *
     *                  REDO METHODS
     *
     * *******************************************************/

    /**
     * Service method to check if a redo operation is currently possible
     *
     * @return {Boolean} Whether redo is possible or not
     */
    isRedoPossible : function() {
      return this.__redoPossible;
    },


    /**
     * Redo facade method. The different types of redo (command/custom/content)
     * are delegated to their specialized implementation.
     *
     * @return {Boolean}
     */
     redo : function()
     {
       if (this.__redoPossible)
       {
         var result;

         // Look after the change history
         // if any custom change was found redo it manually
         if (this.__redoStack.length > 0)
         {
           var redoStep = this.__redoStack.pop();

           if (this.__knownActionTypes[redoStep.actionType.toLowerCase()])
           {
             switch(redoStep.actionType)
             {
               case "Command":
                 result = this.__redoCommand(redoStep);
                 break;

               case "Content":
                 result = this.__redoContent(redoStep);
                 break;

               case "Internal":
                 result = this.__redoInternal(redoStep);
                 break;

               case "Custom":
                 result = this.__redoCustom(redoStep);
                 break;
             }
           }
           else if(this.__registeredHandler[redoStep.actionType])
           {
              var handler = this.__registeredHandler[redoStep.actionType];
              result = handler.redo.call(handler.context ? handler.context : this, redoStep);

              // add it automatically to the undoStack
              this.__addToUndoStack(redoStep);
           }
           else
           {
             this.error("actionType " + redoStep.actionType + " is not managed! Please provide a handler method!");
           }

           this.__undoPossible = true;
           this.__fireUndoRedoStateEvent();
         }

         return result;
      }
    },


    /**
     * Redo a custom command.
     *
     * @param redoInfo {Object} Redo info object
     * @return {Boolean}
     * @signature function(redoInfo)
     */
    __redoCustom : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(redoInfo)
      {
        var currentContent = this.__doc.body.innerHTML;

        var newContent = redoInfo.content;
        this.__doc.body.innerHTML = newContent;

        var undoInfo = redoInfo;
        undoInfo.content = currentContent;
        this.__addToUndoStack(undoInfo);

        return true;
      },

      "default" : function(redoInfo)
      {
        this.__addToUndoStack(redoInfo);

        return this.__performRedo();
      }
    }),


    /**
     * Redo a browser-supported command.
     *
     * @param redoInfo {Object} Redo info object
     * @return {Boolean}
     * @signature function(redoInfo)
     */
    __redoCommand : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(redoInfo) {},

      "default" : function(redoInfo)
      {
        this.__addToUndoStack(redoInfo);

        var result = this.__performRedo();

        if ((qx.core.Environment.get("engine.name") == "gecko"))
        {
          if (this.__checkForNextRedoStep("inserthtml", qx.bom.htmlarea.HtmlArea.EMPTY_DIV))
          {
            // we need to catch the focused paragraph before the extra redo step
            var focusedParagraph = this.__getFocusedParagraph();

            this.__executeExtraRedoStep();

            if (focusedParagraph != null) {
              this.__correctCaretPositionAfterRedo(focusedParagraph);
            }
          }
        }

        return result;
      }
    }),


    /**
     * Checks the next redo step with specific conditions
     *
     * @param command {String} command name
     * @param value {String} command value
     * @return {Boolean} Whether a next redo step is available
     */
    __checkForNextRedoStep : function(command, value)
    {
      if (this.__redoStack.length > 0)
      {
        var nextRedoStep = this.__redoStack[this.__redoStack.length-1];
        return (nextRedoStep.command == command &&
                nextRedoStep.value == value);
      }

      return false;
    },


    /**
     * Returns the current focused paragraph or null if the no paragraph
     * is within the selection.
     *
     * @return {Element?null} P element or null
     */
    __getFocusedParagraph : function()
    {
      if (this.__editorInstance == null) {
        return null;
      }

      var selection = this.__editorInstance.getSelection();
      var focusNode = selection ? selection.focusNode : null;

      if (focusNode == null) {
        return null;
      }

      try
      {
        while (focusNode.nodeName.toLowerCase() != "p")
        {
          focusNode = focusNode.parentNode;

          if (!focusNode || qx.dom.Node.isNodeName(focusNode, "body")) {
            return null;
          }
        }
      }
      catch (exc)
      {
        return null;
      }

      if (focusNode != null && qx.dom.Node.isNodeName(focusNode, "p")) {
        return focusNode;
      } else {
        return null;
      }
    },


    /**
     * Sometimes it is necessary to perform two redo steps at once. Helper method.
     */
    __executeExtraRedoStep : function()
    {
      var nextRedoStep = this.__redoStack.pop();
      this.__addToUndoStack(nextRedoStep);
      this.__performRedo();
    },


    /**
     * Gecko does position the caret at the wrong position after redo commands.
     * Helper method to correct this wrong behaviour.
     *
     */
    __correctCaretPositionAfterRedo : qx.core.Environment.select("engine.name", {
      "gecko" : function(currentParagraph)
      {
        if (currentParagraph == this.__editorInstance.getContentBody().lastChild) {
          return;
        }

        var nodeToSelect = currentParagraph.firstChild;
        while (nodeToSelect.firstChild) {
          nodeToSelect = nodeToSelect.firstChild;
        }

        var selection = this.__editorInstance.getSelection();
        var range = this.__editorInstance.getRange();

        if (selection && range)
        {
          range.selectNode(nodeToSelect);
          selection.addRange(range);
          range.collapse(true);
        }
      },

      "default" : (function() {})
    }),


    /**
     * Redo an internal change like resizing an image/add table cell
     *
     * @param redoInfo {Object} Undo info object
     * @return {Boolean} Success of command
     */
    __redoInternal : function(redoInfo)
    {
      this.__addToUndoStack(redoInfo);

      return this.__performRedo();
    },


    /**
     * Redo a content manipulation
     *
     * @param redoInfo {Object} Redo info object
     * @return {Boolean}
     * @signature function(redoInfo)
     */
    __redoContent : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(redoInfo) {},

      "default" : function(redoInfo)
      {
        this.__addToUndoStack(redoInfo);
        return this.__performRedo();
      }
    }),


    /**
     * Wrapper method for redo execCommand to prevent any exceptions bubbling
     * up to the user.
     *
     * @return {Boolean} Success of execCommand
     */
    __performRedo : function()
    {
      try {
        return this.__doc.execCommand("Redo", false, null);
      } catch(e) {
        return false;
      }
    },


    /* *******************************************************
     *
     *             PRIVATE UTILITY METHODS
     *
     * *******************************************************/

    /**
     * Populates the internal command list. This list determines
     * which commands are handled directly by the undo manager and
     * which commands are passed through (without added to the undo/redo
     * history).
     *
     */
    __populateCommandList : function()
    {
      this._commands = {
        undo         : { passthrough : false },
        redo         : { passthrough : false }
      };

      /*
       * Actions for which a special undo operation is needed because
       * the browser could not handle them automatically with the "undo"
       * execCommand. This is only needed for non-mshtml as IE uses his own
       * undo mechanism.
       */
      this.__commandManager.getCommandObject("backgroundcolor").customUndo = true;
      this.__commandManager.getCommandObject("backgroundimage").customUndo = true;

      if ((qx.core.Environment.get("engine.name") == "gecko")) {
        // TODO: disable the undo of links which are not created at a text selection.
        //       Check if it's applicable at all to allow inserting links without
        //       a valid text selection
        // this.__commandManager.getCommandObject("inserthyperlink").customUndo = true;
      }
    },


    /**
     * Collects the necessary info about the current action and adds this
     * info to the undo history.
     *
     * @param command {String} command to execute
     * @param value {String ? Integer ? null} Value of the command (if any)
     * @param commandObject {Object} internal commandObject
     */
    __collectUndoInfo : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(command, value, commandObject)
      {
        var undoObject = this.getUndoRedoObject();
        undoObject.commandObject = commandObject;
        undoObject.command = command;
        undoObject.value = value;
        undoObject.actionType = "Custom";
        undoObject.content = this.__doc.body.innerHTML;

        this.__updateUndoStack(undoObject);
      },

      "default" : function(command, value, commandObject)
      {
        if (this.__editorInstance == null) {
          return;
        }

        var undoObject = this.getUndoRedoObject();
        undoObject.commandObject = commandObject;
        undoObject.command = command;
        undoObject.value = value;
        undoObject.actionType = "Custom";

        var sel = this.__editorInstance.getSelection();

        if (commandObject.customUndo)
        {
          var parameters = [];
          switch(command)
          {
            case "backgroundcolor":
              parameters.push(qx.bom.element.Style.get(this.__doc.body, "backgroundColor"));
            break;

            case "backgroundimage":
              parameters.push(qx.bom.element.Style.get(this.__doc.body, "backgroundImage"),
                              qx.bom.element.Style.get(this.__doc.body, "backgroundRepeat"),
                              qx.bom.element.Style.get(this.__doc.body, "backgroundPosition"));
            break;

            case "inserthyperlink":
              // If the hyperlinks gets inserted on a selection treat it as a command step
              if (sel && !sel.isCollapsed) {
                undoObject.actionType = "Command";
              }
            break;
          }

          undoObject.parameter  = parameters;
        }
        else
        {
          if ((qx.core.Environment.get("engine.name") == "gecko"))
          {
            /*
             * Ignore commands which normally act on ranges if the current range
             * is collapsed, e.g. Gecko DOES NOT mark setting a collapsed range to
             * bold as an extra action.
             * However commands like inserting an ordered list or table which do not
             * need to act on a range to work should be captured.
             *
             */
            if (sel && sel.isCollapsed)
            {
              switch(command)
              {
                // TODO: create a list of all commands which DO NOT need to act on a range to perform!
                case "insertorderedlist":
                case "insertunorderedlist":
                case "justifyright":
                case "inserthtml":
                case "insertimage":
                  undoObject.actionType = "Command";
                break;

                default:
                  return;
              }
            }
            else {
              undoObject.actionType = "Command";
            }
          }
          else {
            undoObject.actionType = "Command";
          }
        }

        this.__updateUndoStack(undoObject);
      }
    }),


    /**
      * Adds the occurred changes to the undo history and
      * sets a flag for the redo action.
      *
      * @param changeInfo {Object ? String} Infos of the change.
      *                                     Either a map containing details or null for change through a command identifier
      */
     __updateUndoStack : function(changeInfo)
     {
       if (this.__contentChange) {
         this.__addAdditionalContentUndoStep();
       }

       this.__addToUndoStack(changeInfo);

       this.__redoPossible = false;
       this.__redoStack    = [];

       this.__fireUndoRedoStateEvent();
     },


     /**
      * Add additional "Content" undo step if the last is no "Content" undo step.
      */
     __addAdditionalContentUndoStep : function()
     {
       var lastUndoStep = this.__undoStack[this.__undoStack.length - 1];
       if (lastUndoStep == null || lastUndoStep.actionType != "Content")
       {
         var undoObject = this.getUndoRedoObject();
         undoObject.actionType = "Content";

         if ((qx.core.Environment.get("engine.name") == "mshtml") ||
             (qx.core.Environment.get("engine.name") == "webkit")) {
           undoObject.content = this.__currentContent;
           undoObject.actionType = "Custom";
           this.__currentContent = null;
         }

         this.__addToUndoStack(undoObject);

         this.__contentChange = false;
       }
     },


     /**
      * Helper method to get an undo object which is added to the undoStack
      *
      * @return {Object} undo object
      */
     getUndoRedoObject : function()
     {
       return {
        actionType: null,
        commandObject: null,
        command: null,
        value: null,
        parameter: null,
        range: null,
        marker: null,
        content: null
      };
     },


     /**
      * Utility method to add an entry to the undoStack.
      *
      * @param changeInfo {Object} Infos of the change
      */
     __addToUndoStack : function(changeInfo)
     {
       if ((qx.core.Environment.get("qx.debug")) &&
           qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug"))
       {
         this.debug("ADD TO UNDO STACK");
         this.debug(changeInfo.actionType + " " + changeInfo.command + " " + changeInfo.value);
       }

       this.__undoStack.push(changeInfo);
     },


     /**
      * Utility method to add an entry to the redoStack.
      *
      * @param changeInfo {Object} Infos of the change
      */
    __addToRedoStack : function(changeInfo)
    {
      if ((qx.core.Environment.get("qx.debug")) &&
          qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug"))
      {
        this.debug("ADD TO REDO STACK");
        this.debug(changeInfo.actionType + " " + changeInfo.command + " " + changeInfo.value);
      }

      this.__redoStack.push(changeInfo);
    },


     /**
     * Key press handler for the undo manager. Only acts on specific events which
     * are important to the undo manager.
     *
     * @param e {qx.event.type.KeySequence} key event instance
     */
    _handleKeyPress : function(e)
    {
      var keyIdentifier = e.getKeyIdentifier().toLowerCase();
      var isCtrlPressed = e.isCtrlPressed();

      switch(keyIdentifier)
      {
        case "control":
        case "shift":
        case "left":
        case "right":
        case "up":
        case "down":
        case "pageup":
        case "pagedown":
        case "home":
        case "end":
        case "enter":
          // these keys do not mark a content change by the user
        break;

        case "a":
        case "b":
        case "i":
        case "u":
        case "k":
        case "y":
        case "z":
          // hitting hotkeys do not mark a content change
          if (!isCtrlPressed) {
            this.__markContentChange();
          }
        break;

        default:
          this.__redoPossible = false;
          this.__redoStack = [];
          this.__markContentChange();
       }
    },


    /**
     * A content change which is handled as separate undo step is marked.
     *
     */
    __markContentChange : function()
    {
      if (!this.__contentChange)
      {
        this.__contentChange = true;
        this.__undoPossible = true;

        // store current content for adding it to undo stack later
        if ((qx.core.Environment.get("engine.name") == "mshtml") ||
            (qx.core.Environment.get("engine.name") == "webkit")) {
          this.__currentContent = this.__doc.body.innerHTML;
        }

        this.__fireUndoRedoStateEvent();
      }
    },


    /** Holds the selected node for comparing between mouseUp and mouseDown events */
    __selectedNode : null,


    /**
     * Mouse down handler method.
     * Currently only implemented for IE.
     * Used to track internal changes like resizing an image or a table element.
     *
     * @param e {DOMevent} mouse event instance
     */
    _handleMouseDown : qx.core.Environment.select("engine.name", {
      "mshtml" : function(e)
      {
        var checkNode = e.getOriginalTarget();

        if (qx.dom.Node.isElement(checkNode) &&
            (qx.dom.Node.isNodeName(checkNode, "img") || qx.dom.Node.isNodeName(checkNode, "table")))
        {
          this.__selectedNode = { node : checkNode,
                                  content : checkNode.outerHTML};
        }
        else {
          this.__selectedNode = null;
        }
      },

      "default" : function(e) {
        return true;
      }
    }),


    /**
     * Mouse up handler method.
     * Used to track internal changes like resizing an image or a table element.
     *
     * @param e {DOMevent} mouse event instance
     */
    _handleMouseUp : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(e)
      {
        if (this.__editorInstance == null) {
          return;
        }

        var sel = this.__editorInstance.getSelection();

        if (!sel)
        {
          this.__selectedNode = null;
          return;
        }

        var anchorNode = sel.anchorNode;
        var checkNode = anchorNode.childNodes[sel.anchorOffset];

        // We have direct access to the currently selected node (e.g. an image)
        if (qx.dom.Node.isNodeName(checkNode, "img"))
        {
          // Store the element if is not available
          // otherwise compare the current image element with the stored one
          if (this.__selectedNode == null) {
            this.__selectedNode = checkNode.cloneNode(true);
          }
          else
          {
            if (this.__selectedNode.style.width != checkNode.style.width ||
                this.__selectedNode.style.height != checkNode.style.height)
            {
              // A change occurred -> add undo step and update the stored element
              this.__addInternalUndoStep();
              this.__selectedNode = checkNode.cloneNode(true);
            }
          }
        }
        else if (qx.dom.Node.isNodeName(anchorNode, "td") ||
                 qx.dom.Node.isNodeName(anchorNode.parentNode, "td"))
        {
          var tableNode = anchorNode.parentNode;

          while (qx.dom.Node.isNodeName(tableNode, "table")) {
            tableNode = tableNode.parentNode;
          }

          // Store the element if is not available
          // otherwise compare the current table element with the stored one
          if (this.__selectedNode == null) {
            this.__selectedNode = tableNode.cloneNode(true);
          }
          else
          {
            /*
             * Comparison is done inside a timeout method
             * to be sure that the changes (like adding a table cell)
             * to the DOM are already done.
             */
            qx.event.Timer.once(function()
            {
              // Compare width and height and innerHTML
              if (tableNode.style.width != this.__selectedNode.style.width ||
                  tableNode.style.height != this.__selectedNode.style.height ||
                  tableNode.innerHTML != this.__selectedNode.innerHTML)
              {
                // A change occurred -> add undo step and update the stored element
                this.__addInternalUndoStep();
                this.__selectedNode = tableNode.cloneNode(true);
              }
            }, this, 0);
          }
        }
        else {
          this.__selectedNode = null;
        }
      },

      "default" : function(e)
      {
        var checkNode = qx.bom.Event.getTarget(e);

        if (this.__selectedNode != null)
        {
          if (checkNode.nodeType == 1)
          {
            /* Check the clicked element otherwise check the childNodes */
            if (checkNode == this.__selectedNode.node)
            {
              if (checkNode.outerHTML != this.__selectedNode.content)
              {
                this.__selectedNode.content = checkNode.outerHTML;
                this.__addInternalUndoStep();
              }
            }
            else
            {
              for (var i=0, j=checkNode.childNodes.length; i<j; i++)
              {
                if (checkNode.childNodes[i] == this.__selectedNode.node)
                {
                  if (checkNode.childNodes[i].outerHTML != this.__selectedNode.content)
                  {
                    this.__selectedNode.content = checkNode.childNodes[i].outerHTML;
                    this.__addInternalUndoStep();
                  }
                }
              }
            }
          }
          else {
            this.__selectedNode = null;
          }
        }
      }
    }),


    /**
     * Adds an internal undo step to the undo stack.
     *
     */
    __addInternalUndoStep : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function() {
        this.__collectUndoInfo("Internal", null, null);
      },

      "default" : function()
      {
        var undoStep = this.getUndoRedoObject();
        undoStep.actionType = "Internal";

        this.__addToUndoStack(undoStep);
      }
    }),


    /**
     * Fires the "undoRedoState" event to inform external components (like a toolbar)
     * about the current state of the undo/redo.
     * The event itself is fired from the HtmlArea instance and with a
     * timeout to not interfere with the current key event.
     *
     */
    __fireUndoRedoStateEvent : function()
    {
      qx.event.Timer.once(function(e)
      {
        // it may happen that this asynchronous function is executed during/after
        // the dispose phase.
        if (this.__editorInstance != null)
        {
          var data = {
            undo : this.isUndoPossible() ? 0 : -1,
            redo : this.isRedoPossible() ? 0 : -1
          };
          this.__editorInstance.fireDataEvent("undoRedoState", data);
        }
      }, this, 200);
    }
  },


  /**
   * Destructor
   */
  destruct : function()
  {
    try
    {
      qx.event.Registration.removeListener(this.__doc.body, "keypress", this.__handleKeyPress);
      qx.event.Registration.removeListener(this.__doc, "mouseup", this.__handleMouseUp);

      if ((qx.core.Environment.get("engine.name") == "mshtml")) {
        qx.event.Registration.removeListener(this.__doc, "mousedown", this.__handleMouseDown);
      }
    }
    catch(e) {}

    this._disposeObjects("__commandManager");
    this.__editorInstance = this.__undoStack = this.__redoStack = this._commands = this.__doc = null;
    this.__knownActionTypes = this.__registeredHandler = null;
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
     * Martin Wittemann (martinwittemann)
     * Sebastian Werner (wpbasti)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Basic class for a selectbox like lists. Basically supports a popup
 * with a list and the whole children management.
 *
 * @childControl list {qx.ui.form.List} list component of the selectbox
 * @childControl popup {qx.ui.popup.Popup} popup which shows the list
 *
 */
qx.Class.define("qx.ui.form.AbstractSelectBox",
{
  extend  : qx.ui.core.Widget,
  include : [
    qx.ui.core.MRemoteChildrenHandling,
    qx.ui.form.MForm
  ],
  implement : [
    qx.ui.form.IForm
  ],
  type : "abstract",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // set the layout
    var layout = new qx.ui.layout.HBox();
    this._setLayout(layout);
    layout.setAlignY("middle");

    // Register listeners
    this.addListener("keypress", this._onKeyPress);
    this.addListener("blur", this._onBlur, this);

    // register mouse wheel listener
    var root = qx.core.Init.getApplication().getRoot();
    root.addListener("mousewheel", this._onMousewheel, this, true);

    // register the resize listener
    this.addListener("resize", this._onResize, this);
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    // overridden
    width :
    {
      refine : true,
      init : 120
    },

    /**
     * The maximum height of the list popup. Setting this value to
     * <code>null</code> will set cause the list to be auto-sized.
     */
    maxListHeight :
    {
      check : "Number",
      apply : "_applyMaxListHeight",
      nullable: true,
      init : 200
    },

    /**
     * Formatter which format the value from the selected <code>ListItem</code>.
     * Uses the default formatter {@link #_defaultFormat}.
     */
    format :
    {
      check : "Function",
      init : function(item) {
        return this._defaultFormat(item);
      },
      nullable : true
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "list":
          control = new qx.ui.form.List().set({
            focusable: false,
            keepFocus: true,
            height: null,
            width: null,
            maxHeight: this.getMaxListHeight(),
            selectionMode: "one",
            quickSelection: true
          });

          control.addListener("changeSelection", this._onListChangeSelection, this);
          control.addListener("mousedown", this._onListMouseDown, this);
          break;

        case "popup":
          control = new qx.ui.popup.Popup(new qx.ui.layout.VBox);
          control.setAutoHide(false);
          control.setKeepActive(true);
          control.addListener("mouseup", this.close, this);
          control.add(this.getChildControl("list"));

          control.addListener("changeVisibility", this._onPopupChangeVisibility, this);
          break;
      }

      return control || this.base(arguments, id);
    },



    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyMaxListHeight : function(value, old) {
      this.getChildControl("list").setMaxHeight(value);
    },



    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the list widget.
     * @return {qx.ui.form.List} the list
     */
    getChildrenContainer : function() {
      return this.getChildControl("list");
    },



    /*
    ---------------------------------------------------------------------------
      LIST STUFF
    ---------------------------------------------------------------------------
    */

    /**
     * Shows the list popup.
     */
    open : function()
    {
      var popup = this.getChildControl("popup");

      popup.placeToWidget(this, true);
      popup.show();
    },


    /**
     * Hides the list popup.
     */
    close : function() {
      this.getChildControl("popup").hide();
    },


    /**
     * Toggles the popup's visibility.
     */
    toggle : function()
    {
      var isListOpen = this.getChildControl("popup").isVisible();
      if (isListOpen) {
        this.close();
      } else {
        this.open();
      }
    },


    /*
    ---------------------------------------------------------------------------
      FORMAT HANDLING
    ---------------------------------------------------------------------------
    */


    /**
     * Return the formatted label text from the <code>ListItem</code>.
     * The formatter removes all HTML tags and converts all HTML entities
     * to string characters when the rich property is <code>true</code>.
     *
     * @param item {ListItem} The list item to format.
     * @return {String} The formatted text.
     */
    _defaultFormat : function(item)
    {
      var valueLabel = item ? item.getLabel() : "";
      var rich = item ? item.getRich() : false;

      if (rich) {
        valueLabel = valueLabel.replace(/<[^>]+?>/g, "");
        valueLabel = qx.bom.String.unescape(valueLabel);
      }

      return valueLabel;
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for the blur event of the current widget.
     *
     * @param e {qx.event.type.Focus} The blur event.
     */
    _onBlur : function(e)
    {
      this.close();
    },


    /**
     * Reacts on special keys and forwards other key events to the list widget.
     *
     * @param e {qx.event.type.KeySequence} Keypress event
     */
    _onKeyPress : function(e)
    {
      // get the key identifier
      var identifier = e.getKeyIdentifier();
      var listPopup = this.getChildControl("popup");

      // disabled pageUp and pageDown keys
      if (listPopup.isHidden() && (identifier == "PageDown" || identifier == "PageUp")) {
        e.stopPropagation();
      }

      // hide the list always on escape
      else if (!listPopup.isHidden() && identifier == "Escape")
      {
        this.close();
        e.stop();
      }

      // forward the rest of the events to the list
      else
      {
        this.getChildControl("list").handleKeyPress(e);
      }
    },


    /**
     * Close the pop-up if the mousewheel event isn't on the pup-up window.
     *
     * @param e {qx.event.type.Mouse} Mousewheel event.
     */
    _onMousewheel : function(e)
    {
      var target = e.getTarget();
      var popup = this.getChildControl("popup", true);

      if (popup == null) {
        return;
      }

      if (qx.ui.core.Widget.contains(popup, target)) {
        // needed for ComboBox widget inside an inline application
        e.preventDefault();
      } else {
        this.close();
      }
    },


    /**
     * Updates list minimum size.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onResize : function(e){
      this.getChildControl("popup").setMinWidth(e.getData().width);
    },


    /**
     * Syncs the own property from the list change
     *
     * @param e {qx.event.type.Data} Data Event
     */
    _onListChangeSelection : function(e) {
      throw new Error("Abstract method: _onListChangeSelection()");
    },


    /**
     * Redirects mousedown event from the list to this widget.
     *
     * @param e {qx.event.type.Mouse} Mouse Event
     */
    _onListMouseDown : function(e) {
      throw new Error("Abstract method: _onListMouseDown()");
    },


    /**
     * Redirects changeVisibility event from the list to this widget.
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onPopupChangeVisibility : function(e) {
      e.getData() == "visible" ? this.addState("popupOpen") : this.removeState("popupOpen");
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var root = qx.core.Init.getApplication().getRoot();
    if (root) {
      root.removeListener("mousewheel", this._onMousewheel, this, true);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * A selection manager, which handles the selection in widgets.
 */
qx.Class.define("qx.ui.core.selection.Widget",
{
  extend : qx.ui.core.selection.Abstract,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param widget {qx.ui.core.Widget} The widget to connect to
   */
  construct : function(widget)
  {
    this.base(arguments);

    this.__widget = widget;
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __widget : null,

    /*
    ---------------------------------------------------------------------------
      BASIC SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _isSelectable : function(item) {
      return this._isItemSelectable(item) && item.getLayoutParent() === this.__widget;
    },


    // overridden
    _selectableToHashCode : function(item) {
      return item.$$hash;
    },


    // overridden
    _styleSelectable : function(item, type, enabled) {
      enabled ? item.addState(type) : item.removeState(type);
    },


    // overridden
    _capture : function() {
      this.__widget.capture();
    },


    // overridden
    _releaseCapture : function() {
      this.__widget.releaseCapture();
    },


    /**
     * Helper to return the selectability of the item concerning the
     * user interaaction.
     *
     * @param item {qx.ui.core.Widget} The item to check.
     * @return {Boolean} true, if the item is selectable.
     */
    _isItemSelectable : function(item) {
      if (this._userInteraction) {
        return item.isVisible() && item.isEnabled();
      } else {
        return item.isVisible();
      }
    },


    /**
     * Returns the connected widget.
     * @return {qx.ui.core.Widget} The widget
     */
    _getWidget : function() {
      return this.__widget;
    },




    /*
    ---------------------------------------------------------------------------
      DIMENSION AND LOCATION
    ---------------------------------------------------------------------------
    */

    // overridden
    _getLocation : function()
    {
      var elem = this.__widget.getContentElement().getDomElement();
      return elem ? qx.bom.element.Location.get(elem) : null;
    },


    // overridden
    _getDimension : function() {
      return this.__widget.getInnerSize();
    },


    // overridden
    _getSelectableLocationX : function(item)
    {
      var computed = item.getBounds();
      if (computed)
      {
        return {
          left : computed.left,
          right : computed.left + computed.width
        };
      }
    },


    // overridden
    _getSelectableLocationY : function(item)
    {
      var computed = item.getBounds();
      if (computed)
      {
        return {
          top : computed.top,
          bottom : computed.top + computed.height
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getScroll : function()
    {
      return {
        left : 0,
        top : 0
      };
    },


    // overridden
    _scrollBy : function(xoff, yoff) {
      // empty implementation
    },


    // overridden
    _scrollItemIntoView : function(item) {
      this.__widget.scrollChildIntoView(item);
    },






    /*
    ---------------------------------------------------------------------------
      QUERY SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    getSelectables : function(all)
    {
      // if only the user selectables should be returned
      var oldUserInteraction = false;
      if (!all) {
        oldUserInteraction = this._userInteraction;
        this._userInteraction = true;
      }
      var children = this.__widget.getChildren();
      var result = [];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (this._isItemSelectable(child)) {
          result.push(child);
        }
      }

      // reset to the former user interaction state
      this._userInteraction = oldUserInteraction;
      return result;
    },


    // overridden
    _getSelectableRange : function(item1, item2)
    {
      // Fast path for identical items
      if (item1 === item2) {
        return [item1];
      }

      // Iterate over children and collect all items
      // between the given two (including them)
      var children = this.__widget.getChildren();
      var result = [];
      var active = false;
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child === item1 || child === item2)
        {
          if (active)
          {
            result.push(child);
            break;
          }
          else
          {
            active = true;
          }
        }

        if (active && this._isItemSelectable(child)) {
          result.push(child);
        }
      }

      return result;
    },


    // overridden
    _getFirstSelectable : function()
    {
      var children = this.__widget.getChildren();
      for (var i=0, l=children.length; i<l; i++)
      {
        if (this._isItemSelectable(children[i])) {
          return children[i];
        }
      }

      return null;
    },


    // overridden
    _getLastSelectable : function()
    {
      var children = this.__widget.getChildren();
      for (var i=children.length-1; i>0; i--)
      {
        if (this._isItemSelectable(children[i])) {
          return children[i];
        }
      }

      return null;
    },


    // overridden
    _getRelatedSelectable : function(item, relation)
    {
      var vertical = this.__widget.getOrientation() === "vertical";
      var children = this.__widget.getChildren();
      var index = children.indexOf(item);
      var sibling;

      if ((vertical && relation === "above") || (!vertical && relation === "left"))
      {
        for (var i=index-1; i>=0; i--)
        {
          sibling = children[i];
          if (this._isItemSelectable(sibling)) {
            return sibling;
          }
        }
      }
      else if ((vertical && relation === "under") || (!vertical && relation === "right"))
      {
        for (var i=index+1; i<children.length; i++)
        {
          sibling = children[i];
          if (this._isItemSelectable(sibling)) {
            return sibling;
          }
        }
      }

      return null;
    },


    // overridden
    _getPage : function(lead, up)
    {
      if (up) {
        return this._getFirstSelectable();
      } else {
        return this._getLastSelectable();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__widget = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */


/**
 * A selection manager, which handles the selection in widgets extending
 * {@link qx.ui.core.scroll.AbstractScrollArea}.
 */
qx.Class.define("qx.ui.core.selection.ScrollArea",
{
  extend : qx.ui.core.selection.Widget,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      BASIC SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _isSelectable : function(item)
    {
      return this._isItemSelectable(item) &&
        item.getLayoutParent() === this._getWidget().getChildrenContainer();
    },





    /*
    ---------------------------------------------------------------------------
      DIMENSION AND LOCATION
    ---------------------------------------------------------------------------
    */

    // overridden
    _getDimension : function() {
      return this._getWidget().getPaneSize();
    },





    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getScroll : function()
    {
      var widget = this._getWidget();

      return {
        left : widget.getScrollX(),
        top : widget.getScrollY()
      };
    },


    // overridden
    _scrollBy : function(xoff, yoff)
    {
      var widget = this._getWidget();

      widget.scrollByX(xoff);
      widget.scrollByY(yoff);
    },






    /*
    ---------------------------------------------------------------------------
      QUERY SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getPage : function(lead, up)
    {
      var selectables = this.getSelectables();
      var length = selectables.length;
      var start = selectables.indexOf(lead);

      // Given lead is not a selectable?!?
      if (start === -1) {
        throw new Error("Invalid lead item: " + lead);
      }

      var widget = this._getWidget();
      var scrollTop = widget.getScrollY();
      var innerHeight = widget.getInnerSize().height;
      var top, bottom, found;

      if (up)
      {
        var min = scrollTop;
        var i=start;

        // Loop required to scroll pages up dynamically
        while(1)
        {
          // Iterate through all selectables from start
          for (; i>=0; i--)
          {
            top = widget.getItemTop(selectables[i]);

            // This item is out of the visible block
            if (top < min)
            {
              // Use previous one
              found = i+1;
              break;
            }
          }

          // Nothing found. Return first item.
          if (found == null)
          {
            var first = this._getFirstSelectable();
            return first == lead ? null : first;
          }

          // Found item, but is identical to start or even before start item
          // Update min positon and try on previous page
          if (found >= start)
          {
            // Reduce min by the distance of the lead item to the visible
            // bottom edge. This is needed instead of a simple subtraction
            // of the inner height to keep the last lead visible on page key
            // presses. This is the behavior of native toolkits as well.
            min -= innerHeight + scrollTop - widget.getItemBottom(lead);
            found = null;
            continue;
          }

          // Return selectable
          return selectables[found];
        }
      }
      else
      {
        var max = innerHeight + scrollTop;
        var i=start;

        // Loop required to scroll pages down dynamically
        while(1)
        {
          // Iterate through all selectables from start
          for (; i<length; i++)
          {
            bottom = widget.getItemBottom(selectables[i]);

            // This item is out of the visible block
            if (bottom > max)
            {
              // Use previous one
              found = i-1;
              break;
            }
          }

          // Nothing found. Return last item.
          if (found == null)
          {
            var last = this._getLastSelectable();
            return last == lead ? null : last;
          }

          // Found item, but is identical to start or even before start item
          // Update max position and try on next page
          if (found <= start)
          {
            // Extend max by the distance of the lead item to the visible
            // top edge. This is needed instead of a simple addition
            // of the inner height to keep the last lead visible on page key
            // presses. This is the behavior of native toolkits as well.
            max += widget.getItemTop(lead) - scrollTop;
            found = null;
            continue;
          }

          // Return selectable
          return selectables[found];
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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * This mixin links all methods to manage the multi selection from the
 * internal selection manager to the widget.
 */
qx.Mixin.define("qx.ui.core.MMultiSelectionHandling",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    // Create selection manager
    var clazz = this.SELECTION_MANAGER;
    var manager = this.__manager = new clazz(this);

    // Add widget event listeners
    this.addListener("mousedown", manager.handleMouseDown, manager);
    this.addListener("mouseup", manager.handleMouseUp, manager);
    this.addListener("mouseover", manager.handleMouseOver, manager);
    this.addListener("mousemove", manager.handleMouseMove, manager);
    this.addListener("losecapture", manager.handleLoseCapture, manager);
    this.addListener("keypress", manager.handleKeyPress, manager);

    this.addListener("addItem", manager.handleAddItem, manager);
    this.addListener("removeItem", manager.handleRemoveItem, manager);

    // Add manager listeners
    manager.addListener("changeSelection", this._onSelectionChange, this);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fires after the selection was modified */
    "changeSelection" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */


  properties :
  {
    /**
     * The selection mode to use.
     *
     * For further details please have a look at:
     * {@link qx.ui.core.selection.Abstract#mode}
     */
    selectionMode :
    {
      check : [ "single", "multi", "additive", "one" ],
      init : "single",
      apply : "_applySelectionMode"
    },

    /**
     * Enable drag selection (multi selection of items through
     * dragging the mouse in pressed states).
     *
     * Only possible for the selection modes <code>multi</code> and <code>additive</code>
     */
    dragSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDragSelection"
    },

    /**
     * Enable quick selection mode, where no click is needed to change the selection.
     *
     * Only possible for the modes <code>single</code> and <code>one</code>.
     */
    quickSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyQuickSelection"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /** {qx.ui.core.selection.Abstract} The selection manager */
    __manager : null,


    /*
    ---------------------------------------------------------------------------
      USER API
    ---------------------------------------------------------------------------
    */


    /**
     * Selects all items of the managed object.
     */
    selectAll : function() {
      this.__manager.selectAll();
    },


    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {qx.ui.core.Widget} Any valid selectable item.
     * @return {Boolean} Whether the item is selected.
     * @throws {Error} if the item is not a child element.
     */
    isSelected : function(item) {
      if (!qx.ui.core.Widget.contains(this, item)) {
        throw new Error("Could not test if " + item +
          " is selected, because it is not a child element!");
      }

      return this.__manager.isItemSelected(item);
    },


    /**
     * Adds the given item to the existing selection.
     *
     * Use {@link #setSelection} instead if you want to replace
     * the current selection.
     *
     * @param item {qx.ui.core.Widget} Any valid item.
     * @throws {Error} if the item is not a child element.
     */
    addToSelection : function(item) {
      if (!qx.ui.core.Widget.contains(this, item)) {
        throw new Error("Could not add + " + item +
          " to selection, because it is not a child element!");
      }

      this.__manager.addItem(item);
    },


    /**
     * Removes the given item from the selection.
     *
     * Use {@link #resetSelection} when you want to clear
     * the whole selection at once.
     *
     * @param item {qx.ui.core.Widget} Any valid item
     * @throws {Error} if the item is not a child element.
     */
    removeFromSelection : function(item) {
      if (!qx.ui.core.Widget.contains(this, item)) {
        throw new Error("Could not remove " + item +
          " from selection, because it is not a child element!");
      }

      this.__manager.removeItem(item);
    },


    /**
     * Selects an item range between two given items.
     *
     * @param begin {qx.ui.core.Widget} Item to start with
     * @param end {qx.ui.core.Widget} Item to end at
     */
    selectRange : function(begin, end) {
      this.__manager.selectItemRange(begin, end);
    },


    /**
     * Clears the whole selection at once. Also
     * resets the lead and anchor items and their
     * styles.
     */
    resetSelection : function() {
      this.__manager.clearSelection();
    },


    /**
     * Replaces current selection with the given items.
     *
     * @param items {qx.ui.core.Widget[]} Items to select.
     * @throws {Error} if one of the items is not a child element and if
     *    the mode is set to <code>single</code> or <code>one</code> and
     *    the items contains more than one item.
     */
    setSelection : function(items) {
      for (var i = 0; i < items.length; i++) {
        if (!qx.ui.core.Widget.contains(this, items[i])) {
          throw new Error("Could not select " + items[i] +
            ", because it is not a child element!");
        }
      }

      if (items.length === 0) {
        this.resetSelection();
      } else {
        var currentSelection = this.getSelection();
        if (!qx.lang.Array.equals(currentSelection, items)) {
          this.__manager.replaceSelection(items);
        }
      }
    },


    /**
     * Returns an array of currently selected items.
     *
     * Note: The result is only a set of selected items, so the order can
     * differ from the sequence in which the items were added.
     *
     * @return {qx.ui.core.Widget[]} List of items.
     */
    getSelection : function() {
      return this.__manager.getSelection();
    },

    /**
     * Returns an array of currently selected items sorted
     * by their index in the container.
     *
     * @return {qx.ui.core.Widget[]} Sorted list of items
     */
    getSortedSelection : function() {
      return this.__manager.getSortedSelection();
    },

    /**
     * Whether the selection is empty
     *
     * @return {Boolean} Whether the selection is empty
     */
    isSelectionEmpty : function() {
      return this.__manager.isSelectionEmpty();
    },

    /**
     * Returns the last selection context.
     *
     * @return {String | null} One of <code>click</code>, <code>quick</code>,
     *    <code>drag</code> or <code>key</code> or <code>null</code>.
     */
    getSelectionContext : function() {
      return this.__manager.getSelectionContext();
    },

    /**
     * Returns the internal selection manager. Use this with
     * caution!
     *
     * @return {qx.ui.core.selection.Abstract} The selection manager
     */
    _getManager : function() {
      return this.__manager;
    },

    /**
     * Returns all elements which are selectable.
     *
     * @param all {Boolean} true for all selectables, false for the
     *   selectables the user can interactively select
     * @return {qx.ui.core.Widget[]} The contained items.
     */
    getSelectables: function(all) {
      return this.__manager.getSelectables(all);
    },

    /**
     * Invert the selection. Select the non selected and deselect the selected.
     */
    invertSelection: function() {
      this.__manager.invertSelection();
    },


    /**
     * Returns the current lead item. Generally the item which was last modified
     * by the user (clicked on etc.)
     *
     * @return {qx.ui.core.Widget} The lead item or <code>null</code>
     */
    _getLeadItem : function() {
      var mode = this.__manager.getMode();

      if (mode === "single" || mode === "one") {
        return this.__manager.getSelectedItem();
      } else {
        return this.__manager.getLeadItem();
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applySelectionMode : function(value, old) {
      this.__manager.setMode(value);
    },

    // property apply
    _applyDragSelection : function(value, old) {
      this.__manager.setDrag(value);
    },

    // property apply
    _applyQuickSelection : function(value, old) {
      this.__manager.setQuick(value);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    /**
     * Event listener for <code>changeSelection</code> event on selection manager.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onSelectionChange : function(e) {
      this.fireDataEvent("changeSelection", e.getData());
    }
  },


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  destruct : function() {
    this._disposeObjects("__manager");
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
     * Christian Hagendorn (chris_schmidt)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Each object, which should support multiselection selection have to
 * implement this interface.
 */
qx.Interface.define("qx.ui.core.IMultiSelection",
{
  extend: qx.ui.core.ISingleSelection,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /**
     * Selects all items of the managed object.
     */
    selectAll : function() {
      return true;
    },

    /**
     * Adds the given item to the existing selection.
     *
     * @param item {qx.ui.core.Widget} Any valid item
     * @throws {Error} if the item is not a child element.
     */
    addToSelection : function(item) {
      return arguments.length == 1;
    },

    /**
     * Removes the given item from the selection.
     *
     * Use {@link qx.ui.core.ISingleSelection#resetSelection} when you
     * want to clear the whole selection at once.
     *
     * @param item {qx.ui.core.Widget} Any valid item
     * @throws {Error} if the item is not a child element.
     */
    removeFromSelection : function(item) {
      return arguments.length == 1;
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
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * A list of items. Displays an automatically scrolling list for all
 * added {@link qx.ui.form.ListItem} instances. Supports various
 * selection options: single, multi, ...
 */
qx.Class.define("qx.ui.form.List",
{
  extend : qx.ui.core.scroll.AbstractScrollArea,
  implement : [
    qx.ui.core.IMultiSelection,
    qx.ui.form.IForm,
    qx.ui.form.IModelSelection
  ],
  include : [
    qx.ui.core.MRemoteChildrenHandling,
    qx.ui.core.MMultiSelectionHandling,
    qx.ui.form.MForm,
    qx.ui.form.MModelSelection
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param horizontal {Boolean?false} Whether the list should be horizontal.
   */
  construct : function(horizontal)
  {
    this.base(arguments);

    // Create content
    this.__content = this._createListItemContainer();

    // Used to fire item add/remove events
    this.__content.addListener("addChildWidget", this._onAddChild, this);
    this.__content.addListener("removeChildWidget", this._onRemoveChild, this);

    // Add to scrollpane
    this.getChildControl("pane").add(this.__content);

    // Apply orientation
    if (horizontal) {
      this.setOrientation("horizontal");
    } else {
      this.initOrientation();
    }

    // Add keypress listener
    this.addListener("keypress", this._onKeyPress);
    this.addListener("keyinput", this._onKeyInput);

    // initialize the search string
    this.__pressedString = "";
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */


  events :
  {
    /**
     * This event is fired after a list item was added to the list. The
     * {@link qx.event.type.Data#getData} method of the event returns the
     * added item.
     */
    addItem : "qx.event.type.Data",

    /**
     * This event is fired after a list item has been removed from the list.
     * The {@link qx.event.type.Data#getData} method of the event returns the
     * removed item.
     */
    removeItem : "qx.event.type.Data"
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
      init : "list"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    /**
     * Whether the list should be rendered horizontal or vertical.
     */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "vertical",
      apply : "_applyOrientation"
    },

    /** Spacing between the items */
    spacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applySpacing",
      themeable : true
    },

    /** Controls whether the inline-find feature is activated or not */
    enableInlineFind :
    {
      check : "Boolean",
      init : true
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    __pressedString : null,
    __lastKeyPress : null,

    /** {qx.ui.core.Widget} The children container */
    __content : null,

    /** {Class} Pointer to the selection manager to use */
    SELECTION_MANAGER : qx.ui.core.selection.ScrollArea,


    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */


    // overridden
    getChildrenContainer : function() {
      return this.__content;
    },

    /**
     * Handle child widget adds on the content pane
     *
     * @param e {qx.event.type.Data} the event instance
     */
    _onAddChild : function(e) {
      this.fireDataEvent("addItem", e.getData());
    },

    /**
     * Handle child widget removes on the content pane
     *
     * @param e {qx.event.type.Data} the event instance
     */
    _onRemoveChild : function(e) {
      this.fireDataEvent("removeItem", e.getData());
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    /**
     * Used to route external <code>keypress</code> events to the list
     * handling (in fact the manager of the list)
     *
     * @param e {qx.event.type.KeySequence} KeyPress event
     */
    handleKeyPress : function(e)
    {
      if (!this._onKeyPress(e)) {
        this._getManager().handleKeyPress(e);
      }
    },



    /*
    ---------------------------------------------------------------------------
      PROTECTED API
    ---------------------------------------------------------------------------
    */

    /**
     * This container holds the list item widgets.
     *
     * @return {qx.ui.container.Composite} Container for the list item widgets
     */
    _createListItemContainer : function() {
      return new qx.ui.container.Composite;
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyOrientation : function(value, old)
    {
      // Create new layout
      var horizontal = value === "horizontal";
      var layout = horizontal ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox();

      // Configure content
      var content = this.__content;
      content.setLayout(layout);
      content.setAllowGrowX(!horizontal);
      content.setAllowGrowY(horizontal);

      // Configure spacing
      this._applySpacing(this.getSpacing());
    },

    // property apply
    _applySpacing : function(value, old) {
      this.__content.getLayout().setSpacing(value);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    /**
     * Event listener for <code>keypress</code> events.
     *
     * @param e {qx.event.type.KeySequence} KeyPress event
     * @return {Boolean} Whether the event was processed
     */
    _onKeyPress : function(e)
    {
      // Execute action on press <ENTER>
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed())
      {
        var items = this.getSelection();
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
        }

        return true;
      }

      return false;
    },


    /*
    ---------------------------------------------------------------------------
      FIND SUPPORT
    ---------------------------------------------------------------------------
    */


    /**
     * Handles the inline find - if enabled
     *
     * @param e {qx.event.type.KeyInput} key input event
     */
    _onKeyInput : function(e)
    {
      // do nothing if the find is disabled
      if (!this.getEnableInlineFind()) {
        return;
      }

      // Only useful in single or one selection mode
      var mode = this.getSelectionMode();
      if (!(mode === "single" || mode === "one")) {
        return;
      }

      // Reset string after a second of non pressed key
      if (((new Date).valueOf() - this.__lastKeyPress) > 1000) {
        this.__pressedString = "";
      }

      // Combine keys the user pressed to a string
      this.__pressedString += e.getChar();

      // Find matching item
      var matchedItem = this.findItemByLabelFuzzy(this.__pressedString);

      // if an item was found, select it
      if (matchedItem) {
        this.setSelection([matchedItem]);
      }

      // Store timestamp
      this.__lastKeyPress = (new Date).valueOf();
    },

    /**
     * Takes the given string and tries to find a ListItem
     * which starts with this string. The search is not case sensitive and the
     * first found ListItem will be returned. If there could not be found any
     * qualifying list item, null will be returned.
     *
     * @param search {String} The text with which the label of the ListItem should start with
     * @return {qx.ui.form.ListItem} The found ListItem or null
     */
    findItemByLabelFuzzy : function(search)
    {
      // lower case search text
      search = search.toLowerCase();

      // get all items of the list
      var items = this.getChildren();

      // go threw all items
      for (var i=0, l=items.length; i<l; i++)
      {
        // get the label of the current item
        var currentLabel = items[i].getLabel();

        // if the label fits with the search text (ignore case, begins with)
        if (currentLabel && currentLabel.toLowerCase().indexOf(search) == 0)
        {
          // just return the first found element
          return items[i];
        }
      }

      // if no element was found, return null
      return null;
    },

    /**
     * Find an item by its {@link qx.ui.basic.Atom#getLabel}.
     *
     * @param search {String} A label or any item
     * @param ignoreCase {Boolean?true} description
     * @return {qx.ui.form.ListItem} The found ListItem or null
     */
    findItem : function(search, ignoreCase)
    {
      // lowercase search
      if (ignoreCase !== false) {
        search = search.toLowerCase();
      };

      // get all items of the list
      var items = this.getChildren();
      var item;

      // go through all items
      for (var i=0, l=items.length; i<l; i++)
      {
        item = items[i];

        // get the content of the label; text content when rich
        var label;

        if (item.isRich()) {
          var control = item.getChildControl("label", true);
          if (control) {
            var labelNode = control.getContentElement().getDomElement();
            if (labelNode) {
              label = qx.bom.element.Attribute.get(labelNode, "text");
            }
          }

        } else {
          label = item.getLabel();
        }

        if (label != null) {
          if (label.translate) {
            label = label.translate();
          }
          if (ignoreCase !== false) {
            label = label.toLowerCase();
          }

          if (label.toString() == search.toString()) {
            return item;
          }
        }
      }

      return null;
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__content");
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
 * A Collection of utility functions to escape and unescape strings.
 */
qx.Class.define("qx.bom.String",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Mapping of HTML entity names to the corresponding char code */
    TO_CHARCODE :
    {
      "quot"     : 34, // " - double-quote
      "amp"      : 38, // &
      "lt"       : 60, // <
      "gt"       : 62, // >

      // http://www.w3.org/TR/REC-html40/sgml/entities.html
      // ISO 8859-1 characters
      "nbsp"     : 160, // no-break space
      "iexcl"    : 161, // inverted exclamation mark
      "cent"     : 162, // cent sign
      "pound"    : 163, // pound sterling sign
      "curren"   : 164, // general currency sign
      "yen"      : 165, // yen sign
      "brvbar"   : 166, // broken (vertical) bar
      "sect"     : 167, // section sign
      "uml"      : 168, // umlaut (dieresis)
      "copy"     : 169, // copyright sign
      "ordf"     : 170, // ordinal indicator, feminine
      "laquo"    : 171, // angle quotation mark, left
      "not"      : 172, // not sign
      "shy"      : 173, // soft hyphen
      "reg"      : 174, // registered sign
      "macr"     : 175, // macron
      "deg"      : 176, // degree sign
      "plusmn"   : 177, // plus-or-minus sign
      "sup2"     : 178, // superscript two
      "sup3"     : 179, // superscript three
      "acute"    : 180, // acute accent
      "micro"    : 181, // micro sign
      "para"     : 182, // pilcrow (paragraph sign)
      "middot"   : 183, // middle dot
      "cedil"    : 184, // cedilla
      "sup1"     : 185, // superscript one
      "ordm"     : 186, // ordinal indicator, masculine
      "raquo"    : 187, // angle quotation mark, right
      "frac14"   : 188, // fraction one-quarter
      "frac12"   : 189, // fraction one-half
      "frac34"   : 190, // fraction three-quarters
      "iquest"   : 191, // inverted question mark
      "Agrave"   : 192, // capital A, grave accent
      "Aacute"   : 193, // capital A, acute accent
      "Acirc"    : 194, // capital A, circumflex accent
      "Atilde"   : 195, // capital A, tilde
      "Auml"     : 196, // capital A, dieresis or umlaut mark
      "Aring"    : 197, // capital A, ring
      "AElig"    : 198, // capital AE diphthong (ligature)
      "Ccedil"   : 199, // capital C, cedilla
      "Egrave"   : 200, // capital E, grave accent
      "Eacute"   : 201, // capital E, acute accent
      "Ecirc"    : 202, // capital E, circumflex accent
      "Euml"     : 203, // capital E, dieresis or umlaut mark
      "Igrave"   : 204, // capital I, grave accent
      "Iacute"   : 205, // capital I, acute accent
      "Icirc"    : 206, // capital I, circumflex accent
      "Iuml"     : 207, // capital I, dieresis or umlaut mark
      "ETH"      : 208, // capital Eth, Icelandic
      "Ntilde"   : 209, // capital N, tilde
      "Ograve"   : 210, // capital O, grave accent
      "Oacute"   : 211, // capital O, acute accent
      "Ocirc"    : 212, // capital O, circumflex accent
      "Otilde"   : 213, // capital O, tilde
      "Ouml"     : 214, // capital O, dieresis or umlaut mark
      "times"    : 215, // multiply sign
      "Oslash"   : 216, // capital O, slash
      "Ugrave"   : 217, // capital U, grave accent
      "Uacute"   : 218, // capital U, acute accent
      "Ucirc"    : 219, // capital U, circumflex accent
      "Uuml"     : 220, // capital U, dieresis or umlaut mark
      "Yacute"   : 221, // capital Y, acute accent
      "THORN"    : 222, // capital THORN, Icelandic
      "szlig"    : 223, // small sharp s, German (sz ligature)
      "agrave"   : 224, // small a, grave accent
      "aacute"   : 225, // small a, acute accent
      "acirc"    : 226, // small a, circumflex accent
      "atilde"   : 227, // small a, tilde
      "auml"     : 228, // small a, dieresis or umlaut mark
      "aring"    : 229, // small a, ring
      "aelig"    : 230, // small ae diphthong (ligature)
      "ccedil"   : 231, // small c, cedilla
      "egrave"   : 232, // small e, grave accent
      "eacute"   : 233, // small e, acute accent
      "ecirc"    : 234, // small e, circumflex accent
      "euml"     : 235, // small e, dieresis or umlaut mark
      "igrave"   : 236, // small i, grave accent
      "iacute"   : 237, // small i, acute accent
      "icirc"    : 238, // small i, circumflex accent
      "iuml"     : 239, // small i, dieresis or umlaut mark
      "eth"      : 240, // small eth, Icelandic
      "ntilde"   : 241, // small n, tilde
      "ograve"   : 242, // small o, grave accent
      "oacute"   : 243, // small o, acute accent
      "ocirc"    : 244, // small o, circumflex accent
      "otilde"   : 245, // small o, tilde
      "ouml"     : 246, // small o, dieresis or umlaut mark
      "divide"   : 247, // divide sign
      "oslash"   : 248, // small o, slash
      "ugrave"   : 249, // small u, grave accent
      "uacute"   : 250, // small u, acute accent
      "ucirc"    : 251, // small u, circumflex accent
      "uuml"     : 252, // small u, dieresis or umlaut mark
      "yacute"   : 253, // small y, acute accent
      "thorn"    : 254, // small thorn, Icelandic
      "yuml"     : 255, // small y, dieresis or umlaut mark

      // Latin Extended-B
      "fnof"     : 402, // latin small f with hook = function= florin, U+0192 ISOtech

      // Greek
      "Alpha"    : 913, // greek capital letter alpha, U+0391
      "Beta"     : 914, // greek capital letter beta, U+0392
      "Gamma"    : 915, // greek capital letter gamma,U+0393 ISOgrk3
      "Delta"    : 916, // greek capital letter delta,U+0394 ISOgrk3
      "Epsilon"  : 917, // greek capital letter epsilon, U+0395
      "Zeta"     : 918, // greek capital letter zeta, U+0396
      "Eta"      : 919, // greek capital letter eta, U+0397
      "Theta"    : 920, // greek capital letter theta,U+0398 ISOgrk3
      "Iota"     : 921, // greek capital letter iota, U+0399
      "Kappa"    : 922, // greek capital letter kappa, U+039A
      "Lambda"   : 923, // greek capital letter lambda,U+039B ISOgrk3
      "Mu"       : 924, // greek capital letter mu, U+039C
      "Nu"       : 925, // greek capital letter nu, U+039D
      "Xi"       : 926, // greek capital letter xi, U+039E ISOgrk3
      "Omicron"  : 927, // greek capital letter omicron, U+039F
      "Pi"       : 928, // greek capital letter pi, U+03A0 ISOgrk3
      "Rho"      : 929, // greek capital letter rho, U+03A1

      // there is no Sigmaf, and no U+03A2 character either
      "Sigma"    : 931, // greek capital letter sigma,U+03A3 ISOgrk3
      "Tau"      : 932, // greek capital letter tau, U+03A4
      "Upsilon"  : 933, // greek capital letter upsilon,U+03A5 ISOgrk3
      "Phi"      : 934, // greek capital letter phi,U+03A6 ISOgrk3
      "Chi"      : 935, // greek capital letter chi, U+03A7
      "Psi"      : 936, // greek capital letter psi,U+03A8 ISOgrk3
      "Omega"    : 937, // greek capital letter omega,U+03A9 ISOgrk3
      "alpha"    : 945, // greek small letter alpha,U+03B1 ISOgrk3
      "beta"     : 946, // greek small letter beta, U+03B2 ISOgrk3
      "gamma"    : 947, // greek small letter gamma,U+03B3 ISOgrk3
      "delta"    : 948, // greek small letter delta,U+03B4 ISOgrk3
      "epsilon"  : 949, // greek small letter epsilon,U+03B5 ISOgrk3
      "zeta"     : 950, // greek small letter zeta, U+03B6 ISOgrk3
      "eta"      : 951, // greek small letter eta, U+03B7 ISOgrk3
      "theta"    : 952, // greek small letter theta,U+03B8 ISOgrk3
      "iota"     : 953, // greek small letter iota, U+03B9 ISOgrk3
      "kappa"    : 954, // greek small letter kappa,U+03BA ISOgrk3
      "lambda"   : 955, // greek small letter lambda,U+03BB ISOgrk3
      "mu"       : 956, // greek small letter mu, U+03BC ISOgrk3
      "nu"       : 957, // greek small letter nu, U+03BD ISOgrk3
      "xi"       : 958, // greek small letter xi, U+03BE ISOgrk3
      "omicron"  : 959, // greek small letter omicron, U+03BF NEW
      "pi"       : 960, // greek small letter pi, U+03C0 ISOgrk3
      "rho"      : 961, // greek small letter rho, U+03C1 ISOgrk3
      "sigmaf"   : 962, // greek small letter final sigma,U+03C2 ISOgrk3
      "sigma"    : 963, // greek small letter sigma,U+03C3 ISOgrk3
      "tau"      : 964, // greek small letter tau, U+03C4 ISOgrk3
      "upsilon"  : 965, // greek small letter upsilon,U+03C5 ISOgrk3
      "phi"      : 966, // greek small letter phi, U+03C6 ISOgrk3
      "chi"      : 967, // greek small letter chi, U+03C7 ISOgrk3
      "psi"      : 968, // greek small letter psi, U+03C8 ISOgrk3
      "omega"    : 969, // greek small letter omega,U+03C9 ISOgrk3
      "thetasym" : 977, // greek small letter theta symbol,U+03D1 NEW
      "upsih"    : 978, // greek upsilon with hook symbol,U+03D2 NEW
      "piv"      : 982, // greek pi symbol, U+03D6 ISOgrk3

      // General Punctuation
      "bull"     : 8226, // bullet = black small circle,U+2022 ISOpub

      // bullet is NOT the same as bullet operator, U+2219
      "hellip"   : 8230, // horizontal ellipsis = three dot leader,U+2026 ISOpub
      "prime"    : 8242, // prime = minutes = feet, U+2032 ISOtech
      "Prime"    : 8243, // double prime = seconds = inches,U+2033 ISOtech
      "oline"    : 8254, // overline = spacing overscore,U+203E NEW
      "frasl"    : 8260, // fraction slash, U+2044 NEW

      // Letterlike Symbols
      "weierp"   : 8472, // script capital P = power set= Weierstrass p, U+2118 ISOamso
      "image"    : 8465, // blackletter capital I = imaginary part,U+2111 ISOamso
      "real"     : 8476, // blackletter capital R = real part symbol,U+211C ISOamso
      "trade"    : 8482, // trade mark sign, U+2122 ISOnum
      "alefsym"  : 8501, // alef symbol = first transfinite cardinal,U+2135 NEW

      // alef symbol is NOT the same as hebrew letter alef,U+05D0 although the same glyph could be used to depict both characters
      // Arrows
      "larr"     : 8592, // leftwards arrow, U+2190 ISOnum
      "uarr"     : 8593, // upwards arrow, U+2191 ISOnum-->
      "rarr"     : 8594, // rightwards arrow, U+2192 ISOnum
      "darr"     : 8595, // downwards arrow, U+2193 ISOnum
      "harr"     : 8596, // left right arrow, U+2194 ISOamsa
      "crarr"    : 8629, // downwards arrow with corner leftwards= carriage return, U+21B5 NEW
      "lArr"     : 8656, // leftwards double arrow, U+21D0 ISOtech

      // ISO 10646 does not say that lArr is the same as the 'is implied by' arrowbut also does not have any other character for that function. So ? lArr canbe used for 'is implied by' as ISOtech suggests
      "uArr"     : 8657, // upwards double arrow, U+21D1 ISOamsa
      "rArr"     : 8658, // rightwards double arrow,U+21D2 ISOtech

      // ISO 10646 does not say this is the 'implies' character but does not have another character with this function so ?rArr can be used for 'implies' as ISOtech suggests
      "dArr"     : 8659, // downwards double arrow, U+21D3 ISOamsa
      "hArr"     : 8660, // left right double arrow,U+21D4 ISOamsa

      // Mathematical Operators
      "forall"   : 8704, // for all, U+2200 ISOtech
      "part"     : 8706, // partial differential, U+2202 ISOtech
      "exist"    : 8707, // there exists, U+2203 ISOtech
      "empty"    : 8709, // empty set = null set = diameter,U+2205 ISOamso
      "nabla"    : 8711, // nabla = backward difference,U+2207 ISOtech
      "isin"     : 8712, // element of, U+2208 ISOtech
      "notin"    : 8713, // not an element of, U+2209 ISOtech
      "ni"       : 8715, // contains as member, U+220B ISOtech

      // should there be a more memorable name than 'ni'?
      "prod"     : 8719, // n-ary product = product sign,U+220F ISOamsb

      // prod is NOT the same character as U+03A0 'greek capital letter pi' though the same glyph might be used for both
      "sum"      : 8721, // n-ary summation, U+2211 ISOamsb

      // sum is NOT the same character as U+03A3 'greek capital letter sigma' though the same glyph might be used for both
      "minus"    : 8722, // minus sign, U+2212 ISOtech
      "lowast"   : 8727, // asterisk operator, U+2217 ISOtech
      "radic"    : 8730, // square root = radical sign,U+221A ISOtech
      "prop"     : 8733, // proportional to, U+221D ISOtech
      "infin"    : 8734, // infinity, U+221E ISOtech
      "ang"      : 8736, // angle, U+2220 ISOamso
      "and"      : 8743, // logical and = wedge, U+2227 ISOtech
      "or"       : 8744, // logical or = vee, U+2228 ISOtech
      "cap"      : 8745, // intersection = cap, U+2229 ISOtech
      "cup"      : 8746, // union = cup, U+222A ISOtech
      "int"      : 8747, // integral, U+222B ISOtech
      "there4"   : 8756, // therefore, U+2234 ISOtech
      "sim"      : 8764, // tilde operator = varies with = similar to,U+223C ISOtech

      // tilde operator is NOT the same character as the tilde, U+007E,although the same glyph might be used to represent both
      "cong"     : 8773, // approximately equal to, U+2245 ISOtech
      "asymp"    : 8776, // almost equal to = asymptotic to,U+2248 ISOamsr
      "ne"       : 8800, // not equal to, U+2260 ISOtech
      "equiv"    : 8801, // identical to, U+2261 ISOtech
      "le"       : 8804, // less-than or equal to, U+2264 ISOtech
      "ge"       : 8805, // greater-than or equal to,U+2265 ISOtech
      "sub"      : 8834, // subset of, U+2282 ISOtech
      "sup"      : 8835, // superset of, U+2283 ISOtech

      // note that nsup, 'not a superset of, U+2283' is not covered by the Symbol font encoding and is not included. Should it be, for symmetry?It is in ISOamsn  --> <!ENTITY nsub": 8836,  //not a subset of, U+2284 ISOamsn
      "sube"     : 8838, // subset of or equal to, U+2286 ISOtech
      "supe"     : 8839, // superset of or equal to,U+2287 ISOtech
      "oplus"    : 8853, // circled plus = direct sum,U+2295 ISOamsb
      "otimes"   : 8855, // circled times = vector product,U+2297 ISOamsb
      "perp"     : 8869, // up tack = orthogonal to = perpendicular,U+22A5 ISOtech
      "sdot"     : 8901, // dot operator, U+22C5 ISOamsb

      // dot operator is NOT the same character as U+00B7 middle dot
      // Miscellaneous Technical
      "lceil"    : 8968, // left ceiling = apl upstile,U+2308 ISOamsc
      "rceil"    : 8969, // right ceiling, U+2309 ISOamsc
      "lfloor"   : 8970, // left floor = apl downstile,U+230A ISOamsc
      "rfloor"   : 8971, // right floor, U+230B ISOamsc
      "lang"     : 9001, // left-pointing angle bracket = bra,U+2329 ISOtech

      // lang is NOT the same character as U+003C 'less than' or U+2039 'single left-pointing angle quotation mark'
      "rang"     : 9002, // right-pointing angle bracket = ket,U+232A ISOtech

      // rang is NOT the same character as U+003E 'greater than' or U+203A 'single right-pointing angle quotation mark'
      // Geometric Shapes
      "loz"      : 9674, // lozenge, U+25CA ISOpub

      // Miscellaneous Symbols
      "spades"   : 9824, // black spade suit, U+2660 ISOpub

      // black here seems to mean filled as opposed to hollow
      "clubs"    : 9827, // black club suit = shamrock,U+2663 ISOpub
      "hearts"   : 9829, // black heart suit = valentine,U+2665 ISOpub
      "diams"    : 9830, // black diamond suit, U+2666 ISOpub

      // Latin Extended-A
      "OElig"    : 338, //  -- latin capital ligature OE,U+0152 ISOlat2
      "oelig"    : 339, //  -- latin small ligature oe, U+0153 ISOlat2

      // ligature is a misnomer, this is a separate character in some languages
      "Scaron"   : 352, //  -- latin capital letter S with caron,U+0160 ISOlat2
      "scaron"   : 353, //  -- latin small letter s with caron,U+0161 ISOlat2
      "Yuml"     : 376, //  -- latin capital letter Y with diaeresis,U+0178 ISOlat2

      // Spacing Modifier Letters
      "circ"     : 710, //  -- modifier letter circumflex accent,U+02C6 ISOpub
      "tilde"    : 732, // small tilde, U+02DC ISOdia

      // General Punctuation
      "ensp"     : 8194, // en space, U+2002 ISOpub
      "emsp"     : 8195, // em space, U+2003 ISOpub
      "thinsp"   : 8201, // thin space, U+2009 ISOpub
      "zwnj"     : 8204, // zero width non-joiner,U+200C NEW RFC 2070
      "zwj"      : 8205, // zero width joiner, U+200D NEW RFC 2070
      "lrm"      : 8206, // left-to-right mark, U+200E NEW RFC 2070
      "rlm"      : 8207, // right-to-left mark, U+200F NEW RFC 2070
      "ndash"    : 8211, // en dash, U+2013 ISOpub
      "mdash"    : 8212, // em dash, U+2014 ISOpub
      "lsquo"    : 8216, // left single quotation mark,U+2018 ISOnum
      "rsquo"    : 8217, // right single quotation mark,U+2019 ISOnum
      "sbquo"    : 8218, // single low-9 quotation mark, U+201A NEW
      "ldquo"    : 8220, // left double quotation mark,U+201C ISOnum
      "rdquo"    : 8221, // right double quotation mark,U+201D ISOnum
      "bdquo"    : 8222, // double low-9 quotation mark, U+201E NEW
      "dagger"   : 8224, // dagger, U+2020 ISOpub
      "Dagger"   : 8225, // double dagger, U+2021 ISOpub
      "permil"   : 8240, // per mille sign, U+2030 ISOtech
      "lsaquo"   : 8249, // single left-pointing angle quotation mark,U+2039 ISO proposed
      // lsaquo is proposed but not yet ISO standardized
      "rsaquo"   : 8250, // single right-pointing angle quotation mark,U+203A ISO proposed
      // rsaquo is proposed but not yet ISO standardized
      "euro"     : 8364 //  -- euro sign, U+20AC NEW
    },


    /**
     * Escapes the characters in a <code>String</code> using HTML entities.
     *
     * For example: <tt>"bread" & "butter"</tt> => <tt>&amp;quot;bread&amp;quot; &amp;amp; &amp;quot;butter&amp;quot;</tt>.
     * Supports all known HTML 4.0 entities, including funky accents.
     *
     * * <a href="http://www.w3.org/TR/REC-html32#latin1">HTML 3.2 Character Entities for ISO Latin-1</a>
     * * <a href="http://www.w3.org/TR/REC-html40/sgml/entities.html">HTML 4.0 Character entity references</a>
     * * <a href="http://www.w3.org/TR/html401/charset.html#h-5.3">HTML 4.01 Character References</a>
     * * <a href="http://www.w3.org/TR/html401/charset.html#code-position">HTML 4.01 Code positions</a>
     *
     * @param str {String} the String to escape
     * @return {String} a new escaped String
     * @see #unescape
     */
    escape : function(str) {
      return qx.util.StringEscape.escape(str, qx.bom.String.FROM_CHARCODE);
    },


    /**
     * Unescapes a string containing entity escapes to a string
     * containing the actual Unicode characters corresponding to the
     * escapes. Supports HTML 4.0 entities.
     *
     * For example, the string "&amp;lt;Fran&amp;ccedil;ais&amp;gt;"
     * will become "&lt;Fran&ccedil;ais&gt;"
     *
     * If an entity is unrecognized, it is left alone, and inserted
     * verbatim into the result string. e.g. "&amp;gt;&amp;zzzz;x" will
     * become "&gt;&amp;zzzz;x".
     *
     * @param str {String} the String to unescape, may be null
     * @return {var} a new unescaped String
     * @see #escape
     */
    unescape : function(str) {
      return qx.util.StringEscape.unescape(str, qx.bom.String.TO_CHARCODE);
    },


    /**
     * Converts a plain text string into HTML.
     * This is similar to {@link #escape} but converts new lines to
     * <tt>&lt:br&gt:</tt> and preserves whitespaces.
     *
     * @param str {String} the String to convert
     * @return {String} a new converted String
     * @see #escape
     */
    fromText : function(str)
    {
      return qx.bom.String.escape(str).replace(/(  |\n)/g, function(chr)
      {
        var map =
        {
          "  " : " &nbsp;",
          "\n" : "<br>"
        };

        return map[chr] || chr;
      });
    },


    /**
     * Converts HTML to plain text.
     *
     * * Strips all HTML tags
     * * converts <tt>&lt:br&gt:</tt> to new line
     * * unescapes HTML entities
     *
     * @param str {String} HTML string to converts
     * @return {String} plain text representation of the HTML string
     */
    toText : function(str)
    {
      return qx.bom.String.unescape(str.replace(/\s+|<([^>])+>/gi, function(chr)
      //return qx.bom.String.unescape(str.replace(/<\/?[^>]+(>|$)/gi, function(chr)
      {
        if (chr.indexOf("<br") === 0) {
          return "\n";
        } else if (chr.length > 0 && chr.replace(/^\s*/, "").replace(/\s*$/, "") == "") {
          return " ";
        } else {
          return "";
        }
      }));
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    /** Mapping of char codes to HTML entity names */
    statics.FROM_CHARCODE = qx.lang.Object.invert(statics.TO_CHARCODE)
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
 * Generic escaping and unescaping of DOM strings.
 *
 * {@link qx.bom.String} for (un)escaping of HTML strings.
 * {@link qx.xml.String} for (un)escaping of XML strings.
 */
qx.Class.define("qx.util.StringEscape",
{
  statics :
  {
    /**
     * generic escaping method
     *
     * @param str {String} string to escape
     * @param charCodeToEntities {Map} entity to charcode map
     * @return {String} escaped string
     * @signature function(str, charCodeToEntities)
     */
    escape : function(str, charCodeToEntities)
    {
      var entity, result = "";

      for (var i=0, l=str.length; i<l; i++)
      {
        var chr = str.charAt(i);
        var code = chr.charCodeAt(0);

        if (charCodeToEntities[code]) {
          entity = "&" + charCodeToEntities[code] + ";";
        }
        else
        {
          if (code > 0x7F) {
            entity = "&#" + code + ";";
          } else {
            entity = chr;
          }
        }

        result += entity;
      }

      return result;
    },


    /**
     * generic unescaping method
     *
     * @param str {String} string to unescape
     * @param entitiesToCharCode {Map} charcode to entity map
     * @return {String} unescaped string
     */
    unescape : function(str, entitiesToCharCode)
    {
      return str.replace(/&[#\w]+;/gi, function(entity)
      {
        var chr = entity;
        var entity = entity.substring(1, entity.length - 1);
        var code = entitiesToCharCode[entity];

        if (code) {
          chr = String.fromCharCode(code);
        }
        else
        {
          if (entity.charAt(0) == '#')
          {
            if (entity.charAt(1).toUpperCase() == 'X')
            {
              code = entity.substring(2);

              // match hex number
              if (code.match(/^[0-9A-Fa-f]+$/gi)) {
                chr = String.fromCharCode(parseInt(code, 16));
              }
            }
            else
            {
              code = entity.substring(1);

              // match integer
              if (code.match(/^\d+$/gi)) {
                chr = String.fromCharCode(parseInt(code, 10));
              }
            }
          }
        }

        return chr;
      });
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
     * Martin Wittemann (martinwittemann)
     * Sebastian Werner (wpbasti)
     * Jonathan Weiß (jonathan_rass)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * A form widget which allows a single selection. Looks somewhat like
 * a normal button, but opens a list of items to select when clicking on it.
 *
 * Keep in mind that the SelectBox widget has always a selected item (due to the
 * single selection mode). Right after adding the first item a <code>changeSelection</code>
 * event is fired.
 *
 * <pre class='javascript'>
 * var selectBox = new qx.ui.form.SelectBox();
 *
 * selectBox.addListener("changeSelection", function(e) {
 *   // ...
 * });
 *
 * // now the 'changeSelection' event is fired
 * selectBox.add(new qx.ui.form.ListItem("Item 1");
 * </pre>
 *
 * @childControl spacer {qx.ui.core.Spacer} flexible spacer widget
 * @childControl atom {qx.ui.basic.Atom} shows the text and icon of the content
 * @childControl arrow {qx.ui.basic.Image} shows the arrow to open the popup
 */
qx.Class.define("qx.ui.form.SelectBox",
{
  extend : qx.ui.form.AbstractSelectBox,
  implement : [
    qx.ui.core.ISingleSelection,
    qx.ui.form.IModelSelection
  ],
  include : [qx.ui.core.MSingleSelectionHandling, qx.ui.form.MModelSelection],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  construct : function()
  {
    this.base(arguments);

    this._createChildControl("atom");
    this._createChildControl("spacer");
    this._createChildControl("arrow");

    // Register listener
    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);
    this.addListener("click", this._onClick, this);
    this.addListener("mousewheel", this._onMouseWheel, this);
    this.addListener("keyinput", this._onKeyInput, this);
    this.addListener("changeSelection", this.__onChangeSelection, this);
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
      init : "selectbox"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /** {qx.ui.form.ListItem} instance */
    __preSelectedItem : null,


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
        case "spacer":
          control = new qx.ui.core.Spacer();
          this._add(control, {flex: 1});
          break;

        case "atom":
          control = new qx.ui.basic.Atom(" ");
          control.setCenter(false);
          control.setAnonymous(true);

          this._add(control, {flex:1});
          break;

        case "arrow":
          control = new qx.ui.basic.Image();
          control.setAnonymous(true);

          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      focused : true
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS FOR SELECTION API
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the list items for the selection.
     *
     * @return {qx.ui.form.ListItem[]} List itmes to select.
     */
    _getItems : function() {
      return this.getChildrenContainer().getChildren();
    },

    /**
     * Returns if the selection could be empty or not.
     *
     * @return {Boolean} <code>true</code> If selection could be empty,
     *    <code>false</code> otherwise.
     */
    _isAllowEmptySelection: function() {
      return this.getChildrenContainer().getSelectionMode() !== "one";
    },

    /**
     * Event handler for <code>changeSelection</code>.
     *
     * @param e {qx.event.type.Data} Data event.
     */
    __onChangeSelection : function(e)
    {
      var listItem = e.getData()[0];

      var list = this.getChildControl("list");
      if (list.getSelection()[0] != listItem) {
        if(listItem) {
          list.setSelection([listItem]);
        } else {
          list.resetSelection();
        }
      }

      this.__updateIcon();
      this.__updateLabel();
    },


    /**
     * Sets the icon inside the list to match the selected ListItem.
     */
    __updateIcon : function()
    {
      var listItem = this.getChildControl("list").getSelection()[0];
      var atom = this.getChildControl("atom");
      var icon = listItem ? listItem.getIcon() : "";
      icon == null ? atom.resetIcon() : atom.setIcon(icon);
    },

    /**
     * Sets the label inside the list to match the selected ListItem.
     */
    __updateLabel : function()
    {
      var listItem = this.getChildControl("list").getSelection()[0];
      var atom = this.getChildControl("atom");
      var label = listItem ? listItem.getLabel() : "";
      var format = this.getFormat();
      if (format != null) {
        label = format.call(this, listItem);
      }

      // check for translation
      if (label && label.translate) {
        label = label.translate();
      }
      label == null ? atom.resetLabel() : atom.setLabel(label);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Listener method for "mouseover" event
     * <ul>
     * <li>Adds state "hovered"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     */
    _onMouseOver : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      if (this.hasState("abandoned"))
      {
        this.removeState("abandoned");
        this.addState("pressed");
      }

      this.addState("hovered");
    },

    /**
     * Listener method for "mouseout" event
     * <ul>
     * <li>Removes "hovered" state</li>
     * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     */
    _onMouseOut : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      this.removeState("hovered");

      if (this.hasState("pressed"))
      {
        this.removeState("pressed");
        this.addState("abandoned");
      }
    },

    /**
     * Toggles the popup's visibility.
     *
     * @param e {qx.event.type.Mouse} Mouse event
     */
    _onClick : function(e) {
      this.toggle();
    },

    /**
     * Event handler for mousewheel event
     *
     * @param e {qx.event.type.Mouse} Mouse event
     */
    _onMouseWheel : function(e)
    {
      if (this.getChildControl("popup").isVisible()) {
        return;
      }

      var direction = e.getWheelDelta("y") > 0 ? 1 : -1;
      var children = this.getSelectables();
      var selected = this.getSelection()[0];

      if (!selected) {
        if (!children[0]) {
          return;
        }
        selected = children[0];
      }

      var index = children.indexOf(selected) + direction;
      var max = children.length - 1;

      // Limit
      if (index < 0) {
        index = 0;
      } else if (index >= max) {
        index = max;
      }

      this.setSelection([children[index]]);

      // stop the propagation
      // prevent any other widget from receiving this event
      // e.g. place a selectbox widget inside a scroll container widget
      e.stopPropagation();
      e.preventDefault();
    },

    // overridden
    _onKeyPress : function(e)
    {
      var iden = e.getKeyIdentifier();
      if(iden == "Enter" || iden == "Space")
      {
        // Apply pre-selected item (translate quick selection to real selection)
        if (this.__preSelectedItem)
        {
          this.setSelection([this.__preSelectedItem]);
          this.__preSelectedItem = null;
        }

        this.toggle();
      }
      else
      {
        this.base(arguments, e);
      }
    },

    /**
     * Forwards key event to list widget.
     *
     * @param e {qx.event.type.KeyInput} Key event
     */
    _onKeyInput : function(e)
    {
      // clone the event and re-calibrate the event
      var clone = e.clone();
      clone.setTarget(this._list);
      clone.setBubbles(false);

      // forward it to the list
      this.getChildControl("list").dispatchEvent(clone);
    },

    // overridden
    _onListMouseDown : function(e)
    {
      // Apply pre-selected item (translate quick selection to real selection)
      if (this.__preSelectedItem)
      {
        this.setSelection([this.__preSelectedItem]);
        this.__preSelectedItem = null;
      }
    },

    // overridden
    _onListChangeSelection : function(e)
    {
      var current = e.getData();
      var old = e.getOldData();

      // Remove old listeners for icon and label changes.
      if (old && old.length > 0)
      {
        old[0].removeListener("changeIcon", this.__updateIcon, this);
        old[0].removeListener("changeLabel", this.__updateLabel, this);
      }


      if (current.length > 0)
      {
        // Ignore quick context (e.g. mouseover)
        // and configure the new value when closing the popup afterwards
        var popup = this.getChildControl("popup");
        var list = this.getChildControl("list");
        var context = list.getSelectionContext();

        if (popup.isVisible() && (context == "quick" || context == "key"))
        {
          this.__preSelectedItem = current[0];
        }
        else
        {
          this.setSelection([current[0]]);
          this.__preSelectedItem = null;
        }

        // Add listeners for icon and label changes
        current[0].addListener("changeIcon", this.__updateIcon, this);
        current[0].addListener("changeLabel", this.__updateLabel, this);
      }
      else
      {
        this.resetSelection();
      }
    },

    // overridden
    _onPopupChangeVisibility : function(e)
    {
      this.base(arguments, e);

      // Synchronize the current selection to the list selection
      // when the popup is closed. The list selection may be invalid
      // because of the quick selection handling which is not
      // directly applied to the selectbox
      var popup = this.getChildControl("popup");
      if (!popup.isVisible())
      {
        var list = this.getChildControl("list");

        // check if the list has any children before selecting
        if (list.hasChildren()) {
          list.setSelection(this.getSelection());
        }
      } else {
        // ensure that the list is never biger that the max list height and
        // the available space in the viewport
        var distance = popup.getLayoutLocation(this);
        var viewPortHeight = qx.bom.Viewport.getHeight();
        // distance to the bottom and top borders of the viewport
        var toTop = distance.top;
        var toBottom = viewPortHeight - distance.bottom;
        var availableHeigth = toTop > toBottom ? toTop : toBottom;

        var maxListHeight = this.getMaxListHeight();
        var list = this.getChildControl("list")
        if (maxListHeight == null || maxListHeight > availableHeigth) {
          list.setMaxHeight(availableHeigth);
        } else if (maxListHeight < availableHeigth) {
          list.setMaxHeight(maxListHeight);
        }
      }
    }

  },


  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */


  destruct : function() {
    this.__preSelectedItem = null;
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
 * A item for a list. Could be added to all List like widgets but also
 * to the {@link qx.ui.form.SelectBox} and {@link qx.ui.form.ComboBox}.
 */
qx.Class.define("qx.ui.form.ListItem",
{
  extend : qx.ui.basic.Atom,
  implement : [qx.ui.form.IModel],
  include : [qx.ui.form.MModelProperty],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   * @param model {String?null} The items value
   */
  construct : function(label, icon, model)
  {
    this.base(arguments, label, icon);

    if (model != null) {
      this.setModel(model);
    }

    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /** (Fired by {@link qx.ui.form.List}) */
    "action" : "qx.event.type.Event"
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
      init : "listitem"
    }
  },


  members :
  {
    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      focused : true,
      hovered : true,
      selected : true,
      dragover : true
    },


    /**
     * Event handler for the mouse over event.
     */
    _onMouseOver : function() {
      this.addState("hovered");
    },


    /**
     * Event handler for the mouse out event.
     */
    _onMouseOut : function() {
      this.removeState("hovered");
    }
  },

  destruct : function() {
    this.removeListener("mouseover", this._onMouseOver, this);
    this.removeListener("mouseout", this._onMouseOut, this);
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
 * The normal toolbar button. Like a normal {@link qx.ui.form.Button}
 * but with a style matching the toolbar and without keyboard support.
 */
qx.Class.define("qx.ui.toolbar.Button",
{
  extend : qx.ui.form.Button,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, command)
  {
    this.base(arguments, label, icon, command);

    // Toolbar buttons should not support the keyboard events
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
      init : "toolbar-button"
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

  members : {
    // overridden
    _applyVisibility : function(value, old) {
      this.base(arguments, value, old);
      // trigger a appearance recalculation of the parent
      var parent = this.getLayoutParent();
      if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
        qx.ui.core.queue.Appearance.add(parent);
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
     * Andreas Ecker (ecker)
     * Jonathan Weiß (jonathan_rass)
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * The TextField is a multi-line text input field.
 */
qx.Class.define("qx.ui.form.TextArea",
{
  extend : qx.ui.form.AbstractField,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String?""} The text area's initial value
   */
  construct : function(value)
  {
    this.base(arguments, value);
    this.initWrap();

    this.addListener("mousewheel", this._onMousewheel, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Controls whether text wrap is activated or not. */
    wrap :
    {
      check : "Boolean",
      init : true,
      apply : "_applyWrap"
    },

    // overridden
    appearance :
    {
      refine : true,
      init : "textarea"
    },

    /** Factor for scrolling the <code>TextArea</code> with the mouse wheel. */
    singleStep :
    {
      check : "Integer",
      init : 20
    },

    /** Minimal line height. On default this is set to four lines. */
    minimalLineHeight :
    {
      check : "Integer",
      apply : "_applyMinimalLineHeight",
      init : 4
    },

    /**
    * Whether the <code>TextArea</code> should automatically adjust to
    * the height of the content.
    *
    * To set the initial height, modify {@link #minHeight}. If you wish
    * to set a minHeight below four lines of text, also set
    * {@link #minimalLineHeight}. In order to limit growing to a certain
    * height, set {@link #maxHeight} respectively. Please note that
    * autoSize is ignored when the {@link #height} property is in use.
    */
    autoSize :
    {
      check : "Boolean",
      apply : "_applyAutoSize",
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
    __areaClone : null,
    __areaHeight : null,
    __originalAreaHeight : null,

    // overridden
    setValue : function(value)
    {
      value = this.base(arguments, value);
      this.__autoSize();

      return value;
    },

    /**
     * Handles the mouse wheel for scrolling the <code>TextArea</code>.
     *
     * @param e {qx.event.type.MouseWheel} mouse wheel event.
     */
    _onMousewheel : function(e) {
      var contentElement = this.getContentElement();
      var scrollY = contentElement.getScrollY();

      contentElement.scrollToY(scrollY + e.getWheelDelta("y") * this.getSingleStep());

      var newScrollY = contentElement.getScrollY();

      if (newScrollY != scrollY) {
        e.stop();
      }
    },

    /*
    ---------------------------------------------------------------------------
      AUTO SIZE
    ---------------------------------------------------------------------------
    */

    /**
    * Adjust height of <code>TextArea</code> so that content fits without scroll bar.
    *
    */
    __autoSize: function() {
      if (this.isAutoSize()) {
        var clone = this.__getAreaClone();

        if (clone) {

          // Remember original area height
          this.__originalAreaHeight = this.__originalAreaHeight || this._getAreaHeight();

          var scrolledHeight = this._getScrolledAreaHeight();

          // Show scoll-bar when above maxHeight, if defined
          if (this.getMaxHeight()) {
            var insets = this.getInsets();
            var innerMaxHeight = -insets.top + this.getMaxHeight() - insets.bottom;
            if (scrolledHeight > innerMaxHeight) {
                this.getContentElement().setStyle("overflowY", "auto");
            } else {
                this.getContentElement().setStyle("overflowY", "hidden");
            }
          }

          // Never shrink below original area height
          var desiredHeight = Math.max(scrolledHeight, this.__originalAreaHeight);

          // Set new height
          this._setAreaHeight(desiredHeight);

        // On init, the clone is not yet present. Try again on appear.
        } else {
          this.getContentElement().addListenerOnce("appear", function() {
            this.__autoSize();
          }, this);
        }
      }
    },

    /**
    * Get actual height of <code>TextArea</code>
    *
    * @return {Integer} Height of <code>TextArea</code>
    */
    _getAreaHeight: function() {
      return this.getInnerSize().height;
    },

    /**
    * Set actual height of <code>TextArea</code>
    *
    * @param height {Integer} Desired height of <code>TextArea</code>
    */
    _setAreaHeight: function(height) {
      if (this._getAreaHeight() !== height) {
        this.__areaHeight = height;
        qx.ui.core.queue.Layout.add(this);

        // Apply height directly. This works-around a visual glitch in WebKit
        // browsers where a line-break causes the text to be moved upwards
        // for one line. Since this change appears instantly whereas the queue
        // is computed later, a flicker is visible.
        qx.ui.core.queue.Manager.flush();

        this.__forceRewrap();
      }
    },

    /**
    * Get scrolled area height. Equals the total height of the <code>TextArea</code>,
    * as if no scroll-bar was visible.
    *
    * @return {Integer} Height of scrolled area
    */
    _getScrolledAreaHeight: function() {
      var clone = this.__getAreaClone();
      var cloneDom = clone.getDomElement();

      if (cloneDom) {

        // Clone created but not yet in DOM. Try again.
        if (!cloneDom.parentNode) {
          qx.html.Element.flush();
          return this._getScrolledAreaHeight();
        }

        // In WebKit, "wrap" must have been "soft" on DOM level before setting
        // "off" can disable wrapping. To fix, make sure wrap is toggled.
        // Otherwise, the height of an auto-size text area with wrapping
        // disabled initially is incorrectly computed as if wrapping was enabled.
        if (qx.core.Environment.get("engine.name") === "webkit") {
          clone.setWrap(!this.getWrap(), true);
        }

        clone.setWrap(this.getWrap(), true);

        // Webkit needs overflow "hidden" in order to correctly compute height
        if (qx.core.Environment.get("engine.name") == "webkit") {
          cloneDom.style.overflow = "hidden";
        }

        // IE >= 8 needs overflow "visible" in order to correctly compute height
        if (qx.core.Environment.get("engine.name") == "mshtml" &&
          qx.core.Environment.get("browser.documentmode") >= 8) {
          cloneDom.style.overflow = "visible";
        }

        // Update value
        clone.setValue(this.getValue());

        // Recompute
        this.__scrollCloneToBottom(clone);

        if (qx.core.Environment.get("engine.name") == "mshtml") {
          // Flush required for scrollTop to return correct value
          // when initial value should be taken into consideration
          if (!cloneDom.scrollTop) {
            qx.html.Element.flush();
          }

          // Compensate for slightly off scroll height in IE
          return cloneDom.scrollTop + this._getTextSize().height;
        }

        return cloneDom.scrollTop;
      }
    },

    /**
    * Returns the area clone.
    *
    * @return {Element|null} DOM Element or <code>null</code> if there is no
    * original element
    */
    __getAreaClone: function() {
      this.__areaClone = this.__areaClone || this.__createAreaClone();
      return this.__areaClone;
    },

    /**
    * Creates and prepares the area clone.
    *
    * @return {Element} Element
    */
    __createAreaClone: function() {
      var orig,
          clone,
          cloneDom,
          cloneHtml;

      orig = this.getContentElement();

      // An existing DOM element is required
      if (!orig.getDomElement()) {
        return null;
      }

      // Create DOM clone
      cloneDom = qx.bom.Element.clone(orig.getDomElement());

      // Convert to qx.html Element
      cloneHtml = new qx.html.Input("textarea");
      cloneHtml.useElement(cloneDom);
      clone = cloneHtml;

      // Push out of view
      // Zero height (i.e. scrolled area equals height)
      clone.setStyles({
        position: "absolute",
        top: 0,
        left: -9999,
        height: 0,
        overflow: "hidden"
      }, true);

      // Fix attributes
      clone.removeAttribute('id');
      clone.removeAttribute('name');
      clone.setAttribute("tabIndex", "-1");

      // Copy value
      clone.setValue(orig.getValue());

      // Attach to DOM
      clone.insertBefore(orig);

      // Make sure scrollTop is actual height
      this.__scrollCloneToBottom(clone);

      return clone;
    },

    /**
    * Scroll <code>TextArea</code> to bottom. That way, scrollTop reflects the height
    * of the <code>TextArea</code>.
    *
    * @param clone {Element} The <code>TextArea</code> to scroll
    */
    __scrollCloneToBottom: function(clone) {
      clone = clone.getDomElement();
      if (clone) {
        clone.scrollTop = 10000;
      }
    },

    /*
    ---------------------------------------------------------------------------
      FIELD API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createInputElement : function()
    {
      return new qx.html.Input("textarea", {
        overflowX: "auto",
        overflowY: "auto"
      });
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyWrap : function(value, old) {
      this.getContentElement().setWrap(value);
      if (this._placeholder) {
        var whiteSpace = value ? "normal" : "nowrap";
        this._placeholder.setStyle("whiteSpace", whiteSpace);
      }
      this.__autoSize();
    },

    // property apply
    _applyMinimalLineHeight : function() {
      qx.ui.core.queue.Layout.add(this);
    },

    // property apply
    _applyAutoSize: function(value, old) {
      if (qx.core.Environment.get("qx.debug")) {
        this.__warnAutoSizeAndHeight();
      }

      if (value) {
        this.__autoSize();
        this.addListener("input", this.__autoSize, this);

        // This is done asynchronously on purpose. The style given would
        // otherwise be overridden by the DOM changes queued in the
        // property apply for wrap. See [BUG #4493] for more details.
        this.addListenerOnce("appear", function() {
          this.getContentElement().setStyle("overflowY", "hidden");
        });

      } else {
        this.removeListener("input", this.__autoSize);
        this.getContentElement().setStyle("overflowY", "auto");
      }

    },

    // property apply
    _applyDimension : function(value) {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        this.__warnAutoSizeAndHeight();
      }

      if (value === this.getMaxHeight()) {
        this.__autoSize();
      }
    },

    /**
     * Force rewrapping of text.
     *
     * The distribution of characters depends on the space available.
     * Unfortunately, browsers do not reliably (or not at all) rewrap text when
     * the size of the text area changes.
     *
     * This method is called on change of the area's size.
     */
    __forceRewrap : function() {
      var content = this.getContentElement();
      var element = content.getDomElement();

      // Temporarily increase width
      var width = content.getStyle("width");
      content.setStyle("width", parseInt(width, 10) + 1000 + "px", true);

      // Force browser to render
      if (element) {
        qx.bom.element.Dimension.getWidth(element);
      }

      // Restore width
      content.setStyle("width", width, true);
    },

    /**
     * Warn when both autoSize and height property are set.
     *
     */
    __warnAutoSizeAndHeight: function() {
      if (this.isAutoSize() && this.getHeight()) {
        this.warn("autoSize is ignored when the height property is set. " +
                  "If you want to set an initial height, use the minHeight " +
                  "property instead.");
      }
    },

    /*
    ---------------------------------------------------------------------------
      LAYOUT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      var hint = this.base(arguments);

      // lines of text
      hint.height = hint.height * this.getMinimalLineHeight();

      // 20 character wide
      hint.width = this._getTextSize().width * 20;

      if (this.isAutoSize()) {
        hint.height = this.__areaHeight || hint.height;
      }

      return hint;
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
/**
 * <h2>Form Controller</h2>
 *
 * *General idea*
 *
 * The form controller is responsible for connecting a form with a model. If no
 * model is given, a model can be created. This created model will fit exactly
 * to the given form and can be used for serialization. All the connections
 * between the form items and the model are handled by an internal
 * {@link qx.data.controller.Object}.
 *
 * *Features*
 *
 * * Connect a form to a model (bidirectional)
 * * Create a model for a given form
 *
 * *Usage*
 *
 * The controller only works if both a controller and a model are set.
 * Creating a model will automatically set the created model.
 *
 * *Cross reference*
 *
 * * If you want to bind single values, use {@link qx.data.controller.Object}
 * * If you want to bind a list like widget, use {@link qx.data.controller.List}
 * * If you want to bind a tree widget, use {@link qx.data.controller.Tree}
 */
qx.Class.define("qx.data.controller.Form",
{
  extend : qx.core.Object,

  /**
   * @param model {qx.core.Object | null} The model to bind the target to. The
   *   given object will be set as {@link #model} property.
   * @param target {qx.ui.form.Form | null} The form which contains the form
   *   items. The given form will be set as {@link #target} property.
   * @param selfUpdate {Boolean?false} If set to true, you need to call the
   *   {@link #updateModel} method to get the data in the form to the model.
   *   Otherwise, the data will be synced automatically on every change of
   *   the form.
   */
  construct : function(model, target, selfUpdate)
  {
    this.base(arguments);

    this._selfUpdate = !!selfUpdate;
    this.__bindingOptions = {};

    if (model != null) {
      this.setModel(model);
    }

    if (target != null) {
      this.setTarget(target);
    }
  },


  properties :
  {
    /** Data object containing the data which should be shown in the target. */
    model :
    {
      check: "qx.core.Object",
      apply: "_applyModel",
      event: "changeModel",
      nullable: true,
      dereference: true
    },


    /** The target widget which should show the data. */
    target :
    {
      check: "qx.ui.form.Form",
      apply: "_applyTarget",
      event: "changeTarget",
      nullable: true,
      init: null,
      dereference: true
    }
  },


  members :
  {
    __objectController : null,
    __bindingOptions : null,


    /**
     * The form controller uses for setting up the bindings the fundamental
     * binding layer, the {@link qx.data.SingleValueBinding}. To achieve a
     * binding in both directions, two bindings are neede. With this method,
     * you have the opportunity to set the options used for the bindings.
     *
     * @param name {String} The name of the form item for which the options
     *   should be used.
     * @param model2target {Map} Options map used for the binding from model
     *   to target. The possible options can be found in the
     *   {@link qx.data.SingleValueBinding} class.
     * @param target2model {Map} Options map used for the binding from target
     *   to model. The possible options can be found in the
     *   {@link qx.data.SingleValueBinding} class.
     */
    addBindingOptions : function(name, model2target, target2model)
    {
      this.__bindingOptions[name] = [model2target, target2model];

      // return if not both, model and target are given
      if (this.getModel() == null || this.getTarget() == null) {
        return;
      }

      // renew the affected binding
      var item = this.getTarget().getItems()[name];
      var targetProperty =
        this.__isModelSelectable(item) ? "modelSelection[0]" : "value";

      // remove the binding
      this.__objectController.removeTarget(item, targetProperty, name);
      // set up the new binding with the options
      this.__objectController.addTarget(
        item, targetProperty, name, !this._selfUpdate, model2target, target2model
      );
    },


    /**
     * Creates and sets a model using the {@link qx.data.marshal.Json} object.
     * Remember that this method can only work if the form is set. The created
     * model will fit exactly that form. Changing the form or adding an item to
     * the form will need a new model creation.
     *
     * @param includeBubbleEvents {Boolean} Whether the model should support
     *   the bubbling of change events or not.
     * @return {qx.core.Object} The created model.
     */
    createModel : function(includeBubbleEvents) {
      var target = this.getTarget();

      // throw an error if no target is set
      if (target == null) {
        throw new Error("No target is set.");
      }

      var items = target.getItems();
      var data = {};
      for (var name in items) {
        var names = name.split(".");
        var currentData = data;
        for (var i = 0; i < names.length; i++) {
          // if its the last item
          if (i + 1 == names.length) {
            // check if the target is a selection
            var clazz = items[name].constructor;
            var itemValue = null;
            if (qx.Class.hasInterface(clazz, qx.ui.core.ISingleSelection)) {
              // use the first element of the selection because passed to the
              // marshaler (and its single selection anyway) [BUG #3541]
              itemValue = items[name].getModelSelection().getItem(0) || null;
            } else {
              itemValue = items[name].getValue();
            }
            // call the converter if available [BUG #4382]
            if (this.__bindingOptions[name] && this.__bindingOptions[name][1]) {
              itemValue = this.__bindingOptions[name][1].converter(itemValue);
            }
            currentData[names[i]] = itemValue;
          } else {
            // if its not the last element, check if the object exists
            if (!currentData[names[i]]) {
              currentData[names[i]] = {};
            }
            currentData = currentData[names[i]];
          }
        }
      }

      var model = qx.data.marshal.Json.createModel(data, includeBubbleEvents);
      this.setModel(model);

      return model;
    },


    /**
     * Responsible for synching the data from entered in the form to the model.
     * Please keep in mind that this method only works if you create the form
     * with <code>selfUpdate</code> set to true. Otherwise, this method will
     * do nothing because updates will be synched automatically on every
     * change.
     */
    updateModel: function(){
      // only do stuff if self update is enabled and a model or target is set
      if (!this._selfUpdate || !this.getModel() || !this.getTarget()) {
        return;
      }

      var items = this.getTarget().getItems();
      for (var name in items) {
        var item = items[name];
        var sourceProperty =
          this.__isModelSelectable(item) ? "modelSelection[0]" : "value";

        var options = this.__bindingOptions[name];
        options = options && this.__bindingOptions[name][1];

        qx.data.SingleValueBinding.updateTarget(
          item, sourceProperty, this.getModel(), name, options
        );
      }
    },


    // apply method
    _applyTarget : function(value, old) {
      // if an old target is given, remove the binding
      if (old != null) {
        this.__tearDownBinding(old);
      }

      // do nothing if no target is set
      if (this.getModel() == null) {
        return;
      }

      // target and model are available
      if (value != null) {
        this.__setUpBinding();
      }
    },


    // apply method
    _applyModel : function(value, old) {

      // set the model to null to reset all items before removing them
      if (this.__objectController != null && value == null) {
        this.__objectController.setModel(null);
      }

      // first, get rid off all bindings (avoids wrong data population)
      if (this.__objectController != null) {
        var items = this.getTarget().getItems();
        for (var name in items) {
          var item = items[name];
          var targetProperty =
            this.__isModelSelectable(item) ? "modelSelection[0]" : "value";
          this.__objectController.removeTarget(item, targetProperty, name);
        }
      }

      // set the model of the object controller if available
      if (this.__objectController != null) {
        this.__objectController.setModel(value);
      }

      // do nothing is no target is set
      if (this.getTarget() == null) {
        return;
      }

      // model and target are available
      if (value != null) {
        this.__setUpBinding();
      }
    },


    /**
     * Internal helper for setting up the bindings using
     * {@link qx.data.controller.Object#addTarget}. All bindings are set
     * up bidirectional.
     */
    __setUpBinding : function() {
      // create the object controller
      if (this.__objectController == null) {
        this.__objectController = new qx.data.controller.Object(this.getModel());
      }

      // get the form items
      var items = this.getTarget().getItems();

      // connect all items
      for (var name in items) {
        var item = items[name];
        var targetProperty =
          this.__isModelSelectable(item) ? "modelSelection[0]" : "value";
        var options = this.__bindingOptions[name];

        // try to bind all given items in the form
        try {
          if (options == null) {
            this.__objectController.addTarget(item, targetProperty, name, !this._selfUpdate);
          } else {
            this.__objectController.addTarget(
              item, targetProperty, name, !this._selfUpdate, options[0], options[1]
            );
          }
        // ignore not working items
        } catch (ex) {
          if (qx.core.Environment.get("qx.debug")) {
            this.warn("Could not bind property " + name + " of " + this.getModel());
          }
        }
      }
      // make sure the initial values of the model are taken for resetting [BUG #5874]
      this.getTarget().redefineResetter();
    },


    /**
     * Internal helper for removing all set up bindings using
     * {@link qx.data.controller.Object#removeTarget}.
     *
     * @param oldTarget {qx.ui.form.Form} The form which has been removed.
     */
    __tearDownBinding : function(oldTarget) {
      // do nothing if the object controller has not been created
      if (this.__objectController == null) {
        return;
      }

      // get the items
      var items = oldTarget.getItems();

      // disconnect all items
      for (var name in items) {
        var item = items[name];
        var targetProperty =
          this.__isModelSelectable(item) ? "modelSelection[0]" : "value";
        this.__objectController.removeTarget(item, targetProperty, name);
      }
    },


    /**
     * Returns whether the given item implements
     * {@link qx.ui.core.ISingleSelection} and
     * {@link qx.ui.form.IModelSelection}.
     *
     * @param item {qx.ui.form.IForm} The form item to check.
     *
     * @return {Boolean} true, if given item fits.
     */
    __isModelSelectable : function(item) {
      return qx.Class.hasInterface(item.constructor, qx.ui.core.ISingleSelection) &&
      qx.Class.hasInterface(item.constructor, qx.ui.form.IModelSelection);
    }

  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     // dispose the object controller because the bindings need to be removed
     if (this.__objectController) {
       this.__objectController.dispose();
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


/**
 * <h2>Object Controller</h2>
 *
 * *General idea*
 *
 * The idea of the object controller is to make the binding of one model object
 * containing one or more properties as easy as possible. Therefore the
 * controller can take a model as property. Every property in that model can be
 * bound to one or more target properties. The binding will be for
 * atomic types only like Numbers, Strings, ...
 *
 * *Features*
 *
 * * Manages the bindings between the model properties and the different targets
 * * No need for the user to take care of the binding ids
 * * Can create an bidirectional binding (read- / write-binding)
 * * Handles the change of the model which means adding the old targets
 *
 * *Usage*
 *
 * The controller only can work if a model is set. If the model property is
 * null, the controller is not working. But it can be null on any time.
 *
 * *Cross reference*
 *
 * * If you want to bind a list like widget, use {@link qx.data.controller.List}
 * * If you want to bind a tree widget, use {@link qx.data.controller.Tree}
 * * If you want to bind a form widget, use {@link qx.data.controller.Form}
 */
qx.Class.define("qx.data.controller.Object",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param model {qx.core.Object?null} The model for the model property.
   */
  construct : function(model)
  {
    this.base(arguments);

    // create a map for all created binding ids
    this.__bindings = {};
    // create an array to store all current targets
    this.__targets = [];

    if (model != null) {
      this.setModel(model);
    }
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The model object which does have the properties for the binding. */
    model :
    {
      check: "qx.core.Object",
      event: "changeModel",
      apply: "_applyModel",
      nullable: true,
      dereference: true
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // private members
    __targets : null,
    __bindings : null,

    /**
     * Apply-method which will be called if a new model has been set.
     * All bindings will be moved to the new model.
     *
     * @param value {qx.core.Object|null} The new model.
     * @param old {qx.core.Object|null} The old model.
     */
    _applyModel: function(value, old) {
      // for every target
      for (var i = 0; i < this.__targets.length; i++) {
        // get the properties
        var targetObject = this.__targets[i][0];
        var targetProperty = this.__targets[i][1];
        var sourceProperty = this.__targets[i][2];
        var bidirectional = this.__targets[i][3];
        var options = this.__targets[i][4];
        var reverseOptions = this.__targets[i][5];

        // remove it from the old if possible
        if (old != undefined && !old.isDisposed()) {
          this.__removeTargetFrom(targetObject, targetProperty, sourceProperty, old);
        }

        // add it to the new if available
        if (value != undefined) {
          this.__addTarget(
            targetObject, targetProperty, sourceProperty, bidirectional,
            options, reverseOptions
          );
        } else {
          // in shutdown situations, it may be that something is already
          // disposed [BUG #4343]
          if (targetObject.isDisposed() || qx.core.ObjectRegistry.inShutDown) {
            continue;
          }
          // if the model is null, reset the current target
          if (targetProperty.indexOf("[") == -1) {
            targetObject["reset" + qx.lang.String.firstUp(targetProperty)]();
          } else {
            var open = targetProperty.indexOf("[");
            var index = parseInt(
              targetProperty.substring(open + 1, targetProperty.length - 1), 10
            );
            targetProperty = targetProperty.substring(0, open);
            var targetArray = targetObject["get" + qx.lang.String.firstUp(targetProperty)]();
            if (index == "last") {
              index = targetArray.length;
            }
            if (targetArray) {
              targetArray.setItem(index, null);
            }
          }
        }
      }
    },


    /**
     * Adds a new target to the controller. After adding the target, the given
     * property of the model will be bound to the targets property.
     *
     * @param targetObject {qx.core.Object} The object on which the property
     *   should be bound.
     *
     * @param targetProperty {String} The property to which the binding should
     *   go.
     *
     * @param sourceProperty {String} The name of the property in the model.
     *
     * @param bidirectional {Boolean?false} Signals if the binding should also work
     *   in the reverse direction, from the target to source.
     *
     * @param options {Map?null} The options Map used by the binding from source
     *   to target. The possible options can be found in the
     *   {@link qx.data.SingleValueBinding} class.
     *
     * @param reverseOptions {Map?null} The options used by the binding in the
     *   reverse direction. The possible options can be found in the
     *   {@link qx.data.SingleValueBinding} class.
     */
    addTarget: function(
      targetObject, targetProperty, sourceProperty,
      bidirectional, options, reverseOptions
    ) {

      // store the added target
      this.__targets.push([
        targetObject, targetProperty, sourceProperty,
        bidirectional, options, reverseOptions
      ]);

      // delegate the adding
      this.__addTarget(
        targetObject, targetProperty, sourceProperty,
        bidirectional, options, reverseOptions
      );
    },


    /**
    * Does the work for {@link #addTarget} but without saving the target
    * to the internal target registry.
    *
    * @param targetObject {qx.core.Object} The object on which the property
    *   should be bound.
    *
    * @param targetProperty {String} The property to which the binding should
    *   go.
    *
    * @param sourceProperty {String} The name of the property in the model.
    *
    * @param bidirectional {Boolean?false} Signals if the binding should also work
    *   in the reverse direction, from the target to source.
    *
    * @param options {Map?null} The options Map used by the binding from source
    *   to target. The possible options can be found in the
    *   {@link qx.data.SingleValueBinding} class.
    *
    * @param reverseOptions {Map?null} The options used by the binding in the
    *   reverse direction. The possible options can be found in the
    *   {@link qx.data.SingleValueBinding} class.
    */
    __addTarget: function(
      targetObject, targetProperty, sourceProperty,
      bidirectional, options, reverseOptions
    ) {

      // do nothing if no model is set
      if (this.getModel() == null) {
        return;
      }

      // create the binding
      var id = this.getModel().bind(
        sourceProperty, targetObject, targetProperty, options
      );
      // create the reverse binding if necessary
      var idReverse = null
      if (bidirectional) {
        idReverse = targetObject.bind(
          targetProperty, this.getModel(), sourceProperty, reverseOptions
        );
      }

      // save the binding
      var targetHash = targetObject.toHashCode();
      if (this.__bindings[targetHash] == undefined) {
        this.__bindings[targetHash] = [];
      }
      this.__bindings[targetHash].push(
        [id, idReverse, targetProperty, sourceProperty, options, reverseOptions]
      );
    },

    /**
     * Removes the target identified by the three properties.
     *
     * @param targetObject {qx.core.Object} The target object on which the
     *   binding exist.
     *
     * @param targetProperty {String} The targets property name used by the
     *   adding of the target.
     *
     * @param sourceProperty {String} The name of the property of the model.
     */
    removeTarget: function(targetObject, targetProperty, sourceProperty) {
      this.__removeTargetFrom(
        targetObject, targetProperty, sourceProperty, this.getModel()
      );

      // delete the target in the targets reference
      for (var i = 0; i < this.__targets.length; i++) {
        if (
          this.__targets[i][0] == targetObject
          && this.__targets[i][1] == targetProperty
          && this.__targets[i][2] == sourceProperty
        ) {
          this.__targets.splice(i, 1);
        }
      }
    },


    /**
     * Does the work for {@link #removeTarget} but without removing the target
     * from the internal registry.
     *
     * @param targetObject {qx.core.Object} The target object on which the
     *   binding exist.
     *
     * @param targetProperty {String} The targets property name used by the
     *   adding of the target.
     *
     * @param sourceProperty {String} The name of the property of the model.
     *
     * @param sourceObject {String} The source object from which the binding
     *   comes.
     */
    __removeTargetFrom: function(
      targetObject, targetProperty, sourceProperty, sourceObject
    ) {
      // check for not fitting targetObjects
      if (!(targetObject instanceof qx.core.Object)) {
        // just do nothing
        return;
      }

      var currentListing = this.__bindings[targetObject.toHashCode()];
      // if no binding is stored
      if (currentListing == undefined || currentListing.length == 0) {
        return;
      }

      // go threw all listings for the object
      for (var i = 0; i < currentListing.length; i++) {
        // if it is the listing
        if (
          currentListing[i][2] == targetProperty &&
          currentListing[i][3] == sourceProperty
        ) {
          // remove the binding
          var id = currentListing[i][0];
          sourceObject.removeBinding(id);
          // check for the reverse binding
          if (currentListing[i][1] != null) {
            targetObject.removeBinding(currentListing[i][1]);
          }
          // delete the entry and return
          currentListing.splice(i, 1);
          return;
        }
      }
    }
  },


  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    // set the model to null to get the bindings removed
    if (this.getModel() != null && !this.getModel().isDisposed()) {
      this.setModel(null);
    }
  }
});
