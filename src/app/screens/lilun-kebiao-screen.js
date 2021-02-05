/* @flow */

import React, { Component } from 'react';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTranslation } from 'react-i18next';
import {
  Flex,
  Text,
} from '@chakra-ui/core';

import {
  SubjectBoard,
  ResultTabList,
  ResultTable
} from '../components';

import { actions as subjectActions, getSubjectByGrade } from '../redux/modules/subject';
import { actions as banjiActions, buildGradeSubjectId, getBanjiBySubject } from '../redux/modules/banji';
import { actions as kebiaoActions, buildBanjiSchedId, getLiLunByAllBanjiSched } from '../redux/modules/kebiao';

import { SEMESTER_WEEK_COUNT } from './common/info';

const LILUNKEBIAO_COLOR = "orange";
class LiLunKeBiaoScreenWrapped extends Component {
  constructor(props) {
    super(props);
    const { t } = props;
    this.state = {
      selectedSubjectIndex: 0,
      selectWeek: 1,
      labs: []
    };

    this.semesterPages = [];
    this.tabTitles = [];
    this.tableHeaders = [
      {name: t("kebiao.banji_sched_title"), field: "class_name"},
      {name: t("kebiao.sched_monday")+" "+t("kebiao.sched_12"), field: "monday_12"},
      {name: t("kebiao.sched_34"), field: "monday_34"},
      {name: t("kebiao.sched_67"), field: "monday_67"},
      {name: t("kebiao.sched_89"), field: "monday_89"},
      {name: t("kebiao.sched_tuesday")+" "+t("kebiao.sched_12"), field: "tuesday_12"},
      {name: t("kebiao.sched_34"), field: "tuesday_34"},
      {name: t("kebiao.sched_67"), field: "tuesday_67"},
      {name: t("kebiao.sched_89"), field: "tuesday_89"},
      {name: t("kebiao.sched_wednesday")+" "+t("kebiao.sched_12"), field: "wednesday_12"},
      {name: t("kebiao.sched_34"), field: "wednesday_34"},
      {name: t("kebiao.sched_67"), field: "wednesday_67"},
      {name: t("kebiao.sched_89"), field: "wednesday_89"},
      {name: t("kebiao.sched_thursday")+" "+t("kebiao.sched_12"), field: "thursday_12"},
      {name: t("kebiao.sched_34"), field: "thursday_34"},
      {name: t("kebiao.sched_67"), field: "thursday_67"},
      {name: t("kebiao.sched_89"), field: "thursday_89"},
      {name: t("kebiao.sched_friday")+" "+t("kebiao.sched_12"), field: "friday_12"},
      {name: t("kebiao.sched_34"), field: "friday_34"},
      {name: t("kebiao.sched_67"), field: "friday_67"},
      {name: t("kebiao.sched_89"), field: "friday_89"},
    ];

    this.tableDataList = [];
    this.subjectSelectWeek = 1;

    this.tabsListRef = React.createRef();
  }

  componentDidMount() {
    this.loadData();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { subjects, banjiBySubject, kebiaoByBanjiSched, location } = this.props;
    const { selectedSubjectIndex, selectWeek } = this.state;
    // console.log("shouldComponentUpdate, origin grd: "+JSON.stringify(location.state.grd)+", origin edu: "+JSON.stringify(location.state.edu));
    // console.log("shouldComponentUpdate, grd: "+JSON.stringify(nextProps.location.state.grd)+", edu: "+JSON.stringify(nextProps.location.state.edu));
    if (nextProps.location.state.grd !== location.state.grd || nextProps.location.state.edu !== location.state.edu) {
      this.resetData();
      console.log("shouldComponentUpdate, location state diff");
      return true;
    } else if (nextProps.subjects !== subjects || nextProps.banjiBySubject !== banjiBySubject || nextProps.kebiaoByBanjiSched !== kebiaoByBanjiSched) {
      console.log("shouldComponentUpdate, props diff");
      return true;
    } else if (nextState.selectedSubjectIndex !== selectedSubjectIndex || nextState.selectWeek !== selectWeek ) {
      console.log("shouldComponentUpdate, state diff");
      return true
    }
    return false;
  }

  componentDidUpdate() {
    this.loadData();
  }

  loadData = () => {
    if (!this.subjectsData || this.subjectsData.length === 0) { // only get subjects when it's empty
      this.loadSubjects();
    }
    if (this.selectedSubject && !this.hasFetchBanji) {
      this.loadBanji();
    }
    if (this.banjiData && !this.hasFetchKebiao) {
      const { subjectSelectWeek } = this;
      this.loadKebiao(subjectSelectWeek);
    }
  }

