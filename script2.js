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
    // for purposes of validation, convert operands to positive numbers
    let lhsTokens = tokens.slice(0, operatorIndex);
    let rhsTokens = tokens.slice(operatorIndex + 1);
    if (helperOperandIsNegative(lhsTokens)) {
        lhsTokens = helperToggleSign(lhsTokens);
    }
    if (helperOperandIsNegative(rhsTokens)) {
        rhsTokens = helperToggleSign(rhsTokens);
    }
    const lhs = lhsTokens.join("");
    const rhs = rhsTokens.join("");
    // expression complete if parseFloat of lhs and rhs are each not NaN
    return !isNaN(parseFloat(lhs)) && !isNaN(parseFloat(rhs));
}

/** 
 * For sign change:
 * Allowed if last token is not an operation
 */
function lastTokenNotOperator(calculatorState) {
    const operators = ["+", "-" ,"*" ,"/"];
    return !(operators.includes(calculatorState.tokens.at(-1)));
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
 * - lastTokenNotOperator = true
 */
function signChangeAllowed(calculatorState) {
    return tokensPresent(calculatorState) && lastTokenNotOperator(calculatorState);
}

/** 
 * Rules for operators:
 * - tokensPresent = true
 */
function operatorAllowed(calculatorState) {
    //return tokensPresent(calculatorState);
    return true;
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
        operandTokens = ['(', 'neg', ...operandTokens,')']; // add negative indicators
    }
    return operandTokens;
}

/**
 * Converts operand tokens into a floating point number.
 * @param {Array} operandTokens 
 * @return {Number}
 */
function helperParseOperandTokens(operandTokens) {
    if (helperOperandIsNegative(operandTokens)) {
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
 * 
 * @param {Array} operand
 * @param {number} digits The number of digits to round to
 * @returns {Array}
 */
function helperRoundOperand(operand, digits) {
    // record if negative
    const isNegative = helperOperandIsNegative(operand);
    if (isNegative) { // convert to positive
        operand = helperToggleSign(operand);
    }
    operand = operand.join(""); // convert array -> stirng
    operand = parseFloat(operand); // convert string -> float
    operand = ( // round float
        Math.round(operand * (10 ** digits)) / 
        (10 ** digits)
    );
    if (isNegative) { // convert back to negative if necessary
        operand = ['(', 'neg', ...operand.toString().split(""), ')']; // float --> array
    } else {
        operand = operand.toString().split(""); // float -> string -> array
    }
    return operand;
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
        // if ending token is ")", insert digit before
        if (newCalculatorState.tokens.at(-1) === ")") {
            newCalculatorState.tokens.pop();
            newCalculatorState.tokens.push(token, ")");
        } else {
            newCalculatorState.tokens.push(token);
        }
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
    let lastToken = newCalculatorState.tokens.at(-1);
    let negative = false;
    if (lastToken === ")") {
        negative = true;
        newCalculatorState.tokens.pop();
        lastToken = newCalculatorState.tokens.at(-1);
    }
    if (!Number.isInteger(lastToken)) {
        newCalculatorState.tokens.push(0);
    }
    newCalculatorState.tokens.push(".");
    if (negative) {
        newCalculatorState.tokens.push(")");
    }
    return newCalculatorState;
}

/**
 * New sign change token
 */
function processSignChangeToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    const operatorIndex = helperFindOperator(calculatorState.tokens);
    let lhs = null;
    let rhs = [];
    if (operatorIndex === -1) {
        lhs = newCalculatorState.tokens;
        // modifying LHS
        lhs = helperToggleSign(lhs);
        newCalculatorState.tokens = [...lhs];
        return newCalculatorState;
    } else {
        lhs = newCalculatorState.tokens.slice(0, operatorIndex);
        rhs = newCalculatorState.tokens.slice(operatorIndex + 1);
        // modifying RHS
        rhs = helperToggleSign(rhs);
        // return LHS, operator, RHS in flat array
        newCalculatorState.tokens = [...lhs, calculatorState.tokens[operatorIndex], ...rhs];
        return newCalculatorState;
    }
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
        // introducing a second operator! handle using equals processor
        newCalculatorState = processEqualsToken(calculatorState, token);
    } else if (operatorIndex === calculatorState.tokens.length - 1 && operatorIndex !== -1) {
        newCalculatorState.tokens.pop(); // remove last operator
    } else if (calculatorState.tokens.length === 0) {
        newCalculatorState.tokens.push(0);
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
    newCalculatorState.lastOperation = null;
    return newCalculatorState;
}

/**
 * New backspace token
 * Backspace rules for rounded numbers: deletes the first visible token
 */
function processBackspaceToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    let preserveNegative = newCalculatorState.tokens.at(-1) === ")";
    if (preserveNegative) {
        // if number is negative, remove the ending parenthesis (restore later)
        newCalculatorState.tokens.pop();
    }

    let operatorIndex = helperFindOperator(newCalculatorState.tokens);
    if (operatorIndex === -1) {
        // deleting rounded number only possible if no operator present
        if (newCalculatorState.tokens.includes(".")) {
            // includes a decimal
            let decimalIndex = newCalculatorState.tokens.findIndex(
                token => token === "."
            );
            // change underlying representation to visual representation
            // (specified rounding precision)
            newCalculatorState.tokens = newCalculatorState.tokens.slice(
                0, decimalIndex + (roundDigits + 1)
            );
        }
    }

    // remove last character by default
    newCalculatorState.tokens.pop();

    if (preserveNegative) {
        // if number is negative, restore the ending parenthesis
        newCalculatorState.tokens.push(")");
    }
    // if ending in "(-)" (empty negative number), remove negative
    if (newCalculatorState.tokens.slice(-3).join("") === "(neg)") {
        newCalculatorState.tokens = newCalculatorState.tokens.slice(0, -3);
    }
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

let roundDigits = 4;

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
        case "backspace-svg":
        case "backspace-path-1":
        case "backspace-path-2":
            return "backspace";
        default:
            return "error";
    }
}

