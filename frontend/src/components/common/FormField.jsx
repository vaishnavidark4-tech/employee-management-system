import { Form } from 'react-bootstrap';

/**
 * Label + input/select/textarea + error message in one reusable component.
 * as="select" needs `options` (array of strings or { value, label, disabled }).
 */
const FormField = ({
  label,
  name,
  value,
  onChange,
  error,
  as = 'input',
  type = 'text',
  options = [],
  placeholder,
  required = false,
  helpText,
  ...rest
}) => {
  const controlId = `field-${name}`;

  const renderControl = () => {
    if (as === 'select') {
      return (
        <Form.Select name={name} value={value} onChange={onChange} isInvalid={!!error} {...rest}>
          <option value="">{placeholder || 'Select...'}</option>
          {options.map((option) => {
            const item = typeof option === 'string' ? { value: option, label: option } : option;
            return (
              <option key={item.value} value={item.value} disabled={item.disabled}>
                {item.label}
              </option>
            );
          })}
        </Form.Select>
      );
    }

    return (
      <Form.Control
        as={as === 'textarea' ? 'textarea' : 'input'}
        type={as === 'textarea' ? undefined : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isInvalid={!!error}
        {...rest}
      />
    );
  };

  return (
    <Form.Group className="mb-3" controlId={controlId}>
      <Form.Label>
        {label}
        {required && <span className="text-danger"> *</span>}
      </Form.Label>
      {renderControl()}
      {helpText && !error && <Form.Text muted>{helpText}</Form.Text>}
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  );
};

export default FormField;