  resetData = () => {
    console.log("reset kebiao data");
    this.tabsListRef.current.reset();
    this.subjectsData = null;
    this.selectedSubject = null;
    this.subjectSelectWeek = 1;
    this.hasFetchBanji = false;
    this.banjiData = null;
    this.hasFetchKebiao = false;
    this.setState({
      selectWeek: 1,
    });
  }

  buildData = () => {
    this.buildGradeInfo();
    this.buildSemester();
    this.buildSubjects();
    this.buildBanji();
    this.buildKebiao();
  }

  buildGradeInfo = () => {
    const { edu, grd } = this.props.location.state;
    this.gradeInfo = edu.name + grd.name;
  }

  buildSemester = () => {
    const { t } = this.props;
    const { semesterPages } = this;
    if (semesterPages.length === 0) {
      for (let i=0; i < SEMESTER_WEEK_COUNT; i++) {
        semesterPages.push({ name: t("kebiao.semester_week_template", {index: i+1}) });
      }
    }
  }

  buildSubjects = () => {
    if (this.subjectsData == null || this.subjectsData.length === 0) {
      const { subjects } = this.props;
      this.subjectsData = !subjects ? [] : subjects;
      this.setSubjectSelectedIndex(this.state.selectedSubjectIndex);
    }
    this.updateSubjectTitle();
  }

  updateSubjectTitle = () => {
    const { t } = this.props;
    const { selectedSubject, gradeInfo } = this;
    if (selectedSubject) {
      this.subjectTitle = t("subjectBoard.title_template", {subject_name: selectedSubject.title, grade_info: gradeInfo})
    } else {
      this.subjectTitle = t("subjectBoard.title_no_subject_template", {grade_info: gradeInfo})
    }
  }

  setSubjectSelectedIndex = (index) => {
    if (this.subjectsData && index < this.subjectsData.length) {
      this.selectedSubject = this.subjectsData[index];
    } else {
      this.selectedSubject = null;
    }
    this.updateTabTitles();
  }

  updateTabTitles = () => {
    this.tabTitles = [];
    if (!this.subjectsData) {
      return;
    }
    const { selectedSubject } = this;
    if (selectedSubject) {
      this.tabTitles = [selectedSubject.title];
    }
  }

  loadSubjects = () => {
    console.log("loadSubjects");
    const { edu, grd } = this.props.location.state;
    this.props.fetchSubjects(edu.id, grd.id);
  }

  buildBanji = () => {
    const { grd } = this.props.location.state;
    const { banjiBySubject } = this.props;
    if (!this.selectedSubject) {
      this.banjiData = null;
      return;
    }
    const gradeSubjectId = buildGradeSubjectId(grd.id, this.selectedSubject.id);
    this.banjiData = banjiBySubject[gradeSubjectId];
    console.log("BanjiData: "+JSON.stringify(this.banjiData));
  }

  loadBanji = () => {
    if (!this.selectedSubject) {
      console.error("No selected subject defined");
      return;
    }
    console.log("loadBanji");
    const { grd } = this.props.location.state;
    this.props.fetchBanji(grd.id, this.selectedSubject.id);
    this.tableDataList = [];
    this.hasFetchBanji = true;
    this.hasFetchKebiao = false;
  }

  buildKebiao = () => {
    const { kebiaoByBanjiSched } = this.props;
    const { subjectSelectWeek } = this;
    if (!this.banjiData) {
      return;
    }

    const tableDataList = []
    this.banjiData.forEach(banjiInfo => {
      const banjiSchedId = buildBanjiSchedId(banjiInfo.id, 3, subjectSelectWeek);
      console.log("Get kebiaoInfo of "+banjiSchedId);
      const kebiaoInfo = kebiaoByBanjiSched[banjiSchedId];
      if (kebiaoInfo) {
        let tableItem = {class_name: {title: banjiInfo.name}, ...this.buildKebiaoTableSched(kebiaoInfo)};
        tableDataList.push(tableItem);
      }
    });
    this.tableData = tableDataList;

    console.log("kebiaoTable: "+JSON.stringify(this.tableData));
  }

