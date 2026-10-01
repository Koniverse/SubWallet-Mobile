import React from 'react';

/**
 * Lets a confirmation screen append a node to the *inside* of whichever
 * `ConfirmationContent` its variant happens to render, without every variant having to
 * thread a prop through. Used by the transaction confirmation to place the wrapped
 * transaction signer picker directly below the transaction details — rendering it as a
 * sibling of `ConfirmationContent` would pin it to the bottom of the screen instead.
 */
export const ConfirmationExtraContentContext = React.createContext<React.ReactNode>(null);
