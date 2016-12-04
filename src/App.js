import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import { Link } from 'react-router';
import firebase from 'firebase';
import { Alert } from 'react-bootstrap';
import MakeQuestion from './MakeQuestion';
//import noUserPic from './img/no-user-pic.png';
//import { PostBox, PostList, ChannelList, CHANNEL } from './Posts';

var LOGIN = true;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.signIn = this.signIn.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log('Auth state changed: logged in as', user.email);
        this.setState({ userId: user.uid });
      }
      else {
        console.log('Auth state changed: logged out');
        this.setState({ userId: null }); //null out saved state
      }
    })
  }

  // Registering new users
  signUp(email, password, handle, avatar) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function (firebaseUser) {
        var profilePromise = firebaseUser.updateProfile({
          displayName: handle,
          photoURL: avatar
        });
        // creating new entry in the Cloud DB
        var userRef = firebase.database().ref('users/' + firebaseUser.uid);
        var userData = {
          handle: handle,
          avatar: avatar
        }
        var userPromise = userRef.set(userData); //update entry in JOITC
        return Promise.all(profilePromise, userPromise);
      })
      .then(() => this.forceUpdate())
      .catch((err) => console.log("ERROR: " + err));
  }

  // Logging in existing users
  signIn(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch((err) => {
        this.setState({ passwordAlert: true });
      })
  }

  // Logging out the current user
  signOut() {
    firebase.auth().signOut();
  }

  render() {
    var content = null; //what main content to show
    if (this.state.passwordAlert) {
      var passwordAlertTag = <Alert bsStyle="warning"><strong>Password is incorrect for username!</strong> Please try again.</Alert>;
    }
    if (!this.state.userId) { //if logged out, show signup form
      if (LOGIN) {
        content = <Login signInCallback={this.signIn} passwordAlert={passwordAlertTag} />;
      } else {
        content = <Join signUpCallback={this.signUp} />;
      }
    }
    else {
      content = <Questions logged={this.state.userId} signUpCallback={this.signUp} signInCallback={this.signIn} />;
    }

    return (
      <div>
        <header className="container-fluid">
          <h1>- manapoll -</h1>
          {this.state.userId &&
            <div className="logout">
              <button className="btn btn-primary" onClick={() => this.signOut()}>Sign out {firebase.auth().currentUser.displayName}</button>
            </div>
          }
        </header>
        <main className="container">
          {content}
        </main>
      </div>
    );
  }
}

export class Questions extends React.Component {
  render() {
    if (!this.props.logged) { // not logged in
      return (
        <Login signUpCallback={this.props.signUpCallback} signInCallback={this.props.signInCallback} />
      )
    } else { // logged in
      return (
        <div>
          <MakeQuestion />
        </div>
      );
    }
  }
}

class Login extends React.Component {
  render() {
    return (
      <div>
        <SignInForm signInCallback={this.props.signInCallback} />
        {this.props.passwordAlert}
      </div>
    );
  }
}

class Join extends React.Component {
  render() {
    return (
      <SignUpForm signUpCallback={this.props.signUpCallback} />
    );
  }
}

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'email': undefined,
      'password': undefined,
      'passwordConfirm': undefined,
      'handle': undefined,
      'classCode': undefined,
      'avatar': ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    LOGIN = true;
  }

  //update state for each specific field
  handleChange(event) {
    var field = event.target.name;
    var value = event.target.value;
    var changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }

  //handle signUp button
  signUp(event) {
    event.preventDefault(); //don't submit
    this.props.signUpCallback(this.state.email, this.state.password, this.state.handle, this.state.classCode, this.state.avatar);
  }

  // code provided by Joel Ross
  /**
   * A helper function to validate a value based on a hash of validations
   * second parameter has format e.g., 
   * {required: true, minLength: 5, email: true}
   * (for required field, with min length of 5, and valid email)
   */
  validate(value, validations) {
    var errors = { isValid: true, style: '' };

    if (value !== undefined) { //check validations
      //handle required
      if (validations.required && value === '') {
        errors.required = true;
        errors.isValid = false;
      }

      //handle minLength
      if (validations.minLength && value.length < validations.minLength) {
        errors.minLength = validations.minLength;
        errors.isValid = false;
      }

      //handle email type
      if (validations.email) {
        //pattern comparison from w3c
        //https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
        var valid = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)
        if (!valid) {
          errors.email = true;
          errors.isValid = false;
        }
      }

      // handle password matching
      if (validations.matches) {
        if (this.state.passwordConfirm !== value) {
          errors.matches = true;
          errors.isValid = false;
        }
      }
    }

    //display details
    if (!errors.isValid) { //if found errors
      errors.style = 'has-error';
    }
    else if (value !== undefined) { //valid and has input
      errors.style = 'has-success' //show success coloring
    }
    else { //valid and no input
      errors.isValid = false; //make false anyway
    }
    return errors; //return data object
  }

  render() {
    //field validation
    var emailErrors = this.validate(this.state.email, { required: true, email: true });
    var passwordErrors = this.validate(this.state.password, { required: true, minLength: 6, matches: true });
    var passwordErrorsForSignIn = this.validate(this.state.password, { required: true, minLength: 6 });
    var passwordConfirmErrors = this.validate(this.state.passwordConfirm, { required: true });
    var handleErrors = this.validate(this.state.handle, { required: true, minLength: 3 });
    var classCodeErrors = this.validate(this.state.classCode, { required: true, minLength: 6 });
    //button validation
    var signUpEnabled = (emailErrors.isValid && passwordErrors.isValid && handleErrors.isValid && passwordConfirmErrors.isValid && classCodeErrors.isValid);

    return (
      <form role="form" className="sign-up-form">
        <ValidatedInput field="email" type="email" label="Email" changeCallback={this.handleChange} errors={emailErrors} />
        <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />
        <ValidatedInput field="passwordConfirm" type="password" label="Confirm Password" changeCallback={this.handleChange} errors={passwordConfirmErrors} />
        <ValidatedInput field="handle" type="text" label="Handle" changeCallback={this.handleChange} errors={handleErrors} />
        <ValidatedInput field="classCode" type="text" label="Please Input Class Code:" changeCallback={this.handleChange} errors={classCodeErrors} />

        {/* We don't need avatar, but maybe something else?
          <div className="form-group">
            <img className="avatar" src={this.state.avatar || noUserPic} alt="avatar preview" />
            <label htmlFor="avatar" className="control-label">Avatar Image URL</label>
            <input id="avatar" name="avatar" className="form-control" placeholder="http://www.example.com/my-picture.jpg" onChange={this.handleChange} />
          </div>*/}

        <div className="form-group sign-up-buttons">
          <button className="btn btn-primary" disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign-up</button>
          <button className="btn" onClick={this.handleClick}><Link to="/login" className="link">Have an account? Sign in here!</Link></button>
        </div>
      </form>
    );
  }
}

class SignInForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'email': undefined,
      'password': undefined
    };
    //function binding
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  //update state for specific field
  handleChange(event) {
    var field = event.target.name;
    var value = event.target.value;

    var changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }

  handleClick() {
    LOGIN = false;
  }

  //handle signIn button
  signIn(event) {
    event.preventDefault(); //don't submit
    this.props.signInCallback(this.state.email, this.state.password);
  }

  validate(value, validations) {
    var errors = { isValid: true, style: '' };

    if (value !== undefined) { //check validations
      //handle required
      if (validations.required && value === '') {
        errors.required = true;
        errors.isValid = false;
      }

      //handle minLength
      if (validations.minLength && value.length < validations.minLength) {
        errors.minLength = validations.minLength;
        errors.isValid = false;
      }

      //handle email type ??
      if (validations.email) {
        //pattern comparison from w3c
        //https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
        var valid = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)
        if (!valid) {
          errors.email = true;
          errors.isValid = false;
        }
      }
    }

    //display details
    if (!errors.isValid) { //if found errors
      errors.style = 'has-error';
    }
    else if (value !== undefined) { //valid and has input
      errors.style = 'has-success' //show success coloring
    }
    else { //valid and no input
      errors.isValid = false; //make false anyway
    }
    return errors; //return data object
  }

  render() {
    //field validation
    var emailErrors = this.validate(this.state.email, { required: true, email: true });
    var passwordErrors = this.validate(this.state.password, { required: true, minLength: 6 });
    //button validation
    var signInEnabled = (emailErrors.isValid && passwordErrors.isValid);

    return (
      <form role="form" className="sign-up-form">
        <ValidatedInput field="email" type="email" label="Email" changeCallback={this.handleChange} errors={emailErrors} />
        <ValidatedInput field="password" type="password" label="Password" changeCallback={this.handleChange} errors={passwordErrors} />
        <div className="form-group sign-up-buttons">
          <button className="btn btn-primary" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Sign-in</button>
          <button className="btn" onClick={this.handleClick}><Link to="/join" className="link">No account? Sign up here!</Link></button>
        </div>
      </form>
    );
  }
}

// A component that displays an input form with validation styling
// props are: field, type, label, changeCallback, errors
// from Joel Ross
class ValidatedInput extends React.Component {
  render() {
    return (
      <div className={"form-group " + this.props.errors.style}>
        <label htmlFor={this.props.field} className="control-label">{this.props.label}</label>
        <input id={this.props.field} type={this.props.type} name={this.props.field} className="form-control" onChange={this.props.changeCallback} />
        <ValidationErrors errors={this.props.errors} />
      </div>
    );
  }
}

// A component to represent and display validation errors
// from Joel Ross
class ValidationErrors extends React.Component {
  render() {
    return (
      <div>
        {this.props.errors.required &&
          <p className="help-block">Required!</p>
        }
        {this.props.errors.email &&
          <p className="help-block">Not an email address!</p>
        }
        {this.props.errors.minLength &&
          <p className="help-block">Must be at least {this.props.errors.minLength}characters.</p>
        }
        {this.props.errors.matches &&
          <p className="help-block">Must confirm same password below.</p>
        }
      </div>
    );
  }
}

export default App;
