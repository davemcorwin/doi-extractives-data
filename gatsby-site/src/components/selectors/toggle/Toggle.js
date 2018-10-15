import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styles from "./Toggle.module.css"

const Toggle = (props) => {

  const onClickHandler = (e, key) => {
    e.stopPropagation();
    let allToggles = e.currentTarget.parentNode.childNodes;

    allToggles.forEach(node => node.classList.remove(styles.selected))
    e.currentTarget.classList.add(styles.selected);

    if(props.toggleAction) {
        props.toggle(e.currentTarget.dataset.value, props.toggleAction);
    }
  }

	return (
		<div className={styles.toggle}>
			{props.toggles &&
				props.toggles.map((toggleButton, index) => {
					let classNames = (toggleButton.default)? styles.selected : "";
					return (			
						<div key={index} type="button" onClick={onClickHandler} className={classNames} data-value={toggleButton.key}>
							{toggleButton.name}
						</div>
					);
				})
			}
		</div>
	);
}

Toggle.propTypes = {
	/** Array of objects for all the toggles. The default selected vlaue should be mark as default: true */
	toggles: PropTypes.array,
	/** This action will be called when a toggle is clicked. */
	toggleAction: PropTypes.func
}

export default connect(
  state => ({}),
  dispatch => ({ toggle: (key, action) => dispatch(action(key)) }),
)(Toggle);
