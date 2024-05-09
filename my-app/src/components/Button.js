import React from 'react';

const Button = ({ color, text, text2, image, onClick }) => {
    return (
        <li>
            <button style={{ backgroundColor: color }} onClick={onClick}>
                {image && <img className='btn-icon' src={image} alt="button icon" />}
                <div className='en'>
                    {text}
                </div>
                <div className='ja'>
                    {text2}
                </div>
            </button>
        </li>
    );
};



export default Button;
