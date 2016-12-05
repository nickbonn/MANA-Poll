import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import firebase from 'firebase';
import {Alert, FormGroup, Checkbox, Radio, Col,  Button} from 'react-bootstrap';

class AnswerQuestions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {questions:[], isQuestionAnswered:false, selectedOption:''};  
    }

    componentDidMount() {
        var questionRef = firebase.database().ref('questions');
        questionRef.once('value', (snapshot) => {
            var questionList = [];
            snapshot.forEach((childSnapshot) =>{
                var key = childSnapshot.key;
                var question = childSnapshot.val();
                if(questionList.length === 0) {
                    questionList.push(question);
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

    handleClick() {
        this.state.isQuestionAnswered = true;
        //Alert("Triggered button to load next question.");
        // var optionRef = firebase.database().ref('options')
        // optionRef.orderByKey(questions[4].uid).on(''){
        //     this.setState({
        //         options: snapshot.val();
        //     });
        // }
        
        console.log("Triggered button to load next question.");
    }
    //a
    updateAnswer(event, option) {
        event.preventDefault();
        this.setState({
            selectedOption: option            
        });
        
    }

    //sending quiz answer information to firebase so nick can load results
    submitAnswer(event) {
        console.log("I am called");
        console.log(this.state.selectedOption);
        event.preventDefault();
        var answerRef = firebase.database().ref('answers');
        var newAnswer = {
            // questionUID:this.state.currentQuestionUID, 
            userUID:firebase.auth().currentUser.uid,        
            time:firebase.database.ServerValue.TIMESTAMP,
            selectedOption:this.state.selectedOption
        };
        answerRef.push(newAnswer);

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
                {this.state.questions[0].answer1Text !== undefined && <Radio validationState="warning" onClick={(e) => this.updateAnswer(e, this.state.questions[0].answer1Text)}>{this.state.questions[0].answer1Text}</Radio>}
                {this.state.questions[0].answer2Text !== undefined &&<Radio validationState="warning" onClick={(e) => this.updateAnswer(e, this.state.questions[0].answer2Text)}>{this.state.questions[0].answer2Text}</Radio>}
                {this.state.questions[0].answer3Text !== undefined && <Radio validationState="warning" onClick={(e) => this.updateAnswer(e, this.state.questions[0].answer3Text)}>{this.state.questions[0].answer3Text}</Radio>}
                {this.state.questions[0].answer4Text !== undefined && <Radio validationState="warning" onClick={(e) => this.updateAnswer(e, this.state.questions[0].answer4Text)}>{this.state.questions[0].answer4Text}</Radio>}
                </div>
                {/*<Checkbox validationState="error">Checkbox with error</Checkbox>
                <Checkbox validationState="success">Checkbox with success</Checkbox>
                <select>
                 {this.state.options.option1}
                    <option value="grapefruit">Grapefruit</option>
                    <option value="lime">Lime</option>
                    <option selected value="coconut">Coconut</option>
                    <option value="mango">Mango</option>
                </select> }
                    <FormGroup validationState="success">
                    <Checkbox inline>Checkbox</Checkbox>
                    {' '}
                    <Checkbox inline>with</Checkbox>
                    {' '}
                    <Checkbox inline>success</Checkbox>
                </FormGroup>            
    */}
                {/* This requires React 15's <span>-less spaces to be exactly correct. */}
                <FormGroup>
                        <Button onClick={(e) => this.submitAnswer(e)}>Submit</Button>
                </FormGroup>
            </form>
        </div>}
        {this.state.isQuestionAnswered && <div>You have successfully submitted the quiz!!</div>}
          </div>
      );      
    }
    }
}

export default AnswerQuestions;