import React, { useState } from 'react';

const DropdownInput = () => {
    const [selected, setSelected] = useState("Select an option");

    const handleSelect = (event) => {
        const value = event.target.textContent;
        setSelected(value);
    };

    return (
        <div className="dropdown">
            <button
                className="btn btn-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {selected}
            </button>
            <ul className="dropdown-menu">
                <li><button className="dropdown-item" onClick={handleSelect}>Option 1</button></li>
                <li><button className="dropdown-item" onClick={handleSelect}>Option 2</button></li>
                <li><button className="dropdown-item" onClick={handleSelect}>Option 3</button></li>
            </ul>
        </div>
    );
};

export default DropdownInput;
