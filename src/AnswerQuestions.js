import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import firebase from 'firebase';
import {Alert, FormGroup, Checkbox, Radio, Col,  Button} from 'react-bootstrap';
import MakeQuestion from './MakeQuestion';
import PollResult from './PollResults';


class AnswerQuestions extends React.Component {
    
    /* sets the state properties
        questions array stores the question to be rendered on the screen.
    */
    constructor(props) {
        super(props);
        this.state = {questions:[]};  
    }

    componentDidMount() {
        //loading the question to be rendered
        var questionRef = firebase.database().ref('questions/' + this.props.classCode);
        questionRef.once('value', (snapshot) => {
            var questionList = [];
            snapshot.forEach(
                function(childSnapshot){
                    var key = childSnapshot.key;
                    var question = childSnapshot.val();
                    question["key"] = key;                
                    questionList.push(question);
            });
            //the options list and the question (for all questions)
            this.setState({
                questions: questionList
             });
        });    
    }

    render() {
    if (!this.props.logged) { // not logged in
      return (
        <div> User is not logged in!</div>  
      );
    } else if (this.state.questions.length === 0) {
        return (<div className="alert alert-danger">
        <strong>You Have Entered an Invalid Class Code</strong> </div>);
    }else { // logged in
        var questionList = this.state.questions;
        //questionList: loops through all the questions and passes each question to the 
        //QuestionComp for it to be rendered
        var questionNum = 0;
        var allQuestionsToRender = questionList.map((eachQuestion) => {
            questionNum++;        
            return <QuestionComp classCode={this.props.classCode} key={eachQuestion.key} name={questionNum} question={eachQuestion} />;
        });
      return (
        <div className="container">
            {/*only want to render if there is a question */}
             {this.state.questions.length > 0 && 
                 <div>
                    <h2>{this.props.classCode}</h2> 
                    <form> 
                        {allQuestionsToRender}
                    </form>
                </div>
            }
        </div>
      );      
    }
    }
}

//extract the question component into a separate class
class QuestionComp extends React.Component {

    constructor(props) {
        super(props);
            //--isAnswered is used to update the user state of answering a question. If user answers the clicker question
            //this will be set to true and the successful message loads on the screen.
            //selectedOption: is the one to update the state of user selected option whenever user clicks on an option.
        this.state = { selectedOption:'', isAnswered:false};  
    }

    //saves the answer selected for the questions to the firebase
    submitAnswer(event) {
        this.setState({
            isAnswered:true
        });
        event.preventDefault();
        var answerRef = firebase.database().ref('answers/' + this.props.classCode);
        var newAnswer = {
            questionUID:this.props.question.key, 
            userUID:firebase.auth().currentUser.uid,        
            selectedOption:this.state.selectedOption
        };
        answerRef.push(newAnswer);
    }


//updates the state property name selectedOption with the answer selected by the user
    updateAnswer(event, question, option) {
        this.setState({
            selectedOption: option                        
        });
    }

    render() {
        var question = this.props.question;
        var questionText = question.questionText;
        var questionName = this.props.name;
        return (
            <div>
                {/* this gets called if the question has not been answered */}
                {!this.state.isAnswered && 
                <div>
                    <div className="well">{questionText}</div>
                    <div className="well">
                    {question.answer1Text !== undefined && <Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question, question.answer1Text)}>{question.answer1Text}</Radio>}
                    {question.answer2Text !== undefined && <Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question, question.answer2Text)}>{question.answer2Text}</Radio>}
                    {question.answer3Text !== undefined && <Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question, question.answer3Text)}>{question.answer3Text}</Radio>}
                    {question.answer4Text !== undefined && <Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question, question.answer4Text)}>{question.answer4Text}</Radio>}
                    </div>
                    <FormGroup>
                        <Button onClick={(e) => this.submitAnswer(e)}>Submit</Button>
                    </FormGroup>
                </div>}
                
                {/* this get called if the question has been answered */}
                {this.state.isAnswered && <div className="well">Your answer has been submitted succesfully.</div>}
            </div>
            )
      }
}
export default AnswerQuestions;