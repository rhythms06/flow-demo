// Our Flow Client Library (FCL) configuration.

import {config} from "@onflfow/fcl"

config()
  .put("accessNode.api", process.env.REACT_APP_ACCESS_NODE) // Set Flow endpoint.
  .put("challenge.handshake", process.env.REACT_APP_WALLET_DISCOVERY) // Set wallet endpoint.
  .put("0xProfile", process.env.REACT_APP_CONTRACT_PROFILE) // Set Profile smart contract endpoint.
