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
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************

#asset(qx/decoration/Indigo/font/JosefinSlab-SemiBold.woff)
#asset(qx/decoration/Indigo/font/JosefinSlab-SemiBold.ttf)

************************************************************************* */


/**
 * The simple qooxdoo font theme.
 */
qx.Theme.define("qx.theme.indigo.Font",
{
  fonts :
  {
    "default" :
    {
      size : 12,
      family : ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"],
      color: "font",
      lineHeight: 1.8
    },

    "bold" :
    {
      size : 12,
      family : ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"],
      bold : true,
      color: "font",
      lineHeight: 1.8
    },

    "headline" :
    {
      size : 22,
      family : ["serif"],
      sources:
      [
        {
          family : "JosefinSlab",
          source: [
            "qx/decoration/Indigo/font/JosefinSlab-SemiBold.woff",
            "qx/decoration/Indigo/font/JosefinSlab-SemiBold.ttf"
          ]
        }
      ]
    },

    "small" :
    {
      size : 11,
      family : ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"],
      color: "font",
      lineHeight: 1.8
    },

    "monospace" :
    {
      size : 11,
      family : [ "DejaVu Sans Mono", "Courier New", "monospace" ],
      color: "font",
      lineHeight: 1.8
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************

#asset(qx/icon/Tango/16/apps/office-calendar.png)
#asset(qx/icon/Tango/16/places/folder-open.png)
#asset(qx/icon/Tango/16/places/folder.png)
#asset(qx/icon/Tango/16/mimetypes/text-plain.png)
#asset(qx/icon/Tango/16/actions/view-refresh.png)
#asset(qx/icon/Tango/16/actions/window-close.png)
#asset(qx/icon/Tango/16/actions/dialog-cancel.png)
#asset(qx/icon/Tango/16/actions/dialog-ok.png)

************************************************************************* */

/**
 * The simple qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.simple.Appearance",
{
  appearances :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "widget" : {},

    "label" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.3 : undefined
        }
      }
    },

    "atom" : {},
    "atom/label" : "label",
    "atom/icon" : "image",

    "root" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          textColor : "text",
          font : "default"
        };
      }
    },

    "popup" :
    {
      style : function(states)
      {
        return {
          decorator : "popup",
          backgroundColor : "background-pane"
        }
      }
    },

    "tooltip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          backgroundColor : "tooltip",
          textColor : "tooltip-text",
          decorator : "tooltip",
          padding : [ 1, 3, 2, 3 ],
          offset : [ 15, 5, 5, 5 ]
        };
      }
    },

    "tooltip/atom" : "atom",

    "tooltip-error" :
    {
      include : "tooltip",

      style : function(states)
      {
        return {
          textColor: "text-selected",
          showTimeout: 100,
          hideTimeout: 10000,
          decorator: "tooltip-error",
          font: "bold",
          backgroundColor: undefined
        };
      }
    },

    "tooltip-error/atom" : "atom",

    "iframe" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          decorator : "main-dark"
        };
      }
    },

    "move-frame" :
    {
      style : function(states)
      {
        return {
          decorator : "main-dark"
        };
      }
    },

    "resize-frame" : "move-frame",

    "dragdrop-cursor" :
    {
      style : function(states)
      {
        var icon = "nodrop";

        if (states.copy) {
          icon = "copy";
        } else if (states.move) {
          icon = "move";
        } else if (states.alias) {
          icon = "alias";
        }

        return {
          source : qx.theme.simple.Image.URLS["cursor-" + icon],
          position : "right-top",
          offset : [ 2, 16, 2, 6 ]
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      SLIDEBAR
    ---------------------------------------------------------------------------
    */

    "slidebar" : {},
    "slidebar/scrollpane" : {},
    "slidebar/content" : {},

    "slidebar/button-forward" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["arrow-" + (states.vertical ? "down" : "right")]
        };
      }
    },

    "slidebar/button-backward" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["arrow-" + (states.vertical ? "up" : "left")]
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table" : "widget",

    "table/statusbar" :
    {
      style : function(states)
      {
        return {
          decorator : "statusbar",
          padding : [2, 5]
        };
      }
    },

    "table/column-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          decorator : "table-header-column-button",
          padding : 3,
          icon : qx.theme.simple.Image.URLS["select-column-order"]
        };
      }
    },

    "table-column-reset-button" :
    {
      include : "menu-button",
      alias : "menu-button",

      style : function()
      {
        return {
          icon : "icon/16/actions/view-refresh.png"
        }
      }
    },

    "table-scroller/scrollbar-x": "scrollbar",
    "table-scroller/scrollbar-y": "scrollbar",

    "table-scroller" : "widget",

    "table-scroller/header": {
      style : function() {
        return {
          decorator : "table-header"
        }
      }
    },

    "table-scroller/pane" : {},

    "table-scroller/focus-indicator" :
    {
      style : function(states)
      {
        return {
          decorator : "main"
        };
      }
    },

    "table-scroller/resize-line" :
    {
      style : function(states)
      {
        return {
          backgroundColor: "button-border",
          width: 3
        };
      }
    },

    "table-header-cell" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          decorator : states.first ? "table-header-cell-first" : "table-header-cell",
          minWidth: 13,
          font : "bold",
          paddingTop: 3,
          paddingLeft: 5,
          cursor : states.disabled ? undefined : "pointer",
          sortIcon : states.sorted ?
              (qx.theme.simple.Image.URLS["table-" +
                 (states.sortedAscending ? "ascending" : "descending")
              ]) : undefined
        }
      }
    },

    "table-header-cell/icon" :
    {
      include : "atom/icon",

      style : function(states) {
        return {
          paddingRight : 5
        }
      }
    },

    "table-header-cell/sort-icon" :
    {
      style : function(states)
      {
        return {
          alignY : "middle",
          alignX : "right",
          paddingRight : 5
        }
      }
    },

    "table-editor-textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined,
          padding : [ 2, 2 ]
        };
      }
    },

    "table-editor-selectbox" :
    {
      include : "selectbox",
      alias : "selectbox",

      style : function(states)
      {
        return {
          padding : [ 0, 2 ]
        };
      }
    },

    "table-editor-combobox" :
    {
      include : "combobox",
      alias : "combobox",

      style : function(states)
      {
        return {
          decorator : undefined
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      TREEVIRTUAL
    ---------------------------------------------------------------------------
    */

    "treevirtual" : {
      include : "textfield",
      alias : "table",
      style : function(states, superStyles) {
        return {
          padding : [superStyles.padding[0] + 2, superStyles.padding[1] + 1]
        }
      }
    },

    "treevirtual-folder" :
    {
      style : function(states)
      {
        return {
          icon : (states.opened
                  ? "icon/16/places/folder-open.png"
                  : "icon/16/places/folder.png")
        }
      }
    },

    "treevirtual-file" :
    {
      include : "treevirtual-folder",
      alias : "treevirtual-folder",

      style : function(states)
      {
        return {
          icon : "icon/16/mimetypes/text-plain.png"
        }
      }
    },

    "treevirtual-line" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-line"]
        }
      }
    },

    "treevirtual-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["tree-minus"]
        }
      }
    },

    "treevirtual-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["tree-plus"]
        }
      }
    },

    "treevirtual-only-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-minus-only"]
        }
      }
    },

    "treevirtual-only-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-plus-only"]
        }
      }
    },

    "treevirtual-start-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-minus-start"]
        }
      }
    },

    "treevirtual-start-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-plus-start"]
        }
      }
    },

    "treevirtual-end-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-minus-end"]
        }
      }
    },

    "treevirtual-end-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-plus-end"]
        }
      }
    },

    "treevirtual-cross-contract" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-minus-cross"]
        }
      }
    },

    "treevirtual-cross-expand" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-plus-cross"]
        }
      }
    },


    "treevirtual-end" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-end"]
        }
      }
    },

    "treevirtual-cross" :
    {
      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["treevirtual-cross"]
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      RESIZER
    ---------------------------------------------------------------------------
    */

    "resizer" :
    {
      style : function(states)
      {
        return {
          decorator : "main-dark"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    "splitpane" : {},

    "splitpane/splitter" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "light-background"
        };
      }
    },

    "splitpane/splitter/knob" :
    {
      style : function(states)
      {
        return {
          source : qx.theme.simple.Image.URLS[
            "knob-" + (states.horizontal ? "horizontal" : "vertical")
          ],
          padding : 2
        };
      }
    },

    "splitpane/slider" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "border-light-shadow",
          opacity : 0.3
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    "menu" :
    {
      style : function(states)
      {
        var result =
        {
          backgroundColor : "background",
          decorator : "main",
          spacingX : 6,
          spacingY : 1,
          iconColumnWidth : 16,
          arrowColumnWidth : 4,
          padding : 1,
          placementModeY : states.submenu || states.contextmenu ? "best-fit" : "keep-align"
        };

        if (states.submenu)
        {
          result.position = "right-top";
          result.offset = [-2, -3];
        }

        if (states.contextmenu) {
          result.offset = 4;
        }

        return result;
      }
    },

    "menu/slidebar" : "menu-slidebar",

    "menu-slidebar" : "widget",

    "menu-slidebar-button" :
    {
      style : function(states)
      {
        return {
          backgroundColor : states.hovered  ? "background-selected" : undefined,
          padding : 6,
          center : true
        };
      }
    },

    "menu-slidebar/button-backward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS[
            "arrow-up" + (states.hovered ? "-invert" : "")
          ]
        };
      }
    },

    "menu-slidebar/button-forward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS[
            "arrow-down" + (states.hovered ? "-invert" : "")
          ]
        };
      }
    },

    "menu-separator" :
    {
      style : function(states)
      {
        return {
          height : 0,
          decorator : "menu-separator",
          marginTop : 4,
          marginBottom: 4,
          marginLeft : 2,
          marginRight : 2
        }
      }
    },

    "menu-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          backgroundColor : states.selected ? "background-selected" : undefined,
          textColor : states.selected ? "text-selected" : undefined,
          padding : [ 2, 6 ]
        };
      }
    },

    "menu-button/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          alignY : "middle"
        };
      }
    },

    "menu-button/label" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          padding : 1
        };
      }
    },

    "menu-button/shortcut" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          marginLeft : 14,
          padding : 1
        };
      }
    },

    "menu-button/arrow" :
    {
      include : "image",

      style : function(states)
      {
        return {
          source : qx.theme.simple.Image.URLS[
            "arrow-right" + (states.selected ? "-invert" : "")
          ],
          alignY : "middle"
        };
      }
    },

    "menu-checkbox" :
    {
      alias : "menu-button",
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : !states.checked ? undefined :
            qx.theme.simple.Image.URLS[
              "menu-checkbox" + (states.selected ?  "-invert" : "")
            ]
        }
      }
    },

    "menu-radiobutton" :
    {
      alias : "menu-button",
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : !states.checked ? undefined :
            qx.theme.simple.Image.URLS[
              "menu-radiobutton" + (states.selected ?  "-invert" : "")
            ]
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */

    "menubar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "light-background",
          padding: [4, 2]
        };
      }
    },

    "menubar-button" :
    {
      style : function(states)
      {
        var decorator;
        var padding = [2, 6];
        if (!states.disabled) {
          if (states.pressed) {
            decorator = "menubar-button-pressed";
            padding = [1, 5, 2, 5];
          } else if (states.hovered) {
            decorator = "menubar-button-hovered";
            padding = [1, 5];
          }
        }

        return {
          padding : padding,
          cursor : states.disabled ? undefined : "pointer",
          textColor : "link",
          decorator : decorator
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      VIRTUAL WIDGETS
    ---------------------------------------------------------------------------
    */
    "virtual-list" : "list",
    "virtual-list/row-layer" : "row-layer",

    "row-layer" : "widget",
    "column-layer" : "widget",

    "group-item" :
    {
      include : "label",
      alias : "label",

      style : function(states)
      {
        return {
          padding : 4,
          backgroundColor : "#BABABA",
          textColor : "white",
          font: "bold"
        };
      }
    },

    "virtual-selectbox" : "selectbox",
    "virtual-selectbox/dropdown" : "popup",
    "virtual-selectbox/dropdown/list" : {
      alias : "virtual-list"
    },

    "virtual-combobox" : "combobox",
    "virtual-combobox/dropdown" : "popup",
    "virtual-combobox/dropdown/list" : {
      alias : "virtual-list"
    },

    "virtual-tree" :
    {
      include : "tree",
      alias : "tree",

      style : function(states)
      {
        return {
          itemHeight : 21
        };
      }
    },

    "virtual-tree-folder" : "tree-folder",
    "virtual-tree-file" : "tree-file",

    "cell" :
    {
      style : function(states)
      {
        return {
          backgroundColor: states.selected ?
            "table-row-background-selected" :
            "table-row-background-even",
          textColor: states.selected ? "text-selected" : "text",
          padding: [3, 6]
        }
      }
    },

    "cell-string" : "cell",
    "cell-number" :
    {
      include : "cell",
      style : function(states)
      {
        return {
          textAlign : "right"
        }
      }
    },
    "cell-image" : "cell",
    "cell-boolean" : "cell",
    "cell-atom" : "cell",
    "cell-date" : "cell",
    "cell-html" : "cell",


    /*
    ---------------------------------------------------------------------------
      HTMLAREA
    ---------------------------------------------------------------------------
    */

    "htmlarea" :
    {
      "include" : "widget",

      style : function(states)
      {
        return {
          backgroundColor : "white"
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */

    "scrollbar" : {},
    "scrollbar/slider" : {},

    "scrollbar/slider/knob" :
    {
      style : function(states)
      {
        var decorator = "scroll-knob";

        if (!states.disabled) {
          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "scroll-knob-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "scroll-knob-pressed-hovered";
          } else if (states.pressed || states.checked) {
            decorator = "scroll-knob-pressed";
          }
        }

        return {
          height : 14,
          width : 14,
          cursor : states.disabled ? undefined : "pointer",
          decorator : decorator,
          minHeight : states.horizontal ? undefined : 20,
          minWidth : states.horizontal ? 20 : undefined
        };
      }
    },


    "scrollbar/button" :
    {
      style : function(states)
      {
        var styles = {};
        styles.padding = 4;

        var icon = "";
        if (states.left) {
          icon = "left";
          styles.marginRight = 2;
        } else if (states.right) {
          icon += "right";
          styles.marginLeft = 2;
        } else if (states.up) {
          icon += "up";
          styles.marginBottom = 2;
        } else {
          icon += "down";
          styles.marginTop = 2;
        }

        styles.icon = qx.theme.simple.Image.URLS["arrow-" + icon];

        styles.cursor = "pointer";
        styles.decorator = "button-box";
        return styles;
      }
    },

    "scrollbar/button-begin" : "scrollbar/button",
    "scrollbar/button-end" : "scrollbar/button",


    /*
    ---------------------------------------------------------------------------
      SCROLLAREA
    ---------------------------------------------------------------------------
    */

    "scrollarea/corner" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background"
        }
      }
    },

    "scrollarea" : "widget",
    "scrollarea/pane" : "widget",
    "scrollarea/scrollbar-x" : "scrollbar",
    "scrollarea/scrollbar-y" : "scrollbar",


    /*
    ---------------------------------------------------------------------------
      TEXT FIELD
    ---------------------------------------------------------------------------
    */

    "textfield" :
    {
      style : function(states)
      {
        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = undefined;
        }

        var decorator;
        var padding;
        if (states.disabled) {
          decorator = "inset";
          padding = [2, 3];
        } else if (states.invalid) {
          decorator = "border-invalid";
          padding = [1, 2];
        } else if (states.focused) {
          decorator = "focused-inset";
          padding = [1, 2];
        } else {
          padding = [2, 3];
          decorator = "inset";
        }

        return {
          decorator : decorator,
          padding   : padding,
          textColor : textColor,
          backgroundColor : states.disabled ? "background-disabled" : "white"
        };
      }
    },

    "textarea" : "textfield",



    /*
    ---------------------------------------------------------------------------
      RADIO BUTTON
    ---------------------------------------------------------------------------
    */
    "radiobutton/icon" : {
      style : function(states)
      {
        var decorator = "radiobutton";

        if (states.focused && !states.invalid) {
          decorator = "radiobutton-focused";
        }

        decorator += states.invalid && !states.disabled ? "-invalid" : "";

        var backgroundColor;
        if (states.disabled && states.checked) {
          backgroundColor = "background-disabled-checked";
        } else if (states.disabled) {
          backgroundColor = "background-disabled";
        } else if (states.checked) {
          backgroundColor = "background-selected";
        }

        return {
          decorator : decorator,
          width: 12,
          height: 12,
          backgroundColor : backgroundColor
        }
      }
    },

    "radiobutton":
    {
      style : function(states)
      {
        // set an empty icon to be sure that the icon image is rendered
        return {
          icon : qx.theme.simple.Image.URLS["blank"]
        }
      }
    },

    /*
    ---------------------------------------------------------------------------
      FORM
    ---------------------------------------------------------------------------
    */
    "form-renderer-label" : {
      include : "label",
      style : function() {
        return {
          paddingTop: 3
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      CHECK BOX
    ---------------------------------------------------------------------------
    */
    "checkbox":
    {
      alias : "atom",

      style : function(states)
      {
        // The "disabled" icon is set to an icon **without** the -disabled
        // suffix on purpose. This is because the Image widget handles this
        // already by replacing the current image with a disabled version
        // (if available). If no disabled image is found, the opacity style
        // is used.
        var icon;

        // Checked
        if (states.checked) {
          icon = qx.theme.simple.Image.URLS["checkbox-checked"];
        // Undetermined
        } else if (states.undetermined) {
          icon = qx.theme.simple.Image.URLS["checkbox-undetermined"];
        // Unchecked
        } else {
          // empty icon
          icon = qx.theme.simple.Image.URLS["blank"];
        }

        return {
          icon: icon,
          gap: 6
        }
      }
    },


    "checkbox/icon" : {
      style : function(states)
      {
        var decorator = "checkbox";

        if (states.focused && !states.invalid) {
          decorator = "checkbox-focused";
        }

        decorator += states.invalid && !states.disabled ? "-invalid" : "";

        var padding;
        // Checked
        if (states.checked) {
          padding = 2;
        // Undetermined
        } else if (states.undetermined) {
          padding = [4, 2];
        }

        return {
          decorator : decorator,
          width: 12,
          height: 12,
          padding: padding,
          backgroundColor : "white"
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      SPINNER
    ---------------------------------------------------------------------------
    */

    "spinner" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "spinner/textfield" : "textfield",

    "spinner/upbutton" :
    {
      alias : "combobox/button",
      include : "combobox/button",

      style : function(states)
      {
        var decorator = "button-box-top-right";

        if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered-top-right";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered-top-right";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed-top-right";
        }

        return {
          icon : qx.theme.simple.Image.URLS["arrow-up-small"],
          decorator : decorator,
          width: 17
        }
      }
    },

    "spinner/downbutton" :
    {
      alias : "combobox/button",
      include : "combobox/button",

      style : function(states)
      {
        var decorator = "button-box-bottom-right";

        if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered-bottom-right";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered-bottom-right";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed-bottom-right";
        }

        return {
          icon : qx.theme.simple.Image.URLS["arrow-down-small"],
          decorator : decorator,
          width: 17
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      SELECTBOX
    ---------------------------------------------------------------------------
    */

    "selectbox" : "button-frame",

    "selectbox/atom" : "atom",
    "selectbox/popup" : "popup",
    "selectbox/list" : {
      alias : "list",
      include : "list",

      style : function()
      {
        return {
          decorator : undefined
        };
      }
    },

    "selectbox/arrow" :
    {
      include : "image",

      style : function(states)
      {
        return {
          source : qx.theme.simple.Image.URLS["arrow-down"],
          paddingRight : 4,
          paddingLeft : 5
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      COMBO BOX
    ---------------------------------------------------------------------------
    */

    "combobox" :{},

    "combobox/button" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        var decorator = "button-box-right-borderless";

        if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered-right-borderless";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered-right-borderless";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed-right-borderless";
        }

        return {
          icon : qx.theme.simple.Image.URLS["arrow-down"],
          decorator : decorator,
          padding : [0, 5],
          width: 19
        };
      }
    },

    "combobox/popup" : "popup",
    "combobox/list" :
    {
      alias : "list"
    },

    "combobox/textfield" : "textfield",


    /*
    ---------------------------------------------------------------------------
      DATEFIELD
    ---------------------------------------------------------------------------
    */

    "datefield" : "textfield",

    "datefield/button" :
    {
      alias : "combobox/button",
      include : "combobox/button",

      style : function(states)
      {
        return {
          icon : "icon/16/apps/office-calendar.png",
          padding : [0, 0, 0, 3],
          backgroundColor : undefined,
          decorator : undefined,
          width: 19
        };
      }
    },

    "datefield/textfield" : {
      alias : "textfield",
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined,
          padding: 0
        };
      }
    },

    "datefield/list" :
    {
      alias : "datechooser",
      include : "datechooser",

      style : function(states)
      {
        return {
          decorator : undefined
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      LIST
    ---------------------------------------------------------------------------
    */

    "list" :
    {
      alias : "scrollarea",
      include : "textfield"
    },

    "listitem" :
    {
      alias : "atom",

      style : function(states)
      {
        var padding = [3, 5, 3, 5];
        if (states.lead) {
          padding = [ 2, 4 , 2, 4];
        }
        if (states.dragover) {
          padding[2] -= 2;
        }

        var backgroundColor;
        if (states.selected) {
          backgroundColor = "background-selected"
          if (states.disabled) {
            backgroundColor += "-disabled";
          }
        }
        return {
          gap : 4,
          padding : padding,
          backgroundColor : backgroundColor,
          textColor : states.selected ? "text-selected" : undefined,
          decorator : states.lead ? "lead-item" : states.dragover ? "dragover" : undefined
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      SLIDER
    ---------------------------------------------------------------------------
    */

    "slider" :
    {
      style : function(states)
      {
        var decorator;
        var padding;
        if (states.disabled) {
          decorator = "inset";
          padding = [2, 3];
        } else if (states.invalid) {
          decorator = "border-invalid";
          padding = [1, 2];
        } else if (states.focused) {
          decorator = "focused-inset";
          padding = [1, 2];
        } else {
          padding = [2, 3];
          decorator = "inset";
        }

        return {
          decorator : decorator,
          padding   : padding
        }
      }
    },

    "slider/knob" : "scrollbar/slider/knob",


    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */
    "button-frame" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator = "button-box";

        if (!states.disabled) {
          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed";
          }
        }

        if (states.invalid && !states.disabled) {
          decorator += "-invalid";
        } else if (states.focused) {
          decorator += "-focused";
        }

        return {
          decorator : decorator,
          padding : [3, 8],
          cursor: states.disabled ? undefined : "pointer",
          minWidth: 5,
          minHeight: 5
        };
      }
    },

    "button-frame/label" : {
      alias : "atom/label",

      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "button" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        return {
          center : true
        };
      }
    },

    "hover-button" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          decorator : states.hovered ? "button-hover" : undefined
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      SPLIT BUTTON
    ---------------------------------------------------------------------------
    */
    "splitbutton" : {},

    "splitbutton/button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator = "button-box";

        if (!states.disabled) {
          if (states.pressed || states.checked) {
            decorator += "-pressed";
          }
          if (states.hovered) {
            decorator += "-hovered";
          }
        }

        if (states.focused) {
          decorator += "-focused";
        }

        decorator += "-left";

        return {
          decorator : decorator,
          padding : [3, 8],
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "splitbutton/arrow" : {

      style : function(states)
      {
        var decorator = "button-box";

        if (!states.disabled) {
          if (states.pressed || states.checked) {
            decorator += "-pressed";
          }
          if (states.hovered) {
            decorator += "-hovered";
          }
        }

        if (states.focused) {
          decorator += "-focused";
        }

        decorator += "-right";

        return {
          icon : qx.theme.simple.Image.URLS["arrow-down"],
          decorator : decorator,
          cursor : states.disabled ? undefined : "pointer",
          padding: [3, 4]
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */

    "groupbox" : {},

    "groupbox/legend" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          textColor : states.invalid ? "invalid" : undefined,
          padding : 5,
          margin : 4,
          font: "bold"
        };
      }
    },

    "groupbox/frame" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          padding : [6, 9],
          margin: [18, 2, 2, 2],
          decorator  : "white-box"
        };
      }
    },

    "check-groupbox" : "groupbox",

    "check-groupbox/legend" :
    {
      alias : "checkbox",
      include : "checkbox",

      style : function(states)
      {
        return {
          textColor : states.invalid ? "invalid" : undefined,
          padding : 5,
          margin : 4,
          font: "bold"
        };
      }
    },

    "radio-groupbox" : "groupbox",

    "radio-groupbox/legend" :
    {
      alias : "radiobutton",
      include : "radiobutton",

      style : function(states)
      {
        return {
          textColor : states.invalid ? "invalid" : undefined,
          padding : 5,
          margin : 4,
          font: "bold"
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree-folder/open" :
    {
      include : "image",
      style : function(states)
      {
        return {
          source : states.opened ?
            qx.theme.simple.Image.URLS["tree-minus"] :
            qx.theme.simple.Image.URLS["tree-plus"]
        };
      }
    },


    "tree-folder" :
    {
      style : function(states)
      {
        var backgroundColor;
        if (states.selected) {
          backgroundColor = "background-selected";
          if (states.disabled) {
            backgroundColor += "-disabled";
          }
        }
        return {
          padding : [2, 8, 2, 5],
          icon : states.opened ? "icon/16/places/folder-open.png" : "icon/16/places/folder.png",
          backgroundColor : backgroundColor,
          iconOpened : "icon/16/places/folder-open.png"
        };
      }
    },

    "tree-folder/icon" :
    {
      include : "image",
      style : function(states)
      {
        return {
          padding : [0, 4, 0, 0]
        };
      }
    },

    "tree-folder/label" :
    {
      style : function(states)
      {
        return {
          padding : [ 1, 2 ],
          textColor : states.selected && !states.disabled ? "text-selected" : undefined
        };
      }
    },

    "tree-file" :
    {
      include : "tree-folder",
      alias : "tree-folder",

      style : function(states)
      {
        return {
          icon : "icon/16/mimetypes/text-plain.png"
        };
      }
    },

    "tree" :
    {
      include : "list",
      alias : "list",

      style : function(states)
      {
        return {
          contentPadding : states.invalid && !states.disabled? [3, 0] : [4, 1],
          padding : states.focused ? 0 : 1
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    "window" :
    {
      style : function(states)
      {
        return {
          contentPadding : [ 10, 10, 10, 10 ],
          backgroundColor : "background",
          decorator : states.maximized ? undefined : states.active ? "window-active" : "window"
        };
      }
    },

    "window-resize-frame" : "resize-frame",

    "window/pane" : {},

    "window/captionbar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : states.active ? "light-background" : "background-disabled",
          padding : 8,
          font: "bold",
          decorator : "window-caption"
        };
      }
    },

    "window/icon" :
    {
      style : function(states)
      {
        return {
          marginRight : 4
        };
      }
    },

    "window/title" :
    {
      style : function(states)
      {
        return {
          cursor : "default",
          font : "bold",
          marginRight : 20,
          alignY: "middle"
        };
      }
    },

    "window/minimize-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["window-minimize"],
          padding : [ 1, 2 ],
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/restore-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["window-restore"],
          padding : [ 1, 2 ],
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/maximize-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          icon : qx.theme.simple.Image.URLS["window-maximize"],
          padding : [ 1, 2 ],
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/close-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          marginLeft : 2,
          icon : qx.theme.simple.Image.URLS["window-close"],
          padding : [ 1, 2 ],
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/statusbar" :
    {
      style : function(states)
      {
        return {
          decorator : "statusbar",
          padding : [ 2, 6 ]
        };
      }
    },

    "window/statusbar-text" : "label",



    /*
    ---------------------------------------------------------------------------
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser" :
    {
      style : function(states)
      {
        return {
          decorator : "main",
          minWidth: 220
        }
      }
    },

    "datechooser/navigation-bar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          textColor : states.disabled ? "text-disabled" : states.invalid ? "invalid" : undefined,
          padding : [2, 10]
        };
      }
    },

    "datechooser/last-year-button-tooltip" : "tooltip",
    "datechooser/last-month-button-tooltip" : "tooltip",
    "datechooser/next-year-button-tooltip" : "tooltip",
    "datechooser/next-month-button-tooltip" : "tooltip",

    "datechooser/last-year-button"  : "datechooser/button",
    "datechooser/last-month-button" : "datechooser/button",
    "datechooser/next-year-button"  : "datechooser/button",
    "datechooser/next-month-button" : "datechooser/button",
    "datechooser/button/icon" : {},

    "datechooser/button" :
    {
      style : function(states)
      {
        var result = {
          width  : 17,
          show   : "icon",
          cursor : states.disabled ? undefined : "pointer"
        };

        if (states.lastYear) {
          result.icon = qx.theme.simple.Image.URLS["arrow-rewind"];
        } else if (states.lastMonth) {
          result.icon = qx.theme.simple.Image.URLS["arrow-left"];
        } else if (states.nextYear) {
          result.icon = qx.theme.simple.Image.URLS["arrow-forward"];
        } else if (states.nextMonth) {
          result.icon = qx.theme.simple.Image.URLS["arrow-right"];
        }

        return result;
      }
    },

    "datechooser/month-year-label" :
    {
      style : function(states)
      {
        return {
          font          : "bold",
          textAlign     : "center"
        };
      }
    },

    "datechooser/date-pane" :
    {
      style : function(states)
      {
        return {
          decorator       : "datechooser-date-pane",
          backgroundColor : "background"
        };
      }
    },

    "datechooser/weekday" :
    {
      style : function(states)
      {
        return {
          decorator       : "datechooser-weekday",
          font            : "bold",
          textAlign       : "center",
          textColor       : states.disabled ? "text-disabled" : states.weekend ? "background-selected-dark" : "background",
          backgroundColor : states.weekend ? "background" : "background-selected-dark",
          paddingTop: 2
        };
      }
    },

    "datechooser/day" :
    {
      style : function(states)
      {
        return {
          textAlign       : "center",
          decorator       : states.today ? "main" : undefined,
          textColor       : states.disabled ? "text-disabled" : states.selected ? "text-selected" : states.otherMonth ? "text-disabled" : undefined,
          backgroundColor : states.disabled ? undefined : states.selected ? "background-selected" : undefined,
          padding         : states.today ? [ 1, 3 ] : [2, 4]
        };
      }
    },

    "datechooser/week" :
    {
      style : function(states)
      {
        return {
          textAlign : "center",
          textColor : "background-selected-dark",
          padding   : [ 2, 4 ],
          decorator : states.header ? "datechooser-week-header" : "datechooser-week"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */
    "progressbar":
    {
      style: function(states) {
        return {
          decorator: "progressbar",
          padding: 1,
          backgroundColor: "white",
          width : 200,
          height : 20
        }
      }
    },

    "progressbar/progress":
    {
      style: function(states) {
        return {
          backgroundColor: states.disabled ?
            "background-disabled-checked" :
            "background-selected"
        }
      }
    },



    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "light-background",
          padding : 0
        };
      }
    },

    "toolbar/part" : {
      style : function(states)
      {
        return {
          margin : [0 , 15]
        };
      }
    },

    "toolbar/part/container" : {},
    "toolbar/part/handle" : {},

    "toolbar-separator" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-separator",
          margin: [7, 0],
          width: 4
        };
      }
    },

    "toolbar-button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator = "button-box";

        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }

        // set the right left and right decoratos
        if (states.left) {
          decorator += "-left";
        } else if (states.right) {
          decorator += "-right";
        } else if (states.middle) {
          decorator += "-middle";
        }

        // set the margin
        var margin = [7, 10];
        if (states.left || states.middle || states.right) {
          margin = [7, 0];
        }

        return {
          cursor  : states.disabled ? undefined : "pointer",
          decorator : decorator,
          margin : margin,
          padding: [3, 5]
        };
      }
    },

    "toolbar-menubutton" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          showArrow : true
        };
      }
    },

    "toolbar-menubutton/arrow" :
    {
      alias : "image",
      include : "image",

      style : function(states)
      {
        return {
          source : qx.theme.simple.Image.URLS["arrow-down"],
          cursor : states.disabled ? undefined : "pointer",
          padding : [0, 5],
          marginLeft: 2
        };
      }
    },

    "toolbar-splitbutton" : {},
    "toolbar-splitbutton/button" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        var decorator = "button-box";

        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }

        // set the right left and right decoratos
        if (states.left) {
          decorator += "-left";
        } else if (states.right) {
          decorator += "-middle";
        } else if (states.middle) {
          decorator += "-middle";
        }

        return {
          icon : qx.theme.simple.Image.URLS["arrow-down"],
          decorator : decorator
        };
      }
    },


    "toolbar-splitbutton/arrow" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        var decorator = "button-box";

        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }

        // set the right left and right decoratos
        if (states.left) {
          decorator += "-middle";
        } else if (states.right) {
          decorator += "-right";
        } else if (states.middle) {
          decorator += "-middle";
        }

        return {
          icon : qx.theme.simple.Image.URLS["arrow-down"],
          decorator : decorator
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tabview" : {},

    "tabview/bar" :
    {
      alias : "slidebar",

      style : function(states)
      {
        var marginTop=0, marginRight=0, marginBottom=0, marginLeft=0;

        if (states.barTop) {
          marginBottom -= 1;
        } else if (states.barBottom) {
          marginTop -= 1;
        } else if (states.barRight) {
          marginLeft -= 1;
        } else {
          marginRight -= 1;
        }

        return {
          marginBottom : marginBottom,
          marginTop : marginTop,
          marginLeft : marginLeft,
          marginRight : marginRight
        };
      }
    },


    "tabview/bar/button-forward" :
    {
      include : "slidebar/button-forward",
      alias : "slidebar/button-forward",

      style : function(states)
      {
        if (states.barTop) {
          return {
            marginTop : 4,
            marginBottom: 2,
            decorator : null
          }
        } else if (states.barBottom) {
          return {
            marginTop : 2,
            marginBottom: 4,
            decorator : null
          }
        } else if (states.barLeft) {
          return {
            marginLeft : 4,
            marginRight : 2,
            decorator : null
          }
        } else {
          return {
            marginLeft : 2,
            marginRight : 4,
            decorator : null
          }
        }
      }
    },

    "tabview/bar/button-backward" :
    {
      include : "slidebar/button-backward",
      alias : "slidebar/button-backward",

      style : function(states)
      {
        if (states.barTop) {
          return {
            marginTop : 4,
            marginBottom: 2,
            decorator : null
          }
        } else if (states.barBottom) {
          return {
            marginTop : 2,
            marginBottom: 4,
            decorator : null
          }
        } else if (states.barLeft) {
          return {
            marginLeft : 4,
            marginRight : 2,
            decorator : null
          }
        } else {
          return {
            marginLeft : 2,
            marginRight : 4,
            decorator : null
          }
        }
      }
    },

    "tabview/pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          decorator : "main",
          padding : 10
        };
      }
    },

    "tabview-page" : "widget",

    "tabview-page/button" :
    {
      style : function(states)
      {
        var decorator;

        // default padding
        if (states.barTop || states.barBottom) {
          var padding = [8, 16, 8, 13];
        } else {
          var padding = [8, 4, 8, 4];
        }

        // decorator
        if (states.checked) {
          if (states.barTop) {
            decorator = "tabview-page-button-top";
          } else if (states.barBottom) {
            decorator = "tabview-page-button-bottom"
          } else if (states.barRight) {
            decorator = "tabview-page-button-right";
          } else if (states.barLeft) {
            decorator = "tabview-page-button-left";
          }
        } else {
          for (var i=0; i < padding.length; i++) {
            padding[i] += 1;
          };
          // reduce the size by 1 because we have different decorator border width
          if (states.barTop) {
            padding[2] -= 1;
          } else if (states.barBottom) {
            padding[0] -= 1;
          } else if (states.barRight) {
            padding[3] -= 1;
          } else if (states.barLeft) {
            padding[1] -= 1;
          }
        }

        return {
          zIndex : states.checked ? 10 : 5,
          decorator : decorator,
          textColor : states.disabled ? "text-disabled" : states.checked ? null : "link",
          padding : padding,
          cursor: "pointer"
        };
      }
    },

    "tabview-page/button/label" :
    {
      alias : "label",

      style : function(states)
      {
        return {
          padding : [0, 1, 0, 1]
        };
      }
    },

    "tabview-page/button/icon" : "image",
    "tabview-page/button/close-button" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          cursor : states.disabled ? undefined : "pointer",
          icon : qx.theme.simple.Image.URLS["tabview-close"]
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      COLOR POPUP
    ---------------------------------------------------------------------------
    */


    "colorpopup" :
    {
      alias : "popup",
      include : "popup",

      style : function(states)
      {
        return {
          padding : 5
        }
      }
    },

    "colorpopup/field":
    {
      style : function(states)
      {
        return {
          margin : 2,
          width : 14,
          height : 14,
          backgroundColor : "background",
          decorator : "main-dark"
        }
      }
    },

    "colorpopup/selector-button" : "button",
    "colorpopup/auto-button" : "button",

    "colorpopup/preview-pane" : "groupbox",

    "colorpopup/current-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginLeft : 4,
          decorator : "main-dark",
          allowGrowX : true
        }
      }
    },

    "colorpopup/selected-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginRight : 4,
          decorator : "main-dark",
          allowGrowX : true
        }
      }
    },

    "colorpopup/colorselector-okbutton":
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-ok.png"
        };
      }
    },

    "colorpopup/colorselector-cancelbutton":
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-cancel.png"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      COLOR SELECTOR
    ---------------------------------------------------------------------------
    */

    "colorselector" : "widget",
    "colorselector/control-bar" : "widget",
    "colorselector/visual-pane" : "groupbox",
    "colorselector/control-pane": "widget",
    "colorselector/preset-grid" : "widget",

    "colorselector/colorbucket":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          width : 16,
          height : 16
        }
      }
    },

    "colorselector/preset-field-set" : "groupbox",
    "colorselector/input-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 12
        }
      }
    },

    "colorselector/preview-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 12
        }
      }
    },

    "colorselector/hex-field-composite" : "widget",
    "colorselector/hex-field" : "textfield",

    "colorselector/rgb-spinner-composite" : "widget",
    "colorselector/rgb-spinner-red" : "spinner",
    "colorselector/rgb-spinner-green" : "spinner",
    "colorselector/rgb-spinner-blue" : "spinner",

    "colorselector/hsb-spinner-composite" : "widget",
    "colorselector/hsb-spinner-hue" : "spinner",
    "colorselector/hsb-spinner-saturation" : "spinner",
    "colorselector/hsb-spinner-brightness" : "spinner",

    "colorselector/preview-content-old":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          width : 50,
          height : 25
        }
      }
    },

    "colorselector/preview-content-new":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          backgroundColor : "white",
          width : 50,
          height : 25
        }
      }
    },

    "colorselector/hue-saturation-field":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          margin : 5
        }
      }
    },

    "colorselector/brightness-field":
    {
      style : function(states)
      {
        return {
          decorator : "main-dark",
          margin : [5, 7]
        }
      }
    },

    "colorselector/hue-saturation-pane": "widget",
    "colorselector/hue-saturation-handle" : "widget",
    "colorselector/brightness-pane": "widget",
    "colorselector/brightness-handle" : "widget",



    /*
    ---------------------------------------------------------------------------
      APPLICATION
    ---------------------------------------------------------------------------
    */

    "app-header" :
    {
      style : function(states)
      {
        return {
          font : "headline",
          textColor : "text-selected",
          backgroundColor: "background-selected-dark",
          padding : [8, 12]
        };
      }
    },

    "app-header-label" :
    {
      style : function(states)
      {
        return {
          paddingTop : 5
        }
      }
    },


    "app-splitpane" : {
      alias : "splitpane",
      style : function(states) {
        return {
          padding: [0, 10, 10, 10],
          backgroundColor: "light-background"
        }
      }
    }
  }
});
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
/* ************************************************************************

#asset(qx/decoration/Simple/*)

************************************************************************* */
/**
 * Mapping class for all images used in the simple theme.
 */
