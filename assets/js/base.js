angular.module('JPN', []);
angular.module('JPN').controller('BaseCtrl', ['$scope', function($scope) {

    io.socket.get('/device', function(data) {
        // $scope.device = data;
        // $scope.$apply();
    });

    io.socket.on('device', function(event) {
        console.log("##################################################");
        console.log(event);
        console.log("##################################################");
        switch(event.verb) {
            case 'created':
                $scope.device = event.data;
                $scope.$apply();
                break;
        }
    });

    $scope.device = {
        gcm: '',
        baidu: ''
    };
}]);
