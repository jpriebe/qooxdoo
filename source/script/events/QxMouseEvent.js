function QxMouseEvent(vType, vDomEvent, vAutoDispose, vTarget, vActiveTarget, vRelatedTarget)
{
  QxEvent.call(this, vType, vAutoDispose);

  if (vDomEvent)
  {
    this._domEvent = vDomEvent;
    this._domTarget = vDomEvent.target || vDomEvent.srcElement;

    this._target = isValid(vTarget) ? vTarget : this._evalTarget();
    this._activeTarget = isValid(vActiveTarget) ? vActiveTarget : this._evalActiveTarget();
    this._relatedTarget = isValid(vRelatedTarget) ? vRelatedTarget : this._evalRelatedTarget();

    this._pageX = this._evalPageX();
    this._pageY = this._evalPageY();
    this._clientX = this._evalClientX();
    this._clientY = this._evalClientY();

    switch(this._button = this._evalButton())
    {
      case "left":
        this._buttonLeft = true;
        break;

      case "middle":
        this._buttonMiddle = true;
        break;

      case "right":
        this._buttonRight = true;
        break;
    };
  };
};

QxMouseEvent.extend(QxEvent, "QxMouseEvent");


/*
  -------------------------------------------------------------------------------
    SETUP EVENT CHARACTER
  -------------------------------------------------------------------------------
*/

proto._bubbles = true;
proto._propagationStopped = false;
proto._preventDefault = false;




/*
  -------------------------------------------------------------------------------
    DOM CONNECTION
  -------------------------------------------------------------------------------
*/

proto._domEvent = null;
proto._domTarget = null;

proto.getDomEvent  = function() { return this._domEvent; };
proto.getDomTarget = function() { return this._domTarget; };





/*
  -------------------------------------------------------------------------------
    PAGE COORDINATES SUPPORT
  -------------------------------------------------------------------------------
*/

proto._pageX = null;
proto._pageY = null;

proto.getPageX = function() { return this._pageX; };
proto.getPageY = function() { return this._pageY; };

if ((new QxClient).isGecko())
{
  proto._evalPageX = function() {
    return this._domEvent.pageX;
  };

  proto._evalPageY = function() {
    return this._domEvent.pageY;
  };
}
else if ((new QxClient).isMshtml())
{
  if (isInvalid(document.compatMode) || document.compatMode == "BackCompat")
  {
    proto._evalPageX = function() {
      return this._domEvent.clientX + document.documentElement.scrollLeft;
    };

    proto._evalPageY = function() {
      return this._domEvent.clientY + document.documentElement.scrollTop;
    };
  }
  else
  {
    proto._evalPageX = function() {
      return this._domEvent.clientX + document.body.scrollLeft;
    };

    proto._evalPageY = function() {
      return this._domEvent.clientY + document.body.scrollTop;
    };
  };
}
else
{
  // in Konqueror, Opera and iCab, client? really contains the page? value
  proto._evalPageX = function() { return this._domEvent.clientX; };
  proto._evalPageY = function() { return this._domEvent.clientY; };
};







/*
  -------------------------------------------------------------------------------
    CLIENT COORDINATES SUPPORT
  -------------------------------------------------------------------------------
*/

proto._clientX = null;
proto._clientY = null;

proto.getClientX = function() { return this._clientX; };
proto.getClientY = function() { return this._clientY; };

if ((new QxClient).isMshtml() || (new QxClient).isGecko())
{
  proto._evalClientX = function() { return this._domEvent.clientX; };
  proto._evalClientY = function() { return this._domEvent.clientY; };
}
else
{
  // in Konqueror, Opera and iCab, client? really contains the page? value
  proto._evalClientX = function() { return this._domEvent.clientX + (document.body && document.body.scrollLeft != null ? document.body.scrollLeft : 0); };
  proto._evalClientY = function() { return this._domEvent.clientY + (document.body && document.body.scrollTop != null ? document.body.scrollTop : 0); };
};






/*
  -------------------------------------------------------------------------------
    SCREEN COORDINATES SUPPORT
  -------------------------------------------------------------------------------
*/
proto.getScreenX = function() { return this._domEvent.screenX; };
proto.getScreenY = function() { return this._domEvent.screenY; };




/*
  -------------------------------------------------------------------------------
    SPECIAL KEY SUPPORT
  -------------------------------------------------------------------------------
*/
proto.getCtrlKey = function() { return this._domEvent.ctrlKey; };
proto.getShiftKey = function() { return this._domEvent.shiftKey; };
proto.getAltKey = function() { return this._domEvent.altKey; };





/*
  -------------------------------------------------------------------------------
    UTILITIES
  -------------------------------------------------------------------------------
*/

/*!
  Nice utility to get more detailed information from dom event target.
*/
proto.getDomTargetByTagName = function(elemTagName, stopElem)
{
  var dt = this.getDomTarget();

  while(dt && dt.tagName != elemTagName && dt != stopElem) {
    dt = dt.parentNode;
  };

  if (dt && dt.tagName == elemTagName) {
    return dt;
  };

  return null;
};




