'use strict';

angular.module(require('./config').name)
  .service('ControlPanel', function ControlPanel() {
    var panels = [],
    activeOne;

    function activate(index) {
      if (activeOne) {
        activeOne.active = false;
      }
      activeOne = panels[index];
      activeOne.active = true;
      return activeOne;
    }

    function add(name, icon, tpl, ctx) {
      panels.push({
        name: name,
        iconClass: icon,
        template: tpl,
        ctx: ctx,
        active: false
      });
    }

    function all() {
      return panels;
    }

    return {
      all: all,
      add: add,
      activate: activate
    };
  });