  buildKebiaoTableSched = (kebiaoInfo) => {
    const { t } = this.props;
    let kebiaoNames = [];
    kebiaoInfo.forEach(kebiaoDay => {
      for (let i=0; i < 4; i++) {
        const kebiaoHour = kebiaoDay[i];
        let name = t("kebiao.zixi");
        if (kebiaoHour && kebiaoHour.curriculum) {
          name = kebiaoHour.curriculum;
          if (kebiaoHour.theory_teachers && kebiaoHour.theory_teachers.length > 0) {
            kebiaoHour.theory_teachers.forEach(teacher => {
              name += " "+teacher.name;
            });
          }
        }
        kebiaoNames.push(name);
      }
    })

    return {
      monday_12: kebiaoNames[0], monday_34: kebiaoNames[1], monday_67: kebiaoNames[2], monday_89: kebiaoNames[3],
      tuesday_12: kebiaoNames[4], tuesday_34: kebiaoNames[5], tuesday_67: kebiaoNames[6], tuesday_89: kebiaoNames[7],
      wednesday_12: kebiaoNames[8], wednesday_34: kebiaoNames[9], wednesday_67: kebiaoNames[10], wednesday_89: kebiaoNames[11],
      thursday_12: kebiaoNames[12], thursday_34: kebiaoNames[13], thursday_67: kebiaoNames[14], thursday_89: kebiaoNames[15],
      friday_12: kebiaoNames[16], friday_34: kebiaoNames[17], friday_67: kebiaoNames[18], friday_89: kebiaoNames[19],
      data: kebiaoInfo
    };
  }

  loadKebiao = (selectWeek) => {
    if (!this.banjiData) {
      console.error("BanjiData not got yet");
      return;
    }
    console.log("loadKebiao");
    let banjiIds = [];
    this.banjiData.forEach(banjiInfo => {
      banjiIds.push(banjiInfo.id);
    })
    this.props.fetchLiLunByBanji(banjiIds, 3, selectWeek, selectWeek+1);
    this.hasFetchKebiao = true;
  }

  onSubjectClicked = (index) => {
    console.log(`onSubjectClicked ${this.subjectsData[index].title}`)
    this.setState({
      selectedSubjectIndex: index
    });
    this.setSubjectSelectedIndex(index);
    this.loadBanji();
  }

  onSemesterPageChanged = (index) => {
    const { semesterPages } = this;
    console.log("onSemesterPageChanged: "+semesterPages[index].name);
    this.subjectSelectWeek = index+1;
    this.setState({
      selectWeek : this.subjectSelectWeek
    });
    this.loadKebiao(this.subjectSelectWeek);
  }

  render() {
    const { t } = this.props;
    const { selectedSubjectIndex } = this.state;
    this.buildData();
    const { subjectsData, subjectTitle, subjectSelectWeek,
      tabTitles, tableHeaders, tableData, semesterPages,
      onSubjectClicked, onSemesterPageChanged } = this;
    const pageTables = [];
    if (tableData) {
        pageTables[0] = (<ResultTable
          height={400}
          titleHeight={50}
          colLineHeight={20}
          defaultColWidth={100}
          title={t("lilunKebiaoScreen.title")}
          color={LILUNKEBIAO_COLOR}
          headers={tableHeaders}
          data={tableData}
          pageNames={semesterPages}
          pagePrevCaption={t("kebiao.prev_semester_week")}
          pageNextCaption={t("kebiao.next_semester_week")}
          onResultPageIndexChanged={onSemesterPageChanged}
          initPageIndex={subjectSelectWeek-1}
          pageInputCaption={[t("kebiao.input_semester_week_prefix"), t("kebiao.input_semester_week_suffix")]} />);
    } else {
      pageTables[0] = (<Flex alignItems='center' justifyContent='center'><Text>{t("common.no_data")}</Text></Flex>);
    }

    return (
      <Flex width="100%" minHeight={750} direction="column" align="center">
        <SubjectBoard
          my={4}
          color={LILUNKEBIAO_COLOR}
          title={subjectTitle}
          subjects={subjectsData}
          initSelectIndex={selectedSubjectIndex}
          onSubjectClicked={onSubjectClicked}
          enableSelect />
        {
          tabTitles && tabTitles.length > 0 &&
          <ResultTabList
            ref={this.tabsListRef}
            my={4}
            width="100%"
            maxWidth={1444}
            tabHeight={50}
            color={LILUNKEBIAO_COLOR}
            titles={tabTitles}
            pages={pageTables} />
        }
      </Flex>
    );
  }
}

const mapStateToProps = (state, props) => {
  const { edu, grd } = props.location.state;
  return {
    subjects: getSubjectByGrade(state, edu.id, grd.id),
    banjiBySubject: getBanjiBySubject(state),
    kebiaoByBanjiSched: getLiLunByAllBanjiSched(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(subjectActions, dispatch),
    ...bindActionCreators(banjiActions, dispatch),
    ...bindActionCreators(kebiaoActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LiLunKeBiaoScreenWrapped));
