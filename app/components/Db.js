var React = require('react-native');
var database = require('../utils/database');

var {
	View,
	Text,
  StyleSheet,
  ListView,
  TouchableHighlight
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80,
    justifyContent: 'center'
  },
  listContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  rowContainer: {
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 14,
    padding: 5,
  }
});

class Db extends React.Component {

  constructor(props){
    super(props)
    this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2})
    this.state = {
      dataSource: this.ds.cloneWithRows([])
    }
  }

  showData(){
    database.getEverything().then(results => {
      this.setState({
        dataSource: this.ds.cloneWithRows(results)
      });
    });
  }

  showCats(){
    database.getCategories().then(results => {
      this.setState({
        dataSource: this.ds.cloneWithRows(results)
      });
    });
  }

  showTags(){
    database.getTags().then(results => {
      this.setState({
        dataSource: this.ds.cloneWithRows(results)
      });
    });
  }

  showTagRels(){
    database.getTagRelations().then(results => {
      this.setState({
        dataSource: this.ds.cloneWithRows(results)
      });
    });
  }

  renderRow(rowData){
    return (
      <TouchableHighlight>
        <View>
          <View style={styles.rowContainer}>
            <Text> {JSON.stringify(rowData)} </Text>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
  
  render() {
    return (
    	<View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Text style={styles.text} onPress={this.showData.bind(this)}> ALL </Text>
          <Text style={styles.text} onPress={this.showCats.bind(this)}> CATS </Text>
          <Text style={styles.text} onPress={this.showTags.bind(this)}> TAGS </Text>
          <Text style={styles.text} onPress={this.showTagRels.bind(this)}> TAG RELS </Text>  
          <Text style={styles.text} onPress={database.deleteDatabase.bind(this)}> DEL DB </Text>
        </View>
        <ListView
          style={styles.listContainer}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow} />
    	</View>
    )
  }

};

module.exports = Db;