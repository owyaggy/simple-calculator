let calculator = {
    op1: null,
    op2: null,
    operator: null,
    add() {
        return this.op1 + this.op2;
    },
    subtract() {
        return this.op1 - this.op2;
    },
    multiply() {
        return this.op1 * this.op2;
    },
    divide() {
        if (this.op2 === 0) return "DIV#/0!";
        return this.op1 / this.op2;
    },
    operate() {
        switch (this.operator) {
            case "+":
                return this.add();
            case "-":
                return this.subtract();
            case "*":
                return this.multiply();
            case "/":
                return this.divide();
            default:
                return "error";
        }
    }
}
