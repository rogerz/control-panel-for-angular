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
