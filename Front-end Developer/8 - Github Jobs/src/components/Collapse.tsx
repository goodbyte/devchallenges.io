import React, { useState } from 'react';

interface PropTypes extends React.PropsWithChildren {
  label: string;
}

function Collapse(props: PropTypes) {
  const [isVisible, setVisible] = useState(true);

  return (
    <div className="collapse">
      <div className="collapse__label" onClick={ () => setVisible(!isVisible) }>
        <span>{ props.label }</span>
        <span className="material-icons">{ `arrow_drop_${ isVisible ? 'up' : 'down' }` }</span>
      </div>
      <div className="collapse__content" style={{ display: isVisible ? 'block' : 'none' }}>
        { props.children }
      </div>
    </div>
  );
}

export default Collapse;