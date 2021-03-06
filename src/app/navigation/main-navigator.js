import React, { PureComponent } from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTranslation } from 'react-i18next';
import {
  Flex,
  Progress,
} from '@chakra-ui/core';

import {
  MenuBar,
  MenuType,
  Alert,
} from '../components';

import { actions as authActions, getLoggedUser } from '../redux/modules/auth';
import { actions as gradeActions, getGradesOfAllDegrees } from '../redux/modules/grade';
import { actions as jysActions, getJiaoyanshiOfAllCenters } from '../redux/modules/jiaoyanshi';
import { actions as requestActions, getRequestQuantity, getError } from '../redux/modules/app';

import AsyncComponent from '../utils/AsyncComponent';
import connectRoute from '../utils/connectRoute';

const AsyncLiLunKeBiaoScreen = connectRoute(AsyncComponent(() => import('../screens/lilun-kebiao-screen')));
const AsyncBanJiKeBiaoScreen = connectRoute(AsyncComponent(() => import('../screens/banji-kebiao-screen')));
const AsyncShiXunKeBiaoScreen = connectRoute(AsyncComponent(() => import('../screens/shixun-kebiao-screen')));
const AsyncCenterLabScreen = connectRoute(AsyncComponent(() => import('../screens/center-lab-screen')));
const AsyncJysKebiaoScreen = connectRoute(AsyncComponent(() => import('../screens/jys-kebiao-screen')));
const AsyncPaikeScreen = connectRoute(AsyncComponent(() => import('../screens/paike-screen')));

class MainNavigatorWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.confirmErrorDialog = React.createRef();
  }

  componentDidMount() {
    this.props.fetchAllGradeInfo();
    this.props.updateSchoolYearWeekInfo();
    this.props.fetchJiaoyanshi();
  }

  componentDidUpdate() {
    const { requestError } = this.props;
    if (requestError) {
      this.showConfirmDialog(requestError);
    }
  }

  onMenuSelected = (menu, menu_params) => {
    const { history } = this.props;
    console.log("onMenuSelected: "+menu+", params: "+JSON.stringify(menu_params));
    switch(menu) {
      case MenuType.LILUN:
        history.push('/kebiao/lilun', menu_params);
        break;
      case MenuType.BANJI:
        history.push('/kebiao/banji', menu_params);
        break;
      case MenuType.SHIXUN:
        history.push('/kebiao/shixun', menu_params);
        break;
      case MenuType.SHIYANSHI:
        history.push('/labs', menu_params);
        break;
      case MenuType.JIAOYANSHI:
        history.push('/jys', menu_params);
        break;
      case MenuType.PAIKE:
        history.push('/paike', menu_params);
        break;
      default:
        break;
    }
  }

  showConfirmDialog = (requestError) => {
    const { t } = this.props;
    const title = t("alert.request_failure");
    const message = t("alert.request_failure_detail", {error_msg: requestError.message});
    this.confirmErrorDialog.current.show(title, message);
  }

  onConfirmError = () => {
    this.props.removeError();
    this.confirmErrorDialog.current.dismiss();
  }

  needLogin = () => {
    const { user } = this.props;
    return !user || !user.token;
  }

  render() {
    if (this.needLogin()) {
      return <Redirect to="/login" />;
    }
    const { onConfirmError } = this;
    const { gradeTypes, centers, labBuildings, requestsCount, requestError } = this.props;
    console.log("Request count: "+requestsCount);
    return (
      <Flex direction="column" justify="center">
        <Flex px="10%" direction="column" justify="center" >
          <MenuBar gradeTypes={gradeTypes} centers={centers} labBuildings={labBuildings} onMenuSelected={this.onMenuSelected}/>
          <Switch>
            <Route path="/kebiao/lilun" component={AsyncLiLunKeBiaoScreen} />
            <Route path="/kebiao/banji" component={AsyncBanJiKeBiaoScreen} />
            <Route path="/kebiao/shixun" component={AsyncShiXunKeBiaoScreen} />
            <Route path="/labs" component={AsyncCenterLabScreen} />
            <Route path="/jys" component={AsyncJysKebiaoScreen} />
            <Route path="/paike" component={AsyncPaikeScreen} />
          </Switch>
        </Flex>
        {
          requestsCount > 0 && !requestError &&
          <Flex position="absolute" w="100%" h="100%" bg="#aaaa" color="black" alignItems="center" justify="center">
            <Progress width="50%" height="20px" rounded="4px" value={100} hasStripe isAnimated />
          </Flex>
        }
        <Alert
          ref={this.confirmErrorDialog}
          onResult={onConfirmError} />
      </Flex>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: getLoggedUser(state),
    gradeTypes: getGradesOfAllDegrees(state),
    centers: getJiaoyanshiOfAllCenters(state),
    requestsCount: getRequestQuantity(state),
    requestError: getError(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(requestActions, dispatch),
    ...bindActionCreators(authActions, dispatch),
    ...bindActionCreators(gradeActions, dispatch),
    ...bindActionCreators(jysActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(MainNavigatorWrapper));
