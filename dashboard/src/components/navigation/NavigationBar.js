import React, { Component } from "react";
import {
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavItem,
  MDBNavLink,
  MDBNavbarToggler,
  MDBCollapse,
  MDBIcon,
} from "mdbreact";
import PropTypes from "prop-types";

export default class NavigationBar extends Component {
  state = {
    isOpen: false,
  };

  toggleCollapse() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    return (
      <MDBNavbar color="black" dark expand="md">
        <MDBNavbarBrand>
          <MDBNavLink to="/">
            <img
              src={`${
                process.env.REACT_APP_DEBUG === "true"
                  ? "http://localhost:5432"
                  : "https://dash.rainbowflame.quniverse.xyz"
              }/favicon.ico`}
              alt="RainbowFlame Logo"
            />
            &nbsp;
            <strong className="white-text">RainbowFlame</strong>
          </MDBNavLink>
        </MDBNavbarBrand>
        <MDBNavbarToggler
          onClick={() => {
            this.setState({ isOpen: !this.state.isOpen });
          }}
        />
        <MDBCollapse id="navbarCollapse" isOpen={this.state.isOpen} navbar>
          <MDBNavbarNav left>
            <MDBNavLink to="/">
              <MDBIcon icon="server" />
              &nbsp; Server Selection
            </MDBNavLink>
          </MDBNavbarNav>
          <MDBNavbarNav right>
            {/* <MDBNavItem>
              <MDBDropdown>
                <MDBDropdownToggle nav caret>
                  <MDBIcon icon="user" />
                  &nbsp;Profile
                </MDBDropdownToggle>
                <MDBDropdownMenu className="dropdown-default" right>
                  <MDBDropdownItem
                    href={`${
                      process.env.REACT_APP_DEBUG === "true"
                        ? "http://localhost:7001"
                        : "https://api.rainbowflame.quniverse.xyz"
                    }/oauth/logout`}
                  >{`Logout (${this.props.user.username})`}</MDBDropdownItem>
                </MDBDropdownMenu>
              </MDBDropdown>
            </MDBNavItem> */}
            <MDBNavLink
              to={`${
                process.env.REACT_APP_DEBUG === "true"
                  ? "http://localhost:7001"
                  : "https://api.rainbowflame.quniverse.xyz"
              }/oauth/logout`}
            >
              Logout
            </MDBNavLink>
            &nbsp;
            <MDBNavItem>
              <img
                src={this.props.user.avatar}
                alt={`${this.props.user.username}`}
              />
            </MDBNavItem>
          </MDBNavbarNav>
        </MDBCollapse>
      </MDBNavbar>
    );
  }
}

NavigationBar.propTypes = {
  user: PropTypes.object,
};
