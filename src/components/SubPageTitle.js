import React from 'react';
import PropTypes from 'prop-types';
import '../css/SubPageTitle.css';

const SubPageTitle = ({ title, backgroundColor }) => {

  const goBack = () => {
    window.history.back(); // Homeに戻るためにnavigate関数を使用してURLを指定
  };

  
  return (
    <div className='SubPageTitle' style={{ backgroundColor }}>
      <div className='inner'>
        <button onClick={goBack}>&lt;</button>
        <h2><span className='en'>{title.en}</span> {title.ja}</h2>
      </div>
    </div>
  );
};

SubPageTitle.propTypes = {
  title: PropTypes.shape({
    en: PropTypes.string.isRequired,
    ja: PropTypes.string.isRequired
  }).isRequired,
  backgroundColor: PropTypes.string.isRequired
};

export default SubPageTitle;
