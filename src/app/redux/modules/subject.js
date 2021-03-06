import Immutable from 'immutable';
import { combineReducers } from 'redux-immutable';

import { actions as appActions } from './app';
import { api as subjectApi } from '../../services/subject';

// action types
export const types = {
  FETCH_SUBJECTS: "SUBJECT/FETCH_SUBJECTS"
};

// colors
const colors = [
  "red.400", "green.400", "blue.400",
  "orange.300", "cyan.500", "purple.500",
];

// actions
export const actions = {
  fetchSubjects: (gradeTypeId, gradeId) => {
    return async (dispatch, getState) => {
      try {
        if (shouldFetchSubjects(gradeTypeId, gradeId, getState())) {
          dispatch(appActions.startRequest());
          const data = await subjectApi.querySubjects(gradeTypeId, gradeId);
          dispatch(appActions.finishRequest());
          const { subjectByIds, subjectIds } = convertSubjectsToPlain(data);
          dispatch(fetchSubjectsSuccess(gradeTypeId, gradeId, subjectIds, subjectByIds));
        }
      } catch (error) {
        dispatch(appActions.setError(error));
      }
    }
  }
}

const buildGradeInfoId = (gradeTypeId, gradeId) => {
  return gradeTypeId+"_"+gradeId;
}

const shouldFetchSubjects = (gradeTypeId, gradeId, state) => {
  const subjects = getSubjectByGrade(state, gradeTypeId, gradeId);
  return !subjects;
}

const fetchSubjectsSuccess = (gradeTypeId, gradeId, subjectIds, subjectByIds) => {
  return ({
    type: types.FETCH_SUBJECTS,
    gradeTypeId,
    gradeId,
    subjectIds,
    subjectByIds
  })
}

const convertSubjectsToPlain = (subjects) => {
  let subjectByIds = {};
  //console.log("Got Subjects data: "+JSON.stringify(subjects));
  const subjectIds = Object.keys(subjects);
  let colorIndex = 0;
  subjectIds.forEach(subjectId => {
    subjectByIds[subjectId] = { id: subjectId, title: subjects[subjectId], color: colors[colorIndex] };
    colorIndex = (colorIndex+1) % colors.length;
  });
  return {
    subjectByIds,
    subjectIds
  };
}
// reducers
const byIds = (state = Immutable.fromJS({}), action) => {
  switch (action.type) {
    case types.FETCH_SUBJECTS:
      return state.merge(action.subjectByIds);
    default:
      return state;
  }
}

const byGrade = (state = Immutable.fromJS({}), action) => {
  switch (action.type) {
    case types.FETCH_SUBJECTS:
      const gradeInfoId = buildGradeInfoId(action.gradeTypeId, action.gradeId);
      return state.merge({[gradeInfoId]: action.subjectIds});
    default:
      return state;
  }
}

const reducer = combineReducers({
  byIds,
  byGrade,
});

export default reducer;

// selectors
export const getSubjects = state => state.getIn(["subject", "byIds"]);

export const getSubjectById = (state, id) => state.getIn(["subject", "byIds", id]);

export const getSubjectByGrade = (state, gradeTypeId, gradeId) => {
  let subjectIds = state.getIn(["subject", "byGrade", buildGradeInfoId(gradeTypeId, gradeId)]);
  if (subjectIds) {
    return subjectIds.map(subjectId => {
      return getSubjectById(state, subjectId);
    });
  } else {
    return null;
  }
}
