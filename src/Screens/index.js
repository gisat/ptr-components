import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './style.scss';
import Screen from './components/Screen';

const RETRACTED_WIDTH = 5;
const CONST_PLUS = 1;

class Screens extends React.PureComponent {
	static propTypes = {
		set: PropTypes.shape({
			orderBySpace: PropTypes.array,
			orderByHistory: PropTypes.array,
		}),
		screens: PropTypes.object,
		onCloseScreen: PropTypes.func,
		onFocusScreen: PropTypes.func,
		onOpenScreen: PropTypes.func,
		onRetractScreen: PropTypes.func,
		baseActiveWidth: PropTypes.number,
	};

	static defaultProps = {
		baseActiveWidth: 40,
	};

	constructor(props) {
		super(props);

		this.state = {
			width: null,
		};

		this.ref = this.ref.bind(this);
		this.resize = this.resize.bind(this);
	}

	componentDidMount() {
		this.resize();
		if (window) window.addEventListener('resize', this.resize, {passive: true}); //todo IE
	}

	componentWillUnmount() {
		if (window) window.removeEventListener('resize', this.resize);
	}

	resize() {
		let remSize = null;
		let pxWidth = null;
		//todo devicePixelRatio?

		// get available width
		if (this.el && typeof this.el.clientWidth !== 'undefined') {
			pxWidth = this.el.clientWidth;
		}

		// get current base font size (rem)
		if (document && document.documentElement) {
			remSize = getComputedStyle(document.documentElement).fontSize;
			remSize = Number(remSize.slice(0, -2)); // "16px" -> 16
		}

		// update available width in rem (if needed)
		if (pxWidth && remSize) {
			let width = pxWidth / remSize;
			if (width !== this.state.width) {
				this.setState({width});
			}
		}
	}

	ref(el) {
		this.el = el;
	}

	render() {
		return (
			<div className="ptr-screens" ref={this.ref}>
				{this.renderScreens()}
			</div>
		);
	}

