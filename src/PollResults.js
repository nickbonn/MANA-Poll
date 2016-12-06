import firebase from 'firebase';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './PollResults.css';




class PollResults extends React.Component {
  constructor(props){
    super(props);
    this.state = {questions:[]};
  }

  // componentDidMount(){
  //   var questionRef = firebase.database().ref('questions/' + this.props.classCode);
  //   var answerRef = firebase.database().ref('answers');
  //   questionRef.once('value', (snapshot) => {
  //     var questionArray = [];
  //     snapshot.forEach((child) => {
  //       var questionText = child.val();
  //       questionText.key = child.key;
  //       questionArray.push(questionText);
  //     });
  //     console.log(questionArray);
  //     this.setState({questions:questionArray}); 
  //   });
  // }

  componentDidMount() {
    var questionRef = firebase.database().ref('questions/' + this.props.classCode);
    questionRef.once('value', (snapshot) => {
    var questionArray =[];
      snapshot.forEach((child) => {
      var questionText = child.val();
      var question1 = child.val().answer1Text;
      var question2 = child.val().answer2Text;
      var question3 = child.val().answer3Text;
      var question4 = child.val().answer4Text;
      var questionObj = {key: child.key, answerCount : 0, answerArray:[question1, question2, question3, question4]};
      questionObj[question1]= 0;
      questionObj[question2]=0;
      questionObj[question3]=0;
      questionObj[question4]=0;
      questionArray.push(questionObj);
    });
    console.log(questionArray);
    this.setState({questions:questionArray});

    })
  }

  getAnwers() {
    var answerRef = firebase.database().ref('answers');
    answerRef.once('value', (snapshot) => {
      this.state.questions.forEach((question) => {
        snapshot.forEach((child) => {
          var questionKey = child.val().questionUID;
          if (question.key === questionKey) {
            var answer = child.val().selectedOption;
            var newCount = this.state.answer+1;
            var newTotalCount = this.state.answerCount+1;
            this.setState({answer: newCount});
            this.setState({answerCount:newTotalCount});
          }
      })
      });
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