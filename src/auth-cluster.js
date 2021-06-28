// A React component that shows a user's address and a "Log Out" button,
// or "Sign Up" and "Log In" buttons if the user isn't authenticated yet.

import React, {useState, useEffect} from "react"
import * as fcl from "@onflow/fcl"

export function AuthCluster() {
    // Create a user object that may (not) be logged in, using a state hook.
    const [user, setUser] = useState({loggedIn: null})
    // Subscribe to the user's state of authentication.
    useEffect(() => fcl.currentUser().subscribe(setUser), [])

    if (user.loggedIn) {
        // If authenticated, show user address and "Log Out" button.
        // Note: fcl.unauthenticate is an alias for fcl.currentUser().unauthenticate()
        return (
            <div>
                <span>{user?.addr ?? "Unknown address."}</span>
                <button onClick={fcl.unauthenticate}>Log Out</button>
            </div>
        )
    } else {
        // If unauthenticated, show "Sign Up" and "Log In" buttons.
        // Note: fcl.logIn and fcl.signUp are both aliases for fcl.currentUser().authenticate()
        return (
            <div>
                <button onClick={fcl.logIn}>Log In</button>
                <button onClick={fcl.signUp}>Sign Up</button>
            </div>
        )
    }
}

