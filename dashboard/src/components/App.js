import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import NavigationBar from "./navigation/NavigationBar";

export default class App extends Component {
  state = {
    loading: true,
    user: null,
  };
  componentDidMount() {
    this.setState({ loading: false });
  }
  render() {
    if (this.state.loading) {
      return (
        <React.Fragment>
          <div className="container">
            <h1>Loading...</h1>
          </div>
        </React.Fragment>
      );
    } else if (!this.state.user) {
      window.location.replace("https://discord.com");
      return <React.Fragment />;
    } else {
      return (
        <React.Fragment>
          <Router>
            <div className="container">
              <NavigationBar user={this.state.user} />
            </div>
          </Router>
        </React.Fragment>
      );
    }
  }
}
