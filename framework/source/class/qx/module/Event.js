/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Event module
 */
qx.Bootstrap.define("qx.module.Event", {
  statics :
  {
    /**
     * Event normalization registry
     * 
     * @type Map
     * @internal 
     */
    __normalizations : {},

    /**
     * Register a listener for the given event type on each item in the 
     * collection
     * 
     * @param type {String} Type of the event to listen for
     * @param listener {Function} Listener callback
     * @param context {Object?} Context the callback function will be executed in.
     * Default: The element on which the listener was registered
     * @return {qx.Collection} The collection for chaining
     */
    on : function(type, listener, context) {
      for (var i=0; i < this.length; i++) {
        var el = this[i];
        var ctx = context || q.wrap(el);

        // add native listener
        var bound;
        if (qx.bom.Event.supportsEvent(el, type)) {
          bound = function(event) {
            // apply normalizations
            var registry = qx.module.Event.__normalizations;
            // generic
            var normalizations = registry["*"] || [];
            // type specific
            if (registry[type]) {
              normalizations = normalizations.concat(registry[type]);
            }

            for (var x=0, y=normalizations.length; x<y; x++) {
              event = normalizations[x](event, el);
            }
            listener.apply(ctx, [event]);
          }
          bound.original = listener;
          qx.bom.Event.addNativeListener(el, type, bound);
        }
        // create an emitter if necessary
        if (!el.__emitter) {
          el.__emitter = new qx.event.Emitter();
        }
        var id = el.__emitter.on(type, bound || listener, ctx);
        if (typeof id == "number" && bound) {
          if (!el.__bound) {
            el.__bound = {};
          }
          el.__bound[id] = bound;
        }
      };
      return this;
    },


    /**
     * Unregister event listeners for the given type from each element in the
     * collection
     * 
     * @param type {String} Type of the event
     * @param listener {Function} Listener callback
     * @param ctx {Object?} Listener callback context
     * @return {qx.Collection} The collection for chaining
     */
    off : function(type, listener, ctx) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        if (!el.__bound) {
          el.__emitter.off(type, listener, ctx);
        }
        else {
          for (var id in el.__bound) {
            if (el.__bound[id].original == listener) {
              el.__emitter.off(type, el.__bound[id], ctx);
              // remove the native listener
              qx.bom.Event.removeNativeListener(el, type, el.__bound[id]);
              delete el.__bound[id];
            }
          }
        }
      };
      return this;
    },


    /**
     * Fire an event of the given type.
     * 
     * @param type {String} Event type
     * @param data {?var} Optional data that will be passed to the listener 
     * callback function
     * @return {qx.Collection} The collection for chaining
     */
    emit : function(type, data) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        if (el.__emitter) {
          el.__emitter.emit(type, data);
        }
      };
      return this;
    },


    /**
     * Attach a listener for the given event that will be executed only once.
     * 
     * @param type {String} Type of the event to listen for
     * @param listener {Function} Listener callback
     * @param ctx {Object?} Context the callback function will be executed in.
     * Default: The element on which the listener was registered
     * @return {qx.Collection} The collection for chaining
     */
    once : function(type, listener, ctx) {
      var self = this;
      var wrappedListener = function(data) {
        listener.call(this, data);
        self.off(type, wrappedListener, ctx);
      };
      this.on(type, wrappedListener, ctx);
      return this;
    },


    /**
     * Copies any event listeners that are attached to the elements in the 
     * collection to the provided target element
     * 
     * @param target {Element} Element to attach the copied listeners to
     */
    copyEventsTo : function(target) {
      var source = this;

      // get all children of source and target
      for (var i = source.length - 1; i >= 0; i--) {
        var descendants = source[i].getElementsByTagName("*");
        for (var j=0; j < descendants.length; j++) {
          source.push(descendants[j]);
        };
      }
      for (var i = target.length -1; i >= 0; i--) {
        var descendants = target[i].getElementsByTagName("*");
        for (var j=0; j < descendants.length; j++) {
          target.push(descendants[j]);
        };
      }


      for (var i=0; i < source.length; i++) {
        var el = source[i];
        if (!el.__emitter) {
          continue;
        }
        var storage = el.__emitter.getListeners();
        for (var name in storage) {
          for (var j=0; j < storage[name].length; j++) {
            var listener = storage[name][j].listener;
            if (listener.original) {
              listener = listener.original;
            }
            q.wrap(target[i]).on(name, listener, storage[name][j].ctx);
          };
        }
      };
    },


    /**
     * Executes the given function once the document is ready
     * 
     * @param callback {Function} callback function
     */
    ready : function(callback) {
      // handle case that its already ready
      if (document.readyState === "complete") {
        window.setTimeout(callback, 0);
        return;
      }
      qx.bom.Event.addNativeListener(window, "load", callback);
    },


    /**
     * Register a normalization function for the given event types. Listener
     * callbacks for these types will be called with the return value of the
     * normalization function instead of the regular event object.
     * 
     * The normalizer will be called with two arguments: The original event
     * object and the element on which the event was triggered
     * 
     * @param types {String[]} List of event types to be normalized. Use an 
     * asterisk (<code>*</code>) to normalize all event types
     * @param normalizer {Function} Normalizer function
     */
    registerNormalization : function(types, normalizer)
    {
      if (!qx.lang.Type.isArray(types)) {
        types = [types];
      }
      var registry = qx.module.Event.__normalizations;
      for (var i=0,l=types.length; i<l; i++) {
        var type = types[i];
        if (qx.lang.Type.isFunction(normalizer)) {
          if (!registry[type]) {
            registry[type] = [];
          }
          registry[type].push(normalizer);
        }
      }
    },


    /**
     * Unregister a normalization function from the given event types
     * 
     * @param types {String[]} List of event types
     * @param normalizer {Function} Normalizer function
     */
    unregisterNormalization : function(types, normalizer)
    {
      if (!qx.lang.Type.isArray(types)) {
        types = [types];
      }
      var registry = qx.module.Event.__normalizations;
      for (var i=0,l=types.length; i<l; i++) {
        var type = types[i];
        if (registry[type]) {
          qx.lang.Array.remove(registry[type], normalizer);
        }
      }
    },


    /**
     * Returns all registered event normalizers
     * 
     * @return {Map} Map of event types/normalizer functions
     */
    getRegistry : function()
    {
      return qx.module.Event.__normalizations;
    }
  },


  defer : function(statics) {
    q.attach({
      "on" : statics.on,
      "off" : statics.off,
      "once" : statics.once,
      "emit" : statics.emit,
      "copyEventsTo" : statics.copyEventsTo
    });

    q.attachStatic({
      "ready": statics.ready,
      "registerEventNormalization" : statics.registerNormalization,
      "unregisterEventNormalization" : statics.unregisterNormalization,
      "getEventNormalizationRegistry" : statics.getRegistry
    });
  }
});