/*
  -------------------------------------------------------------------------------
    PREVENT DEFAULT SUPPORT
  -------------------------------------------------------------------------------
*/

if((new QxClient).isMshtml())
{
  proto.preventDefault = function()
  {
    this._domEvent.returnValue = false;
    this._defaultPrevented = true;
  };
}
else
{
  proto.preventDefault = function()
  {
    this._domEvent.preventDefault();
    this._domEvent.returnValue = false;
    this._defaultPrevented = true;
  };
};

proto.getDefaultPrevented = function() {
  return this._defaultPrevented;
};





/*
  -------------------------------------------------------------------------------
    TARGET SUPPORT
  -------------------------------------------------------------------------------
*/

proto._target = proto._activeTarget = proto._relatedTarget = null;

proto.getTarget = function() {
  return this._target;
};

proto.getActiveTarget = function() {
  return this._activeTarget;
};

proto.getRelatedTarget = function() {
  return this._relatedTarget;
};

proto._evalTarget = function() {
  return QxEventManager.getTargetObjectFromEvent(this._domEvent);
};

proto._evalActiveTarget = function() {
  return QxEventManager.getActiveTargetObjectFromEvent(this._domEvent);
};

proto._evalRelatedTarget = function() {
  return QxEventManager.getRelatedActiveTargetObjectFromEvent(this._domEvent);
};




/*
  -------------------------------------------------------------------------------
    BUTTON SUPPORT
  -------------------------------------------------------------------------------
*/

proto._button = 0;

proto.getButton = function() {
  return this._button;
};

proto.isLeftButton = function() {
  return this._buttonLeft;
};

proto.isMiddleButton = function() {
  return this._buttonMiddle;
};

proto.isRightButton = function() {
  return this._buttonRight;
};

proto.isNotLeftButton = function() {
  return !this._buttonLeft;
};

proto.isNotMiddleButton = function() {
  return !this._buttonMiddle;
};

proto.isNotRightButton = function() {
  return !this._buttonRight;
};

if ((new QxClient).isMshtml())
{
  proto._evalButton = function()
  {
    var b = this._domEvent.button;
    return b == 1 ? "left" : b == 2 ? "right" : b == 4 ? "middle" : null;
  };

  QxMouseEvent.buttons = { left : 1, right : 2, middle : 4 };
}
else
{
  proto._evalButton = function()
  {
    var b = this._domEvent.button;
    return b == 0 ? "left" : b == 2 ? "right" : b == 1 ? "middle" : null;
  };

  QxMouseEvent.buttons = { left : 0, right : 2, middle : 1 };
};




/*
  -------------------------------------------------------------------------------
    WHEEL SUPPORT
  -------------------------------------------------------------------------------
*/

proto._wheelDelta = 0;
proto._wheelDeltaEvaluated = false;

proto.getWheelDelta = function()
{
  if (this._wheelDeltaEvaluated) {
    return this._wheelDelta;
  };

  this._wheelDeltaEvaluated = true;
  return this._wheelDelta = this._evalWheelDelta();
};

if((new QxClient).isMshtml())
{
  proto._evalWheelDelta = function() {
    return this._domEvent.wheelDelta ? this._domEvent.wheelDelta / 40 : 0;
  };
}
else
{
  proto._evalWheelDelta = function() {
    return -(this._domEvent.detail || 0);
  };
};





/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/
proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  QxEvent.prototype.dispose.call(this);

  this._domEvent = null;
  this._domTarget = null;

  this._target = null;
  this._activeTarget = null;
  this._relatedTarget = null;
};







/*
  -------------------------------------------------------------------------------
    LAST EVENT STORAGE SUPPORT
  -------------------------------------------------------------------------------
*/

QxMouseEvent._screenX = QxMouseEvent._screenY = QxMouseEvent._clientX = QxMouseEvent._clientY = QxMouseEvent._pageX = QxMouseEvent._pageY = 0;
QxMouseEvent._button = null;

QxMouseEvent._storeEventState = function(e)
{
  QxMouseEvent._screenX = e.getScreenX();
  QxMouseEvent._screenY = e.getScreenY();
  QxMouseEvent._clientX = e.getClientX();
  QxMouseEvent._clientY = e.getClientY();
  QxMouseEvent._pageX   = e.getPageX();
  QxMouseEvent._pageY   = e.getPageY();
  QxMouseEvent._button  = e.getButton();
};

QxMouseEvent.getScreenX = function() { return QxMouseEvent._screenX; };
QxMouseEvent.getScreenY = function() { return QxMouseEvent._screenY; };
QxMouseEvent.getClientX = function() { return QxMouseEvent._clientX; };
QxMouseEvent.getClientY = function() { return QxMouseEvent._clientY; };
QxMouseEvent.getPageX   = function() { return QxMouseEvent._pageX;   };
QxMouseEvent.getPageY   = function() { return QxMouseEvent._pageY;   };
QxMouseEvent.getButton  = function() { return QxMouseEvent._button;  };
