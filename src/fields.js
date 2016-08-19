/**
 * The various field specifications. There are only a few of these "built in"
 * but users may implement (or extend) the `Field` interface to make their
 * own. Fields are very notably lacking anything related to display. Because 
 * higherforms doesn't care about that. Our goal is only to manage state and
 * validation.
 * 
 * @module higherform
 */

import invariant from 'invariant';

/**
 * The field base class.
 */
export class Field {
    constructor(validators) {
        validators = validators || [];
        if (!Array.isArray(validators)) {
            validators = [validators];
        }

        invariant(
            validators.filter(v => typeof v === 'function').length === validators.length,
            'All field validators must be functions'
        );

        this.validators = validators;
    }

    /**
     * Returns a plain object of props for the field.
     *
     * @param {Component} form The form component that wraps the value
     * @param {func} changeHandler The change handler 
     * @param {mixed} currentValue the current value of the field
     * @return {object}
     */
    toProps(form, changeHandler, currentValue) {
        return {};
    }

    /**
     * Returns a function suitable for use a change event handler. How
     * this works will depend on the the field. Checkboxes will be different
     * from text inputs, for instance.
     *
     * @param {Component} form The react component
     * @param {func(newValue)} updateValue A function that takes the new value for the field
     * @return {func(event, currentValue)}
     */
    createChangeHandler(form, updateValue) {
        return (event, currentValue) => { };
    }

    /**
     * Provides a way to filter the form value before sending it back to the
     * the end users.
     *
     * Useful if the field keeps extra state for itself.
     *
     * The default is to do nothing.
     *
     * @param {mixed} currentValue the current value of the field to filter
     * @return {mixed|undefined} `undefined` indicates that the value should not
     *         be included in the output sent to the user.
     */
    filterOutput(currentValue) {
        return currentValue;
    }

    /**
     * Filters incoming values -- like mapping props to form data.
     *
     * @param {mixed} inValue
     * @return {mixed}
     */
    filterInput(inValue) {
        return inValue;
    }

    /**
     * Validate the input for the field.
     *
     * @param {string|object} currentValue the value from the form to validate
     * @param {object} ctx The validation context.
     * @return {void}
     */
    validate(currentValue, ctx) {
        this.validators.forEach(v => v(currentValue, ctx));
    }
}

/**
 * A field object suitable for use with any input that uses an onChange event
 * and `value` attribute. So just about everything except radio buttons and
 * check boxes
 */
export class SimpleField extends Field {
    toProps(form, changeHandler, formData) {
        return {
            value: formData,
            onChange: changeHandler,
        };
    }

    createChangeHandler(form, updateValue) {
        return event => {
            updateValue(event.target.value);
        };
    }
}

/**
 * A field object suitable for use with checkboxes and radio buttons.
 */
export class CheckedField extends Field {
    toProps(form, changeHandler, currentValue) {
        return {
            checked: !!currentValue.checked,
            onClick: changeHandler,
        };
    }

    createChangeHandler(form, updateValue) {
        return (event, currentValue) => {
            updateValue({
                checked: !currentValue.checked,
                value: event.target.value, // store the value of the field
            });
        };
    }

    filterOutput(currentValue) {
        return currentValue.checked ? (currentValue.value || currentValue.checked) : undefined;
    }

    filterInput(inValue) {
        return {checked: !!inValue};
    }

    validate(currentValue, ctx) {
        super.validate(this.filterOutput(currentValue), ctx);
    }
}

function sf(validators) {
    return new SimpleField(validators);
}

function cf(validators) {
    return new CheckedField();
}

export const input = sf;
export const textarea = sf;
export const select = sf;
export const checkbox = cf;
export const radio = cf;