qx.Class.define("qx.theme.simple.Image",
{
  extend : qx.core.Object,

  statics :
  {
    /**
     * Holds a map containig all the URL to the images.
     * @internal
     */
    URLS :
    {
      "blank" : "qx/static/blank.gif",

      // checkbox
      "checkbox-checked" : "decoration/checkbox/checked.png",
      "checkbox-undetermined" : "decoration/checkbox/undetermined.png",

      // window
      "window-minimize" : "decoration/window/minimize.gif",
      "window-maximize" : "decoration/window/maximize.gif",
      "window-restore" : "decoration/window/restore.gif",
      "window-close" : "decoration/window/close.gif",

      // cursor
      "cursor-copy" : "decoration/cursors/copy.gif",
      "cursor-move" : "decoration/cursors/move.gif",
      "cursor-alias" : "decoration/cursors/alias.gif",
      "cursor-nodrop" : "decoration/cursors/nodrop.gif",

      // arrows
      "arrow-right" : "decoration/arrows/right.gif",
      "arrow-left" : "decoration/arrows/left.gif",
      "arrow-up" : "decoration/arrows/up.gif",
      "arrow-down" : "decoration/arrows/down.gif",
      "arrow-forward" : "decoration/arrows/forward.gif",
      "arrow-rewind" : "decoration/arrows/rewind.gif",
      "arrow-down-small" : "decoration/arrows/down-small.gif",
      "arrow-up-small" : "decoration/arrows/up-small.gif",
      "arrow-up-invert" : "decoration/arrows/up-invert.gif",
      "arrow-down-invert" : "decoration/arrows/down-invert.gif",
      "arrow-right-invert" : "decoration/arrows/right-invert.gif",

      // split pane
      "knob-horizontal" : "decoration/splitpane/knob-horizontal.png",
      "knob-vertical" : "decoration/splitpane/knob-vertical.png",

      // tree
      "tree-minus" : "decoration/tree/minus.gif",
      "tree-plus" : "decoration/tree/plus.gif",

      // table
      "select-column-order" : "decoration/table/select-column-order.png",
      "table-ascending" : "decoration/table/ascending.png",
      "table-descending" : "decoration/table/descending.png",

      // tree virtual
      "treevirtual-line" : "decoration/treevirtual/line.gif",
      "treevirtual-minus-only" : "decoration/treevirtual/only_minus.gif",
      "treevirtual-plus-only" : "decoration/treevirtual/only_plus.gif",
      "treevirtual-minus-start" : "decoration/treevirtual/start_minus.gif",
      "treevirtual-plus-start" : "decoration/treevirtual/start_plus.gif",
      "treevirtual-minus-end" : "decoration/treevirtual/end_minus.gif",
      "treevirtual-plus-end" : "decoration/treevirtual/end_plus.gif",
      "treevirtual-minus-cross" : "decoration/treevirtual/cross_minus.gif",
      "treevirtual-plus-cross" : "decoration/treevirtual/cross_plus.gif",
      "treevirtual-end" : "decoration/treevirtual/end.gif",
      "treevirtual-cross" : "decoration/treevirtual/cross.gif",

      // menu
      "menu-checkbox" : "decoration/menu/checkbox.gif",
      "menu-checkbox-invert" : "decoration/menu/checkbox-invert.gif",
      "menu-radiobutton-invert" : "decoration/menu/radiobutton-invert.gif",
      "menu-radiobutton" : "decoration/menu/radiobutton.gif",

      // tabview
      "tabview-close" : "decoration/tabview/close.gif"
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
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************

#asset(qx/icon/Tango/16/apps/office-calendar.png)
#asset(qx/icon/Tango/16/places/folder-open.png)
#asset(qx/icon/Tango/16/places/folder.png)
#asset(qx/icon/Tango/16/mimetypes/text-plain.png)
#asset(qx/icon/Tango/16/actions/view-refresh.png)
#asset(qx/icon/Tango/16/actions/window-close.png)
#asset(qx/icon/Tango/16/actions/dialog-cancel.png)
#asset(qx/icon/Tango/16/actions/dialog-ok.png)

************************************************************************* */

/**
 * The simple qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.indigo.Appearance",
{
  extend : qx.theme.simple.Appearance,

  appearances :
  {
    "colorselector/input-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 0
        }
      }
    },

    "colorselector/preview-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 0
        }
      }
    },


    "toolbar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "light-background",
          padding : [4, 0]
        };
      }
    },


    "splitpane/splitter/knob" :
    {
      style : function(states)
      {
        return {
          source : qx.theme.simple.Image.URLS[
            "knob-" + (states.horizontal ? "horizontal" : "vertical")
          ],
          padding : 3
        };
      }
    },


    "window" :
    {
      style : function(states)
      {
        return {
          contentPadding : [ 10, 10, 10, 10 ],
          backgroundColor: states.maximized ? "background" : undefined,
          decorator : states.maximized ? undefined : states.active ? "window-active" : "window"
        };
      }
    },


    "window/captionbar" :
    {
      style : function(states)
      {
        var active = states.active && !states.disabled;
        return {
          padding : [3, 8, active ? 1 : 3, 8],
          textColor: active ? "highlight" : "font",
          decorator: active ? "window-caption-active" : "window-caption"
        };
      }
    },


    "window/title" :
    {
      style : function(states)
      {
        return {
          cursor : "default",
          font : "default",
          marginRight : 20,
          alignY: "middle"
        };
      }
    },


    "virtual-tree" :
    {
      include : "tree",
      alias : "tree",

      style : function(states)
      {
        return {
          itemHeight : 27
        };
      }
    },


    "app-header" :
    {
      style : function(states)
      {
        return {
          font : "headline",
          textColor : "text-selected",
          decorator: "app-header",
          padding : 10
        };
      }
    },

    "app-header-label" :
    {
      style : function(states)
      {
        return {
          paddingTop : 5
        }
      }
    },

    "app-splitpane" : {
      alias : "splitpane",
      style : function(states) {
        return {
          padding: [0, 10, 10, 10],
          backgroundColor: "light-background"
        }
      }
    }
  }
});/* ************************************************************************

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
 * Tango icons
 */
qx.Theme.define("qx.theme.icon.Tango",
{
  title : "Tango",
  aliases : {
    "icon" : "qx/icon/Tango"
  }
});
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
 * Mixin for the border radius CSS property.
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 *
 * Keep in mind that this is not supported by all browsers:
 *
 * * Firefox 3,5+
 * * IE9+
 * * Safari 3.0+
 * * Opera 10.5+
 * * Chrome 4.0+
 */
qx.Mixin.define("qx.ui.decoration.MBorderRadius",
{
  properties : {
    /** top left corner radius */
    radiusTopLeft :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBorderRadius"
    },

    /** top right corner radius */
    radiusTopRight :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBorderRadius"
    },

    /** bottom left corner radius */
    radiusBottomLeft :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBorderRadius"
    },

    /** bottom right corner radius */
    radiusBottomRight :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBorderRadius"
    },

    /** Property group to set the corner radius of all sides */
    radius :
    {
      group : [ "radiusTopLeft", "radiusTopRight", "radiusBottomRight", "radiusBottomLeft" ],
      mode : "shorthand"
    }
  },


  members :
  {
    /**
     * Takes a styles map and adds the border radius styles in place to the
     * given map. This is the needed behavior for
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleBorderRadius : function(styles)
    {
      // Fixing the background bleed in Webkits
      // http://tumble.sneak.co.nz/post/928998513/fixing-the-background-bleed
      styles["-webkit-background-clip"] = "padding-box";

      // radius handling
      var radius = this.getRadiusTopLeft();
      if (radius > 0) {
        styles["-moz-border-radius-topleft"] = radius + "px";
        styles["-webkit-border-top-left-radius"] = radius + "px";
        styles["border-top-left-radius"] = radius + "px";
      }

      radius = this.getRadiusTopRight();
      if (radius > 0) {
        styles["-moz-border-radius-topright"] = radius + "px";
        styles["-webkit-border-top-right-radius"] = radius + "px";
        styles["border-top-right-radius"] = radius + "px";
      }

      radius = this.getRadiusBottomLeft();
      if (radius > 0) {
        styles["-moz-border-radius-bottomleft"] = radius + "px";
        styles["-webkit-border-bottom-left-radius"] = radius + "px";
        styles["border-bottom-left-radius"] = radius + "px";
      }

      radius = this.getRadiusBottomRight();
      if (radius > 0) {
        styles["-moz-border-radius-bottomright"] = radius + "px";
        styles["-webkit-border-bottom-right-radius"] = radius + "px";
        styles["border-bottom-right-radius"] = radius + "px";
      }
    },

    // property apply
    _applyBorderRadius : function()
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
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Mixin for the box shadow CSS property.
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 *
 * Keep in mind that this is not supported by all browsers:
 *
 * * Firefox 3,5+
 * * IE9+
 * * Safari 3.0+
 * * Opera 10.5+
 * * Chrome 4.0+
 */
qx.Mixin.define("qx.ui.decoration.MBoxShadow",
{
  properties : {
    /** Horizontal length of the shadow. */
    shadowHorizontalLength :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBoxShadow"
    },

    /** Vertical length of the shadow. */
    shadowVerticalLength :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBoxShadow"
    },

    /** The blur radius of the shadow. */
    shadowBlurRadius :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBoxShadow"
    },

    /** The spread radius of the shadow. */
    shadowSpreadRadius :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBoxShadow"
    },

    /** The color of the shadow. */
    shadowColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyBoxShadow"
    },

    /** Inset shadows are drawn inside the border. */
    inset :
    {
      init : false,
      check : "Boolean",
      apply : "_applyBoxShadow"
    },

    /** Property group to set the shadow length. */
    shadowLength :
    {
      group : ["shadowHorizontalLength", "shadowVerticalLength"],
      mode : "shorthand"
    }
  },


  members :
  {
    /**
     * Takes a styles map and adds the box shadow styles in place to the
     * given map. This is the needed behavior for
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleBoxShadow : function(styles) {
      if (qx.core.Environment.get("qx.theme"))
      {
        var Color = qx.theme.manager.Color.getInstance();
        var color = Color.resolve(this.getShadowColor());
      }
      else
      {
        var color = this.getShadowColor();
      }

      if (color != null)
      {
        var vLength = this.getShadowVerticalLength() || 0;
        var hLength = this.getShadowHorizontalLength() || 0;
        var blur = this.getShadowBlurRadius() || 0;
        var spread = this.getShadowSpreadRadius() || 0;
        var inset = this.getInset() ? "inset " : "";
        var value = inset + hLength + "px " + vLength + "px " + blur + "px " + spread + "px " + color;

        styles["-moz-box-shadow"] = value;
        styles["-webkit-box-shadow"] = value;
        styles["box-shadow"] = value;
      }
    },


    // property apply
    _applyBoxShadow : function()
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
 * A simple decorator featuring background images and colors and a simple
 * uniform border based on CSS styles.
 */
qx.Class.define("qx.ui.decoration.Uniform",
{
  extend : qx.ui.decoration.Single,


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
  }
});
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
 * Mixin for the linear background gradient CSS property.
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 *
 * Keep in mind that this is not supported by all browsers:
 *
 * * Safari 4.0+
 * * Chrome 4.0+
 * * Firefox 3.6+
 * * Opera 11.1+
 * * IE 10+
 * * IE 5.5+ (with limitations)
 *
 * For IE 5.5 to IE 9,this class uses the filter rules to create the gradient. This
 * has some limitations: The start and end position property can not be used. For
 * more details, see the original documentation:
 * http://msdn.microsoft.com/en-us/library/ms532997(v=vs.85).aspx
 */
