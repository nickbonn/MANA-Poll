import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import firebase from 'firebase';
import {Alert, FormGroup, Checkbox, Radio, Col,  Button} from 'react-bootstrap';
import MakeQuestion from './MakeQuestion';
import PollResult from './PollResults';


class AnswerQuestions extends React.Component {
    constructor(props) {
        super(props);
        //sets the state properties
            //--isQuestionAnswered is used to update the user state of anwering question. If user answers the clicker question
            //                     this will be set to true and the succeful message loads on the screen.
            //questions array stores the question to be rendered on the screen.
            //selectedOption: is the one to update the state of user selected option whenever user clicks on an option.
        this.state = {questions:[], isQuestionAnswered:false, selectedOption:'', questionAnswerMap:{}};  
    }

    componentDidMount() {
        //loading the question to be rendered
        var questionRef = firebase.database().ref('questions/' + this.props.classCode);
        questionRef.once('value', (snapshot) => {
            var questionList = [];
            snapshot.forEach((childSnapshot) =>{
                var key = childSnapshot.key;
                var question = childSnapshot.val();
                questionList.push(question);
                    //sets the currentQuestionUID state to the current question id
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

    optionClickedCallback(question, option) {
        this.state.questionAnswerMap[question] = option;
        console.log(this.state.questionAnswerMap)
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
        var questionList = this.state.questions;
        
        //questionList: loops through all the questions and passes each question to the 
        //QuestionComp for it to be rendered
        var questionNum = 0;
        var questionAndAnswerObject = {};
        var allQuestionsToRender = questionList.map((eachQuestion) => {
            questionNum++;        
            questionAndAnswerObject[eachQuestion] = '';
            return <QuestionComp name={questionNum} question={eachQuestion} optionClickedCallback={this.optionClickedCallback} />;
        });
      return (
        <div className="container">
            {/*only want to render if there is a question */}
             {this.state.questions.length > 0 &&
                 <div>
                 <h2>{this.props.classCode}</h2> 
                <form> 
                    {allQuestionsToRender}
                {/* This requires React 15's <span>-less spaces to be exactly correct. */}
                <FormGroup>
                        <Button onClick={(e) => this.submitAnswer(e)}>Submit</Button>
                </FormGroup>
            </form>
        </div>}
        {/* {this.state.isQuestionAnswered && <div className="well">You have successfully submitted the quiz. Thank you!</div>}
         {this.state.isQuestionAnswered && <PollResult/>} */}
        </div>
      );      
    }
    }
}

//extract the question component into a separate class
class QuestionComp extends React.Component {
    updateAnswer(event, option) {
        this.props.optionClickedCallback(this.props.question, option);
        //this.props.questionAndAnswerObject[this.props.question] = option;
        //console.log(this.props.questionAndAnswerObject);
    };

    render() {
        var question = this.props.question;
        var questionText = question.questionText + " ?";
        var questionName = this.props.name;
      return (
        <div>
            <div className="well">{questionText}</div>
            <div className="well">
            {question.answer1Text !== undefined && <Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question.answer1Text)}>{question.answer1Text}</Radio>}
            {question.answer2Text !== undefined &&<Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question.answer2Text)}>{question.answer2Text}</Radio>}
            {question.answer3Text !== undefined && <Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question.answer3Text)}>{question.answer3Text}</Radio>}
            {question.answer4Text !== undefined && <Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question.answer4Text)}>{question.answer4Text}</Radio>}
            </div>
        </div>
        )
      }
}

export default AnswerQuestions;