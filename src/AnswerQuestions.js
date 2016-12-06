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
        this.state = {answersMap:{}, questions:[], isQuestionAnswered:false, selectedOption:''};  
    }

    componentDidMount() {
        //loading the question to be rendered
        var questionRef = firebase.database().ref('questions/' + this.props.classCode);
        questionRef.once('value', (snapshot) => {
            var questionList = [];
            var answersMapList = {};
            var questionKey = "key";
            var answerText = "answerText";
            snapshot.forEach((childSnapshot) =>{
                var key = childSnapshot.key;
                var question = childSnapshot.val();
                question["key"] = key;
                
                questionList.push(question);
                var answerMapObj = {
                    questionKey: key,
                    answerText: ''    
                }
                answersMapList[key] = answerMapObj;
                    //sets the currentQuestionUID state to the current question id
            });
            //the options list and the question (for all questions)
            this.setState({
                     questions: questionList
                 });
            this.setState({
                     answersMap: answersMapList
                 });
            console.log(this.state.answersMap);
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
        console.log(question);
        console.log(option);
        console.log(this.state);


        // var questionAnswerList = {};   
        // if(this.state.questionAnswerMap !== undefined && this.state.questionAnswerMap[question.key] != undefined) {
        //     questionAnswerList[question.key] = this.state.questionAnswerMap[question.key];
        //     questionAnswerList[question.key][questionAnswer] = option;
        // } else {
        //     var questionID = "questionID";
        //     var questionAnswer = "questionAnswer";      
        //     var questionAnswerObject = {
        //         questionID: question.key,
        //         questionAnswer: option
        //     };
        //     questionAnswerList[question.key] = questionAnswerObject;
        // }
        // if(this.state.questionAnswerMap !== null && this.state.questionAnswerMap !== undefined) {
        //     this.setState({
        //         questionAnswerMap:questionAnswerList
        //     });
        //     console.log(this.state.questionAnswerMap);
        // }
    }

    //sending quiz answer information to firebase so nick can load results
    submitAnswer(event) {
        event.preventDefault();
        var answerRef = firebase.database().ref('answers');
        //what gets sent to the firebase
        //This is an answer object to be saved to the firebase.
        //what happens when you click submit
        var newAnswer = {
            questionUID:this.state.currentQuestionUID, 
            userUID:firebase.auth().currentUser.uid,        
//            time:firebase.database.ServerValue.TIMESTAMP,
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
        var allQuestionsToRender = questionList.map((eachQuestion) => {
            questionNum++;        
            return <QuestionComp classCode={this.props.classCode} key={eachQuestion.key} name={questionNum} question={eachQuestion} optionClickedCallback={this.optionClickedCallback} />;
        });
      return (
        <div className="container">
            {/*only want to render if there is a question */}
             {this.state.questions.length > 0 &&
                 <div>
                 <h2>{this.props.classCode}</h2> 
                <form> 
                    {allQuestionsToRender}
                {/* This requires React 15's <span>-less spaces to be exactly correct. 
                 <FormGroup>
                         <Button onClick={(e) => this.submitAnswer(e)}>Submit</Button>
                 </FormGroup>
                 */}
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

    // updateAnswer(event, option) {
    //     console.log(this.state);
    //     this.props.optionClickedCallback(this.props.question, option);
    //     //this.props.questionAndAnswerObject[this.props.question] = option;
    //     //console.log(this.props.questionAndAnswerObject);
    // };

    constructor(props) {
        super(props);
        //sets the state properties
            //--isQuestionAnswered is used to update the user state of anwering question. If user answers the clicker question
            //                     this will be set to true and the succeful message loads on the screen.
            //questions array stores the question to be rendered on the screen.
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
        //what gets sent to the firebase
        //This is an answer object to be saved to the firebase.
        //what happens when you click submit
        var newAnswer = {
            questionUID:this.props.question.key, 
            userUID:firebase.auth().currentUser.uid,        
//            time:firebase.database.ServerValue.TIMESTAMP,
            selectedOption:this.state.selectedOption
        };
        answerRef.push(newAnswer);
        //this.handleClick();
    }


//update the state property name selectedOption with the answer selected by the user
    updateAnswer(event, question, option) {
        console.log(option);
        this.setState({
            selectedOption: option                        
        });
    }


    render() {
        var question = this.props.question;
        var questionText = question.questionText;
        var questionName = this.props.name;
        console.log(question.key);
      return (
        <div>
            {/* this get called if the question has not been answered */}
            {!this.state.isAnswered && <div>
            <div className="well">{questionText}</div>
            <div className="well">
            {question.answer1Text !== undefined && <Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question, question.answer1Text)}>{question.answer1Text}</Radio>}
            {question.answer2Text !== undefined &&<Radio name={questionName} validationState="success" onClick={(e) => this.updateAnswer(e, question, question.answer2Text)}>{question.answer2Text}</Radio>}
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