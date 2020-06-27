import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import fetch from "node-fetch";

import NavigationBar from "./navigation/NavigationBar";

export default class App extends Component {
  state = {
    loading: true,
    user: null,
  };

  componentDidMount() {
    fetch(
      `${
        process.env.REACT_APP_DEBUG === "true"
          ? "http://localhost:7001"
          : "https://api.rainbowflame.quniverse.xyz"
      }/oauth/details`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (!res) return this.setState({ loading: false });
        this.setState({ loading: false, user: res });
      })
      .catch(() => this.setState({ loading: false }));
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
      window.location.replace(
        `${
          process.env.REACT_APP_DEBUG === "true"
            ? "http://localhost:7001"
            : "https://api.rainbowflame.quniverse.xyz"
        }/oauth/login`
      );
      return <React.Fragment />;
    } else {
      return (
        <React.Fragment>
          <Router>
            <NavigationBar user={this.state.user} />
          </Router>
        </React.Fragment>
      );
    }
  }
}
