
import React from 'react';
import { pushRotate as Menu } from 'react-burger-menu';


export class SideBar extends React.Component {
    constructor(props) {
        super(props);
        
        // Set initial state 
        this.state = {
            currentHtml: '',
            currentTripIdx: -1,
            currentFilename: '30',
            totalFilenames: 1,
            filenameList: ['']
        }

        console.log("myprops");
        console.log(props);
        
        // Binding this keyword 
        this.updateState = this.updateState.bind(this);
        this.test1 = this.test1.bind(this);
        this.test2 = this.test2.bind(this);
    }

    updateState() {
        // Changing state 
        this.setState(this.props.getState());
    }

    componentDidMount() {
        this.updateState();
      }
      componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.currentTripIdx !== prevProps.currentTripIdx) {
            this.updateState();
        }
      }

    test1() {
        this.updateState();
    }
    test2() {
        this.props.parseNext();
        this.updateState();
    }

    render() {
        // NOTE: You also need to provide styles, see https://github.com/negomi/react-burger-menu#styling
        return (
            <Menu pageWrapId={"map-container-webgl-id"} outerContainerId={"App"}>
      <div dangerouslySetInnerHTML={{ __html: this.state.currentHtml }} />
                <button onClick={this.test1} className="menu-item">Test1</button>
                <button onClick={this.test2} className="menu-item--small">Test2</button>
            </Menu>
        );
    }
}