	renderScreens() {
		if (this.state.width && this.props.set) {
			let screens = {};
			let orderByHistory = [...this.props.set.orderByHistory].reverse();
			let orderBySpace = [...this.props.set.orderBySpace];

			// add any possible children as first screen
			if (this.props.children) {
				if (!_.includes(orderByHistory, 'base')) {
					orderByHistory.push('base');
				}
				if (!_.includes(orderBySpace, 'base')) {
					orderBySpace.unshift('base');
				}
			}

			// compute open screens
			let overallRetractedWidth = orderByHistory.length * RETRACTED_WIDTH;
			let availableWidthLeft = this.state.width - overallRetractedWidth;

			// check if there is enough space for first open screen
			let maximalizedScreenLineage = null;
			let baseFirstOpen = false;
			let otherFirstOpen = false;
			orderByHistory.forEach(lineage => {
				screens[lineage] = {lineage};
				let stateScreen = this.props.screens[lineage];

				if (!maximalizedScreenLineage && !baseFirstOpen && !otherFirstOpen) {
					if (
						stateScreen &&
						stateScreen.data &&
						stateScreen.data.desiredState === 'open'
					) {
						// screen does not fit
						if (
							stateScreen.data.width + CONST_PLUS >
							availableWidthLeft + RETRACTED_WIDTH
						) {
							maximalizedScreenLineage = stateScreen.lineage;
						} else {
							otherFirstOpen = true;
						}
					}

					if (lineage === 'base') {
						baseFirstOpen = true;
					}
				}

				if (
					stateScreen &&
					stateScreen.data &&
					stateScreen.data.desiredState === 'closing'
				) {
					availableWidthLeft += RETRACTED_WIDTH;
				}
			});

			if (!maximalizedScreenLineage) {
				let focusedScreenAlreadySelected = false;
				orderByHistory.forEach(
					function (lineage, index) {
						let stateScreen = this.props.screens[lineage];
						if (!availableWidthLeft) {
							screens[lineage].computedWidth = RETRACTED_WIDTH;
							screens[lineage].computedDisabled = true;
						} else {
							if (stateScreen && stateScreen.data && stateScreen.data.width) {
								if (stateScreen.data.desiredState === 'open') {
									if (
										stateScreen.data.width + CONST_PLUS <=
										availableWidthLeft + RETRACTED_WIDTH
									) {
										screens[lineage].computedWidth =
											stateScreen.data.width + CONST_PLUS;
									} else {
										screens[lineage].computedWidth =
											availableWidthLeft + RETRACTED_WIDTH;
										screens[lineage].computedDisabled = true;
									}
									availableWidthLeft -=
										screens[lineage].computedWidth - RETRACTED_WIDTH;
								} else if (stateScreen.data.desiredState === 'retracted') {
									screens[lineage].computedWidth = RETRACTED_WIDTH;
									screens[lineage].computedDisabled = true;
								} else if (stateScreen.data.desiredState === 'opening') {
									screens[lineage].computedWidth = 0;
									screens[lineage].computedDisabled = false;
									availableWidthLeft -=
										stateScreen.data.width - RETRACTED_WIDTH;
								} else {
									screens[lineage].computedWidth = 0;
									screens[lineage].computedDisabled = true;
								}
							} else {
								if (
									stateScreen &&
									stateScreen.data &&
									stateScreen.data.desiredState === 'retracted'
								) {
									screens[lineage].computedWidth = RETRACTED_WIDTH;
									screens[lineage].computedDisabled = true;
								} else if (
									stateScreen &&
									stateScreen.data &&
									stateScreen.data.desiredState === 'closing'
								) {
									screens[lineage].computedWidth = 0;
									screens[lineage].computedDisabled = true;
								} else {
									let enoughSpaceAvailable =
										this.props.baseActiveWidth + CONST_PLUS <=
										availableWidthLeft + RETRACTED_WIDTH;
									if (
										lineage === 'base' &&
										(baseFirstOpen || enoughSpaceAvailable)
									) {
										screens[lineage].computedWidth =
											this.props.baseActiveWidth + CONST_PLUS;
										availableWidthLeft -=
											this.props.baseActiveWidth - RETRACTED_WIDTH;
									} else {
										screens[lineage].computedWidth =
											availableWidthLeft + RETRACTED_WIDTH;
										availableWidthLeft = 0;
									}

									if (lineage === 'base' && !baseFirstOpen) {
										screens[lineage].computedDisabled =
											screens[lineage].computedWidth <
											this.props.baseActiveWidth;
									}
								}
							}
						}

						let closing =
							stateScreen && stateScreen.data.desiredState === 'closing';
						if (
							!focusedScreenAlreadySelected &&
							(closing || !screens[lineage].computedDisabled)
						) {
							screens[lineage].focused = true;
							focusedScreenAlreadySelected = true;
						}
					}.bind(this)
				);
			} else {
				orderByHistory.forEach(lineage => {
					if (lineage !== maximalizedScreenLineage) {
						screens[lineage].computedDisabled = true;
						screens[lineage].computedWidth = 0;
					} else {
						screens[lineage].computedWidth = this.state.width;
						screens[lineage].focused = true;
						screens[lineage].minActiveWidth = 0;
					}
				});
			}

			let screenComponents = [];
			orderBySpace.forEach(screenLineage => {
				let screen = screens[screenLineage];

				let stateScreen = this.props.screens[screenLineage];
				if (
					stateScreen &&
					stateScreen.data &&
					(stateScreen.data.minActiveWidth || screen.minActiveWidth)
				) {
					screen.minActiveWidth = screen.hasOwnProperty('minActiveWidth')
						? screen.minActiveWidth
						: stateScreen.data.minActiveWidth;
				}
				if (stateScreen && stateScreen.data && stateScreen.data.width) {
					screen.contentWidth = stateScreen.data.width
						? stateScreen.data.width
						: null;
				}

				if (screenLineage === 'base') {
					let content = this.props.children;
					if (screen.computedDisabled) {
						content = React.cloneElement(this.props.children, {
							unfocusable: true,
						});
					}
					screenComponents.push(this.renderScreen(screen, content, true));
				} else {
					screenComponents.push(
						this.renderScreen(
							screen,
							React.createElement(
								stateScreen.data.component,
								{
									...stateScreen.data.props,
									unfocusable: screen.computedDisabled,
								},
								null
							)
						)
					);
				}
			});

			return screenComponents;
		} else if (this.props.children) {
			let screen = {
				lineage: 'base',
			};
			return this.renderScreen(screen, this.props.children, true);
		} else {
			return null;
		}
	}

	renderScreen(screen, content, noControls) {
		return (
			<Screen
				key={screen.lineage}
				lineage={screen.lineage}
				focused={screen.focused}
				disabled={screen.computedDisabled}
				width={screen.computedWidth}
				minWidth={screen.minActiveWidth}
				content={content}
				contentWidth={screen.contentWidth}
				onFocus={this.props.onFocusScreen}
				onCloseClick={this.props.onCloseScreen}
				onOpenClick={this.props.onOpenScreen}
				onRetractClick={this.props.onRetractScreen}
				noControls={noControls}
			/>
		);
	}
}

export default Screens;
