var app = angular.module('selectordie', []);

app.directive('selectordie', function($timeout) {
  return {
    restrict: 'A',
    require: 'ngModel',
    compile: function (tElement, tAttrs) {
      return function (scope, element, attrs, ngModel) {
        $timeout(function() {
          element.find('select').selectOrDie({
            placeholder: attrs.label ? attrs.label : null,
            onChange: function() {
              ngModel.$setViewValue($(this).val());
            }
          });
        });
        ngModel.$render = function() {
          element.find('select').val(ngModel.$modelValue);
          element.find('select option[value="' + ngModel.$modelValue + '"]').attr('selected', 'selected');
          element.find('select').selectOrDie('update');
        };
      }
    }
  };
});
