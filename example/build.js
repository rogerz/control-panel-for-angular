
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("control-panel-for-angular/index.js", function(exports, require, module){
module.exports = require('./module.js');

require('./directives.js');
require('./services.js');
});
require.register("control-panel-for-angular/module.js", function(exports, require, module){
exports = module.exports = angular.module('rogerz/controlPanel', []);

});
require.register("control-panel-for-angular/services.js", function(exports, require, module){
require('./module')
  .service('controlPanel', function () {
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

});
require.register("control-panel-for-angular/directives.js", function(exports, require, module){
require('./module')
  .directive('controlPanel', function () {

    function controller($scope, controlPanel) {
      $scope.panels = controlPanel.all();

      $scope.activate = function (index) {
        var activeOne = controlPanel.activate(index);

        $scope.template = activeOne.template;
        $scope.ctx = activeOne.ctx;
      };

      $scope.inactive = false;

      $scope.toggle = function () {
        $scope.inactive = !$scope.inactive;
      };
    }

    return {
      restrict: 'E',
      controller: ['$scope', 'controlPanel', controller],
      template: require('./template.html')
    };
  })
  .directive('angularBindTemplate', function ($compile) {
    return function (scope, elem, attrs) {
      scope.$watch(attrs.angularBindTemplate, function (newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          elem.html(newVal);
          $compile(elem.contents())(scope);
        }
      });
    };
  });

});
require.register("control-panel-for-angular/template.html", function(exports, require, module){
module.exports = '<div id="side-bar" ng-class="{inactive: inactive}">\n  <ul id="sb-hot-zone">\n    <li>\n      <a id="sb-toggle" ng-click="toggle()">\n        <i class="glyphicon glyphicon-cog"></i>\n      </a>\n    </li>\n  </ul>\n  <ul id="sb-tabs">\n    <li ng-repeat="panel in panels">\n      <a ng-click="activate($index)">\n        <ni class="glyphicon {{panel.iconClass || \'glyphicon-cog\'}}"></i>\n      </a>\n    </li>\n  </ul>\n</div>\n<div id="control-panel" ng-hide="inactive">\n  <div angular-bind-template="template"></div>\n</div>\n';
});