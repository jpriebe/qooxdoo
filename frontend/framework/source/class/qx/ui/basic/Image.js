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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * The image class is used for buttons, toolbars, menus, ...
 *
 * This class supports image clipping, which means that multiple images can be combined
 * into one large image and only the relevant part is shown.
 *
 * Please note that this widget can not be stretched.
 */
qx.Class.define("qx.ui.basic.Image",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param source {String?} The URL of the image to display.
   */
  construct : function(source)
  {
    this.base(arguments);

    if (source) {
      this.setSource(source);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The URL of the image */
    source :
    {
      check : "String",
      init : null,
      nullable : true,
      event : "changeSource",
      apply : "_applySource",
      themeable : true
    },


    // overridden
    appearance :
    {
      refine : true,
      init : "image"
    },


    // overridden
    allowGrowX :
    {
      refine : true,
      init : false
    },


    // overridden
    allowShrinkX :
    {
      refine : true,
      init : false
    },


    // overridden
    allowGrowY :
    {
      refine : true,
      init : false
    },


    // overridden
    allowShrinkY :
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createContentElement : function() {
      return new qx.html.ClippedImage();
    },


    // overridden
    _getContentHint : function()
    {
      return {
        width : this.__width || 0,
        height : this.__height || 0
      };
    },





    /*
    ---------------------------------------------------------------------------
      IMAGE API
    ---------------------------------------------------------------------------
    */

    // property apply, overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);
      this._styleSource();
    },


    // property apply
    _applySource : function(value) {
      qx.io.Alias.getInstance().connect(this._syncSource, this, value);
    },


    /**
     * Connects a callback method to the value manager to ensure
     * that changes to the source are handled by the image instance
     *
     * @type member
     * @param source {String} new icon source
     * @return {void}
     */
    _syncSource : function(source)
    {
      this._source = source;
      this._styleSource();
    },


    /**
     * Applies the source to the clipped image instance or preload
     * a image to detect sizes and apply it afterwards.
     *
     * @type member
     * @return {void}
     */
    _styleSource : function()
    {
      var source = this._source;
      var el = this._contentElement;

      if (!source)
      {
        el.resetSource();
        return;
      }

      var Registry = qx.util.ImageRegistry.getInstance();

      // Detect if the image registry knows this image
      if (Registry.has(source))
      {
        // Try to find a disabled image in registry
        if (!this.getEnabled())
        {
          var disabled = source.replace(/\.([a-z]+)$/, "-disabled.$1");
          if (Registry.has(disabled))
          {
            source = disabled;
            this.addState("replacement");
          }
          else
          {
            this.removeState("replacement");
          }
        }

        // Optimize case for enabled changes when no disabled image was found
        if (el.getSource() === source) {
          return;
        }

        // Apply source to ClippedImage instance
        el.setSource(source, false);

        // Query dimensions
        var width = el.getWidth();
        var height = el.getHeight();

        // Compare with old sizes and relayout if necessary
        if (width !== this.__width || height !== this.__height)
        {
          this.__width = width;
          this.__height = height;

          qx.ui.core.queue.Layout.add(this);
        }
      }
      else if (this.__preLoading !== source)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          var self = this.self(arguments);

          if (!self._warned) {
            self._warned = {};
          }

          if (!self._warned[source])
          {
            // this.warn("Unknown image: " + source);
            self._warned[source] = true;
          }
        }

        this.__preLoading = source;
        qx.io2.ImageLoader.load(source, this.__loaderCallback, this);
      }
    },


    /**
     * Event handler fired after the preloader has finished loading the icon
     *
     * @type member
     * @param source {String} Image source which was loaded
     * @param size {Map} Dimensions of the loaded image
     * @return {void}
     */
    __loaderCallback : function(source, size)
    {
      // Ignore when the source has already been modified
      if (source !== this.__preLoading) {
        return;
      }

      // Remove flag
      delete this.__preLoading;

      // Dynamically register image
      if (size) {
        qx.util.ImageRegistry.getInstance().register(source, source, 0, 0, size.width, size.height);
      } else {
        this.warn("Image could not be loaded: " + source);
      }

      // Update image (again)
      this._syncSource(source);
    }
  }
});