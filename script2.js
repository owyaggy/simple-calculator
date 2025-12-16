/** ###### RULES ###### */
/**
 * For decimal point:
 * Max 1 allowed between operators
 * If no operator present, just have to check if there's already a decimal
 * If operator is present, check for a decimal after the operator
 */
function isDecimalAllowed(calculatorState) {
    const tokens = calculatorState.tokens;
    const operators = ["+", "-" ,"*" ,"/"];
    for (let i = 0; i < tokens.length; i++) {
        if (operators.includes(tokens[i])) { // if operator present
            return !(tokens.slice(i).includes(".")); // decimal -> false, else -> true
        }
    }
    // at this point in execution, confirmed that no operator is present
    return !tokens.includes("."); // decimal -> false, else -> true
}

/**
 * For sign change, equals, backspace, and clear:
 * Only allowed if stack isn't empty
 * If tokens are present (desired), return true
 * Otherwise, it no tokens are present (stack is empty), return false
 */
function tokensPresent(calculatorState) {
    return calculatorState.tokens.length !== 0;
}

/**
 * For equals:
 * If only one operand is present (no operator), only allowed if there is a
 * `lastOperation` to apply
 * IMPORTANT: relies on lastOperation being set to `null` as soon as a new operator
 * is entered
 */
function lastOperationPresent(calculatorState) {
    return calculatorState.lastOperation !== null;
}

/**
 * For equals:
 * Allowed if a full expression (operand, operator, operand) is present
 */
function completeExpressionPresent(calculatorState) {
    const tokens = calculatorState.tokens;
    // find index of operator
    const operators = ["+", "-" ,"*" ,"/"];
    const operatorIndex = tokens.findIndex(token => operators.includes(token));
    // if no operator found, return false
    if (operatorIndex === -1) {
        return false;
    }
    // at this point, operator is confirmed to be present
    // check both LHS and RHS are numbers
    // if both are numbers, expression is valid, return true. else return false
    const lhs = tokens.slice(0, operatorIndex).join();
    const rhs = tokens.slice(operatorIndex + 1).join();
    // expression complete if parseFloat of lhs and rhs are each not NaN
    return !isNaN(parseFloat(lhs)) && !isNaN(parseFloat(rhs));
}

/**
 * Rules for digits:
 * - (none, always allowed)
 */
function digitAllowed(calculatorState) {
    return true;
}

/**
 * Rules for sign change:
 * - tokensPresent = true
 */
function signChangeAllowed(calculatorState) {
    return tokensPresent(calculatorState);
}

/** 
 * Rules for operators:
 * - tokensPresent = true
 */
function operatorAllowed(calculatorState) {
    return tokensPresent(calculatorState);
}

/**
 * Rules for backspace:
 * - tokensPresent = true
 */
function backspaceAllowed(calculatorState) {
    return tokensPresent(calculatorState);
}

/**
 * Rules for clear:
 * - tokensPresent = true
 */
function clearAllowed(calculatorState) {
    return tokensPresent(calculatorState);
}

/** 
 * Rules for decimal:
 * - isDecimalAllowed = true
 */
function decimalAllowed(calculatorState) {
    return isDecimalAllowed(calculatorState);
}

/**
 * Rules for equals:
 * - tokensPresent = true
 * - (lastOperationPresent = true) OR (completeExpressionPresent = true)
 */
function equalsAllowed(calculatorState) {
    return (
        tokensPresent(calculatorState) && (
            lastOperationPresent(calculatorState) || 
            completeExpressionPresent(calculatorState)
        )
    );
}

/**
 * Rules for percentage:
 * - TODO
 */
function percentAllowed(calculatorState) {
    // TODO
}

/**
 * General handler for all new tokens
 */
function tokenAllowed(calculatorState, newToken) {
    if (Number.isInteger(newToken)) {
        return digitAllowed(calculatorState);
    }
    switch (newToken) {
        case "sign":
            return signChangeAllowed(calculatorState);
        case "add":
        case "subtract":
        case "multiply":
        case "divide":
            return operatorAllowed(calculatorState);
        case "backspace":
            return backspaceAllowed(calculatorState);
        case "clear":
            return clearAllowed(calculatorState);
        case "decimal":
            return decimalAllowed(calculatorState);
        case "equals":
            return equalsAllowed(calculatorState);
        case "percent":
            return percentAllowed(calculatorState);
    }
}