function processKey(input) {
    switch (input) {
        case "0":
            return "zero";
        case "1":
            return "one";
        case "2":
            return "two";
        case "3":
            return "three";
        case "4":
            return "four";
        case "5":
            return "five";
        case "6":
            return "six";
        case "7":
            return "seven";
        case "8":
            return "eight";
        case "9":
            return "nine";
        case "+":
            return "add";
        case "-":
            return "subtract";
        case "*":
        case "x":
            return "multiply";
        case "/":
        case "÷":
            return "divide";
        case "c":
        case "C":
            return "clear";
        case "Backspace":
            return "backspace";
        case ".":
            return "decimal";
        case "=":
        case "Enter":
            return "equals";
        case "%":
            return "percent";
        case " ":
            return "sign";
        default:
            return "invalid";
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
    // round decimal of answer to two places
    if (calculatorState.lhsIsResult) {
        const lhsEnd = displayContent.findIndex(elem => elem === " ");
        if (lhsEnd !== -1) {
            // there is an operator or distinct LHS
            const lhsDecimalIndex = displayContent.findIndex(elem => elem === ".");
            if (lhsDecimalIndex !== -1) {
                // decimal found on lhs
                let lhsTokens = displayContent.slice(0, lhsEnd);
                lhsTokens = helperRoundOperand(lhsTokens, roundDigits);
                displayContent = [...lhsTokens, ...displayContent.slice(lhsEnd)];
            }
        } else {
            // only a "LHS" (result) is availably
            const lhsDecimalIndex = displayContent.findIndex(elem => elem === ".");
            if (lhsDecimalIndex !== -1) {
                // decimal found on LHS
                displayContent = helperRoundOperand(displayContent, roundDigits);
            }
        }
    }
    displayContent = displayContent.map(token => (token === "neg") ? "-" : token);
    displayContent = displayContent.map(token => (token === "/") ? "÷" : token);
    displayContent = displayContent.map(token => (token === "*") ? "x" : token);
    if (displayContent.length === 0) {
        displayContent.push(0);
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

function keyDown(event) {
    let key = event.key;
    console.log(key);
    const target = processKey(key);
    if (target !== "invalid") {
        let buttonClasses = document.querySelector(`#${target}`).classList;
        buttonClasses.add("keydown");
    }
}

function keyUp(event) {
    let key = event.key;
    const target = processKey(key);
    if (target !== "invalid") {
        let buttonClasses = document.querySelector(`#${target}`).classList;
        buttonClasses.remove("keydown");
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
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
}

setupBtns();
updateDisplay(calculatorState);

// TODO: why is sign change allowed for empty second operand? DONE
// TODO: fix editing a negative number DONE
// TODO: fix backspace not working properly if deleting something that is rounded
// and not currently visible
// TODO: fix backspace not working properly if deleting from a negative number DONE
// TODO: fix display overflow
// TODO: fix display vertical height
// TODO: add last operation view
// TODO: add percent functionality
// TODO: fix adding decimal to a negative number DONE
// TODO; display really long, but simplifiable, numbers in scientific notation
// TODO: remove console.log statements
// TODO: add some sort of indicator for when a number is rounded
// TODO: handle exceeding safe integer limit
// TODO: handle division by 0
// TODO: fix being able to input = despite last token being an operator if
// lastOperationIsResult is true