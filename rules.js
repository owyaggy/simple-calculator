export {
    digitAllowed,
    signChangeAllowed,
    operatorAllowed,
    backspaceAllowed,
    clearAllowed,
    decimalAllowed,
    equalsAllowed,
    percentAllowed,
};

/**
 * For decimal point:
 * Max 1 allowed between operators
 * If no operator present, just have to check if there's already a decimal
 * If operator is present, check for a decimal after the operator
 */
function isDecimalAllowed(calculatorState) {
    const tokens = calculatorState.tokens;
    const operators = ["+", "-" ,"*" ,"/"];
    tokens.forEach((token, index) => {
        if (!operators.contains(token)) { // if operator present
            return !tokens.slice(index).contains("."); // decimal -> false, else -> true
        }
    });
    // at this point in execution, confirmed that no operator is present
    return !tokens.contains("."); // decimal -> false, else -> true
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
    const operatorIndex = tokens.findIndex(token => operators.contains(token));
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