qx.Mixin.define("qx.ui.decoration.MLinearBackgroundGradient",
{
  properties :
  {
    /** Start start color of the background */
    startColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },

    /** End end color of the background */
    endColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },

    /** The orientation of the gradient. */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "vertical",
      apply : "_applyLinearBackgroundGradient"
    },

    /** Position in percent where to start the color. */
    startColorPosition :
    {
      check : "Number",
      init : 0,
      apply : "_applyLinearBackgroundGradient"
    },

    /** Position in percent where to start the color. */
    endColorPosition :
    {
      check : "Number",
      init : 100,
      apply : "_applyLinearBackgroundGradient"
    },

    /** Defines if the given positions are in % or px.*/
    colorPositionUnit :
    {
      check : ["px", "%"],
      init : "%",
      apply : "_applyLinearBackgroundGradient"
    },


    /** Property group to set the start color including its start position. */
    gradientStart :
    {
      group : ["startColor", "startColorPosition"],
      mode : "shorthand"
    },

    /** Property group to set the end color including its end position. */
    gradientEnd :
    {
      group : ["endColor", "endColorPosition"],
      mode : "shorthand"
    }
  },


  members :
  {
    /**
     * Takes a styles map and adds the linear background styles in place to the
     * given map. This is the needed behavior for
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleLinearBackgroundGradient : function(styles) {
      var colors = this.__getColors();
      var startColor = colors.start;
      var endColor = colors.end;

      var unit = this.getColorPositionUnit();

      // new implementation for webkit is available since chrome 10 --> version
      if (qx.core.Environment.get("css.gradient.legacywebkit")) {
        // webkit uses px values if non are given
        unit = unit === "px" ? "" : unit;

        if (this.getOrientation() == "horizontal") {
          var startPos = this.getStartColorPosition() + unit +" 0" + unit;
          var endPos = this.getEndColorPosition() + unit + " 0" + unit;
        } else {
          var startPos = "0" + unit + " " + this.getStartColorPosition() + unit;
          var endPos = "0" + unit +" " + this.getEndColorPosition() + unit;
        }

        var color =
          "from(" + startColor +
          "),to(" + endColor + ")";

        var value = "-webkit-gradient(linear," + startPos + "," + endPos + "," + color + ")";
        styles["background"] = value;

      } else if (qx.core.Environment.get("css.gradient.filter") &&
        !qx.core.Environment.get("css.gradient.linear")) {

        // make sure the overflow is hidden for border radius usage [BUG #6318]
        styles["overflow"] = "hidden";
      // spec like syntax
      } else {
        // WebKit, Opera and Gecko interpret 0deg as "to right"
        var deg = this.getOrientation() == "horizontal" ? 0 : 270;

        var start = startColor + " " + this.getStartColorPosition() + unit;
        var end = endColor + " " + this.getEndColorPosition() + unit;

        var prefixedName = qx.core.Environment.get("css.gradient.linear");
        // Browsers supporting the unprefixed implementation interpret 0deg as
        // "to top" as defined by the spec [BUG #6513]
        if (prefixedName === "linear-gradient") {
          deg = this.getOrientation() == "horizontal" ? deg + 90 : deg - 90;
        }

        styles["background-image"] =
          prefixedName + "(" + deg + "deg, " + start + "," + end + ")";
      }
    },


    /**
     * Helper to get start and end color.
     * @return {Map} A map containing start and end color.
     */
    __getColors : function() {
      if (qx.core.Environment.get("qx.theme"))
      {
        var Color = qx.theme.manager.Color.getInstance();
        var startColor = Color.resolve(this.getStartColor());
        var endColor = Color.resolve(this.getEndColor());
      }
      else
      {
        var startColor = this.getStartColor();
        var endColor = this.getEndColor();
      }
      return {start: startColor, end: endColor};
    },


    /**
     * Helper for IE which applies the filter used for the gradient to a separate
     * DIV element which will be put into the decorator. This is necessary in case
     * the decorator has rounded corners.
     * @return {String} The HTML for the inner gradient DIV.
     */
    _getContent : function() {
      // IE filter syntax
      // http://msdn.microsoft.com/en-us/library/ms532997(v=vs.85).aspx
      // It needs to be wrapped in a separate div bug #6318
      if (qx.core.Environment.get("css.gradient.filter") &&
        !qx.core.Environment.get("css.gradient.linear")) {

        var colors = this.__getColors();
        var type = this.getOrientation() == "horizontal" ? 1 : 0;

        // convert all hex3 to hex6
        var startColor = qx.util.ColorUtil.hex3StringToHex6String(colors.start);
        var endColor = qx.util.ColorUtil.hex3StringToHex6String(colors.end);

        // get rid of the starting '#'
        startColor = startColor.substring(1, startColor.length);
        endColor = endColor.substring(1, endColor.length);

        // filter gradients block the box shadow implementation ->
        // we need to set them explicitly [BUG #6761]
        var shadow = "";
        if (this.classname.indexOf("MBoxShadow") != -1) {
          var styles = {};
          this._styleBoxShadow(styles);
          shadow = "<div style='width: 100%; height: 100%; position: absolute;" +
            qx.bom.element.Style.compile(styles) +
            "'></div>";
        }

        return "<div style=\"position: absolute; width: 100%; height: 100%; " +
          "filter:progid:DXImageTransform.Microsoft.Gradient" +
          "(GradientType=" + type + ", " +
          "StartColorStr='#FF" + startColor + "', " +
          "EndColorStr='#FF" + endColor + "';)\">" + shadow + "</div>";
      }
      return "";
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
    _resizeLinearBackgroundGradient : function(element, width, height) {
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
    _applyLinearBackgroundGradient : function()
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
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Border implementation with two CSS borders. Both borders can be styled
 * independent of each other.
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 */
qx.Mixin.define("qx.ui.decoration.MDoubleBorder",
{
  include : [qx.ui.decoration.MSingleBorder, qx.ui.decoration.MBackgroundImage],

  construct : function() {
    // override the methods of single border and background image
    this._getDefaultInsetsForBorder = this.__getDefaultInsetsForDoubleBorder;
    this._resizeBorder = this.__resizeDoubleBorder;
    this._styleBorder = this.__styleDoubleBorder;
    this._generateMarkup = this.__generateMarkupDoubleBorder;
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER WIDTH
    ---------------------------------------------------------------------------
    */

    /** top width of border */
    innerWidthTop :
    {
      check : "Number",
      init : 0
    },

    /** right width of border */
    innerWidthRight :
    {
      check : "Number",
      init : 0
    },

    /** bottom width of border */
    innerWidthBottom :
    {
      check : "Number",
      init : 0
    },

    /** left width of border */
    innerWidthLeft :
    {
      check : "Number",
      init : 0
    },

    /** Property group to set the inner border width of all sides */
    innerWidth :
    {
      group : [ "innerWidthTop", "innerWidthRight", "innerWidthBottom", "innerWidthLeft" ],
      mode : "shorthand"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER COLOR
    ---------------------------------------------------------------------------
    */

    /** top inner color of border */
    innerColorTop :
    {
      nullable : true,
      check : "Color"
    },

    /** right inner color of border */
    innerColorRight :
    {
      nullable : true,
      check : "Color"
    },

    /** bottom inner color of border */
    innerColorBottom :
    {
      nullable : true,
      check : "Color"
    },

    /** left inner color of border */
    innerColorLeft :
    {
      nullable : true,
      check : "Color"
    },

    /**
     * Property group for the inner color properties.
     */
    innerColor :
    {
      group : [ "innerColorTop", "innerColorRight", "innerColorBottom", "innerColorLeft" ],
      mode : "shorthand"
    }
  },


  members :
  {
    __ownMarkup : null,

    /**
     * Takes a styles map and adds the inner border styles styles in place
     * to the given map. This is the needed behavior for
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    __styleDoubleBorder : function(styles)
    {
      if (qx.core.Environment.get("qx.theme"))
      {
        var Color = qx.theme.manager.Color.getInstance();

        var innerColorTop = Color.resolve(this.getInnerColorTop());
        var innerColorRight = Color.resolve(this.getInnerColorRight());
        var innerColorBottom = Color.resolve(this.getInnerColorBottom());
        var innerColorLeft = Color.resolve(this.getInnerColorLeft());
      }
      else
      {
        var innerColorTop = this.getInnerColorTop();
        var innerColorRight = this.getInnerColorRight();
        var innerColorBottom = this.getInnerColorBottom();
        var innerColorLeft = this.getInnerColorLeft();
      }

      // Inner styles
      // Inner image must be relative to be compatible with qooxdoo 0.8.x
      // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=3450 for details
      styles.position = "relative";

      // Add inner borders
      var width = this.getInnerWidthTop();
      if (width > 0) {
        styles["border-top"] = width + "px " + this.getStyleTop() + " " + innerColorTop;
      }

      var width = this.getInnerWidthRight();
      if (width > 0) {
        styles["border-right"] = width + "px " + this.getStyleRight() + " " + innerColorRight;
      }

      var width = this.getInnerWidthBottom();
      if (width > 0) {
        styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + innerColorBottom;
      }

      var width = this.getInnerWidthLeft();
      if (width > 0) {
        styles["border-left"] = width + "px " + this.getStyleLeft() + " " + innerColorLeft;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        if (!styles["border-top"] && !styles["border-right"] &&
          !styles["border-bottom"] && !styles["border-left"]) {
          throw new Error("Invalid Double decorator (zero inner border width). Use qx.ui.decoration.Single instead!");
        }
      }
    },


    /**
     * Special generator for the markup which creates the containing div and
     * the sourrounding div as well.
     *
     * @param styles {Map} The styles for the inner
     * @return {String} The generated decorator HTML.
     */
    __generateMarkupDoubleBorder : function(styles) {
      var innerHtml = this._generateBackgroundMarkup(
        styles, this._getContent ? this._getContent() : ""
      );

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

      // get rid of the old borders
      styles["border-top"] = '';
      styles["border-right"] = '';
      styles["border-bottom"] = '';
      styles["border-left"] = '';

      // Generate outer HTML
      styles["line-height"] = 0;

      // Do not set the line-height on IE6, IE7, IE8 in Quirks Mode and IE8 in IE7 Standard Mode
      // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=3450 for details
      if (
        (qx.core.Environment.get("engine.name") == "mshtml" &&
         parseFloat(qx.core.Environment.get("engine.version")) < 8) ||
        (qx.core.Environment.get("engine.name") == "mshtml" &&
         qx.core.Environment.get("browser.documentmode") < 8)
      ) {
        styles["line-height"] = '';
      }

      var width = this.getWidthTop();
      if (width > 0) {
        styles["border-top"] = width + "px " + this.getStyleTop() + " " + colorTop;
      }

      var width = this.getWidthRight();
      if (width > 0) {
        styles["border-right"] = width + "px " + this.getStyleRight() + " " + colorRight;
      }

      var width = this.getWidthBottom();
      if (width > 0) {
        styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + colorBottom;
      }

      var width = this.getWidthLeft();
      if (width > 0) {
        styles["border-left"] = width + "px " + this.getStyleLeft() + " " + colorLeft;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        if (styles["border-top"] == '' && styles["border-right"] == '' &&
          styles["border-bottom"] == '' && styles["border-left"] == '') {
          throw new Error("Invalid Double decorator (zero outer border width). Use qx.ui.decoration.Single instead!");
        }
      }

      // final default styles
      styles["position"] = "absolute";
      styles["top"] = 0;
      styles["left"] = 0;

      // Store
      return this.__ownMarkup = this._generateBackgroundMarkup(styles, innerHtml);
    },




    /**
     * Resize function for the decorator. This is suitable for the
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param element {Element} The element which could be resized.
     * @param width {Number} The new width.
     * @param height {Number} The new height.
     * @return {Map} A map containing the desired position and dimension and a
     *   emelent to resize.
     *   (width, height, top, left, elementToApplyDimensions).
     */
    __resizeDoubleBorder : function(element, width, height)
    {
      var insets = this.getInsets();
      width -= insets.left + insets.right;
      height -= insets.top + insets.bottom;

      var left =
        insets.left -
        this.getWidthLeft() -
        this.getInnerWidthLeft();
      var top =
        insets.top -
        this.getWidthTop() -
        this.getInnerWidthTop();

      return {
        left: left,
        top: top,
        width: width,
        height: height,
        elementToApplyDimensions : element.firstChild
      };
    },


   /**
    * Implementation of the interface for the double border.
    *
    * @return {Map} A map containing the default insets.
    *   (top, right, bottom, left)
    */
    __getDefaultInsetsForDoubleBorder : function()
    {
      return {
        top : this.getWidthTop() + this.getInnerWidthTop(),
        right : this.getWidthRight() + this.getInnerWidthRight(),
        bottom : this.getWidthBottom() + this.getInnerWidthBottom(),
        left : this.getWidthLeft() + this.getInnerWidthLeft()
      };
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
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/**
 * The simple qooxdoo decoration theme.
 */
qx.Theme.define("qx.theme.simple.Decoration",
{
  aliases : {
    decoration : "qx/decoration/Simple"
  },

  decorations :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "border-blue" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 4,
        color : "background-selected"
      }
    },


    "main" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "border-main"
      }
    },

    "main-dark" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "button-border"
      }
    },


    "popup" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width: 1,
        color: "window-border",
        shadowLength : 2,
        shadowBlurRadius : 5,
        shadowColor : "shadow"
      }
    },


    "dragover" :
    {
      decorator : qx.ui.decoration.Single,

      style : {
        bottom: [2, "solid", "dark-blue"]
      }
    },



    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */
    "button-box" :
    {
      decorator : [
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        radius : 3,
        width : 1,
        color : "button-border",
        gradientStart : ["button-box-bright", 40],
        gradientEnd : ["button-box-dark", 70],
        backgroundColor : "button-box-bright"
      }
    },

    "button-box-pressed" :
    {
      include : "button-box",

      style :
      {
        gradientStart : ["button-box-bright-pressed", 40],
        gradientEnd : ["button-box-dark-pressed", 70],
        backgroundColor : "button-box-bright-pressed"
      }
    },

    "button-box-pressed-hovered" :
    {
      include : "button-box-pressed",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "button-box-hovered" :
    {
      include : "button-box",

      style :
      {
        color : "button-border-hovered"
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON INVALID
    ---------------------------------------------------------------------------
    */
    "button-box-invalid" :
    {
      include : "button-box",

      style :
      {
        color : "invalid"
      }
    },

    "button-box-pressed-invalid" :
    {
      include : "button-box-pressed",

      style :
      {
        color : "invalid"
      }
    },

    "button-box-hovered-invalid" : {include: "button-box-invalid"},

    "button-box-pressed-hovered-invalid" : {include: "button-box-pressed-invalid"},


    /*
    ---------------------------------------------------------------------------
      BUTTON FOCUSED
    ---------------------------------------------------------------------------
    */
    "button-box-focused" :
    {
      include : "button-box",

      style :
      {
        color : "background-selected"
      }
    },

    "button-box-pressed-focused" :
    {
      include : "button-box-pressed",

      style :
      {
        color : "background-selected"
      }
    },

    "button-box-hovered-focused" : {include: "button-box-focused"},

    "button-box-pressed-hovered-focused" : {include: "button-box-pressed-focused"},


    /*
    ---------------------------------------------------------------------------
      BUTTON RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-right" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-right" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-hovered-right" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-hovered-right" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-focused-right" :
    {
      include : "button-box-focused",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-hovered-focused-right" :
    {
      include : "button-box-hovered-focused",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-focused-right" :
    {
      include : "button-box-pressed-focused",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-hovered-focused-right" :
    {
      include : "button-box-pressed-hovered-focused",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON BORDERLESS RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-right-borderless" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-pressed-right-borderless" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-pressed-hovered-right-borderless" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-hovered-right-borderless" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON TOP RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-top-right" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 3, 0, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-pressed-top-right" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 3, 0, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-pressed-hovered-top-right" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 3, 0, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-hovered-top-right" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 3, 0, 0],
        width: [1, 1, 1, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON BOTOM RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-bottom-right" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 0, 3, 0],
        width : [0, 1, 1, 0]
      }
    },

    "button-box-pressed-bottom-right" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 0, 3, 0],
        width : [0, 1, 1, 0]
      }
    },

    "button-box-pressed-hovered-bottom-right" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 0, 3, 0],
        width : [0, 1, 1, 0]
      }
    },

    "button-box-hovered-bottom-right" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 0, 3, 0],
        width : [0, 1, 1, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON BOTOM LEFT
    ---------------------------------------------------------------------------
    */
    "button-box-bottom-left" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },

    "button-box-pressed-bottom-left" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },

    "button-box-pressed-hovered-bottom-left" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },

    "button-box-hovered-bottom-left" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON TOP LEFT
    ---------------------------------------------------------------------------
    */
    "button-box-top-left" :
    {
      include : "button-box",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },

    "button-box-pressed-top-left" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },

    "button-box-pressed-hovered-top-left" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },

    "button-box-hovered-top-left" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON MIDDLE
    ---------------------------------------------------------------------------
    */
    "button-box-middle" :
    {
      include : "button-box",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-middle" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-hovered-middle" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 1]
      }
    },

    "button-box-hovered-middle" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON LEFT
    ---------------------------------------------------------------------------
    */
    "button-box-left" :
    {
      include : "button-box",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-left" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-hovered-left" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-hovered-left" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-focused-left" :
    {
      include : "button-box-focused",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-hovered-focused-left" :
    {
      include : "button-box-hovered-focused",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-hovered-focused-left" :
    {
      include : "button-box-pressed-hovered-focused",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-focused-left" :
    {
      include : "button-box-pressed-focused",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      SEPARATOR
    ---------------------------------------------------------------------------
    */

    "separator-horizontal" :
    {
      decorator: qx.ui.decoration.Single,

      style :
      {
        widthLeft : 1,
        colorLeft : "border-separator"
      }
    },

    "separator-vertical" :
    {
      decorator: qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "border-separator"
      }
    },


    /*
    ---------------------------------------------------------------------------
      SCROLL KNOB
    ---------------------------------------------------------------------------
    */
    "scroll-knob" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        radius : 3,
        width : 1,
        color : "button-border",
        backgroundColor : "scrollbar-bright"
      }
    },

    "scroll-knob-pressed" :
    {
      include : "scroll-knob",

      style :
      {
        backgroundColor : "scrollbar-dark"
      }
    },

    "scroll-knob-hovered" :
    {
      include: "scroll-knob",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "scroll-knob-pressed-hovered" :
    {
      include: "scroll-knob-pressed",

      style :
      {
        color : "button-border-hovered"
      }
    },

    /*
    ---------------------------------------------------------------------------
      HOVER BUTTON
    ---------------------------------------------------------------------------
    */
    "button-hover" :
    {
      decorator : [
        qx.ui.decoration.MBackgroundColor,
        qx.ui.decoration.MBorderRadius
      ],

      style :
      {
        backgroundColor : "button",
        radius : 3
      }
    },


    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */
    "window" :
    {
      decorator: [
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : 1,
        color : "window-border",
        innerWidth : 4,
        innerColor: "window-border-inner",
        shadowLength : 1,
        shadowBlurRadius : 3,
        shadowColor : "shadow",
        backgroundColor : "background"
      }
    },

    "window-active" :
    {
      include : "window",

      style :
      {
        shadowLength : 2,
        shadowBlurRadius : 5
      }
    },


    "window-caption" : {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : [0, 0, 2, 0],
        color : "window-border-inner"
      }
    },


    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */
    "white-box" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width: 1,
        color: "white-box-border",
        shadowBlurRadius : 2,
        shadowColor : "#999999",
        radius: 7,
        backgroundColor : "white"
      }
    },


    /*
    ---------------------------------------------------------------------------
      TEXT FIELD
    ---------------------------------------------------------------------------
    */
    "inset" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 1,
        color : [ "border-light-shadow", "border-light", "border-light", "border-light" ]
      }
    },

    "focused-inset" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 2,
        color : "background-selected"
      }
    },

    "border-invalid" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 2,
        color : "invalid"
      }
    },


    /*
    ---------------------------------------------------------------------------
      LIST ITEM
    ---------------------------------------------------------------------------
    */

    "lead-item" :
    {
      decorator : qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        style : "dotted",
        color : "border-lead"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TOOL TIP
    ---------------------------------------------------------------------------
    */

    "tooltip" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor,
        qx.ui.decoration.MBoxShadow
      ],

      style :
      {
        width : 1,
        color : "tooltip-text",
        shadowLength : 1,
        shadowBlurRadius : 2,
        shadowColor : "shadow"
      }
    },


    "tooltip-error" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MBackgroundColor
      ],

      style : {
        radius: 5,
        backgroundColor: "invalid"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar-separator" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthLeft : 1,
        colorLeft : "button-border"
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */
    "menu-separator" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop: 1,
        colorTop : "background-selected"
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */
    "menubar-button-hovered" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : 1,
        color : "border-main",
        radius : 3,
        backgroundColor : "white"
      }
    },


    "menubar-button-pressed" :
    {
      include : "menubar-button-hovered",

      style :
      {
        radius : [3, 3, 0, 0],
        width : [1, 1, 0, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser-date-pane" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop: 1,
        colorTop : "gray",
        style : "solid"
      }
    },


    "datechooser-weekday" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthBottom: 1,
        colorBottom : "gray",
        style : "solid"
      }
    },

    "datechooser-week" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthRight: 1,
        colorRight : "gray",
        style : "solid"
      }
    },

    "datechooser-week-header" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthBottom : 1,
        colorBottom : "gray",
        widthRight: 1,
        colorRight : "gray",
        style : "solid"
      }
    },





    /*
    ---------------------------------------------------------------------------
      TAB VIEW
    ---------------------------------------------------------------------------
    */

    "tabview-page-button-top" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : [1, 1, 0, 1],
        backgroundColor: "background",
        color : "border-main",
        radius : [3, 3, 0, 0]
      }
    },

    "tabview-page-button-bottom" : {
      include : "tabview-page-button-top",

      style :
      {
        radius : [0, 0, 3, 3],
        width : [0, 1, 1, 1]
      }
    },

    "tabview-page-button-left" : {
      include : "tabview-page-button-top",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "tabview-page-button-right" : {
      include : "tabview-page-button-top",

      style :
      {
        radius : [0, 3, 3, 0],
        width : [1, 1, 1, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "statusbar" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "background-selected",
        styleTop : "solid"
      }
    },

    "table-scroller-focus-indicator" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 2,
        color : "table-focus-indicator",
        style : "solid"
      }
    },

    "table-header" :
    {
      include : "button-box",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 0]
      }
    },

    "table-header-column-button" :
    {
      include : "table-header",
      style : {
        width : 1,
        color : "button-border"
      }
    },

    "table-header-cell" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthRight : 1,
        color : "button-border"
      }
    },

    "table-header-cell-first" :
    {
      include : "table-header-cell",
      style : {
        widthLeft : 1
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */

    "progressbar" :
    {
      decorator: qx.ui.decoration.Single,

      style:
      {
        backgroundColor: "#FFF",
        width: 1,
        color: "border-separator"
      }
    },



    /*
    ---------------------------------------------------------------------------
      RADIO BUTTON
    ---------------------------------------------------------------------------
    */
    "radiobutton" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        radius : 10,
        width : 1,
        color : "button-border",
        innerColor: "background",
        innerWidth: 2
      }
    },

    "radiobutton-focused" :
    {
      include : "radiobutton",
      style :
      {
        color : "background-selected"
      }
    },

    "radiobutton-invalid" :
    {
      include : "radiobutton",
      style :
      {
        color : "invalid"
      }
    },


    /*
    ---------------------------------------------------------------------------
      CHECK BOX
    ---------------------------------------------------------------------------
    */

    "checkbox" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : 1,
        color : "button-border"
      }
    },

    "checkbox-focused" :
    {
      include : "checkbox",
      style :
      {
        color : "background-selected"
      }
    },

    "checkbox-invalid" :
    {
      include : "checkbox",
      style :
      {
        color : "invalid"
      }
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
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/**
 * The indigo qooxdoo decoration theme.
 */
qx.Theme.define("qx.theme.indigo.Decoration",
{
  extend : qx.theme.simple.Decoration,

  aliases : {
    decoration : "qx/decoration/Simple"
  },

  decorations :
  {
    "window" :
    {
      decorator: [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MBackgroundColor,
        qx.ui.decoration.MBorderRadius
      ],

      style :
      {
        width : 1,
        color : "window-border",
        shadowLength : 1,
        shadowBlurRadius : 3,
        shadowColor : "shadow",
        backgroundColor : "background",
        radius: 3
      }
    },


    "window-caption" : {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder
      ],

      style :
      {
        radius: [3, 3, 0, 0],
        color: "window-border",
        widthBottom: 1
      }
    },

    "window-caption-active" : {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder
      ],

      style :
      {
        radius: [3, 3, 0, 0],
        color: "highlight",
        widthBottom: 3
      }
    },


    "white-box" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width: 1,
        color: "white-box-border",
        backgroundColor : "white"
      }
    },

    "statusbar" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "border-main",
        styleTop : "solid"
      }
    },


    "app-header" : {
      decorator : [
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        innerWidthBottom : 1,
        innerColorBottom: "highlight-shade",
        widthBottom: 9,
        colorBottom: "highlight",

        gradientStart : ["#505154", 0],
        gradientEnd : ["#323335", 100],

        backgroundColor : "#323335"
      }
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tristan Koch (trkoch)

************************************************************************ */

/**
 * Indigo color theme
 */
qx.Theme.define("qx.theme.indigo.Color",
{
  colors :
  {
    // main
    "background" : "white",
    "dark-blue" : "#323335",
    "light-background" : "#F4F4F4",
    "font" : "#262626",


    "highlight" : "#3D72C9", // bright blue
    "highlight-shade" : "#5583D0", // bright blue

    // backgrounds
    "background-selected" : "#3D72C9",
    "background-selected-disabled" : "#CDCDCD",
    "background-selected-dark" : "#323335",
    "background-disabled" : "#F7F7F7",
    "background-disabled-checked" : "#BBBBBB",
    "background-pane" : "white",

    // tabview
    "tabview-unselected" : "#1866B5",
    "tabview-button-border" : "#134983",
    "tabview-label-active-disabled" : "#D9D9D9",

    // text colors
    "link" : "#24B",

    // scrollbar
    "scrollbar-bright" : "#F1F1F1",
    "scrollbar-dark" : "#EBEBEB",

    // form
    "button" : "#E8F0E3",
    "button-border" : "#BBB",
    "button-border-hovered" : "#939393",
    "invalid" : "#C00F00",
    "button-box-bright" : "#F9F9F9",
    "button-box-dark" : "#E3E3E3",
    "button-box-bright-pressed" : "#BABABA",
    "button-box-dark-pressed" : "#EBEBEB",
    "border-lead" : "#888888",

    // window
    "window-border" : "#dddddd",
    "window-border-inner" : "#F4F4F4",

    // group box
    "white-box-border" : "#dddddd",

    // shaddows
    "shadow" : qx.core.Environment.get("css.rgba") ? "rgba(0, 0, 0, 0.4)" : "#666666",

    // borders
    "border-main" : "#dddddd",
    "border-light" : "#B7B7B7",
    "border-light-shadow" : "#686868",

    // separator
    "border-separator" : "#808080",

    // text
    "text" : "#262626",
    "text-disabled" : "#A7A6AA",
    "text-selected" : "white",
    "text-placeholder" : "#CBC8CD",

    // tooltip
    "tooltip" : "#FE0",
    "tooltip-text" : "black",

    // table
    "table-header" : [ 242, 242, 242 ],
    "table-focus-indicator" : "#3D72C9",

    // used in table code
    "table-header-cell" : [ 235, 234, 219 ],
    "table-row-background-focused-selected" : "#3D72C9",
    "table-row-background-focused" : "#F4F4F4",
    "table-row-background-selected" : [ 51, 94, 168 ],
    "table-row-background-even" : "white",
    "table-row-background-odd" : "white",
    "table-row-selected" : [ 255, 255, 255 ],
    "table-row" : [ 0, 0, 0],
    "table-row-line" : "#EEE",
    "table-column-line" : "#EEE",

    // used in progressive code
    "progressive-table-header" : "#AAAAAA",
    "progressive-table-row-background-even" : [ 250, 248, 243 ],
    "progressive-table-row-background-odd" : [ 255, 255, 255 ],
    "progressive-progressbar-background" : "gray",
    "progressive-progressbar-indicator-done" : "#CCCCCC",
    "progressive-progressbar-indicator-undone" : "white",
    "progressive-progressbar-percent-background" : "gray",
    "progressive-progressbar-percent-text" : "white"
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tristan Koch (trkoch)

************************************************************************ */
/**
 * Simple Theme
 */
qx.Theme.define("qx.theme.Indigo",
{
  title : "Indigo",

  meta :
  {
    color : qx.theme.indigo.Color,
    decoration : qx.theme.indigo.Decoration,
    font : qx.theme.indigo.Font,
    appearance : qx.theme.indigo.Appearance,
    icon : qx.theme.icon.Tango
  }
});