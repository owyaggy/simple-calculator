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
function helperOperandIsPositive(operandTokens) {
    return operandTokens.includes('neg');
}

/**
 * Flips the sign of the given operand, as represented by its component tokens.
 * @param {Array} operandTokens 
 * @returns {Array}
 */
function helperToggleSign(operandTokens) {
    if (helperOperandIsPositive(operandTokens)) {
        operandTokens = ['(', 'neg', ...operandTokens, ,')']; // add negative indicators
    } else {
        operandTokens = operandTokens.slice(2, -1); // remove negative indicators
    }
    return operandTokens;
}

/**
 * Converts operand tokens into a floating point number.
 * @param {Array} operandTokens 
 * @return {Number}
 */
function helperParseOperandTokens(operandTokens) {
    if (!helperOperandIsPositive(operandTokens)) {
        // refactor negative numbers to work with parseFloat
        operandTokens = "-" + operandTokens.slice(2, -1).join("");
        return parseFloat(operandTokens);
    } else {
        // positive numbers just need to be joined
        operandTokens.join("");
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
    if (newCalculatorState.tokens[-1] !== 0) {
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
    return [...lhs, calculatorState.tokens[operatorIndex], ...rhs];
}

/**
 * New equals token
 */
function processEqualsToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    const operatorIndex = helperFindOperator(calculatorState.tokens);
    let operator = null;
    let lhsTokens = newCalculatorState.tokens.slice(0, operatorIndex);
    let rhsTokens = null;
    if (operatorIndex === -1) {
        // no operator path only possible if last operation exists
        // apply last operation
        operator = calculatorState.lastOperation.operator;
        rhsTokens = calculator.lastOperation.rhsTokens;
    } else {
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
}

/**
 * New operator token
 */
function processOperatorToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    const operatorIndex = helperFindOperator(calculatorState.tokens);
    if (operatorIndex < calculatorState.tokens.length - 1) {
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
    switch (token) {
        case !(isNaN(parseInt(token))):
            return processDigitToken(calculatorState, token);
        case ".":
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
        case "percent":
            return processPercentToken(calculatorState, token);
        default:
            throw new Error("Trying to process an improper token.");
    }
}