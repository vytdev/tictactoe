(function (fn) {
    "use strict";
    
    // wait until dom was fully loaded
    window.onload = fn;
})(function () {
    "use strict";
    
    // ==================== CONFIG ====================
    // whether to play with computer
    var computer = false;
    // whether to do smart mode for computer
    var smart = true;
    // add a delayed effect for computer
    var delayed = false;
    // who will move first, true to computer
    var computerFirst = false;
    // length of tic-tac-toe table sides
    var len = 3;
    
    // ==================== VARS ====================
    var active = true; // whether the game is active
    var areas = document.getElementById("areas"); // table object
    var aiDeciding = false; // whether computer is deciding
    var slots = len * len; // length squared
    var left = slots; // how many slots were left
    var board = []; // linear array containing what players moved
    var cells = []; // linear array containing divs, synced on board
    var isX = true; // whether x is in current move
    var xScore = 0; // score of x
    var oScore = 0; // score of o
    var xScoreView = document.getElementById("x-score"); // element that shows x's score on the page
    var oScoreView = document.getElementById("o-score"); // element that shows o's score on the page
    // enum containing player types (x and o)
    var Players = (function(val) {
        val[val["x"] = "X"] = "x";
        val[val["o"] = "O"] = "o";
        return val;
    })({});
    
    var fontSize = ((Math.min(window.innerWidth, window.innerHeight) - 40) / len) * 0.8 + "px";
    var lastRow;
    for (var i = 0; i < slots; i++) {
        if (!lastRow || i % len == 0) {
            lastRow = document.createElement("div");
            areas.appendChild(lastRow);
        }
        var cell = document.createElement("div");
        lastRow.appendChild(cell);
        cell.style.fontSize = fontSize;
        cells.push(cell);
        cell.tictactoeSlotNumber = i; // using var can cause problems
        // cell clicked
        cell.onclick = function() {
            if (active && !aiDeciding && !board[this.tictactoeSlotNumber]) {
                var char = isX ? Players.X : Players.O;
                board[this.tictactoeSlotNumber] = char;
                cells[this.tictactoeSlotNumber].innerHTML = char;
                left--;
                // check if some won
                if (checkWin(char)) {
                    return;
                }
                isX = !isX;
                // this will return if computer mode is off
                computerMove();
            }
        };
    }
    
    // check if the given player wins in board
    function validateWin(board, player) {
        var combinations = [];
        
        // horizontal
        for (var i = 0; i < slots; i += len) {
            if (board[i] == player) {
                var succed = true;
                var comb = [];
                var max = i + len;
                for (var j = i; j < max; j++) {
                    comb.push(j);
                    if (board[j] != player) {
                        succed = false;
                        break;
                    }
                }
                if (succed) combinations.push(comb);
            }
        }
        
        // vertical
        for (var i = 0; i < len; i++) {
            if (board[i] == player) {
                var succed = true;
                var comb = [];
                for (var j = 0; j < len; j++) {
                    var pos = j * len + i;
                    comb.push(pos);
                    if (board[pos] != player) {
                        succed = false;
                        break;
                    }
                }
                if (succed) combinations.push(comb);
            }
        }
        
        // diagonal: top left to bottom right
        if (board[0] == player) {
            var succed = true;
            var comb = [];
            for (var i = 0; i < len; i++) {
                var pos = i * len + i;
                comb.push(pos);
                if (board[pos] != player) {
                    succed = false;
                    break;
                }
            }
            if (succed) combinations.push(comb);
        }
        
        // diagonal: top right to bottom left
        if (board[len - 1] == player) {
            var succed = true;
            var comb = [];
            for (var i = 0; i < len; i++) {
                var pos = (len - (i + 1)) * len + i;
                comb.push(pos);
                if (board[pos] != player) {
                    succed = false;
                    break;
                }
            }
            if (succed) combinations.push(comb);
        }
        
        // return combinations
        if (combinations.length) return combinations;
        
        // no matches
        return false;
    }
    
    // check win
    function checkWin(char) {
        if (!active) return;
        var check = validateWin(board, char);
        if (check) {
            active = false;
            inform(Players[char] + " won");
            // highlight combinations
            for (var i = 0; i < check.length; i++) {
                for (var j = 0; j < len; j++) {
                    cells[check[i][j]].classList.value = "matched";
                }
            }
            if (char == Players.X) {
                xScore++;
                xScoreView.innerHTML = xScore;
            } else {
                oScore++;
                oScoreView.innerHTML = oScore;
            }
            return true;
        }
        if (left <= 0) {
            inform("Tie!");
            active = false;
            return true;
        }
        return false;
    }
    
    // perform computer move
    function computerMove() {
        if (!computer) return;
        var char = isX ? Players.X : Players.O;
        // make delayed effect!
        aiDeciding = true;
        // determine the position
        var pos;
        // smart mode
        if (smart) {
            var best = -Infinity;
            for (var i = 0; i < slots; i++) {
                if (!board[i]) {
                    board[i] = char;
                    var score = minimax(true);
                    board[i] = null;
                    // get the highest score
                    pos = best > score ? pos : i;
                    best = best > score ? best : score;
                }
            }
        }
        // random mode
        else if (left > 0) {
            while (!pos || board[pos]) {
                pos = Math.floor(Math.random() * slots);
            }
        }
        // delayed effect
        setTimeout(function () {
            if (!aiDeciding) return;
            aiDeciding = false;
            // show pos
            board[pos] = char;
            cells[pos].innerHTML = char;
            left--;
            // check if computer won
            if (checkWin(char)) {
                return;
            }
            // player move
            isX = !isX;
        }, delayed ? (Math.floor(Math.random() * 1500 + 200) - 200) : 0);
    }
    
    // minimax algorithm (smart mode)
    function minimax(ai) {
        var val = validateWin(board, ai ? Players.AI : Players.HUMAN)
            ? (ai ? 1 : -1)
            : (ai ? -1 : 1);
        for (var i = 0; i < slots; i++) {
            if (!board[i]) {
                board[i] = ai ? Players.HUMAN : Players.AI;
                val += minimax(!ai);
                board[i] = null;
            }
        }
        // we divide val into 2 for the following things:
        //  - for positive numbers, it will decrease the value:  1 ->  0.5
        //  - for negative numbers, it will increase the value: -1 -> -0.5
        // this effects a large impact on the algorithm
        return val / 2;
    }
    
    // reset function
    function reset() {
        active = true;
        aiDeciding = false;
        slots = len * len;
        left = slots;
        board = [];
        isX = true;
        inform("");
        // update Players enum
        Players["AI"] = computerFirst ? Players.X : Players.O;
        Players["HUMAN"] = computerFirst ? Players.O : Players.X;
        // clear slots
        for (var i = 0; i < cells.length; i++) {
            var slot = cells[i];
            slot.innerHTML = "";
            slot.classList.value = "";
        }
        // computer is in first move
        if (computer && computerFirst) {
            left--;
            var pos = Math.floor(Math.random() * slots);
            board[pos] = Players.X;
            cells[pos].innerHTML = Players.X;
            isX = false;
        }
    }
    
    // game options
    document.forms["game-opts"].onsubmit = function(e) {
        e.preventDefault();
        active = false;
        // reset scores
        xScore = 0;
        oScore = 0;
        xScoreView.innerHTML = xScore;
        oScoreView.innerHTML = oScore;
        // update config
        // len config is not available due to its impact on performance
        computer = this.computer.checked;
        smart = this.smart.checked;
        computerFirst = this.computerFirst.checked;
        delayed = this.delayed.checked;
        // reset game
        reset();
    }
    
    // inform function
    var msgBox = document.getElementById("msg-box");
    function inform(msg) {
        msgBox.innerHTML = msg;
    }
    
    // initialize
    reset();
    
    // reset button
    document.getElementById("reset").onclick = reset;
    
    // show the gamebox
    document.getElementById("gamebox").style.display = "block";
});
