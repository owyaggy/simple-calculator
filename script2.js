function processClick(input) {
    switch (input) {
        case "one":
            return 1;
        case "two":
            return 2;
        case "three":
            return 3;
        case "four":
            return 4;
        case "five":
            return 5;
        case "six":
            return 6;
        case "seven":
            return 7;
        case "eight":
            return 8;
        case "nine":
            return 9;
        case "zero":
            return 0;
        case "add":
        case "subtract":
        case "multiply":
        case "divide":
        case "equals":
        case "sign":
        case "backspace":
        case "clear":
        case "decimal":
        case "percent":
            return input;
        default:
            return "error";
    }
}

function updateTokens(update) {
    switch (update) {
        case "backspace":
            tokens.pop();
            break;
        case "clear":
            tokens = [];
            break;
        case "sign":
            // need to handle special case
            // TODO
            break;
        default:
            tokens.push(update);
    }
}

function updateDisplay() {
    /**
     * Need to parse the token list
     * Should produce an underlying mathematical expression
     * Perhaps stored in op1, op2, operator variables
     * 
     */
    
}

function buttonClick(event) {
    const target = event.target.id;
    if (target) {
        // only if target is something truthy (meaningful)
        const update = processClick(target);
        updateTokens(update);
        updateDisplay();
    }
}

function setupBtns() {
    const container = document.querySelector(".main");
    container.addEventListener("click", buttonClick);
}

setupBtns();

let tokens = [];

