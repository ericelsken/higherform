import { fields } from '../../src';

describe('fields/Field', function () {
    it('should error when given validators that are not functions', function () {
        assert.throws(() => {
            new fields.Field('notAFunction');
        }, /must be functions/);
    });

    it('should call the provided validators with the formData and context', function () {
        let args = null;
        let formData = {one: 'two'};
        let ctx = {addViolation: () => {}};
        let field = new fields.Field(function () {
            args = arguments;
        });

        field.validate(formData, ctx);

        assert.isNotNull(args);
        assert.strictEqual(args[0], formData);
        assert.strictEqual(args[1], ctx);
    });

    describe('#filterOutput', function () {
        it('should not alter the currentValue', function () {
            let field = new fields.Field();

            assert.strictEqual(field.filterOutput('formData'), 'formData');
        });
    });

    describe('#filterInput', function () {
        const field = new fields.Field();
        it('should not alter the inValue', function () {
            assert.strictEqual(field.filterInput('inData'), 'inData');
        });

        it('should return an empty string when given `undefined` (@regression)', function () {
            assert.strictEqual(field.filterInput(undefined), '');
        });

        it('should return an empty string when given `null` (@regression)', function () {
            assert.strictEqual(field.filterInput(null), '');
        });

        it('should return an empty string when given `false` (@regression)', function () {
            assert.strictEqual(field.filterInput(false), '');
        });
    });

    describe('#toMethods(props)', function () {
        const field = new fields.Field();
        const name = 'example';

        it('returns a set of props with the value and onChange set', function () {
            let value = 'test';
            let updateValue = v => {}

            let props = field.toMethods(name, updateValue, () => value).props();

            assert.property(props, 'value');
            assert.equal(props.value, 'test');
            assert.property(props, 'onChange');
            assert.typeOf(props.onChange, 'function');
            assert.property(props, 'name');
            assert.equal(props.name, name);
        });

        it('should create a change handler that updates the form with the value from the event', function () {
            let value = null;
            let updateValue = v => value = v;
            let onChange = field.toMethods(name, updateValue, () => '').props().onChange;

            onChange({target: {value: 'test'}}, value);

            assert.equal(value, 'test');
        });
    });

    describe('#toMethods(setValue)', function () {
        const field = new fields.Field();
        const name = 'example';

        it('should update the value via the updateValue callback', function () {
            let value = 'initial';
            let updateValue = v => value = v;

            field.toMethods(name, updateValue, () => value).setValue('changed');

            assert.equal(value, 'changed');
        });

        it('should set the value to an empty string when its empty', function () {
            let value = 'initial';
            let updateValue = v => value = v;

            field.toMethods(name, updateValue, () => value).setValue(null);

            assert.equal(value, '');
        });
    });
});
