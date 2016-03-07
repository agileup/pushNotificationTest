angular.module('JPN', []);
angular.module('JPN').controller('BaseCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.messages = [];
    $scope.device = {
        id: 1,
        gcm: 'g1',
        baidu: '4362608915109776776'
    };

    io.socket.on('device', function(event) {
        switch(event.verb) {
            case 'created':
                $scope.device = event.data;
                $scope.$apply();
                break;
        }
    });

    io.socket.on('message', function (data){
        $scope.messages.push(data.log);
        $scope.$apply();
    });

    $scope.startTest = function() {
        if (!$scope.device.gcm || !$scope.device.baidu) {
            return;
        }

        io.socket.post("/test/connect", $scope.device, function(data) {
            console.log(data);
        });

        $http({
            method: 'POST',
            url: '/test/start',
            data: $scope.device
        }).success(function(data, status) {
            //
        });
    };
}]);
