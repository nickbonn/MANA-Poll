import firebase from 'firebase';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './PollResults.css';
import './index.js';

export class PollResults extends React.Component {
  constructor(props){
    super(props);
    this.state = {questions:[], answers:[]};
  }

  componentDidMount() {

  var questionRef = firebase.database().ref('questions/' + this.props.classCode);
  questionRef.once('value', (snapshot) => {
    var questionArray = [];
    snapshot.forEach((child) => {
      var question = child.val();
      var questionKey = child.key;
      var text = question.questionText;
      var answers = [question.answer1Text, question.answer2Text, question.answer3Text, question.answer4Text];
      var questionObj = {key: questionKey, qText: text, answerList: answers};
      questionArray.push(questionObj);
    })
    this.setState({questions:questionArray});
  });


    var answerRef = firebase.database().ref('answers/' + this.props.classCode);
    answerRef.once('value', (snapshot) => {
      var answerArray = [];
      this.state.questions.forEach((question)=> {
        var questionKey = question.key;
        var questionText = question.qText;
        var answerCount = {};
        question.answerList.forEach((option) => {
           answerCount[option] = 0;
        })
        var answerObj = {key: questionKey, text: questionText, count: answerCount, totalCount : 0, answerArray : question.answerList};
        //console.log(answerObj);
        snapshot.forEach((child)=> {
          var answerInfo = child.val()
          var quesKey = answerInfo.questionUID;
          if(quesKey === question.key){
            var chosenAns = answerInfo.selectedOption;
            var newCount = answerObj['count'][chosenAns] +1;
            var newTotalCount = answerObj['totalCount'] +1;
            answerObj['count'][chosenAns] = newCount;
            answerObj['totalCount'] = newTotalCount;
          }
        })
        answerArray.push(answerObj);
      })
      this.setState({answers: answerArray});
    })



  }

  render() {
    //console.log(this.state.questions);
    if (this.state.answers.length > 0) {
    var showQuestions = this.state.answers.map((answer) => {
      return <IndivQuestion answer={answer} />
    })
    return (<div>{showQuestions}</div>);
    } else{
      return null;
    }
  }
}

class IndivQuestion extends React.Component {
  
  toPercent(num) {
    var newNum = num * 100;
    var finalNum = newNum.toFixed(2) + '%';
    return finalNum;
  }
  
  
  render() {
    var question1Text = this.props.answer.answerArray[0];
    var question2Text = this.props.answer.answerArray[1];
    var question3Text = this.props.answer.answerArray[2];
    var question4Text = this.props.answer.answerArray[3];
    var totalCount = this.props.answer.totalCount;
    var firstPercent = this.toPercent(this.props.answer.count[question1Text] / totalCount);
    var secondPercent = this.toPercent(this.props.answer.count[question2Text] / totalCount);
    var thirdPercent = this.toPercent(this.props.answer.count[question3Text] / totalCount);
    var fourthPercent = this.toPercent(this.props.answer.count[question4Text] / totalCount);

    return (
      <div className="span6">
        <h2>{this.props.answer.text}</h2><h5>Total Votes: {totalCount}</h5>
        <strong>{question1Text}</strong><span className="pull-right">{firstPercent}</span>
        <div className="progress progress-danger active">
            <div className="bar" style={{width: firstPercent}}></div>
        </div>
        <strong>{question2Text}</strong><span className="pull-right">{secondPercent}</span>
        <div className="progress progress-info active">
            <div className="bar" style={{width: secondPercent}}></div>
        </div>
        <strong>{question3Text}</strong><span className="pull-right">{thirdPercent}</span>
        <div className="progress progress-striped active">
            <div className="bar" style={{width: thirdPercent}}></div>
        </div>
        <strong>{question4Text}</strong><span className="pull-right">{fourthPercent}</span>
        <div className="progress progress-success active">
            <div className="bar" style={{width: fourthPercent}}></div>
        </div>
      </div>
    )
  }
}

export default PollResults;