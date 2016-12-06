import firebase from 'firebase';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './PollResults.css';




class PollResults extends React.Component {
  constructor(props){
    super(props);
    this.state = {questions:[]};
  }

  componentDidMount(){
    var questionRef = firebase.database().ref('questions/' + this.props.classCode);
    questionRef.on('value', (snapshot) => {
      var questionArray = [];
      snapshot.forEach(function(child) {
        var questionText = child.val();
        questionText.key = child.key;
        questionArray.push(questionText);
      })
      questionArray.sort((a,b) => b.time - a.time); //reverse order
      this.setState({questions:questionArray});      
    });
  }

  render() {
    var showQuestions = this.state.questions.map((question) => {
      return <IndivQuestion question={question} key={question.key} />
    })
    return (<div>{showQuestions}</div>);
  }
}

class IndivQuestion extends React.Component {
  render() {
    //console.log(this.props.question.key);
    //var answerRef = firebase.database().ref('answers');
    //answerRef
    return (
      <div className="span6">
        <h2>{this.props.question.questionText}</h2>
        <strong>{this.props.question.answer1Text}</strong><span className="pull-right">30%</span>
        <div className="progress progress-danger active">
            <div className="bar" style={{width: '30%'}}></div>
        </div>
        <strong>{this.props.question.answer2Text}</strong><span className="pull-right">40%</span>
        <div className="progress progress-info active">
            <div className="bar" style={{width: '40%'}}></div>
        </div>
        <strong>{this.props.question.answer3Text}</strong><span className="pull-right">10%</span>
        <div className="progress progress-striped active">
            <div className="bar" style={{width: '10%'}}></div>
        </div>
        <strong>{this.props.question.answer4Text}</strong><span className="pull-right">5%</span>
        <div className="progress progress-success active">
            <div className="bar" style={{width: '5%'}}></div>
        </div>
      </div>
    )
  }
}

export default PollResults;