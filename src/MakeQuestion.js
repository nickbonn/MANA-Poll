import React from 'react';
import './App.css';
import firebase from 'firebase';
import { Col, Form, FormGroup, FormControl, Button, ControlLabel } from 'react-bootstrap';

class MakeQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            question: '',
            answer1: '',
            answer2: '',
            answer3: '',
            answer4: '',
            classCode: '',
            isQuestionSubmitted: false,
        };

    }

    //when the text in the form changes
    updateQuestion(event) {
        this.setState({
            question: event.target.value
        });
    }

    updateAnswer1(event) {
        this.setState({
            answer1: event.target.value
        });
    }

    updateAnswer2(event) {
        this.setState({
            answer2: event.target.value
        });
    }
    updateAnswer3(event) {
        this.setState({
            answer3: event.target.value
        });
    }
    updateAnswer4(event) {
        this.setState({
            answer4: event.target.value
        });
    }

    updateClassCode(event) {
        this.setState({
            classCode: event.target.value
        });
    }

    postQuestion(event) {
        event.preventDefault(); //don't submit

        /* Add a new question to the database */
        var questionData = {
            questionText: this.state.question,
            answer1Text: this.state.answer1,
            answer2Text: this.state.answer2,
            answer3Text: this.state.answer3,
            answer4Text: this.state.answer4

        }

        //var questionsRef = jsonObjectInTheCloud['questions']; 
        var questionRef = firebase.database().ref('questions/' + this.state.classCode);
        questionRef.push(questionData);
        this.setState({
            isQuestionSubmitted: true
        });

        //empty out post (controlled input)
        this.setState({
            question: '',
            answer1: '',
            answer2: '',
            answer3: '',
            answer4: ''
        });
    }
    render() {

        var submitEnabled = false;
        if (this.state.answer1.length > 0  && this.state.answer2.length > 0  && this.state.answer3.length > 0  && this.state.answer4.length > 0) {
            submitEnabled = true;
        }

        return (
            <div >
                <h4 className="center">Hey, {firebase.auth().currentUser.displayName}! Please enter information to create a question, or click "View Results" to see created questions.</h4>

                <Form horizontal className="question-form">
                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                        </Col>

                        <Col sm={10}>
                            <FormControl type="classCode" placeholder="Class Code (e.g. MATH126)" value={this.state.classCode.toUpperCase()} onChange={(e) => this.updateClassCode(e)} />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                        </Col>

                        <Col sm={10}>
                            <FormControl type="question" placeholder="Question" value={this.state.question} onChange={(e) => this.updateQuestion(e)} />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword" >
                        <Col componentClass={ControlLabel} sm={2} >
                        </Col>

                        <Col sm={10}>
                            <FormControl type="answer" placeholder="Choice A" value={this.state.answer1} onChange={(e) => this.updateAnswer1(e)} />
                        </Col>

                        <Col componentClass={ControlLabel} sm={2}>
                        </Col>

                        <Col sm={10}>
                            <FormControl type="answer" placeholder="Choice B" value={this.state.answer2} onChange={(e) => this.updateAnswer2(e)} />
                        </Col>
                        <Col componentClass={ControlLabel} sm={2}>
                        </Col>

                        <Col sm={10}>
                            <FormControl type="answer" placeholder="Choice C" value={this.state.answer3} onChange={(e) => this.updateAnswer3(e)} />
                        </Col>
                        <Col componentClass={ControlLabel} sm={2}>
                        </Col>

                        <Col sm={10}>
                            <FormControl type="answer" placeholder="Choice D" value={this.state.answer4} onChange={(e) => this.updateAnswer4(e)} />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                        <span>
                            <p id='fillFour'>Please fill in all four answer options</p>
                            <Button type="submit" disabled = {!submitEnabled} onClick={(e) => this.postQuestion(e)}> Submit  </Button>
                        </span>
                        </Col>
                    </FormGroup>
                </Form>
                {this.state.isQuestionSubmitted && <div className="well"> You have sucessfully submitted a question!</div>}
            </div >
        )
    }
}


export default MakeQuestion;