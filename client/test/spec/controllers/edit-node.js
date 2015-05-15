'use strict';

describe('Controller: EditNodeCtrl', function () {

  // load the controller's module
  beforeEach(module('iibHeatMapApp'));

  var EditNodeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EditNodeCtrl = $controller('EditNodeCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
