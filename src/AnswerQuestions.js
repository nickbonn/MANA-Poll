import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import firebase from 'firebase';
import {Alert, FormGroup, Checkbox, Radio, Col,  Button} from 'react-bootstrap';
import PollResult from './PollResults';

class AnswerQuestions extends React.Component {
    constructor(props) {
        super(props);
        //sets the state properties
            //--isQuestionAnswered is used to update the user state of anwering question. If user answers the clicker question
            //                     this will be set to true and the succeful message loads on the screen.
            //questions array stores the question to be rendered on the screen.
            //selectedOption: is the one to update the state of user selected option whenever user clicks on an option.
        this.state = {questions:[], isQuestionAnswered:false, selectedOption:''};  
    }

    componentDidMount() {
        //loading the question to be rendered
        var questionRef = firebase.database().ref('questions');
        questionRef.once('value', (snapshot) => {
            var questionList = [];
            snapshot.forEach((childSnapshot) =>{
                var key = childSnapshot.key;
                var question = childSnapshot.val();
                if(questionList.length === 0) {
                    questionList.push(question);

                    //sets the currentQuestionUID state to the current question id
                    this.setState({
                        currentQuestionUID:key
                    });  
                }               
            });
            this.setState({
                     questions: questionList
                 });
            console.log(this.state.questions);
        });    
    }

//sets the isQuestionAnswered to true if user submit the answer for the clicker question
    handleClick() {
        this.setState({
            isQuestionAnswered:true
        });      
    }

    //Update the selected option based on the option clicked by the user
    updateAnswer(event, option) {
        console.log(option);
        this.setState({
            selectedOption: option                        
        });
    }

    //sending quiz answer information to firebase so nick can load results
    submitAnswer(event) {
        event.preventDefault();
        var answerRef = firebase.database().ref('answers');
        //what gets sent to the firebase
        //This is an answer object to be saved to the firebase.
        var newAnswer = {
            questionUID:this.state.currentQuestionUID, 
            userUID:firebase.auth().currentUser.uid,        
            time:firebase.database.ServerValue.TIMESTAMP,
            selectedOption:this.state.selectedOption
        };
        answerRef.push(newAnswer);
        this.handleClick();
    }

    render() {
    if (!this.props.logged) { // not logged in
      return (
        <div> User is not logged in!</div>  
      );
    } else { // logged in
        var questionText = "No Questions Found";
        if(this.state.questions.length > 0){
            questionText = this.state.questions[0].questionText + " ?";
        }    
      return (
        <div className="container">
            {/*only want to render if there is a question */}
             {!this.state.isQuestionAnswered && this.state.questions.length > 0 &&
                 <div> 
            <div className="well">{questionText}</div>
            <form>
                <div className="well">
                {this.state.questions[0].answer1Text !== undefined && <Radio name="optionName" validationState="success" onClick={(e) => this.updateAnswer(e, this.state.questions[0].answer1Text)}>{this.state.questions[0].answer1Text}</Radio>}
                {this.state.questions[0].answer2Text !== undefined &&<Radio name="optionName" validationState="success" onClick={(e) => this.updateAnswer(e, this.state.questions[0].answer2Text)}>{this.state.questions[0].answer2Text}</Radio>}
                {this.state.questions[0].answer3Text !== undefined && <Radio name="optionName" validationState="success" onClick={(e) => this.updateAnswer(e, this.state.questions[0].answer3Text)}>{this.state.questions[0].answer3Text}</Radio>}
                {this.state.questions[0].answer4Text !== undefined && <Radio name="optionName" validationState="success" onClick={(e) => this.updateAnswer(e, this.state.questions[0].answer4Text)}>{this.state.questions[0].answer4Text}</Radio>}
                </div>

                {/* This requires React 15's <span>-less spaces to be exactly correct. */}
                <FormGroup>
                        <Button onClick={(e) => this.submitAnswer(e)}>Submit</Button>
                </FormGroup>
            </form>
        </div>}
        {this.state.isQuestionAnswered && <div className="well">You have successfully submitted the quiz. Thank you!</div>}
        {this.state.isQuestionAnswered && <PollResult/>}
        </div>
      );      
    }
    }
}

export default AnswerQuestions;