(function (angular) {
    'use strict';
    angular
        .module('issueTrackerApp')
        .controller('SnakeCtrl', SnakeCtrl);

    SnakeCtrl.$inject = ['$scope', '$http', '$uibModalInstance', '$window', '$timeout', 'snake'];

    function SnakeCtrl($scope, $http, $uibModalInstance, $window, $timeout, snake) {
        var vm = this;

        vm.snakeRes = snake;
        vm.name = '';

        vm.snakeRes.sort(function (obj1, obj2) {
            // Сортировка по убыванию
            return obj2.scores - obj1.scores;
        });

        vm.BOARD_SIZE = 20;

        vm.DIRECTIONS = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        };

        vm.COLORS = {
            GAME_OVER: '#820303',
            FRUIT: '#E80505',
            SNAKE_HEAD: '#078F00',
            SNAKE_BODY: '#0DFF00',
            BOARD: '#000'
        };

        vm.snake = {
            direction: vm.DIRECTIONS.LEFT,
            parts: [{
                x: -1,
                y: -1
            }]
        };

        vm.fruit = {
            x: -1,
            y: -1
        };

        vm.score = 0;

        vm.setStyling = function (col, row) {
            if (vm.isGameOver) {
                return vm.COLORS.GAME_OVER;
            } else if (vm.fruit.x == row && vm.fruit.y == col) {
                return vm.COLORS.FRUIT;
            } else if (vm.snake.parts[0].x == row && vm.snake.parts[0].y == col) {
                return vm.COLORS.SNAKE_HEAD;
            } else if (vm.board[col][row] === true) {
                return vm.COLORS.SNAKE_BODY;
            }
            return vm.COLORS.BOARD;
        };

        vm.update = function () {
            var newHead = vm.getNewHead();

            if (vm.boardCollision(newHead) || vm.selfCollision(newHead)) {
                return vm.gameOver();
            } else if (vm.fruitCollision(newHead)) {
                vm.eatFruit();
            }

            // Remove tail
            var oldTail = vm.snake.parts.pop();
            vm.board[oldTail.y][oldTail.x] = false;

            // Pop tail to head
            vm.snake.parts.unshift(newHead);
            vm.board[newHead.y][newHead.x] = true;

            // Do it again
            vm.snake.direction = vm.tempDirection;
            $timeout(vm.update, vm.interval);
        }

        vm.getNewHead = function () {
            var newHead = angular.copy(vm.snake.parts[0]);

            // Update Location
            if (vm.tempDirection === vm.DIRECTIONS.LEFT) {
                newHead.x -= 1;
            } else if (vm.tempDirection === vm.DIRECTIONS.RIGHT) {
                newHead.x += 1;
            } else if (vm.tempDirection === vm.DIRECTIONS.UP) {
                newHead.y -= 1;
            } else if (vm.tempDirection === vm.DIRECTIONS.DOWN) {
                newHead.y += 1;
            }
            return newHead;
        }

        vm.boardCollision = function (part) {
            return part.x === vm.BOARD_SIZE || part.x === -1 || part.y === vm.BOARD_SIZE || part.y === -1;
        }

        vm.selfCollision = function (part) {
            return vm.board[part.y][part.x] === true;
        }

        vm.fruitCollision = function (part) {
            return part.x === vm.fruit.x && part.y === vm.fruit.y;
        }

        vm.resetFruit = function () {
            var x = Math.floor(Math.random() * vm.BOARD_SIZE);
            var y = Math.floor(Math.random() * vm.BOARD_SIZE);

            if (vm.board[y][x] === true) {
                return vm.resetFruit();
            }
            vm.fruit = {x: x, y: y};
        };

        vm.eatFruit = function () {
            vm.score++;

            // Grow by 1
            var tail = angular.copy(vm.snake.parts[vm.snake.parts.length - 1]);
            vm.snake.parts.push(tail);
            vm.resetFruit();

            if (vm.score % 5 === 0) {
                vm.interval -= 15;
            }
        };

        vm.gameOver = function () {
            vm.isGameOver = true;

            $timeout(function () {
                vm.isGameOver = false;
            }, 500);

            vm.setupBoard();

            vm.newScore = {
                name: vm.name,
                scores: vm.score
            }

            console.log(vm.newScore);

            if (vm.newScore.scores >= vm.snakeRes[vm.snakeRes.length - 1].scores) {
                Object.assign(vm.snakeRes[vm.snakeRes.length - 1], vm.newScore);
            }

            vm.snakeRes.sort(function (obj1, obj2) {
                // Сортировка по убыванию
                return obj2.scores - obj1.scores;
            });
            
            $http.post("./snake", vm.snakeRes)
        };

        vm.setupBoard = function () {
            vm.board = [];
            for (var i = 0; i < vm.BOARD_SIZE; i++) {
                vm.board[i] = [];
                for (var j = 0; j < vm.BOARD_SIZE; j++) {
                    vm.board[i][j] = false;
                }
            }
        };

        vm.setupBoard();

        $window.addEventListener("keyup", function (e) {
            if (e.keyCode == vm.DIRECTIONS.LEFT && vm.snake.direction !== vm.DIRECTIONS.RIGHT) {
                vm.tempDirection = vm.DIRECTIONS.LEFT;
            } else if (e.keyCode == vm.DIRECTIONS.UP && vm.snake.direction !== vm.DIRECTIONS.DOWN) {
                vm.tempDirection = vm.DIRECTIONS.UP;
            } else if (e.keyCode == vm.DIRECTIONS.RIGHT && vm.snake.direction !== vm.DIRECTIONS.LEFT) {
                vm.tempDirection = vm.DIRECTIONS.RIGHT;
            } else if (e.keyCode == vm.DIRECTIONS.DOWN && vm.snake.direction !== vm.DIRECTIONS.UP) {
                vm.tempDirection = vm.DIRECTIONS.DOWN;
            }
        });

        vm.startGame = function () {
            vm.score = 0;
            vm.snake = {direction: vm.DIRECTIONS.LEFT, parts: []};
            vm.tempDirection = vm.DIRECTIONS.LEFT;
            vm.isGameOver = false;
            vm.interval = 150;

            // Set up initial snake
            for (var i = 0; i < 5; i++) {
                vm.snake.parts.push({x: 10 + i, y: 10});
            }
            vm.resetFruit();
            vm.update();
        };
    };
})(angular);