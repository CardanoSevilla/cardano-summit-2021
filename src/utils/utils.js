export const inputMatchList = [
    {
        text: ('alphanumericAndSpace'),
        expression: /^[\w\s]+$/,
        bool: false
    },
    {
        text: ('charRange'),
        expression: /^.{2,64}$/,
        bool: false
    }
]

/**
 * input validation
 */
export function inputValidate(input) {
    let list = inputMatchList.map(v => {
        if (v.expression.test(input)) {
            v.bool = true;
        } else {
            v.bool = false;
        }
        return v;
    })
    return list
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
