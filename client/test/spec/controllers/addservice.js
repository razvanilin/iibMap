'use strict';

describe('Controller: AddserviceCtrl', function () {

  // load the controller's module
  beforeEach(module('iibHeatMapApp'));

  var AddserviceCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddserviceCtrl = $controller('AddserviceCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
