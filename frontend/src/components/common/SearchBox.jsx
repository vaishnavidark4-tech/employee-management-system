import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FiSearch, FiX } from 'react-icons/fi';

// Search input with a "Search" button. The search runs only on submit (not on every key press).
// The parent passes key={value}, so the input resets when the URL changes (browser back / clear filters).
const SearchBox = ({ value, onSearch, placeholder = 'Search...' }) => {
  const [text, setText] = useState(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(text.trim());
  };

  const handleClear = () => {
    setText('');
    onSearch('');
  };

  return (
    <Form onSubmit={handleSubmit} className="search-box">
      <InputGroup>
        <InputGroup.Text className="bg-white">
          <FiSearch />
        </InputGroup.Text>
        <Form.Control
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          maxLength={100}
        />
        {text && (
          <Button variant="outline-secondary" onClick={handleClear} aria-label="Clear search">
            <FiX />
          </Button>
        )}
        <Button type="submit" variant="brand">
          Search
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBox;
