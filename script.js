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
 * For operator:
 * Allowed if not currently showing an error
 */
function noError(calculatorState) {
    const firstToken = calculatorState.tokens[0];
    const errorMessages = [
        "Input exceeds limit",
        "Result exceeds limit",
        "div by 0? bruh."
    ];
    return !(errorMessages.includes(firstToken));
}

function lastTokenNotPercent(calculatorState) {
    let lastToken = calculatorState.tokens.at(-1);
    return lastToken !== "%";
}

function lastTokenIsPercent(calculatorState) {
    return !(lastTokenNotPercent(calculatorState));
}

function lastOperandNotPercent(calculatorState) {
    if (!lastTokenNotOperator(calculatorState)) {
        // if last token is an operator
        let penultimateToken = calculatorState.tokens.at(-2);
        return penultimateToken !== "%";
    } else {
        return true;
    }
}

function notZero(calculatorState) {
    if (calculatorState.tokens.length === 1) {
        return calculatorState.tokens[0] !== "0";
    } else {
        return true;
    }
}

/**
 * Rules for digits:
 * - lastTokenNotPercent = true
 */
function digitAllowed(calculatorState) {
    return true;
    //return lastTokenNotPercent(calculatorState);
}

/**
 * Rules for sign change:
 * - tokensPresent = true
 * - notZero = true
 * - lastTokenNotOperator = true
 */
function signChangeAllowed(calculatorState) {
    return tokensPresent(calculatorState) && notZero(calculatorState) && lastTokenNotOperator(calculatorState);
}

/** 
 * Rules for operators:
 * - noError = true
 */
function operatorAllowed(calculatorState) {
    return noError(calculatorState);
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
            completeExpressionPresent(calculatorState) ||
            lastTokenIsPercent(calculatorState)
        )
    );
}

/**
 * Rules for percentage:
 * - noError = true
 * Can use percent at end of operand or to replace operator,
 * which is almost all of the time
 * Exception: can't replace operator if previous operand ends in percent
 * CHANGE: replacing operator removed, so requires lastTokenNotOperator
 */
function percentAllowed(calculatorState) {
    return noError(calculatorState) && lastOperandNotPercent(calculatorState) && lastTokenNotOperator(calculatorState);
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
    let percentIndex = operandTokens.findIndex(token => token === "%");
    if (helperOperandIsNegative(operandTokens)) {
        if (percentIndex === -1) {
            console.log("operand tokens before slice:");
            console.log(operandTokens);
            operandTokens = operandTokens.slice(2, -1); // remove negative indicators
            console.log("operand tokens after slice:");
            console.log(operandTokens);
        } else {
            operandTokens = operandTokens.slice(2, -2);
            operandTokens.push("%");
        }
    } else {
        if (percentIndex === -1) {
            console.log("operand tokens before combining:");
            console.log(operandTokens);
            operandTokens = ['(', 'neg', ...operandTokens,')']; // add negative indicators
            console.log("operand tokens after combining:");
            console.log(operandTokens);
        } else {
            operandTokens = ['(', 'neg', ...operandTokens.slice(0, -1), ')', '%'];
        }
    }
    console.log(operandTokens);
    return operandTokens;
}

/**
 * Converts operand tokens into a floating point number.
 * @param {Array} operandTokens 
 * @return {Number}
 */
