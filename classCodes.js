import firebase from 'firebase';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';

class ClassCodes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'classCode': undefined
    };
    //function binding
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }  

  handleChange(event) {
    var field = event.target.name;
    var value = event.target.value;

    var changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }

  enterClass(event) {
    event.preventDefault(); //don't submit
    this.props.enterClassCallback(this.state.classCode);    
  }

  render() {
    return(
      <form>
        Class Code: <input type="text" name="classCode" changeCallback={this.handleChange}>
        <button className="btn btn-primary" onClick={(e) => this.enterClass(e)}>Enter Class</button>
      </form>
    )
  }
}
