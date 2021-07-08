# Scripts and Transactions

In [Flow](https://onflow.org/), **scripts** and **transactions** are JavaScript files
housed under `/src/flow/` by convention used to query and modify the blockchain.
The central piece of either kind of file is the method `fcl.send([]).then(fcl.decode)`,
which transmits [Cadence-formatted](https://docs.onflow.org/cadence/) information
to the blockchain via the access node specified in `/.env.local` and `src/config.js`
and retrieves a response.

## Scripts
**Scripts** have the suffix `.script.js` and are used to
execute functions and query the blockchain.

```javascript
import * as fcl from "@onflow/fcl" // Flow Client Library
import * as t from "@onflow/types" // Flow Types

export async function func(variable) {
    return fcl
        .send([
            fcl.script`
            pub fun main(variable: Type): Type {
                return something of type Type
            }
            `,
            fcl.args([
                fcl.arg(variable, t.Type)
            ])
        ])
        .then(fcl.decode)
}
```

Here, `fcl.send([])` transmits a function and arguments to the
blockchain. The function is enclosed with the tag `fcl.script`, and the
arguments are passed to the method `fcl.args([])`. Each argument is
of the form `fcl.arg(argument, t.Type)`, where `argument`and `Type`
correspond to an input field of the main function of `fcl.script`.

Finally, `fcl.decode` applies the arguments specified in `fcl.args`
to the `fcl.script` method `pub fun main`, the script's main function.

*See `is-initialized.script.js` for an annotated, working example.*


## Transactions
**Transactions** have the suffix `.tx.js` and are used to
permanently alter the state of the blockchain. Every transaction has a set
*computation limit* and requires  a *payer*, *proposer*, and (usually) *authorizer(s)*.
Often, the current user is asked to play all three roles.
A transaction may also specify arguments, but is not required to do so.

```javascript
import * as fcl from "@onflow/fcl" // Flow Client Library
import * as t from "@onflow/types" // Flow Types

export async function func(variable) {
    const txId = await fcl
        .send([
            fcl.transaction`
            transaction {
                // Define one or more blockchain-altering functions here
            }
            `,
            fcl.payer(userID), // Required
            fcl.proposer(userID), // Required
            fcl.authorizations(userID), // Optional
            fcl.limit(integer), // Required
            fcl.args([fcl.arg(variable, t.Type)]) // Optional
        ])
        .then(fcl.decode)
    
    return fcl.tx(txId).onceSealed()
}
```

Here, `fcl.send([])` transmits a transaction, a payer, a proposer,
authorizations, and a computation limit to the blockchain.

*Tip*: If the current user is being asked to play all three roles, we
can simply pass `fcl.authz`, shorthand for `fcl.currentUser().authorization`,
to `fcl.payer()`, `fcl.proposer()`, and `fcl.authorizations([])`
for easy transacting.

Finally, `fcl.decode` returns an ID that can used
to check the status of a state modification.

*See `init-account.tx.js` for an annotated, working example.*
