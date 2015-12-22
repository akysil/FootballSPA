
/* App Module */

var app = angular.module('app', []);

/* App Run */

app.run(['$rootScope', 'Source', function($rootScope, Source) {
    
    // set initial data
    $rootScope.source = 'players.json';
    $rootScope.footballers = [];

    // put source into scope, handle errors
    Source.get($rootScope.source).then(function(response) {
        $rootScope.footballers = response.data;
    }, function(error) {
        console.log(error.status + ': ' + error.data);
    });

}]);

/* App Controllers */

app.controller('mainCtrl', ['$scope', function($scope) {

    // handle query input errors
    $scope.checkQuery = function() {
        var quotes = ($scope.query.match(/"/g)) ? $scope.query.match(/"/g) : [];
        $scope.error = (quotes.length && (quotes.length & 1)) ? true : false;
    };

}]);

/* App Filters */

app.filter('advancedSearch', function() {
    return function(array, query) {

        var result = [];
        var queryArrPlus = [];
        var queryArrMinus = [];

        var queryStr = (query) ? query.toLowerCase().trim() : '';

        // find and put "exact match" queries into appropriate arrays
        setStrict(queryStr);

        // split regular queries to array
        var queryArr = (queryStr) ? queryStr.split(" ") : [];
        
        // put regular queries into appropriate arrays
        for (var i = 0; i < queryArr.length; i++) {
            if (queryArr[i].indexOf("-") === 0) {
                if (queryArr[i].slice(1)) {
                    queryArrMinus.push(queryArr[i].slice(1));
                }
            } else {
                queryArrPlus.push(queryArr[i]);
            }
        }

        // loop items
        angular.forEach(array, function(obj, index, array) {

            var stringObj = objToString(obj).toLowerCase();

            // compare to minus words
            for (i = 0; i < queryArrMinus.length; i++) {
                if(~stringObj.indexOf(queryArrMinus[i])) return false;
            }

            var counter = 0;

            // compare to plus words
            for (var j = 0; j < queryArrPlus.length; j++) {
                if(~stringObj.indexOf(queryArrPlus[j])) {
                    counter ++;
                }
            }

            // if (counter) this.push(obj); // "eny of this words mode"
            if (counter === queryArrPlus.length) this.push(obj);
            
        }, result);

        // return result
        return (query) ? result : array;

        // convert object to string
        function objToString(obj) {
            var string = '';
            for (var key in obj) {
                string += ' ' + obj[key];
            }
            return string;
        }

        // put "exact match" into queries arrays
        function setStrict(string) {
            var match = findInQuotes(string);

            if (match) {
                if (match.slice(1) && match.indexOf("-") === 0) {
                    queryArrMinus.push(' ' + match.slice(1) + ' ');
                }
                if (match.indexOf("-") !== 0) {
                    queryArrPlus.push(' ' + match + ' ');
                }
                queryStr = queryStr.replace('"' + match + '"', '').trim();
                setStrict(queryStr);
            }
        }

        // check if "exact match" present
        function findInQuotes(string) {
            var match = string.match(/\"(.*?)\"/);
            return (match) ? match[1] : false;
        }

    };
});

/* App Services */

app.factory('Source', ['$http', function($http) {

    // get source from JSON
    return {
        get: function(url) {
            return $http.get(url);
        }
    };

}]);