function helperParseOperandTokens(operandTokens) {
    let result = null;
    let percent = false;
    let lastToken = operandTokens.at(-1);
    if (lastToken === "%") {
        operandTokens.pop();
        percent = true;
    }
    if (helperOperandIsNegative(operandTokens)) {
        // refactor negative numbers to work with parseFloat
        operandTokens = "-" + operandTokens.slice(2, -1).join("");
        result = parseFloat(operandTokens);
    } else {
        // positive numbers just need to be joined
        operandTokens = operandTokens.join("");
        result = parseFloat(operandTokens);
    }
    if (percent) {
        result /= 100;
    }
    return result;
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
        // if ending token is ")" or "%", insert digit before them
        let lastToken = newCalculatorState.tokens.at(-1);
        let percent = false;
        let negative = false;
        if (lastToken === "%") {
            percent = true;
            newCalculatorState.tokens.pop();
            lastToken = newCalculatorState.tokens.at(-1);
        }
        if (lastToken === ")") {
            negative = true;
            newCalculatorState.tokens.pop();
            // don't update lastToken because not needed
        }
        newCalculatorState.tokens.push(token);
        if (negative) {
            newCalculatorState.tokens.push(")");
        }
        if (percent) {
            newCalculatorState.tokens.push("%");
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
    let percent = false;
    if (lastToken === "%") {
        percent = true;
        newCalculatorState.tokens.pop();
        lastToken = newCalculatorState.tokens.at(-1);
    }
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
    if (percent) {
        newCalculatorState.tokens.push("%");
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
        // no operator path only possible if last operation exists OR percent
        // if percent, divide by 100
        // if no percent, apply last operation
        let lastToken = calculatorState.tokens.at(-1);
        if (lastToken === "%") {
            lhsTokens = calculatorState.tokens.slice(0, -1);
            operator = "/";
            rhsTokens = ["1", "0", "0"];
        } else {
            lhsTokens = calculatorState.tokens;
            operator = calculatorState.lastOperation.operator;
            rhsTokens = calculatorState.lastOperation.rhsTokens;
        }
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
    if (result === "DIV#/0!") {
        newCalculatorState.tokens = ["div by 0? bruh."];
    } else if (lhs > Number.MAX_SAFE_INTEGER || lhs < Number.MIN_SAFE_INTEGER ||
        rhs > Number.MAX_SAFE_INTEGER || rhs < Number.MIN_SAFE_INTEGER
    ) {
        newCalculatorState.tokens = ["Input exceeds limit"];
    } else if (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) {
        newCalculatorState.tokens = ["Result exceeds limit"];
    } else {
        newCalculatorState.tokens = helperConvertToTokens(result);
        newCalculatorState.lastOperation = {
            lhsTokens: lhsTokens,
            operator: operator,
            rhsTokens: rhsTokens,
        };
    }
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
    let lastToken = newCalculatorState.tokens.at(-1);
    let percent = false;
    let negative = newCalculatorState.tokens.at(-1) === ")";
    if (lastToken === "%") {
        percent = true;
        newCalculatorState.tokens.pop();
        lastToken = newCalculatorState.tokens.at(-1);
    }
    if (lastToken === ")") {
        // if number is negative, remove the ending parenthesis (restore later)
        negative = true;
        newCalculatorState.tokens.pop();
        // last token not updated because no longer needed
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

    if (negative) {
        // if number is negative, restore the ending parenthesis
        newCalculatorState.tokens.push(")");
    }
    // if ending in "(-)" (empty negative number), remove negative
    if (newCalculatorState.tokens.slice(-3).join("") === "(neg)") {
        newCalculatorState.tokens = newCalculatorState.tokens.slice(0, -3);
    }
    if (percent && newCalculatorState.tokens.length !== 0) {
        // if number if percent, restore percent symbol
        newCalculatorState.tokens.push("%");
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
/**
 * Percent functionality:
 * - Can only add at the end of an operand, or to replace an operator
 *      - So it can go anywhere?
 * - Nothing can come after it except for an operator
 * - However, a digit with a percent *is* a complete expression
 * - If last token is an operator, adding the % *replaces* the operator
 */
function processPercentToken(calculatorState, token) {
    let newCalculatorState = structuredClone(calculatorState);
    if (newCalculatorState.tokens.length === 0) {
        newCalculatorState.tokens.push("0");
    }
    let lastToken = newCalculatorState.tokens.at(-1);
    const operators = ["+", "-" ,"*" ,"/"]; 
    if (lastToken === "%") {
        // if currently a percentage operand, convert
        percent = true;
        newCalculatorState.tokens.pop(); // remove %
    } else if (operators.includes(lastToken)) {
        // ends in operator, need to replace
        newCalculatorState.tokens.pop();
        newCalculatorState.tokens.push("%");
    } else {
        // not ending in percentage or operator --> add percentage
        newCalculatorState.tokens.push("%");
    }
    return newCalculatorState;
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
        case "s":
            return "sign";
        default:
            return "invalid";
    }
}

function displayCalculation(calculatorState) {
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
                let percent = false;
                if (lhsTokens.at(-1) === "%") {
                    lhsTokens.pop();
                    percent = true;
                }
                lhsTokens = helperRoundOperand(lhsTokens, roundDigits);
                displayContent = [...lhsTokens, ...displayContent.slice(lhsEnd)];
                if (percent) {
                    displayContent.push("%");
                }
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
    return displayContent.join("");
}

function updateDisplay(calculatorState) {
    const display = document.querySelector(".display");
    let firstToken = calculatorState.tokens[0];
    if (firstToken === "Input exceeds limit" ||
        firstToken === "Result exceeds limit" ||
        firstToken === "div by 0? bruh."
    ) {
        display.textContent = firstToken;
    } else {
        display.textContent = displayCalculation(calculatorState);
    }
}

function buttonClick(event) {
    const target = event.target.id;
    console.log(`processing BUTTON click on ${target}`);
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
    const target = processKey(key);
    console.log(`processing KEY click on ${target}`);
    if (target !== "invalid") {
        let buttonClasses = document.querySelector(`#${target}`).classList;
        buttonClasses.add("keydown");
    }
}

function keyUp(event) {
    let key = event.key;
    const target = processKey(key);
    if (target !== "invalid") {
        event.stopImmediatePropagation();
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
// and not currently visible DONE
// TODO: fix backspace not working properly if deleting from a negative number DONE
// TODO: fix display vertical height DONE
// TODO: add last operation view DONE
// TODO: add percent functionality DONE
// TODO: fix adding decimal to a negative number DONE
// TODO: remove console.log statements DONE
// TODO: handle exceeding safe integer limit DONE
// TODO: handle division by 0 DONE
// TODO: fix being able to input = despite last token being an operator if
// lastOperationIsResult is true DONE
// TODO: fix what is possible after an error message is shown
// can't repeat lastOperation, must be able to replace with digit DONE
// TODO: make the whole thing smaller! DONE
// TODO: process calculations when % is involved (operand is divided by 100) DONE
// TODO: make sure percent is sufficient for equals DONE

// TODO: fix display overflow
// TODO: implement last operation display updating
// TODO: fix accessibility/focus and keybindings
// TODO: remove console.log statements
// TODO: add logging for debugging
// TODO: add copy/paste functionality
// TODO: add animations


/**
 * Deal with operator
 */