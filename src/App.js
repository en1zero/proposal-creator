/* Energi Proposal Creator
*
* The following JSON represents an Energi proposal object that can be submitted to the blockchain.
* The purpose of this app is to create and validate this data based on user input, and then prepare
* the commands a user would use to submit this object to the Energi blockchain.

[
   [
      "proposal",
      {
         "end_epoch":1521329930,
         "name":"TITLE",
         "payment_address":"someaddr",
         "payment_amount":1337,
         "start_epoch":1513603490,
         "type":1,
         "url":"https://example.com/title-proposal"
      }
   ]
]
*/

import React, { Component } from 'react';
import logo from './logo256.png';
import './App.css';
import PrepareForm from './PrepareForm.js';

class App extends Component
{
  constructor(props)
  {
    super(props);

    // reference to internal proposal data we need to modify for convenience
    this.state = {
      network: "test60x",
      gobj: [
        [
          "proposal",
          {
            "end_epoch": 0,
            "name": "",
            "payment_address": "",
            "payment_amount": 0,
            "start_epoch": 0,
            "type": 1,
            "url": ""
          }
        ]
      ],
      governanceInfo: {},
      bestBlock: {},
      validationError: ""
    }
    this.setError = this.setError.bind(this);
    this.hasError = this.hasError.bind(this);
    this.validateNewState = this.validateNewState.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount()
  {
    document.title = "Energi Proposal Creator";
    return fetch('http://explore.test.energi.network/api/getgovernanceinfo')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          governanceInfo: responseJson
        }, function() {
          // do something with new state
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  setError(errStr)
  {
    this.setState({validationError: errStr});
  }

  hasError()
  {
    if (this.state.validationError === '') return false;
    return true;
  }

  validateNewState()
  {
    function validateProposalName(setError, state)
    {
      const name = state.gobj[0][1].name;
      if ((name.length < 5) || (name.length > 20))
      {
        setError("Proposal name must a unique name between 5 and 20 characters in length");
      }
      let allowedCharactersRegex = /^[a-zA-Z0-9 _]+$/i;
      if (!name.match(allowedCharactersRegex))
      {
        setError("Proposal name may only contain alphanumeric characters, space and underscore")
      }
      // TODO: make sure proposal name doesn't match any active proposal names
    }

    function validateProposalURL(setError, state)
    {
      const url = state.gobj[0][1].url;
      if (!url.startsWith('http://') && !url.startsWith('https://'))
      {
        setError("Proposal URL must begin with http:// or https://");
      }
      if (url.length > 255) // TODO: verify maximum URL length
      {
        setError("Maximum URL length is 255 characters. Please use a URL shortening service.");
      }
    }

    function validateProposalStart(setError, state)
    {
      // TODO: validate start_epoch
      setError("Proposal start date is invalid");
    }

    function validateProposalEnd(setError, state)
    {
      // TODO: validate end_epoch
      setError("Number of payment cycles must be between 1 and 26");
    }

    function validateProposalAddress(setError, state)
    {
      // Energi main net addresses start with 'E' and testnet addresses start with 't'
      const addrPrefix = state.network == 'main' ? '^E' : '^t';
      const validChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      const regexStr = addrPrefix + '[' + validChars + ']{33}$';
      let prefixRegex = new RegExp(regexStr, "i");
      const payment_address = state.gobj[0][1].payment_address;
      if (!payment_address.match(prefixRegex) || (payment_address.length != 34))
      {
        setError("Payment address is not valid");
      }
    }

    function validateProposalAmount(setError, state)
    {
      // TODO: special budget consideration for first budget cycle
      const maximumBudgetAmount = 184000;
      const payment_amount = state.gobj[0][1].payment_amount;
      if (payment_amount > maximumBudgetAmount)
      {
        setError("Payment amount exceeds maximum budget");
      }
      if (payment_amount <= 0)
      {
        setError("Payment amount must be greater than 0");
      }
    }

    function validateProposalType(setError, state)
    {
      if (state.gobj[0][1]['type'] != '1')
      {
        setError("Proposal type must be equal to 1");
      }
    }

    // clear the error state and begin validation
    this.setError("");
    validateProposalName(this.setError, this.state);
    validateProposalURL(this.setError, this.state);
    //validateProposalStart(this.setError, this.state);
    //validateProposalEnd(this.setError, this.state);
    validateProposalAddress(this.setError, this.state);
    validateProposalAmount(this.setError, this.state);
  }

  handleInputChange(event)
  {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    // make sure numbers are numbers
    if ((name === 'start_epoch')
      || (name == 'end_epoch')
      || (name == 'payment_amount'))
    {
        value = Number(value) || 0;
    }

    let new_gobj = this.state.gobj;
    new_gobj[0][1][name] = value;
    this.setState({gobj: new_gobj});
    this.validateNewState();
  }

  render()
  {
    let prepareform_props = {
      onChange: this.handleInputChange,
      validationError: this.state.validationError
    };
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Energi Proposal Creator</h1>
        </header>
        <PrepareForm {...prepareform_props} />

        <div>
          <p className="App-intro">
            Current State:
            <pre>
              { JSON.stringify(this.state, null, "\t") }
            </pre>
          </p>
        </div>
      </div>
    );
  }
}

export default App;
