function add(op1, op2) {
    return op1 + op2;
}

function subtract(op1, op2) {
    return op1 - op2;
}

function multiply(op1, op2) {
    return op1 * op2;
}

function divide(op1, op2) {
    if (op2 === 0) return "DIV#/0!";
    return op1 / op2;
}

function operate(operator, op1, op2) {
    switch (operator) {
        case "add":
            return add(op1, op2);
        case "subtract":
            return subtract(op1, op2);
        case "multiply":
            return multiply(op1, op2);
        case "divide":
            return divide(op1, op2);
        default:
            return "error";
    }
}

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
        case "fn":
            return input;
        default:
            return "error";
    }
}

function setupBtns() {
    const container = document.querySelector(".main");
    container.addEventListener("click", buttonClick);
}

function updateTokens(update) {
    // identify token type: digit, operator, equals, some function?
    if (Number.isInteger(update)) {
        // digit being entered
        if (calculator.operator === null) {
            // operator absent, 1st operand being entered
            if (calculator.op1 === null || (calculator.lastOperation !== null && (!calculator.lastOperation.new))) {
                // 1st operand hasn't receveived any digits yet
                // OR, 1st operand is result of prior calculation
                // and we don't want to edit it
                if (calculator.lastOperation) calculator.lastOperation.new = true;
                if (calculator.op1Type === "dot") {
                    // operand 1 just had a decimal point entered
                    calculator.op1 = update / 10;
                    calculator.op1Type = "float";
                } else {
                    // operand 1 is getting an integer
                    calculator.op1 = update;
                }
            } else {
                // operand 1 has already seen entries
                if (calculator.op1Type === "dot") {
                    // currently adding first digit after decimal
                    calculator.op1 = parseFloat(`${calculator.op1}.${update}`);
                    calculator.op1Type = "float";
                } else if (calculator.op1Type === "float") {
                    // adding 2nd or later digit after decimal
                    calculator.op1 = parseFloat(`${calculator.op1}${update}`);
                } else {
                    // adding another digit to the integer
                    calculator.op1 = parseInt(`${calculator.op1}${update}`);
                }
            }
        } else {
            // operator is present, 2nd operand being entered
            if (calculator.op2 === null) {
                // operand 2 hasn't received any digits yet
                if (calculator.op2Type === "dot") {
                    // operand 2 just had a decimal point entered
                    calculator.op2 = update / 10;
                    calculator.op2Type = "float";
                } else {
                    // operand 2 is getting an integer
                    calculator.op2 = update;
                }
            } else {
                // operand 2 has already seen entries
                if (calculator.op2Type === "dot") {
                    // currently adding first digit after decimal
                    calculator.op2 = parseFloat(`${calculator.op2}.${update}`);
                    calculator.op2Type = "float";
                } else if (calculator.op2Type === "float") {
                    // adding 2nd or later digit after decimal
                    calculator.op2 = parseFloat(`${calculator.op2}${update}`);
                } else {
                    // adding another digit to the integer
                    calculator.op2 = parseInt(`${calculator.op2}${update}`);
                }
            }
        }
    } else if (["add", "subtract", "multiply", "divide"].includes(update)) {
        // operator being entered
        if (calculator.operator === null) {
            // no operator has been entered yet, add it
            calculator.operator = update;
        } else {
            // an operator has already been added
            if (calculator.op2 === null) {
                // still missing second operand
                // so this update is changing existing operator
                calculator.operator = update;
            } else {
                // a second operand has been entered
                // TODO: need to evaluate expression so far -> op1
                calculator.op1 = operate(calculator.operator, calculator.op1, calculator.op2);
                calculator.lastOperation = {operator: calculator.operator, op2: calculator.op2};
                calculator.operator = update;
                calculator.op2 = null;
                calculator.op2Type = "int";
                // check if op1 is now int and adjust accordingly
                // TODO
            }
        }
    } else if (update === "decimal") {
        // decimal selected
        if (calculator.operator === null) {
            // still entering 1st operand
            if (calculator.op1Type === "int") {
                // haven't entered decimal yet
                calculator.op1Type = "dot";
            }
        } else {
            // entering 2nd operand
            if (calculator.op2Type === "int") {
                // haven't entered decimal yet
                calculator.op2Type = "dot";
            }
        }
    } else if (update === "sign") {
        // sign selected
        // TODO
    } else if (update === "backspace") {
        // backspace selected
        // TODO
    } else if (update === "clear") {
        // clear selected
        calculator.op1 = null;
        calculator.op2 = null;
        calculator.op1Type = "int";
        calculator.op2Type = "int";
        calculator.lastOperation = null;
    } else if (update === "fn") {
        // fn selected
        // TODO
    } else {
        // equals selected
        if (calculator.op2 === null) {
            // 2nd operand does not exist
            // perform last operation if it exists, otherwise do nothing
            if (calculator.lastOperation) {
                // last operation exists
                // perform last operation again
                calculator.op1 = operate(calculator.lastOperation.operator, calculator.op1, calculator.lastOperation.op2);
                calculator.lastOperation.new = false;
                // check if op1 is now integer and adjust accordingly
                // TODO
            }
        } else {
            // 2nd operand has been entered
            // perform operation based on symbols currently entered
            calculator.op1 = operate(calculator.operator, calculator.op1, calculator.op2);
            calculator.lastOperation = {operator: calculator.operator, op2: calculator.op2};
            calculator.operator = null;
            calculator.op2 = null;
            calculator.op2Type = "int";
            // check if op1 is now integer and adjust accordingly
            // TODO
        }
    }
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

function updateDisplay() {
    const display = document.querySelector(".display");
    // code to update the display
    let text = "";
    if (calculator.op1 !== null) {
        if (calculator.lastOperation && calculator.op1Type === "float") {
            text += calculator.op1.toFixed(2);
        } else {
            text += calculator.op1;
        }
    }
    if (calculator.op1Type === "dot") text += ".";
    if (calculator.operator) {
        if (calculator.operator === "add") {
            text += " +";
        } else if (calculator.operator === "subtract") {
            text += " -";
        } else if (calculator.operator === "multiply") {
            text += " x";
        } else {
            text += " ÷";
        }
    }
    if (calculator.op2 !== null) text += " " + calculator.op2;
    if (calculator.op2Type === "dot") text += ".";
    display.textContent = text;
}

let calculator = {
    op1: null,
    op2: null,
    op1Type: "int", // int, dot, float
    op2Type: "int", // int, dot, float
    lastOperation: {}, // e.g.: {operator: "multiply", op2: 6}
    operator: null,
}

setupBtns();