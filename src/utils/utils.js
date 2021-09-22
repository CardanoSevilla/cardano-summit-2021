export const inputMatchList = [
    {
        text: ('alphanumericAndSpace'),
        expression: /^[\w\s]+$/,
        bool: false
    },
    {
        text: ('charRange'),
        expression: /.{2,64}/,
        bool: false
    }
]

/**
 * input validation
 */
export function inputValidate(input) {
    return inputMatchList.map(v => {
        v.bool = v.expression.test(input);
        return v;
    });
}

/**
 * Check final validation from validations list
 */
export function checkValidationList(validatedList) {
    let isValid = true;
    for (let index = 0; index < validatedList.length; index++) {
        const ruleItem = validatedList[index];
        if (!ruleItem.bool) {
            isValid = false;
            break;
        }
    }
    return isValid;
}
