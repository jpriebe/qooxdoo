/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Limited, http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

/**
 * A mixin providing objects by ID and owners.
 * 
 * The typical use of IDs is to override the `_createObjectImpl` method and create
 * new instances on demand; all code should access these instances by calling
 * `getObject`.
 */
qx.Mixin.define("qx.core.MObjectId", {
  
  /*
   * ****************************************************************************
   * PROPERTIES
   * ****************************************************************************
   */

  properties: {

    /** The owning object */
    owner : {
      init : null,
      check : "qx.core.Object",
      nullable : true,
      apply : "_applyOwner"
    },


    /** {String} The ID of the object.  */
    objectId : {
      init: null,
      check : function(value) { return value === null || (typeof value == "string" && value.indexOf('/') < 0); },
      nullable : true,
      apply : "_applyObjectId"
    }
  },

  /*
   * ****************************************************************************
   * MEMBERS
   * ****************************************************************************
   */

  members: {
    
    __ownedObjects: null,
    __changingOwner: false,

    /**
     * Apply owner
     */
    _applyOwner : function(value, oldValue) {
      if (!this.__changingOwner) {
        throw new Error("Please use API methods to change owner, not the property");
      }
    },
    
    /**
     * Apply objectId
     */
    _applyObjectId : function(value, oldValue) {
      if (this.getOwner() && !this.__changingOwner) {
        throw new Error("Please use API methods to change owner ID, not the property");
      }
      
      if (typeof this.getContentElement == "function") {
        var contentElement = this.getContentElement();
        if (contentElement) {
          contentElement.updateObjectId();
        }
      }
    },
    
    /**
     * Returns the object with the specified ID
     * 
     * @param id
     *          {String} ID of the object
     * @return {qx.core.Object?} the found object
     */
    getObject: function(id) {
      if (this.__ownedObjects) {
        var obj = this.__ownedObjects[id];
        if (obj !== undefined) {
          return obj;
        }
      }
      
      // Handle paths
      if (id.indexOf('/') > -1) {
        var segs = id.split('/');
        var target = this;
        var found = segs.every(function(seg) {
          if (!seg.length) {
            return true;
          }
          if (!target) {
            return false;
          }
          var tmp = target.getObject(seg);
          if (tmp !== undefined) {
            target = tmp;
            return true;
          }
        });
        return found ? target : undefined;
      }
      
      // No object, creating the object
      var obj = this._createObjectImpl(id);
      if (obj !== undefined) {
        this.addOwnedObject(obj, id);
      }
      
      return obj;
    },
    
    /**
     * Creates the object, intended to be overridden. Null is a valid return
     * value and will be cached by `getObject`, however `undefined` is NOT a
     * valid value and so will not be cached meaning that `_createObjectImpl`
     * will be called multiple times until a valid value is returned.
     * 
     * @param id {String} ID of the object
     * @return {qx.core.Object?} the created object
     */
    _createObjectImpl: function(id) {
      return;  // Return undefined
    },
    
    /**
     * Adds an object as owned by this object
     * 
     * @param obj {qx.core.Object} the object to register
     * @param id {String?} the id to set when registering the object
     */
    addOwnedObject: function(obj, id) {
      if (!this.__ownedObjects) {
        this.__ownedObjects = {};
      }
      var thatOwner = obj.getOwner();
      if (thatOwner === this) {
        return;
      }
      if (thatOwner) {
        thatOwner.removeOwnedObject(obj);
      }
      if (id === undefined) {
        id = obj.getObjectId();
      }
      if (!id) {
        throw new Error("Cannot register an object that has no ID, obj=" + obj);
      }
      if (this.__ownedObjects[id]) {
        throw new Error("Cannot register an object with ID '" + id + "' because that ID is already in use, this=" + this + ", obj=" + obj);
      }
      if (obj.getOwner() != null) {
        throw new Error("Cannot register an object with ID '" + id + "' because it is already owned by another object this=" + this + ", obj=" + obj);
      }
      obj.__changingOwner = true;
      try {
        obj.setOwner(this);
        obj.setObjectId(id);
      } finally {
        obj.__changingOwner = false;
      }
      this.__ownedObjects[id] = obj;
    },

    /**
     * Discards an object from the list of owned objects; note that this does
     * not dispose of the object, simply forgets it if it exists.
     * 
     * @param args {String|Object} the ID of the object to discard, or the object itself
     */
    removeOwnedObject: function(args) {
      if (!this.__ownedObjects) {
        throw new Error("Cannot discard object because it is not owned by this, this=" + this + ", object=" + obj);
      }
      
      var id;
      var obj;
      if (typeof args === "string") {
        if (args.indexOf('/') > -1) {
          throw new Error("Cannot discard owned objects based on a path");
        }
        id = args;
        obj = this.__ownedObjects[id];
        if (obj === undefined) {
          return;
        }
      } else {
        obj = args;
        id = obj.getObjectId();
        if (this.__ownedObjects[id] !== obj) {
          throw new Error("Cannot discard object because it is not owned by this, this=" + this + ", object=" + obj);
        }
      }

      if (obj !== null) {
        obj.__changingOwner = true;
        try {
          obj.setOwner(null);
        } finally {
          obj.__changingOwner = false;
        }
      }
      delete this.__ownedObjects[id];
    },

    /**
     * Returns an array of objects that are owned by this object, or an empty
     * array if none exists.
     * 
     * @return {Array}
     */    
    getOwnedObjects : function(){
      return this.__ownedObjects ? Object.values(this.__ownedObjects) : [];
    }
  }
});