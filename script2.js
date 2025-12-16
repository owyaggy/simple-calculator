import { tokenAllowed } from "./rules.js";
import { processToken, helperFindOperator } from "./tokenProcessors.js";

let calculatorState = {
    tokens: [],
    lastOperation: null,
    lhsIsResult: false,
};

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

function updateDisplay() {
    /**
     * Need to parse the token list
     * Should produce an underlying mathematical expression
     * Perhaps stored in op1, op2, operator variables
     * 
     */
    let displayContent = calculatorState.tokens;
    const operatorIndex = helperFindOperator(displayContent);
    if (operatorIndex !== -1) {
        displayContent = [
            ...displayContent.slice(0, operatorIndex),
            " ",
            displayContent[operatorIndex],
            " ",
            ...displayContent.slice(operatorIndex + 1),
        ];
    } 
    displayContent = displayContent.map(token => (token === "neg") ? "-" : token);
    displayContent = displayContent.map(token => (token === "/") ? "÷" : token);
    // round decimal of answer to two places
    if (calculatorState.lhsIsResult) {
        const lhsEnd = displayContent.findIndex(" ");
        if (lhsEnd !== -1) {
            // there is an operator or distinct LHS
            const lhsDecimalIndex = displayContent.findIndex(".");
            if (lhsDecimalIndex !== -1) {
                // decimal found on lhs
                displayContent = [
                    ...displayContent.slice(0, Math.min(lhsDecimalIndex + 3, lhsEnd)),
                    ...displayContent.slice(lhsEnd)
                ];
            }
        } else {
            // only a "LHS" (result) is availably
            const lhsDecimalIndex = displayContent.findIndex(".");
            if (lhsDecimalIndex !== -1) {
                // decimal found on LHS
                displayContent = displayContent.slice(0, lhsDecimalIndex + 3);
            }
        }
    }
    const display = document.querySelector(".display");
    display.textContent = displayContent.join("");
}

function buttonClick(event) {
    const target = event.target.id;
    if (target) {
        // only if target is something truthy (meaningful)
        const newToken = processClick(target);
        if (tokenAllowed(calculatorState, newToken)) {
            calculatorState = processToken(calculatorState, newToken);
            updateDisplay();
        }
    }
}

function setupBtns() {
    const container = document.querySelector(".main");
    container.addEventListener("click", buttonClick);
}

setupBtns();