var React = require('react-native');
var Separator = require('./helpers/Separator');
var Icon = require('react-native-vector-icons/MaterialIcons');
var Places = require('./Places')
var Categories = require('./Categories');
var database = require('../utils/database');
// var Db = require('./Db');

var {
	View,
	Text,
	StyleSheet,
	PixelRatio,
	TouchableHighlight,
  ListView
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
  },
  rowWrapper: {
    height: 40,
    padding: 8,
    flexDirection: 'row',
  },
  rowIcon: {
    textAlign: 'right',
    color: 'gray'
  },
  rowText: {
    fontSize: 18,
    flex: 1,
    textAlign: 'left',
    marginLeft: 10,
  },
})

var componentData = [
  {id: 1, component: Places, name: 'Places'},
  {id: 2, component: Categories, name: 'Categories'},
  // {id: 3, component: Db, name: 'Database'},
];

class ControlPanel extends React.Component{

  constructor(props){
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2})
    this.state = {
      dataSource: this.ds.cloneWithRows(componentData),
      categories: this.props.categories
    }
  }

  componentDidMount(){
    console.log(this.state.categories)
  }

  handleComponentPress(rowData){
    this.props.navigator.push({
      title: rowData.name,
      component: rowData.component,
      passProps: {
        categories: this.state.categories,
      }
    });
  }

  renderRow(rowData){
    return (
      <TouchableHighlight
        underlayColor={'#2196F3'}
        onPress={this.handleComponentPress.bind(this,rowData)}>
        <View style={styles.rowWrapper}>
          <Text style={styles.rowText}>
            {rowData.name}
          </Text>
          <Icon 
            style={styles.rowIcon}
            name={'chevron-right'}
            size={25} 
            color={'#2196F3'} />
        </View>
      </TouchableHighlight>
    )
  }

	render(){
		return (
			<View style={styles.container}>
        <ListView
          contentContainerStyle={styles.listContainer}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          renderSeparator={(sectionID, rowID) => <Separator key={`${sectionID}-${rowID}`} /> } />
      </View>
		)
	}
}

module.exports = ControlPanel;