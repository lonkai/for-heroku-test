(function (angular) {
    'use strict';
    
    angular
        .module('issueTrackerApp.sign-in')
        .directive('signIn', signIn);

    function signIn() {

        return {
            templateUrl: 'src/templates/sign-in.html'
        };
    }
})(angular);
