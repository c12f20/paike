import Immutable from "immutable";

// Init State
const initialState = Immutable.fromJS({
  requestsCount: 0,
  error: null
});

// Action types
export const types = {
  START_REQUEST: "APP/START_REQUEST",
  FINISH_REQUEST: "APP/FINISH_REQUEST",
  SET_ERROR: "APP/SET_ERROR",
  REMOVE_ERROR: "APP/REMOVE_ERROR",
}

// Action Creator
export const actions = {
  startRequest: () => ({
    type: types.START_REQUEST
  }),
  finishRequest: () => ({
    type: types.FINISH_REQUEST
  }),
  setError: (error) => ({
    type: types.SET_ERROR,
    error
  }),
  removeError: () => ({
    type: types.REMOVE_ERROR
  }),
}

// reducer
const reducer = (state = initialState, action) => {
  switch(action.type) {
    case types.START_REQUEST:
      return state.merge({ requestsCount: state.get("requestsCount")+1 })
    case types.FINISH_REQUEST:
      return state.merge({ requestsCount: state.get("requestsCount")-1 });
    case types.SET_ERROR:
      return state.merge({ requestsCount: state.get("requestsCount")-1, error: action.error });
    case types.REMOVE_ERROR:
      return state.merge({ error: null });
    default:
      return state;
  }
}

export default reducer;

// selectors
export const getError = state => {
  return state.getIn(["app", "error"]);
};

export const getRequestQuantity = state => {
  return state.getIn(["app", "requestsCount"]);
};
