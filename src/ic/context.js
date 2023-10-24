import { Ed25519KeyIdentity } from "@dfinity/identity";
import { useWeb3React } from "@web3-react/core";
import React, { createContext, useCallback, useContext, useState } from "react";
import { createActors, createAnonymousActors } from "./actor";
import { loadSavedIdentity } from "./identity";


export const ICContextDefaults = {
  identity: undefined,
  actors: undefined,
  principal: undefined,
  loadIdentity: () => null,
  setIdentity: () => null,
  clearActiveIdentity: () => null,
};

export const ICContext = createContext(ICContextDefaults);

export function useICContextValues(){
  const { account } = useWeb3React();

  const [identity, _setIdentity] = useState(
    undefined
  );
  const [actors, _setActors] = useState(undefined);
  const [principal, _setPrincipal] = useState(undefined);

  React.useEffect(() => {
    if (!identity) return;
    _setActors(createActors(identity));
  }, [identity]);

  React.useEffect(() => {
    if (!actors) return;
    actors.profile.getOwnPrincipal().then((principal) => {
      if (!principal?.isAnonymous()) {
        _setPrincipal(principal);
      }
    });
  }, [actors]);

  React.useEffect(() => {
    _setActors(createAnonymousActors());
  }, []);

  const setIdentity = useCallback(
    (identity) => {
      _setIdentity(identity);
    },
    [_setIdentity]
  );

  const clearActiveIdentity = useCallback(() => {
    _setIdentity(undefined);
    _setActors(createAnonymousActors());
    _setPrincipal(undefined);
  }, [_setIdentity, _setActors, _setPrincipal]);

  const loadIdentity = useCallback(
    (account) => {
      const identity = loadSavedIdentity(account);
      if (!identity) {
        clearActiveIdentity();
        return;
      }
      setIdentity(identity);
    },
    [setIdentity, clearActiveIdentity]
  );

  React.useEffect(() => {
    if (account) {
      loadIdentity(account);
    }
  }, [account, loadIdentity]);

  return {
    identity,
    actors,
    principal,
    loadIdentity,
    setIdentity,
    clearActiveIdentity,
  };
}

export function useInternetComputer() {
  return useContext(ICContext);
}
