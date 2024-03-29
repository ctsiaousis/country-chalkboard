import React from 'react';
import { pushRotate as Menu } from 'react-burger-menu';
import Select from 'react-select'


var aboutStr = "A static website that parses markdown files and images, that depict one's journey/vacations, to project them on a globe.\n"+
"Share your travel experiences in a unique and interactive way!\n"+
"Author: Chris Tsiaousis <ctsiaous@gmail.com>\n"+
"License: GPL v3";

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
        this.handleChange = this.handleChange.bind(this);
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
        if (this.props.updateID !== prevProps.updateID) {
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

    handleChange(selectedOption) {
        console.log(selectedOption.value);
        this.props.parseNext(selectedOption.value);
    }


    render() {
        // NOTE: You also need to provide styles, see https://github.com/negomi/react-burger-menu#styling
        const options = [];
        for (var idx in this.state.filenameList) {
            options.push({ value: this.state.filenameList[idx], label: this.state.filenameList[idx] });
        }
        
        return (
            <Menu width={340} pageWrapId={"map-container-webgl-id"} outerContainerId={"App"}>
                {/* <h1>{this.props.getTitle()}</h1> */}
                <button name="mybutton" onClick={() => alert(aboutStr)}>About</button>
                <a href="https://github.com/ctsiaousis/country-chalkboard" rel="noreferrer" target="_blank">Source Code</a>
                <h3>Select a trip and start exploring 🔭</h3>
                <Select options={options} onChange={this.handleChange} isSearchable={ false }/>
                <div dangerouslySetInnerHTML={{ __html: this.state.currentHtml }} />
            </Menu>
        );
    }
}