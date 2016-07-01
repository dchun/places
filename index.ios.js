var React = require('react-native');
var database = require('./app/utils/database');
var Main = require('./app/components/Main');
var menu = require('./app/components/imgs/ic_menu.png');
var search = require('./app/components/imgs/ic_search.png');

var {
  AppRegistry,
  StyleSheet,
  NavigatorIOS,
  View
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  }
});

class places extends React.Component {

  constructor(){
    super()
    this.state = {
      dbReady: false,
    }
  }

  componentWillMount(){
    database.initialize()
      .then(() => {this.setState({dbReady: true})})
      .catch(() => {
        database.populateDB()
          .then(() => {this.setState({dbReady: true})});
      })
  }

  render() {
    if(this.state.dbReady){
      return (
        <NavigatorIOS
          style={styles.container}
          ref="nav"
          initialRoute={{
            title: 'Places',
            component: Main,
            passProps: {
              filters: {
                category: 0,
                tags: [0],
                select: 0,
              },
              ref: (component) => {this.pushedComponent = component},
            },
            leftButtonIcon: menu,
            onLeftButtonPress: () => { 
              this.pushedComponent && this.pushedComponent.handleLeftButtonPress();
            },
            rightButtonIcon: search,
            onRightButtonPress: () => { 
              this.pushedComponent && this.pushedComponent.handleRightButtonPress();
            }
          }} />
      );      
    } else {
      return(
        <View />
      );
    }

  }

}

AppRegistry.registerComponent('places', () => places);