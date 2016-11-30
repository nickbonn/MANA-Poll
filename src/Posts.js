import React from 'react';
import Time from 'react-time'
import firebase from 'firebase';
import noUserPic from './img/no-user-pic.png';
import {Link} from 'react-router';

var CHANNEL = 'general';

// A form the user can use to post a post
export class PostBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { post: '' };
  }

  // when the text in the form changes
  updatePost(event) {
    this.setState({ post: event.target.value });
  }

  // post a new post to the database
  postPost(event) {
    event.preventDefault(); //don't submit
    var postData = {
      text: this.state.post,
      userId: firebase.auth().currentUser.uid,
      time: firebase.database.ServerValue.TIMESTAMP,
      channel: CHANNEL
    }
    var postsRef = firebase.database().ref('posts');
    postsRef.push(postData);
    this.setState({ post: '' }); //empty out post
  }

  render() {
    return (
      <div className="post-box write-post">
        {/* Show image of current user, would be working if md5 didn't stop working for some reason */}
        <img className="image" src={firebase.auth().currentUser.photoURL} alt="user avatar" />
        <form className="post-input" role="form">
          <textarea placeholder="What's happening...?" name="text" value={this.state.post} className="form-control" onChange={(e) => this.updatePost(e)}></textarea>
          <div className="form-group send-post">
            <button className="btn btn-primary"
              disabled={this.state.post.length === 0}
              onClick={(e) => this.postPost(e)} >
              Post
            </button>
          </div>
        </form>
      </div>
    );
  }
}

//A list of posts that have been posted
export class PostList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { listOfPosts: [], postItems: []};
  }

  componentDidMount() {
    var usersRef = firebase.database().ref('users');
    usersRef.on('value', (snapshot) => {
      this.setState({ users: snapshot.val() });
    });

    var postsRef = firebase.database().ref('posts');
    postsRef.on('value', (snapshot) => {
      var postsArray = []; //an array to put in the state
      snapshot.forEach(function (childSnapshot) { //go through each item like an array
        var postObj = childSnapshot.val(); //convert this snapshot into an object
        postObj.key = childSnapshot.key; //save the child's unique id for later
        postsArray.push(postObj); //put into our new array
      });
      postsArray.sort((a, b) => b.time - a.time); //reverse order
      this.setState({ listOfPosts: postsArray }); //add to state
    });
  }

  componentWillUnmount() {
    firebase.database().ref('users').off();
    firebase.database().ref('posts').off();
  }

  render() {
    //don't show if don't have user data yet
    if (!this.state.users) {
      return null;
    }
    var postItems = this.state.listOfPosts.map((postObj) => {
      if(postObj.channel == CHANNEL) {
        return <PostItem
          postObject={postObj}
          user={this.state.users[postObj.userId]}
          key={postObj.key} />
      }
    })
    return <div>{postItems}</div>;  
  }
}

class PostItem extends React.Component {
  render() {
    return (
      <div className="post-box">
        <div>
          {/* This image's src would be the user's avatar if md5 was working */}
          <img className="image" src={this.props.user.avatar} role="presentation" />
          {/* User's handle */}
          <span className="handle">{this.props.user.handle} {/*space*/}</span>
          {/* Time of the post */}
          <span className="time"><Time value={this.props.postObject.time} relative /></span>
        </div>
        {/* Text of the post */}
        <div className="post">{this.props.postObject.text}</div>
      </div>
    );
  }
}

// proptype declaration
PostItem.propTypes = {
  postObject: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
};

export class ChannelList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { channel: '', channelNames:[<li><Link className="btn btn-warning">general</Link></li>]};
  }

  componentDidMount() {
    var channelNamesRef = firebase.database().ref('channels');
    channelNamesRef.on('value', (snapshot) => {
      var channelsArray = []; //an array to put in the state
      snapshot.forEach(function (childSnapshot) { //go through each item like an array
        var channelObj = childSnapshot.val(); //convert this snapshot into an object
        channelsArray.push(<li><Link className="btn btn-warning" to={"channels/" + channelObj.name}>{channelObj.name}</Link></li>); //put into our new array
      });
      channelsArray.sort((a, b) => b.time - a.time); //reverse order
      this.setState({ channelNames: channelsArray }); //add to state
    })
  }

  updateChannelName(event) {
    this.setState({ channel: event.target.value });
  }

  createChannel(event) {
    event.preventDefault();
    var channelData = {
      name: this.state.channel,
      userId: firebase.auth().currentUser.uid,
      time: firebase.database.ServerValue.TIMESTAMP,
    }
    CHANNEL = this.state.channel;
    this.state.channelNames.push(this.state.channel); // update channelNames
    var channelRef = firebase.database().ref('channels');
    channelRef.push(channelData);
    this.setState({ channel: '' });
    channelRef.on('value', (snapshot) => {
      var channelsArray = []; //an array to put in the state
      snapshot.forEach(function (childSnapshot) { //go through each item like an array
        var channelObj = childSnapshot.val(); //convert this snapshot into an object
        channelsArray.push(<li><Link className="btn btn-warning" to={"channels/" + channelObj.name}>{channelObj.name}</Link></li>); //put into our new array
      });
      this.setState({ channelNames: channelsArray }); //add to state
    })
  }

  render() {
    return (
      <ul>
        <form role="form">
          <input  className="post-input" placeholder="Add New Channel" name="text" value={this.state.post} className="form-control" onChange={(e) => this.updateChannelName(e)}></input>
          <div className="form-group send-post">
            <button className="btn btn-primary"
              disabled={this.state.channel.length === 0}
              onClick={(e) => this.createChannel(e)} >
              Create
            </button>
          </div>
        </form>
        {this.state.channelNames}
      </ul>
    );
  }
}

export {CHANNEL};
export default PostList;