/** ##### TOKEN PROCESSORS ##### */
function add(lhs, rhs) {
    return lhs + rhs;
}

function subtract(lhs, rhs) {
    return lhs - rhs;
}

function multiply(lhs, rhs) {
    return lhs * rhs;
}

function divide(lhs, rhs) {
    if (rhs === 0) return "DIV#/0!";
    return lhs / rhs;
}

/**
 * Returns the index of the first operator.
 * If no operator is found, returns -1.
 * @param {Array} tokens 
 * @returns {Number}
 */
function helperFindOperator(tokens) {
    const operators = ["+", "-", "*", "/"];
    return tokens.findIndex(token => operators.includes(token));
}

/**
 * Determines whether the given operand, as represented by its component tokens, is
 * negative or positive. 
 * @param {Array} operandTokens
 * @returns {Boolean}
 */
function helperOperandIsNegative(operandTokens) {
    return operandTokens.includes('neg');
}

/**
 * Flips the sign of the given operand, as represented by its component tokens.
 * @param {Array} operandTokens 
 * @returns {Array}
 */
function helperToggleSign(operandTokens) {
    if (helperOperandIsNegative(operandTokens)) {
        operandTokens = operandTokens.slice(2, -1); // remove negative indicators
    } else {
        operandTokens = ['(', 'neg', ...operandTokens, ,')']; // add negative indicators
    }
    return operandTokens;
}

/**
 * Converts operand tokens into a floating point number.
 * @param {Array} operandTokens 
 * @return {Number}
 */
function helperParseOperandTokens(operandTokens) {
    if (helperOperandIsNegative(operandTokens)) { //TODO
        // refactor negative numbers to work with parseFloat
        operandTokens = "-" + operandTokens.slice(2, -1).join("");
        return parseFloat(operandTokens);
    } else {
        // positive numbers just need to be joined
        operandTokens = operandTokens.join("");
        return parseFloat(operandTokens);
    }
}

/**
 * Converts a number into tokens.
 * @param {Number} result 
 * @returns {Array}
 */
function helperConvertToTokens(result) {
    const sign = result >= 0 ? 1 : -1; // positive -> 1, negative -> -1
    result = Math.abs(result);
    if (Number.isInteger(result)) {
        result = Math.round(result); // strip trailing .0 from integers
    }
    let resultTokens = result.toString().split("");
    if (sign < 0) {
        resultTokens = helperToggleSign(resultTokens);
    }
    return resultTokens;
}

/**
 * New digit token
 */
function processDigitToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    const operatorIndex = helperFindOperator(calculatorState.tokens);
    if (operatorIndex === -1 && calculatorState.lhsIsResult) {
        // modifying LHS and current operand is a result
        // toss old result, replace with new digit
        newCalculatorState.tokens = [token];
        newCalculatorState.lhsIsResult = false;
        return newCalculatorState;
    } else {
        // current operand is not a result
        // append new digit
        newCalculatorState.tokens.push(token);
        return newCalculatorState;
    }
}

/**
 * New decimal token
 */
function processDecimalToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    const operatorIndex = helperFindOperator(calculatorState.tokens);
    if (operatorIndex === -1 && calculatorState.lhsIsResult) {
        newCalculatorState.tokens = [];
        newCalculatorState.lhsIsResult = false;
    }
    const lastToken = newCalculatorState.tokens.at(-1);
    if (!Number.isInteger(lastToken)) {
        newCalculatorState.tokens.push(0);
    }
    newCalculatorState.tokens.push(".");
    return newCalculatorState;
}

/**
 * New sign change token
 */
function processSignChangeToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    const operatorIndex = helperFindOperator(calculatorState.tokens);
    let lhs = newCalculatorState.tokens.slice(0, operatorIndex);
    let rhs = newCalculatorState.tokens.slice(operatorIndex + 1);
    if (operatorIndex === -1) {
        // modifying LHS
        lhs = helperToggleSign(lhs);
    } else {
        // modifying RHS
        rhs = helperToggleSign(rhs);
    }
    // return LHS, operator, RHS in flat array
    newCalculatorState.tokens = [...lhs, calculatorState.tokens[operatorIndex], ...rhs];
    return newCalculatorState;
}

/**
 * New equals token
 */
function processEqualsToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    const operatorIndex = helperFindOperator(calculatorState.tokens);
    let operator = null;
    let lhsTokens = null;
    let rhsTokens = null;
    if (operatorIndex === -1) {
        // no operator path only possible if last operation exists
        // apply last operation
        lhsTokens = calculatorState.tokens;
        operator = calculatorState.lastOperation.operator;
        rhsTokens = calculatorState.lastOperation.rhsTokens;
    } else {
        lhsTokens = newCalculatorState.tokens.slice(0, operatorIndex);
        operator = calculatorState.tokens[operatorIndex];
        rhsTokens = calculatorState.tokens.slice(operatorIndex + 1);
    }
    let lhs = helperParseOperandTokens(lhsTokens);
    let rhs = helperParseOperandTokens(rhsTokens);
    let result = null;
    switch (operator) {
        case "+":
            result = add(lhs, rhs);
            break;
        case "-":
            result = subtract(lhs, rhs);
            break;
        case "*":
            result = multiply(lhs, rhs);
            break;
        case "/":
            result = divide(lhs, rhs);
            break;
    }
    newCalculatorState.tokens = helperConvertToTokens(result);
    newCalculatorState.lastOperation = {
        operator: operator,
        rhsTokens: rhsTokens,
    };
    newCalculatorState.lhsIsResult = true;
    return newCalculatorState;
}

/**
 * New operator token
 */
function processOperatorToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    const operatorIndex = helperFindOperator(calculatorState.tokens);
    if (operatorIndex < calculatorState.tokens.length - 1 && operatorIndex !== -1) {
        // introducing a second operator! need to handle
        // TODO: this is a temporary solution
        // way to have some sort of "pop" effect as a result replaces an expression?
        newCalculatorState = processEqualsToken(calculatorState, token);
    } else if (operatorIndex === calculatorState.tokens.length - 1) {
        newCalculatorState.tokens.pop(); // remove last operator
    }
    let newOperator = null;
    switch (token) {
        case "add":
            newOperator = "+";
            break;
        case "subtract":
            newOperator = "-";
            break;
        case "multiply":
            newOperator = "*";
            break;
        case "divide":
            newOperator = "/";
            break;
    }
    newCalculatorState.tokens.push(newOperator);
    return newCalculatorState;
}

/**
 * New backspace token
 */
function processBackspaceToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    newCalculatorState.tokens.pop();
    return newCalculatorState;
}

/**
 * New clear token
 */
function processClearToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    newCalculatorState.tokens = [];
    newCalculatorState.lastOperation = null;
    newCalculatorState.lhsIsResult = false;
    return newCalculatorState;
}

/**
 * New percentage token
 */
function processPercentToken(calculatorState, token) {
    // TODO
}

/**
 * General handler for new tokens
 */
function processToken(calculatorState, token) {
    if (!isNaN(parseInt(token))) {
        return processDigitToken(calculatorState, token);
    }
    switch (token) {
        case "decimal":
            return processDecimalToken(calculatorState, token);
        case "sign":
            return processSignChangeToken(calculatorState, token);
        case "add":
        case "subtract":
        case "multiply":
        case "divide":
            return processOperatorToken(calculatorState, token);
        case "backspace":
            return processBackspaceToken(calculatorState, token);
        case "clear":
            return processClearToken(calculatorState, token);
        case "equals":
            return processEqualsToken(calculatorState, token);
        case "percent":
            return processPercentToken(calculatorState, token);
        default:
            throw new Error("Trying to process an improper token.");
    }
}

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

function updateDisplay(calculatorState) {
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
    displayContent = displayContent.map(token => (token === "*") ? "x" : token);
    // round decimal of answer to two places
    if (calculatorState.lhsIsResult) {
        const lhsEnd = displayContent.findIndex(elem => elem === " ");
        if (lhsEnd !== -1) {
            // there is an operator or distinct LHS
            const lhsDecimalIndex = displayContent.findIndex(elem => elem === ".");
            if (lhsDecimalIndex !== -1) {
                // decimal found on lhs
                displayContent = [
                    ...displayContent.slice(0, Math.min(lhsDecimalIndex + 3, lhsEnd)),
                    ...displayContent.slice(lhsEnd)
                ];
            }
        } else {
            // only a "LHS" (result) is availably
            const lhsDecimalIndex = displayContent.findIndex(elem => elem === ".");
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
            updateDisplay(calculatorState);
        }
    }
}

function setupBtns() {
    const container = document.querySelector(".main");
    container.addEventListener("click", buttonClick);
}

setupBtns();