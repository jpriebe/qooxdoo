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

qx.Class.define("demobrowser.demo.layout.DockLayout_5",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var container = new qx.ui.core.Widget();
      var containerLayout = new qx.ui.layout.VBox();
      containerLayout.setSpacing(20);
      container.setLayout(containerLayout);
      this.getRoot().add(container, 20, 20);

      // default layout, flex growing
      var widget1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", width:450, height:250});
      var layout1 = new qx.ui.layout.Dock();

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "red"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "orange"});
      var w4 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w5 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "fuchsia"});

      layout1.add(w1, "north");
      layout1.add(w2, "west", {width:"50%"});
      layout1.add(w3, "south", {height:"50%"});
      layout1.add(w4, "east");
      layout1.add(w5, "center");

      widget1.setLayout(layout1);
      containerLayout.add(widget1);




      // y-axis first, flex growing
      var widget1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", width:450, height:250});
      var layout1 = new qx.ui.layout.Dock();
      layout1.setSort("y");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "red"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "orange"});
      var w4 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w5 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "fuchsia"});

      layout1.add(w1, "north");
      layout1.add(w2, "west", {width:"50%"});
      layout1.add(w3, "south", {height:"50%"});
      layout1.add(w4, "east");
      layout1.add(w5, "center");

      widget1.setLayout(layout1);
      containerLayout.add(widget1);





      // x-axis first, flex growing
      var widget1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", width:450, height:250});
      var layout1 = new qx.ui.layout.Dock();
      layout1.setSort("x");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "red"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "blue"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "orange"});
      var w4 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w5 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "fuchsia"});

      layout1.add(w1, "north");
      layout1.add(w2, "west", {width:"50%"});
      layout1.add(w3, "south", {height:"50%"});
      layout1.add(w4, "east");
      layout1.add(w5, "center");

      widget1.setLayout(layout1);
      containerLayout.add(widget1);
    }
  }
});
